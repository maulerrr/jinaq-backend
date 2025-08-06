import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Query,
} from '@nestjs/common'
import { PaginatedResponse } from 'src/common/utils/pagination.util'
import {
	ProfessionFilter,
	ProfessionDto,
	CreateProfessionDto,
	UpdateProfessionDto,
} from './dtos/professions.dtos'
import { ProfessionsService } from './professions.service'

@Controller('professions')
export class ProfessionsController {
	constructor(private readonly professionsService: ProfessionsService) {}

	@Get()
	async getAllProfessions(
		@Query() filters: ProfessionFilter,
	): Promise<PaginatedResponse<ProfessionDto>> {
		return this.professionsService.getAllProfessions(filters)
	}

	@Get(':id')
	async getProfessionById(@Param('id', ParseIntPipe) id: number): Promise<ProfessionDto> {
		return this.professionsService.getProfessionById(id)
	}

	@Post()
	async createProfession(@Body() dto: CreateProfessionDto): Promise<ProfessionDto> {
		return this.professionsService.createProfession(dto)
	}

	@Put(':id')
	async updateProfession(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: UpdateProfessionDto,
	): Promise<ProfessionDto> {
		return this.professionsService.updateProfession(id, dto)
	}

	@Delete(':id')
	async deleteProfession(@Param('id', ParseIntPipe) id: number): Promise<void> {
		return this.professionsService.deleteProfession(id)
	}
}
