import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AppConfigService } from 'src/common/config/config.service'
import { JwtService } from 'src/common/services/jwt.service'
import { parseExpirationDate } from 'src/common/utils/expiration.util'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class UserSessionService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
		private readonly config: AppConfigService,
	) {}

	private async linkSessionToUser(userId: number, sessionId: number): Promise<void> {
		await this.prisma.user.update({
			where: { id: userId },
			data: { session: { connect: { id: sessionId } } },
		})
	}

	/** Issue or refresh a JWT session */
	async upsertSession(userId: number): Promise<string> {
		const now = new Date()
		const expiresAt = parseExpirationDate(this.config.Jwt.expiresIn, now)
		const existing = await this.prisma.userSession.findUnique({
			where: { userId },
		})
		const token = this.jwtService.signUser({ userId })

		if (existing) {
			const updated = await this.prisma.userSession.update({
				where: { id: existing.id },
				data: { token, expiresAt },
			})
			await this.linkSessionToUser(userId, updated.id)
			return updated.token
		}

		const created = await this.prisma.userSession.create({
			data: { userId, token, expiresAt },
		})
		await this.linkSessionToUser(userId, created.id)
		return created.token
	}

	/** Validate JWT + DB session */
	async validateUserSession(token: string): Promise<number> {
		let payload: { userId: number }
		try {
			payload = this.jwtService.verifyUser(token)
		} catch {
			throw new UnauthorizedException('Invalid or expired token')
		}

		const session = await this.prisma.userSession.findFirst({
			where: { token, expiresAt: { gt: new Date() } },
		})
		if (!session) throw new UnauthorizedException('Session revoked or expired')
		return payload.userId
	}

	/** Revoke the session */
	async revokeUserSession(token: string): Promise<void> {
		await this.prisma.userSession.deleteMany({ where: { token } })
	}
}
