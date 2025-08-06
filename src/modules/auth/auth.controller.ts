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
} from '@nestjs/common'
import { AuthService } from './auth.service'
import {
	UserSignupRequest,
	UserLoginRequest,
	TokenResponse,
	CurrentUserResponse,
	UserOnboardingRequest,
} from './dtos/auth.dtos'
import { Response, Request } from 'express'
import { UserAuthGuard } from '../../common/guards/user-auth.guard'
import { GetCurrentUser } from '../../common/decorators/get-current-user.decorator'
import { CookieService } from 'src/common/services/cookie.service'

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly cookies: CookieService,
	) {}

	@Post('signup')
	async signup(@Res() res: Response, @Body() userData: UserSignupRequest): Promise<TokenResponse> {
		return this.authService.signupUser(res, userData)
	}

	@Post('login')
	async login(@Res() res: Response, @Body() userData: UserLoginRequest): Promise<TokenResponse> {
		return this.authService.loginUser(res, userData)
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
	}

	@Get('me')
	@UseGuards(UserAuthGuard)
	async getMe(@GetCurrentUser() currentUser: { userId: number }): Promise<CurrentUserResponse> {
		return this.authService.getCurrentUser(currentUser.userId)
	}

	@Post('onboarding')
	@UseGuards(UserAuthGuard)
	async onboarding(
		@Body() userData: UserOnboardingRequest,
		@GetCurrentUser() currentUser: { userId: number },
	): Promise<CurrentUserResponse> {
		const user = await this.authService.onboardUser(currentUser.userId, userData)
		return {
			id: user.id,
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
}
