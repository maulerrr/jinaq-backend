import {
	Controller,
	Post,
	Body,
	Res,
	Req,
	Get,
	UseGuards,
	HttpCode,
	HttpStatus,
	UseInterceptors,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { FileInterceptor } from '@nestjs/platform-express'
import {
	UserSignupRequest,
	UserLoginRequest,
	CurrentUserResponse,
	UserOnboardingRequest,
} from './dtos/auth.dtos'
import { Response, Request } from 'express'
import { UserAuthGuard } from '../../common/guards/user-auth.guard'
import { GetCurrentUser } from '../../common/decorators/get-current-user.decorator'
import { CookieService } from 'src/common/services/cookie.service'
import { UserClaims } from 'src/common/types/user-request.interface'

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly cookies: CookieService,
	) {}

	@Post('signup')
	@HttpCode(HttpStatus.CREATED)
	async signup(@Res() res: Response, @Body() userData: UserSignupRequest): Promise<void> {
		const tokenResponse = await this.authService.signupUser(res, userData)
		res.status(HttpStatus.CREATED).json(tokenResponse)
	}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	async login(@Res() res: Response, @Body() userData: UserLoginRequest): Promise<void> {
		const tokenResponse = await this.authService.loginUser(res, userData)
		res.status(HttpStatus.OK).json(tokenResponse)
	}

	@Post('logout')
	@HttpCode(HttpStatus.NO_CONTENT)
	async logout(@Res() res: Response, @Req() req: Request): Promise<void> {
		const sessionToken = this.cookies.getAuthCookie(req)
		if (!sessionToken) {
			res.status(HttpStatus.BAD_REQUEST).json({ detail: 'No access token found in cookies' })
			return
		}
		await this.authService.logoutUser(res, sessionToken)
		res.status(HttpStatus.NO_CONTENT).send()
	}

	@Get('me')
	@UseGuards(UserAuthGuard)
	async getMe(@GetCurrentUser() user: UserClaims): Promise<CurrentUserResponse> {
		return this.authService.getCurrentUser(user.id)
	}

	@Post('onboarding')
	@UseGuards(UserAuthGuard)
	async onboarding(
		@Body() userData: UserOnboardingRequest,
		@GetCurrentUser() user: UserClaims,
	): Promise<CurrentUserResponse> {
		const onboardedUser = await this.authService.onboardUser(user.id, userData)
		return {
			id: onboardedUser.id,
			firstName: onboardedUser.firstName,
			lastName: onboardedUser.lastName,
			email: onboardedUser.email,
			username: onboardedUser.username,
			role: onboardedUser.role,
			verified: onboardedUser.verified,
			onboarded: onboardedUser.onboarded,
			avatarUrl: null,
		}
	}

	@Post('upload-avatar')
	@UseGuards(UserAuthGuard)
	@UseInterceptors(
		FileInterceptor('file', {
			limits: {
				fileSize: 5 * 1024 * 1024, // 5 MB
			},
		}),
	)
	async uploadAvatar(
		@GetCurrentUser() user: UserClaims,
		@Body() file: Express.Multer.File,
	): Promise<CurrentUserResponse> {
		return this.authService.uploadAvatar(user.id, file)
	}

	@Post('upload-banner')
	@UseGuards(UserAuthGuard)
	@UseInterceptors(
		FileInterceptor('file', {
			limits: {
				fileSize: 5 * 1024 * 1024, // 5 MB
			},
		}),
	)
	async uploadBanner(
		@GetCurrentUser() user: UserClaims,
		@Body() file: Express.Multer.File,
	): Promise<CurrentUserResponse> {
		return this.authService.uploadBanner(user.id, file)
	}
}
