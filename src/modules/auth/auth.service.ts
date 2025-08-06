import {
	Injectable,
	UnauthorizedException,
	ConflictException,
	NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import {
	UserSignupRequest,
	UserLoginRequest,
	TokenResponse,
	CurrentUserResponse,
	UserOnboardingRequest,
	UserResponse,
} from './dtos/auth.dtos'
import { JwtService } from '../../common/services/jwt.service'
import { CookieService } from '../../common/services/cookie.service'
import { hash, compare } from 'bcryptjs'
import { Response } from 'express'
import { UserRole, SubscriptionType } from '@prisma/client'

const SESSION_TOKEN_EXPIRE_SECS = 60 * 60 * 24 * 7 // Example: 7 days

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
		private readonly cookieService: CookieService,
	) {}

	async signupUser(response: Response, userData: UserSignupRequest): Promise<TokenResponse> {
		const existingUser = await this.prisma.user.findFirst({
			where: {
				OR: [{ email: userData.email }, { username: userData.username }],
			},
		})
		if (existingUser) {
			throw new ConflictException('User with this email or username already exists')
		}

		const hashedPassword = await hash(userData.password, 10)
		const user = await this.prisma.user.create({
			data: {
				firstName: userData.firstName,
				lastName: userData.lastName,
				email: userData.email,
				username: userData.username,
				password: hashedPassword,
				subscription: SubscriptionType.FREE,
				role: UserRole.USER,
				verified: false,
				onboarded: false,
			},
		})

		const sessionToken = this.jwtService.signUser({
			userId: Number(user.id),
			role: user.role,
			subscription: user.subscription,
		})
		const expiresAt = new Date(Date.now() + SESSION_TOKEN_EXPIRE_SECS * 1000)

		// Delete any existing session for this user
		await this.prisma.userSession.deleteMany({ where: { userId: user.id } })
		await this.prisma.userSession.create({
			data: { userId: user.id, token: sessionToken, expiresAt },
		})

		this.cookieService.setAuthCookie(response, sessionToken, SESSION_TOKEN_EXPIRE_SECS * 1000)

		return { sessionToken, expiresAt }
	}

	async loginUser(response: Response, userData: UserLoginRequest): Promise<TokenResponse> {
		const user = await this.prisma.user.findFirst({
			where: {
				OR: [{ email: userData.emailOrUsername }, { username: userData.emailOrUsername }],
			},
		})
		if (!user || !(await compare(userData.password, user.password))) {
			throw new UnauthorizedException('Invalid credentials')
		}

		const sessionToken = this.jwtService.signUser({
			userId: Number(user.id),
			role: user.role,
			subscription: user.subscription,
		})
		const expiresAt = new Date(Date.now() + SESSION_TOKEN_EXPIRE_SECS * 1000)

		// Delete any existing session for this user
		await this.prisma.userSession.deleteMany({ where: { userId: user.id } })
		await this.prisma.userSession.create({
			data: { userId: user.id, token: sessionToken, expiresAt },
		})

		this.cookieService.setAuthCookie(response, sessionToken, SESSION_TOKEN_EXPIRE_SECS * 1000)

		return { sessionToken, expiresAt }
	}

	async logoutUser(response: Response, sessionToken: string) {
		const userSession = await this.prisma.userSession.findUnique({
			where: { token: sessionToken },
		})
		if (userSession) {
			await this.prisma.userSession.delete({ where: { id: userSession.id } })
		}
		this.cookieService.clearAuthCookie(response)
	}

	async getCurrentUser(userId: number): Promise<CurrentUserResponse> {
		const user = await this.prisma.user.findUnique({ where: { id: userId } })
		if (!user) {
			throw new NotFoundException('User not found')
		}
		return {
			id: Number(user.id),
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			username: user.username,
			roles: [user.role],
			verified: user.verified,
			onboarded: user.onboarded,
			avatarUrl: null,
		}
	}

	async onboardUser(userId: number, onboardingData: UserOnboardingRequest): Promise<UserResponse> {
		const user = await this.prisma.user.findUnique({ where: { id: userId } })
		if (!user) {
			throw new NotFoundException('User not found')
		}

		// Update user onboarding fields
		const updatedUser = await this.prisma.user.update({
			where: { id: userId },
			data: {
				dateOfBirth: onboardingData.dateOfBirth,
				interests: onboardingData.interests,
				organizationName: onboardingData.organizationName,
				bioAbout: onboardingData.about,
				onboarded: true,
				academicInfo: onboardingData.academic
					? {
							upsert: {
								update: { ...onboardingData.academic },
								create: { ...onboardingData.academic },
							},
						}
					: undefined,
				languageProficiencies: {
					deleteMany: {}, // Remove old
					create: onboardingData.languages.map(lang => ({
						language: lang.language,
						level: lang.level,
					})),
				},
			},
		})

		return {
			id: Number(updatedUser.id),
			firstName: updatedUser.firstName,
			lastName: updatedUser.lastName,
			email: updatedUser.email,
			username: updatedUser.username,
			role: updatedUser.role,
			subscription: updatedUser.subscription,
			verified: updatedUser.verified,
			onboarded: updatedUser.onboarded,
		}
	}
}
