from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.modules.cities.cities_schemas import CityResponse
from app.modules.countries.countries_schemas import CountryResponse
from app.core.models.universities_models import (
    InstitutionMajorCategory,
    InstitutionFinancingType,
    InstitutionType,
    EnrollmentRequirementType,
    AttributeType,
)


# Base Schemas
class UniversitiesCountryResponse(BaseModel):
    id: int
    name: str
    emoji: str
    universities_count: int = Field(..., alias="universitiesCount")

    class Config:
        from_attributes = True
        validate_by_name = True


class InstitutionMajorResponse(BaseModel):
    id: int
    name: str
    duration_years: int = Field(..., alias="durationYears")
    learning_language: str = Field(..., alias="learningLanguage")
    description: str
    price: float
    category: InstitutionMajorCategory

    class Config:
        from_attributes = True
        validate_by_name = True


class InstitutionEnrollmentDocumentResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class InstitutionEnrollmentRequirementResponse(BaseModel):
    id: int
    name: str
    type: EnrollmentRequirementType
    value: str

    class Config:
        from_attributes = True


class InstitutionFilterRequest(BaseModel):
    country_id: Optional[int] = Field(None, alias="countryId")
    search: Optional[str] = None

    class Config:
        validate_by_name = True


class InstitutionResponse(BaseModel):
    id: int
    name: str
    short_name: str = Field(..., alias="shortName")
    description: str
    foundation_year: str = Field(..., alias="foundationYear")
    financing_type: InstitutionFinancingType = Field(..., alias="financingType")
    type: InstitutionType
    website: str
    email: str
    contact_number: str = Field(..., alias="contactNumber")
    city: CityResponse
    country: CountryResponse
    address: str
    has_dorm: bool = Field(..., alias="hasDorm")
    image_url: str = Field(..., alias="imageUrl")

    class Config:
        from_attributes = True
        validate_by_name = True


class InstitutionDetailsResponse(InstitutionResponse):
    majors: List[InstitutionMajorResponse]
    enrollment_documents: List[InstitutionEnrollmentDocumentResponse] = Field(
        ..., alias="enrollmentDocuments"
    )
    enrollment_requirements: List[InstitutionEnrollmentRequirementResponse] = Field(
        ..., alias="enrollmentRequirements"
    )

    class Config:
        validate_by_name = True


# Analysis Schemas
class UniversityAnalysisRequest(BaseModel):
    institution_ids: Optional[List[int]] = Field(None, alias="institutionIds")

    class Config:
        validate_by_name = True


class UniversitiesAnalysisResultsAttributesResponse(BaseModel):
    name: str
    type: AttributeType
    recommendation: str

    class Config:
        from_attributes = True


class UniversitiesAnalysisResultsPlanResponse(BaseModel):
    order: int
    name: str
    description: str
    duration_month: int

    class Config:
        from_attributes = True


class UniversitiesAnalysisInstitutesResponse(BaseModel):
    institution: InstitutionResponse
    chance_percentage: float = Field(..., alias="chancePercentage")
    attributes: List[UniversitiesAnalysisResultsAttributesResponse]
    plan: List[UniversitiesAnalysisResultsPlanResponse]

    class Config:
        from_attributes = True
        validate_by_name = True


class UniversityAnalysisResponse(BaseModel):
    id: int
    created_at: datetime = Field(..., alias="createdAt")
    institutes: List[UniversitiesAnalysisInstitutesResponse]

    class Config:
        from_attributes = True
        validate_by_name = True
