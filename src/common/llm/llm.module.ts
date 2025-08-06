import { Module } from '@nestjs/common'
import { PromptRegistry } from './prompt.registry'
import { PromptBuilderService } from './prompt.builder'
import { PrismaModule } from 'src/prisma/prisma.module'
import { AppConfigModule } from '../config/config.module'

@Module({
	imports: [AppConfigModule, PrismaModule],
	providers: [PromptRegistry, PromptBuilderService],
	exports: [PromptBuilderService, PromptRegistry],
})
export class LlmModule {}
