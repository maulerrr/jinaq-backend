from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database.session import get_async_session
from app.modules.llm.llm_service import LLMService
from app.modules.llm.prompt_builder import build_university_analysis_prompt
from app.modules.universities.universities_repository import UniversitiesRepository
from app.modules.universities.universities_schemas import (
    InstitutionFilterRequest,
    UniversityAnalysisRequest,
    UniversitiesCountryResponse,
)
from app.core.utils.serialization_utils import (
    serialize_institution,
    serialize_user_profile,
)
from app.modules.users.users_repository import UserRepository


class UniversitiesService:
    def __init__(self, db: Session = Depends(get_async_session)):
        self.repository = UniversitiesRepository(db)
        self.users_repository = UserRepository(db)
        self.llm_service = LLMService()

    def get_countries_with_university_count(self):
        countries_data = self.repository.get_countries_with_university_count()
        return [
            UniversitiesCountryResponse(
                id=row.id,
                name=row.name,
                emoji=row.emoji,
                universities_count=row.universities_count,
            )
            for row in countries_data
        ]

    def get_institutions(self, filters: InstitutionFilterRequest):
        return self.repository.get_institutions(filters)

    def get_institution_by_id(self, institution_id: int):
        return self.repository.get_institution_by_id(institution_id)

    def create_university_analysis(
        self, user_id: int, analysis_request: UniversityAnalysisRequest
    ):
        user = self.users_repository.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if analysis_request.institution_ids:
            institutions = [
                self.get_institution_by_id(inst_id)
                for inst_id in analysis_request.institution_ids
            ]
        else:
            institutions = self.repository.get_institutions(
                InstitutionFilterRequest()
            )[: self.llm_service.settings.llm.max_universities_for_analysis]

        user_profile = serialize_user_profile(user)
        universities_data = [
            serialize_institution(inst) for inst in institutions
        ]

        prompt = build_university_analysis_prompt(user_profile, universities_data)
        llm_response = self.llm_service.get_university_analysis(prompt)

        if not llm_response:
            raise HTTPException(
                status_code=500, detail="Failed to get analysis from LLM"
            )

        return self.repository.create_university_analysis(user_id, llm_response)

    def get_latest_university_analysis(self, user_id: int):
        return self.repository.get_latest_university_analysis(user_id)
