import { Module } from '@nestjs/common'
import { InstitutionsController } from './institutions.controller'
import { InstitutionsService } from './institutions.service'
import { PrismaModule } from 'src/prisma/prisma.module'
import { AuthModule } from '../auth/auth.module'
import { CommonModule } from 'src/common/common.module'
import { LlmModule } from 'src/common/llm/llm.module'

@Module({
	imports: [PrismaModule, AuthModule, CommonModule, LlmModule],
	controllers: [InstitutionsController],
	providers: [InstitutionsService],
})
export class InstitutionsModule {}
