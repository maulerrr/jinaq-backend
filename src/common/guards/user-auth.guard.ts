import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { CookieService } from '../services/cookie.service'
import { UserRequest } from '../types/user-request.interface'
import { UserSessionService } from 'src/modules/auth/services/session.service'

@Injectable()
export class UserAuthGuard implements CanActivate {
	constructor(
		private readonly sessions: UserSessionService,
		private readonly cookieService: CookieService,
	) {}

	async canActivate(ctx: ExecutionContext): Promise<boolean> {
		const req = ctx.switchToHttp().getRequest<UserRequest>()
		const token = this.cookieService.getAuthCookie(req)
		if (!token) throw new UnauthorizedException('Authentication token missing')

		const userId = await this.sessions.validateUserSession(token)
		req.user = { id: userId }
		return true
	}
}
