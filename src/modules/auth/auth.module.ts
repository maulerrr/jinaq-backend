import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { PrismaModule } from '../../prisma/prisma.module'
import { JwtService } from '../../common/services/jwt.service'
import { CookieService } from '../../common/services/cookie.service'
import { UserAuthGuard } from '../../common/guards/user-auth.guard'

@Module({
	imports: [PrismaModule],
	controllers: [AuthController],
	providers: [AuthService, JwtService, CookieService, UserAuthGuard],
	exports: [AuthService],
})
export class AuthModule {}
