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
	CurrentUserResponse,
	UserOnboardingRequest,
} from './dtos/auth.dtos'
import { CookieService } from '../../common/services/cookie.service'
import { hash, compare } from 'bcryptjs'
import { Response } from 'express'
import { UserRole, SubscriptionType } from '@prisma/client'
import { UserSessionService } from './services/session.service'
import { S3Service } from '../../common/s3/s3.service'
import { MediaUrlService } from '../../common/services/media-url.service'
import { Express } from 'express' // Import Express for Multer types

const SESSION_TOKEN_EXPIRE_SECS = 60 * 60 * 24 * 30 // Example: 30 days

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly cookieService: CookieService,
		private readonly userSessionService: UserSessionService,
		private readonly s3Service: S3Service,
		private readonly mediaUrlService: MediaUrlService, // Inject MediaUrlService
	) {}

	async signupUser(response: Response, userData: UserSignupRequest): Promise<void> {
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

		const token = await this.userSessionService.upsertSession(user.id)
		this.cookieService.setAuthCookie(response, token, SESSION_TOKEN_EXPIRE_SECS * 1000)

		return
	}

	async loginUser(response: Response, userData: UserLoginRequest): Promise<void> {
		const user = await this.prisma.user.findFirst({
			where: {
				OR: [{ email: userData.emailOrUsername }, { username: userData.emailOrUsername }],
			},
		})
		if (!user || !(await compare(userData.password, user.password))) {
			throw new UnauthorizedException('Invalid credentials')
		}

		const token = await this.userSessionService.upsertSession(user.id)
		this.cookieService.setAuthCookie(response, token, SESSION_TOKEN_EXPIRE_SECS * 1000)

		return
	}

	async logoutUser(response: Response, sessionToken: string): Promise<void> {
		await this.userSessionService.revokeUserSession(sessionToken)
		this.cookieService.clearAuthCookie(response)
	}

	async uploadAvatar(userId: number, file: Express.Multer.File): Promise<CurrentUserResponse> {
		const user = await this.prisma.user.findUnique({ where: { id: userId } })
		if (!user) {
			throw new NotFoundException('User not found')
		}

		const fileExtension = file.originalname.split('.').pop()
		const avatarKey = `avatars/${userId}/avatar.${fileExtension}`

		await this.s3Service.uploadObject(avatarKey, file.buffer, file.mimetype)

		const updatedUser = await this.prisma.user.update({
			where: { id: userId },
			data: { avatarKey },
		})

		return {
			id: updatedUser.id,
			firstName: updatedUser.firstName,
			lastName: updatedUser.lastName,
			email: updatedUser.email,
			username: updatedUser.username,
			role: updatedUser.role,
			verified: updatedUser.verified,
			onboarded: updatedUser.onboarded,
			avatarUrl: updatedUser.avatarKey
				? MediaUrlService.buildMediaUrl(updatedUser.avatarKey)
				: null,
		}
	}

	async uploadBanner(userId: number, file: Express.Multer.File): Promise<CurrentUserResponse> {
		const user = await this.prisma.user.findUnique({ where: { id: userId } })
		if (!user) {
			throw new NotFoundException('User not found')
		}

		const fileExtension = file.originalname.split('.').pop()
		const bannerKey = `banners/${userId}/banner.${fileExtension}`

		await this.s3Service.uploadObject(bannerKey, file.buffer, file.mimetype)

		const updatedUser = await this.prisma.user.update({
			where: { id: userId },
			data: { bannerKey },
		})

		return {
			id: updatedUser.id,
			firstName: updatedUser.firstName,
			lastName: updatedUser.lastName,
			email: updatedUser.email,
			username: updatedUser.username,
			role: updatedUser.role,
			verified: updatedUser.verified,
			onboarded: updatedUser.onboarded,
			avatarUrl: updatedUser.avatarKey
				? MediaUrlService.buildMediaUrl(updatedUser.avatarKey)
				: null,
			bannerUrl: updatedUser.bannerKey
				? MediaUrlService.buildMediaUrl(updatedUser.bannerKey)
				: null,
		}
	}

	async getCurrentUser(userId: number): Promise<CurrentUserResponse> {
		const user = await this.prisma.user.findUnique({ where: { id: userId } })
		if (!user) {
			throw new NotFoundException('User not found')
		}
		return {
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			username: user.username,
			role: user.role,
			verified: user.verified,
			onboarded: user.onboarded,
			avatarUrl: user.avatarKey ? MediaUrlService.buildMediaUrl(user.avatarKey) : null,
			bannerUrl: user.bannerKey ? MediaUrlService.buildMediaUrl(user.bannerKey) : null,
		}
	}

	async onboardUser(
		userId: number,
		onboardingData: UserOnboardingRequest,
	): Promise<CurrentUserResponse> {
		const user = await this.prisma.user.findUnique({ where: { id: userId } })
		if (!user) {
			throw new NotFoundException('User not found')
		}

		// Update user onboarding fields
		const updatedUser = await this.prisma.user.update({
			where: { id: userId },
			data: {
				cityId: onboardingData.cityId,
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
			id: updatedUser.id,
			firstName: updatedUser.firstName,
			lastName: updatedUser.lastName,
			email: updatedUser.email,
			username: updatedUser.username,
			role: updatedUser.role,
			verified: updatedUser.verified,
			onboarded: updatedUser.onboarded,
			avatarUrl: updatedUser.avatarKey
				? MediaUrlService.buildMediaUrl(updatedUser.avatarKey)
				: null,
			bannerUrl: updatedUser.bannerKey
				? MediaUrlService.buildMediaUrl(updatedUser.bannerKey)
				: null,
		}
	}
}
