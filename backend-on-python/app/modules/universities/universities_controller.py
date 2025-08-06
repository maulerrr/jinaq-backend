from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.core.models.users_model import User
from app.core.utils.auth_utils import get_current_user
from app.modules.universities.universities_schemas import (
    UniversitiesCountryResponse,
    InstitutionResponse,
    InstitutionDetailsResponse,
    UniversityAnalysisRequest,
    UniversityAnalysisResponse,
    InstitutionFilterRequest,
)
from app.modules.universities.universities_service import UniversitiesService

router = APIRouter()


@router.get(
    "/countries",
    response_model=List[UniversitiesCountryResponse],
    summary="Get list of countries with university counts",
)
def get_countries(
    service: UniversitiesService = Depends(),
):
    return service.get_countries_with_university_count()


@router.get(
    "/institutions",
    response_model=List[InstitutionResponse],
    summary="Get list of institutions with optional filters",
)
def get_institutions(
    filters: InstitutionFilterRequest = Depends(),
    service: UniversitiesService = Depends(),
):
    return service.get_institutions(filters)


@router.get(
    "/institutions/{institution_id}",
    response_model=InstitutionDetailsResponse,
    summary="Get detailed information about a specific institution",
)
def get_institution_details(
    institution_id: int,
    service: UniversitiesService = Depends(),
):
    institution = service.get_institution_by_id(institution_id)
    if not institution:
        raise HTTPException(status_code=404, detail="Institution not found")
    return institution


@router.post(
    "/analyze",
    response_model=UniversityAnalysisResponse,
    summary="Perform university analysis based on user profile",
)
def analyze_universities(
    analysis_request: UniversityAnalysisRequest,
    current_user: User = Depends(get_current_user),
    service: UniversitiesService = Depends(),
):
    return service.create_university_analysis(current_user.id, analysis_request)


@router.get(
    "/analysis",
    response_model=UniversityAnalysisResponse,
    summary="Get the latest university analysis for the current user",
)
def get_latest_analysis(
    current_user: User = Depends(get_current_user),
    service: UniversitiesService = Depends(),
):
    analysis = service.get_latest_university_analysis(current_user.id)
    if not analysis:
        raise HTTPException(status_code=404, detail="No analysis found")
    return analysis
