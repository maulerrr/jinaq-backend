import {
	Institution,
	Country,
	City,
	InstitutionMajor,
	InstitutionEnrollmentDocument,
	InstitutionEnrollmentRequirement,
	UniversitiesAnalysis,
	UniversitiesAnalysisResultsAttribute,
	UniversitiesAnalysisResultsPlan,
	UniversitiesAnalysisInstitute,
} from '@prisma/client'
import {
	InstitutionCountryDto,
	InstitutionDto,
	InstitutionDetailsDto,
	InstitutionMajorDto,
	InstitutionEnrollmentDocumentDto,
	InstitutionEnrollmentRequirementDto,
	UniversityAnalysisDto,
	UniversitiesAnalysisInstitutesDto,
	UniversitiesAnalysisResultsAttributesDto,
	UniversitiesAnalysisResultsPlanDto,
	BaseUniversityAnalysis,
} from '../dtos/institutions.dto'

type InstitutionWithRelations = Institution & {
	country: Country
	city: City
	majors?: InstitutionMajor[]
	enrollmentDocuments?: InstitutionEnrollmentDocument[]
	enrollmentRequirements?: InstitutionEnrollmentRequirement[]
}

type UniversitiesAnalysisWithInsitutes = UniversitiesAnalysis & {
	institutes: (UniversitiesAnalysisInstitute & {
		institution: InstitutionWithRelations
	})[]
}

type UniversitiesAnalysisWithRelations = UniversitiesAnalysis & {
	institutes: (UniversitiesAnalysisInstitute & {
		institution: InstitutionWithRelations
		attributes: UniversitiesAnalysisResultsAttribute[]
		plan: UniversitiesAnalysisResultsPlan[]
	})[]
}

export function toInstitutionCountryDto(
	country: Country & { _count: { institutions: number } },
): InstitutionCountryDto {
	return {
		id: country.id,
		name: country.name,
		emoji: country.emoji ?? '',
		universitiesCount: country._count.institutions,
	}
}

export function toInstitutionDto(institution: InstitutionWithRelations): InstitutionDto {
	return {
		id: institution.id,
		name: institution.name,
		shortName: institution.shortName ?? undefined,
		description: institution.description ?? '',
		foundationYear: institution.foundationYear ?? undefined,
		financingType: institution.financingType,
		type: institution.type,
		website: institution.website ?? undefined,
		email: institution.email ?? undefined,
		contactNumber: institution.contactNumber ?? undefined,
		city: {
			id: institution.city.id,
			name: institution.city.name,
			countryId: institution.city.countryId,
			createdAt: institution.city.createdAt,
			updatedAt: institution.city.updatedAt,
		},
		country: {
			id: institution.country.id,
			name: institution.country.name,
			emoji: institution.country.emoji ?? '',
			createdAt: institution.country.createdAt,
			updatedAt: institution.country.updatedAt,
		},
		address: institution.address ?? undefined,
		hasDorm: institution.hasDorm,
		imageUrl: institution.imageUrl ?? undefined,
	}
}

export function toInstitutionMajorDto(major: InstitutionMajor): InstitutionMajorDto {
	return {
		id: major.id,
		name: major.name,
		durationYears: major.durationYears ?? undefined,
		learningLanguage: major.learningLanguage ?? undefined,
		description: major.description ?? undefined,
		price: major.price ?? 0, // Fallback to 0 if price is null, assuming price is a number
		category: major.category,
	}
}

export function toInstitutionEnrollmentDocumentDto(
	document: InstitutionEnrollmentDocument,
): InstitutionEnrollmentDocumentDto {
	return {
		id: document.id,
		name: document.name,
	}
}

export function toInstitutionEnrollmentRequirementDto(
	requirement: InstitutionEnrollmentRequirement,
): InstitutionEnrollmentRequirementDto {
	return {
		id: requirement.id,
		name: requirement.name,
		type: requirement.type,
		value: requirement.value ?? undefined,
	}
}

export function toInstitutionDetailsDto(
	institution: InstitutionWithRelations,
): InstitutionDetailsDto {
	return {
		...toInstitutionDto(institution),
		majors: institution.majors?.map(toInstitutionMajorDto) || [],
		enrollmentDocuments:
			institution.enrollmentDocuments?.map(toInstitutionEnrollmentDocumentDto) || [],
		enrollmentRequirements:
			institution.enrollmentRequirements?.map(toInstitutionEnrollmentRequirementDto) || [],
	}
}

export function toUniversitiesAnalysisResultsAttributesDto(
	attribute: UniversitiesAnalysisResultsAttribute,
): UniversitiesAnalysisResultsAttributesDto {
	return {
		name: attribute.name,
		type: attribute.type,
		recommendation: attribute.recommendation ?? undefined,
	}
}

export function toUniversitiesAnalysisResultsPlanDto(
	plan: UniversitiesAnalysisResultsPlan,
): UniversitiesAnalysisResultsPlanDto {
	return {
		order: plan.order,
		name: plan.name,
		description: plan.description ?? undefined,
		durationMonth: plan.durationMonth ?? undefined,
	}
}

export function toUniversitiesAnalysisInstitutesDto(
	institute: UniversitiesAnalysisInstitute & {
		institution: InstitutionWithRelations
		attributes: UniversitiesAnalysisResultsAttribute[]
		plan: UniversitiesAnalysisResultsPlan[]
	},
): UniversitiesAnalysisInstitutesDto {
	return {
		institution: toInstitutionDto(institute.institution),
		chancePercentage: institute.chancePercentage ?? undefined,
		attributes: institute.attributes.map(toUniversitiesAnalysisResultsAttributesDto),
		plan: institute.plan.map(toUniversitiesAnalysisResultsPlanDto),
	}
}

export function toUniversityAnalysisDto(
	analysis: UniversitiesAnalysisWithRelations,
): UniversityAnalysisDto {
	return {
		id: analysis.id,
		createdAt: analysis.createdAt,
		institutes: analysis.institutes.map(toUniversitiesAnalysisInstitutesDto),
	}
}

export function toBaseUniversityAnalysisDto(
	analysis: UniversitiesAnalysisWithInsitutes,
): BaseUniversityAnalysis {
	return {
		id: analysis.id,
		createdAt: analysis.createdAt,
		institutes: analysis.institutes.map(institute => ({
			institution: toInstitutionDto(institute.institution),
			chancePercentage: institute.chancePercentage ?? undefined,
		})),
	}
}
