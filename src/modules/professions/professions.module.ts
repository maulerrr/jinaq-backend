import { Module } from '@nestjs/common'
import { ProfessionsController } from './professions.controller'
import { PrismaModule } from 'src/prisma/prisma.module'
import { ProfessionsService } from './professions.service'

@Module({
	imports: [PrismaModule],
	controllers: [ProfessionsController],
	providers: [ProfessionsService],
	exports: [],
})
export class ProfessionsModule {}
