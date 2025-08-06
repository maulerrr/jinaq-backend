import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { PrismaModule } from '../../prisma/prisma.module'
import { JwtService } from '../../common/services/jwt.service'
import { CookieService } from '../../common/services/cookie.service'
import { UserAuthGuard } from '../../common/guards/user-auth.guard'
import { CommonModule } from 'src/common/common.module'
import { UserSessionService } from './services/session.service'
import { AppConfigModule } from 'src/common/config/config.module'
import { S3Module } from 'src/common/s3/s3.module'
import { S3Service } from 'src/common/s3/s3.service'

@Module({
	imports: [AppConfigModule, PrismaModule, CommonModule, S3Module],
	controllers: [AuthController],
	providers: [AuthService, UserSessionService, JwtService, CookieService, UserAuthGuard, S3Service],
	exports: [AuthService, UserSessionService],
})
export class AuthModule {}
