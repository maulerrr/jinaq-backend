import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PrismaService } from 'src/prisma/prisma.service'
import { ROLES_KEY } from './roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private prisma: PrismaService,
	) {}

	async canActivate(ctx: ExecutionContext): Promise<boolean> {
		const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
			ctx.getHandler(),
			ctx.getClass(),
		])
		if (!requiredRoles) return true

		const req = ctx.switchToHttp().getRequest<{ user: { id: number } }>()
		const userId = req.user?.id
		if (!userId) throw new ForbiddenException()

		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { role: true },
		})
		if (!user || !requiredRoles.includes(user.role)) {
			throw new ForbiddenException('Forbidden')
		}

		return true
	}
}
