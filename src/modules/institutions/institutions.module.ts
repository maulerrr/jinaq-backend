import { Module } from '@nestjs/common'
import { InstitutionsController } from './institutions.controller'
import { InstitutionsService } from './institutions.service'
import { PrismaModule } from 'src/prisma/prisma.module'
import { AuthModule } from '../auth/auth.module'
import { CommonModule } from 'src/common/common.module'
import { LlmModule } from 'src/common/llm/llm.module'
import { OpenAIUniversitiesAdapter } from 'src/common/adapters/llm/openai-universities.adapter'
import { AppConfigModule } from 'src/common/config/config.module'

@Module({
	imports: [AppConfigModule, PrismaModule, AuthModule, CommonModule, LlmModule],
	controllers: [InstitutionsController],
	providers: [InstitutionsService, OpenAIUniversitiesAdapter],
})
export class InstitutionsModule {}
