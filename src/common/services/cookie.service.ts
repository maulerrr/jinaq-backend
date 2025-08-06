import { Injectable } from '@nestjs/common'
import { Response, Request } from 'express'
import { AppConfigService } from '../config/config.service'

@Injectable()
export class CookieService {
	private readonly cookieName = 'JINAQ_SESSION'
	private readonly domain: string
	private readonly maxAge: number

	constructor(private readonly config: AppConfigService) {
		this.domain = this.config.client.cookieDomain
		this.maxAge = 24 * 3600 * 1000 // 1 day
	}

	setAuthCookie(res: Response, token: string, maxAgeMs?: number) {
		res.cookie(this.cookieName, token, {
			domain: this.domain,
			path: '/',
			httpOnly: true,
			secure: this.config.isProduction,
			sameSite: this.config.isProduction ? 'none' : 'lax',
			maxAge: maxAgeMs ?? this.maxAge,
		})
	}

	getAuthCookie(req: Request): string | undefined {
		const cookies = req.cookies as Record<string, unknown> | undefined
		const token = cookies ? cookies[this.cookieName] : undefined
		return typeof token === 'string' ? token : undefined
	}

	clearAuthCookie(res: Response) {
		res.clearCookie(this.cookieName, {
			domain: this.domain,
			path: '/',
		})
	}
}
