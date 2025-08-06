import { Module } from '@nestjs/common'
import { TestsController } from './tests.controller'
import { TestsService } from './tests.service'
import { PrismaModule } from 'src/prisma/prisma.module'
import { AuthModule } from '../auth/auth.module'
import { CommonModule } from 'src/common/common.module'
import { LlmModule } from 'src/common/llm/llm.module'

@Module({
	imports: [PrismaModule, AuthModule, CommonModule, LlmModule],
	controllers: [TestsController],
	providers: [TestsService],
})
export class TestsModule {}
