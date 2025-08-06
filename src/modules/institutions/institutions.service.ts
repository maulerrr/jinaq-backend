import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import {
	InstitutionCountryDto,
	InstitutionDetailsDto,
	InstitutionDto,
	InstitutionFilterDto,
	UniversityAnalysisRequestDto,
	UniversityAnalysisDto,
	UniversityAnalysis,
	BaseUniversityAnalysis,
	InstituteProbability,
} from './dtos/institutions.dto'
import {
	toBaseUniversityAnalysisDto,
	toInstitutionCountryDto,
	toInstitutionDetailsDto,
	toInstitutionDto,
	toUniversityAnalysisDto,
} from './utils/institutions.mapper'
import { PaginatedResponse, mapPaginatedResponse } from 'src/common/utils/pagination.util'
import { Prisma } from '@prisma/client'
import { paginatePrisma } from 'src/common/utils/prisma-pagination.util'
import { PromptBuilderService } from 'src/common/llm/prompt.builder'
import { OpenAIUniversitiesAdapter } from 'src/common/adapters/llm/openai-universities.adapter'

@Injectable()
export class InstitutionsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly llmAdapter: OpenAIUniversitiesAdapter,
		private readonly promptBuilderService: PromptBuilderService,
	) {}

	async getCountriesWithInstitutionCount(): Promise<InstitutionCountryDto[]> {
		const countriesData = await this.prisma.country.findMany({
			include: {
				_count: {
					select: { institutions: true },
				},
			},
		})

		return countriesData.map(toInstitutionCountryDto)
	}

	async getInstitutions(filters: InstitutionFilterDto): Promise<PaginatedResponse<InstitutionDto>> {
		const where: Prisma.InstitutionWhereInput = {}
		if (filters.countryId) {
			where.countryId = filters.countryId
		}
		if (filters.search) {
			where.name = { contains: filters.search, mode: 'insensitive' }
		}

		const paginatedInstitutions = await paginatePrisma(
			this.prisma.institution,
			{
				where,
				include: {
					city: true,
					country: true,
				},
				orderBy: { name: 'asc' },
			},
			this.prisma.institution,
			{ where },
			filters,
		)

		return mapPaginatedResponse(paginatedInstitutions, toInstitutionDto)
	}

	async getInstitutionById(institutionId: number): Promise<InstitutionDetailsDto> {
		const institution = await this.prisma.institution.findUnique({
			where: { id: institutionId },
			include: {
				majors: true,
				enrollmentDocuments: true,
				enrollmentRequirements: true,
				city: true,
				country: true,
			},
		})

		if (!institution) {
			throw new NotFoundException('Institution not found')
		}

		return toInstitutionDetailsDto(institution)
	}

	async createUniversityAnalysis(
		userId: number,
		analysisRequest: UniversityAnalysisRequestDto,
	): Promise<BaseUniversityAnalysis> {
		const llmResponse = await this.llmAdapter.getUniversityAnalysis(
			userId,
			analysisRequest.countryId,
			analysisRequest.institutionIds,
		)

		if (!llmResponse) {
			throw new InternalServerErrorException('Failed to get analysis from LLM')
		}
		// Now that we've checked for null, we can assert the type
		const validatedLlmResponse: InstituteProbability[] = llmResponse

		const newAnalysis = await this.prisma.universitiesAnalysis.create({
			data: {
				userId,
				institutes: {
					create: validatedLlmResponse.map(institute => ({
						institutionId: institute.institutionId,
						chancePercentage: institute.chancePercentage,
					})),
				},
			},
			include: {
				institutes: {
					include: {
						institution: {
							include: {
								city: true,
								country: true,
								majors: true,
								enrollmentDocuments: true,
								enrollmentRequirements: true,
							},
						},
					},
				},
			},
		})

		return toBaseUniversityAnalysisDto(newAnalysis)
	}

	async getUniversityAnalysisById(
		userId: number,
		institutionId: number,
	): Promise<UniversityAnalysisDto> {
		const universityAnalysis = await this.prisma.universitiesAnalysisInstitute.findFirst({
			where: { institutionId: institutionId },
		})
		if (!universityAnalysis) {
			throw new NotFoundException('University analysis not found')
		}

		const llmResponse: UniversityAnalysis | null = await this.llmAdapter.getAnalysisByUniversity(
			userId,
			institutionId,
		)

		if (!llmResponse) {
			throw new InternalServerErrorException('Failed to get analysis from LLM')
		}

		const attributes = await this.prisma.universitiesAnalysisResultsAttribute.createMany({
			data: llmResponse.attributes.map(attribute => ({
				name: attribute.name,
				type: attribute.type,
				recommendation: attribute.recommendation,
				universitiesAnalysisInstitutesId: universityAnalysis.id,
			})),
		})

		const plans = await this.prisma.universitiesAnalysisResultsPlan.createMany({
			data: llmResponse.plan.map(plan => ({
				order: plan.order,
				name: plan.name,
				description: plan.description,
				durationMonth: plan.durationMonth,
				universitiesAnalysisInstitutesId: universityAnalysis.id,
			})),
		})

		if (attributes.count === 0 || plans.count === 0) {
			throw new InternalServerErrorException('Failed to save analysis results')
		}

		const analysis = await this.prisma.universitiesAnalysis.findUnique({
			where: { id: universityAnalysis.id },
			include: {
				institutes: {
					include: {
						institution: {
							include: {
								city: true,
								country: true,
								majors: true,
								enrollmentDocuments: true,
								enrollmentRequirements: true,
							},
						},
						attributes: true,
						plan: true,
					},
				},
			},
		})
		if (!analysis) {
			throw new NotFoundException('Analysis not found')
		}
		return toUniversityAnalysisDto(analysis)
	}

	async getLatestUniversityAnalysis(userId: number): Promise<UniversityAnalysisDto> {
		const analysis = await this.prisma.universitiesAnalysis.findFirst({
			where: { userId },
			orderBy: { createdAt: 'desc' },
			include: {
				institutes: {
					include: {
						institution: {
							include: {
								city: true,
								country: true,
								majors: true,
								enrollmentDocuments: true,
								enrollmentRequirements: true,
							},
						},
						attributes: true,
						plan: true,
					},
				},
			},
		})

		if (!analysis) {
			throw new NotFoundException('No analysis found for this user')
		}

		return toUniversityAnalysisDto(analysis)
	}
}
