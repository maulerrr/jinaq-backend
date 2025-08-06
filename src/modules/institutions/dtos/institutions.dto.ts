import {
	InstitutionMajorCategory,
	InstitutionFinancingType,
	InstitutionType,
	EnrollmentRequirementType,
	AttributeType,
} from '@prisma/client'
import { PaginationParamsFilter } from 'src/common/utils/pagination.util'
import { CityDto } from 'src/modules/cities/dtos/cities.dtos'
import { CountryDto } from 'src/modules/countries/dtos/countries.dtos'

export class InstitutionCountryDto {
	id: number
	name: string
	emoji: string
	universitiesCount: number
}

export class InstitutionMajorDto {
	id: number
	name: string
	durationYears?: number
	learningLanguage?: string
	description?: string
	price?: number
	category: InstitutionMajorCategory
}

export class InstitutionEnrollmentDocumentDto {
	id: number
	name: string
}

export class InstitutionEnrollmentRequirementDto {
	id: number
	name: string
	type: EnrollmentRequirementType
	value?: string
}

export class InstitutionFilterDto extends PaginationParamsFilter {
	countryId?: number
	search?: string
}

export class InstitutionDto {
	id: number
	name: string
	shortName?: string
	description: string
	foundationYear?: string
	financingType: InstitutionFinancingType
	type: InstitutionType
	website?: string
	email?: string
	contactNumber?: string
	address?: string
	hasDorm: boolean
	imageUrl?: string
	city: CityDto
	country: CountryDto
}

export class InstitutionDetailsDto extends InstitutionDto {
	majors: InstitutionMajorDto[]
	enrollmentDocuments: InstitutionEnrollmentDocumentDto[]
	enrollmentRequirements: InstitutionEnrollmentRequirementDto[]
}

export class UniversityAnalysisRequestDto {
	countryId: number
	institutionIds?: number[]
}

export class UniversitiesAnalysisResultsAttributesDto {
	name: string
	type: AttributeType
	recommendation?: string
}

export class UniversitiesAnalysisResultsPlanDto {
	order: number
	name: string
	description?: string
	durationMonth?: number
}

export class BaseUniversityAnalysisInstituteDto {
	institution: InstitutionDto
	chancePercentage?: number
}

export class UniversitiesAnalysisInstitutesDto {
	institution: InstitutionDto
	chancePercentage?: number
	attributes: UniversitiesAnalysisResultsAttributesDto[]
	plan: UniversitiesAnalysisResultsPlanDto[]
}

export class BaseUniversityAnalysis {
	id: number
	createdAt: Date
	institutes: BaseUniversityAnalysisInstituteDto[]
}

export class UniversityAnalysisDto {
	id: number
	createdAt: Date
	institutes: UniversitiesAnalysisInstitutesDto[]
}

// Interface for the expected LLM response structure
export interface LLMUniversityAnalysisResponse {
	institutes: {
		institution: {
			id: number
		}
		chancePercentage?: number
		attributes: {
			name: string
			type: AttributeType
			recommendation?: string
		}[]
		plan: {
			order: number
			name: string
			description?: string
			durationMonth?: number
		}[]
	}[]
}

export interface InstituteProbability {
	institutionId: number
	chancePercentage: number
}

export interface InstituteAnalysisResultAttribute {
	name: string
	type: AttributeType
	recommendation?: string
	description?: string
}

export interface InstituteAnalysisResultPlan {
	order: number
	name: string
	description?: string
	durationMonth?: number
}

export interface UniversityAnalysis {
	attributes: InstituteAnalysisResultAttribute[]
	plan: InstituteAnalysisResultPlan[]
}
