import {
	Controller,
	Get,
	Post,
	Param,
	Body,
	Query,
	UseGuards,
	ParseIntPipe,
	HttpCode,
	HttpStatus,
	NotFoundException,
} from '@nestjs/common'
import { InstitutionsService } from './institutions.service'
import {
	InstitutionCountryDto,
	InstitutionDetailsDto,
	InstitutionDto,
	InstitutionFilterDto,
	UniversityAnalysisRequestDto,
	UniversityAnalysisDto,
	BaseUniversityAnalysis,
} from './dtos/institutions.dto'
import { ApiTags } from '@nestjs/swagger'
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator'
import { UserAuthGuard } from 'src/common/guards/user-auth.guard'
import { User } from '@prisma/client'
import { PaginatedResponse } from 'src/common/utils/pagination.util'

@ApiTags('institutions')
@Controller('institutions')
export class InstitutionsController {
	constructor(private readonly institutionsService: InstitutionsService) {}

	@Get('countries')
	@HttpCode(HttpStatus.OK)
	async getCountries(): Promise<InstitutionCountryDto[]> {
		return this.institutionsService.getCountriesWithInstitutionCount()
	}

	@Get()
	@HttpCode(HttpStatus.OK)
	async getInstitutions(
		@Query() filters: InstitutionFilterDto,
	): Promise<PaginatedResponse<InstitutionDto>> {
		return this.institutionsService.getInstitutions(filters)
	}

	@Get(':id')
	@HttpCode(HttpStatus.OK)
	async getInstitutionDetails(
		@Param('id', ParseIntPipe) id: number,
	): Promise<InstitutionDetailsDto> {
		const institution = await this.institutionsService.getInstitutionById(id)
		if (!institution) {
			throw new NotFoundException('Institution not found')
		}
		return institution
	}

	@Post('analyze')
	@UseGuards(UserAuthGuard)
	@HttpCode(HttpStatus.OK)
	async analyzeUniversities(
		@Body() analysisRequest: UniversityAnalysisRequestDto,
		@GetCurrentUser() user: User,
	): Promise<BaseUniversityAnalysis> {
		return this.institutionsService.createUniversityAnalysis(user.id, analysisRequest)
	}

	@Get('analyze/:id')
	@UseGuards(UserAuthGuard)
	@HttpCode(HttpStatus.OK)
	async getUniversityAnalysis(
		@Param('id', ParseIntPipe) id: number,
		@GetCurrentUser() user: User,
	): Promise<UniversityAnalysisDto> {
		return this.institutionsService.getUniversityAnalysisById(user.id, id)
	}

	@Get('analysis')
	@UseGuards(UserAuthGuard)
	@HttpCode(HttpStatus.OK)
	async getLatestAnalysis(@GetCurrentUser() user: User): Promise<UniversityAnalysisDto> {
		const analysis = await this.institutionsService.getLatestUniversityAnalysis(user.id)
		if (!analysis) {
			throw new NotFoundException('No analysis found')
		}
		return analysis
	}
}
