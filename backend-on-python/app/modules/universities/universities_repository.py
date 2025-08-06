from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.core.models.countries_model import Country
from app.core.models.universities_models import (
    Institution,
    UniversitiesAnalysis,
)
from app.modules.universities.universities_schemas import (
    InstitutionFilterRequest,
    UniversityAnalysisRequest,
)


class UniversitiesRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_countries_with_university_count(self):
        return (
            self.db.query(
                Country.id,
                Country.name,
                Country.emoji,
                func.count(Institution.id).label("universities_count"),
            )
            .join(Institution, Country.id == Institution.country_id)
            .group_by(Country.id, Country.name, Country.emoji)
            .all()
        )

    def get_institutions(self, filters: InstitutionFilterRequest):
        query = self.db.query(Institution)
        if filters.country_id:
            query = query.filter(Institution.country_id == filters.country_id)
        if filters.search:
            query = query.filter(Institution.name.ilike(f"%{filters.search}%"))
        return query.all()

    def get_institution_by_id(self, institution_id: int):
        return (
            self.db.query(Institution)
            .options(
                joinedload(Institution.majors),
                joinedload(Institution.enrollment_documents),
                joinedload(Institution.enrollment_requirements),
            )
            .filter(Institution.id == institution_id)
            .first()
        )

    def create_university_analysis(
        self, user_id: int, analysis_data: dict
    ) -> UniversitiesAnalysis:
        new_analysis = UniversitiesAnalysis(user_id=user_id, **analysis_data)
        self.db.add(new_analysis)
        self.db.commit()
        self.db.refresh(new_analysis)
        return new_analysis

    def get_latest_university_analysis(self, user_id: int):
        return (
            self.db.query(UniversitiesAnalysis)
            .filter(UniversitiesAnalysis.user_id == user_id)
            .order_by(UniversitiesAnalysis.created_at.desc())
            .first()
        )
