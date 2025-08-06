import enum

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey,
    Enum,
    Float,
    DateTime,
    func,
    Text,
)
from sqlalchemy.orm import relationship

from app.core.models.base import Base


class InstitutionMajorCategory(enum.Enum):
    STEM = "STEM"
    BUSINESS = "BUSINESS"
    ARTS = "ARTS"
    HUMANITIES = "HUMANITIES"
    MEDICINE = "MEDICINE"
    LAW = "LAW"
    OTHER = "OTHER"


class InstitutionFinancingType(enum.Enum):
    PRIVATE = "PRIVATE"
    GOV = "GOV"
    AUTONOMOUS = "AUTONOMOUS"


class InstitutionType(enum.Enum):
    SCHOOL = "SCHOOL"
    COLLEGE = "COLLEGE"
    UNIVERSITY = "UNIVERSITY"


class EnrollmentRequirementType(enum.Enum):
    ACADEMIC = "ACADEMIC"
    LANGUAGE = "LANGUAGE"
    OTHER = "OTHER"


class AttributeType(enum.Enum):
    PROS = "PROS"
    CONS = "CONS"


class Institution(Base):
    __tablename__ = "institutions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    short_name = Column(String)
    description = Column(String)
    foundation_year = Column(String)
    financing_type = Column(Enum(InstitutionFinancingType), nullable=False)
    type = Column(Enum(InstitutionType), nullable=False)
    website = Column(String)
    email = Column(String)
    contact_number = Column(String)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=False)
    country_id = Column(Integer, ForeignKey("countries.id"), nullable=False)
    address = Column(String)
    has_dorm = Column(Boolean, default=False)
    image_url = Column(String)

    city = relationship("City", back_populates="institutions")
    country = relationship("Country", back_populates="institutions")
    majors = relationship("InstitutionMajor", back_populates="institution")
    enrollment_documents = relationship(
        "InstitutionEnrollmentDocument", back_populates="institution"
    )
    enrollment_requirements = relationship(
        "InstitutionEnrollmentRequirement", back_populates="institution"
    )
    analysis_institutes = relationship(
        "UniversitiesAnalysisInstitutes", back_populates="institution"
    )


class InstitutionMajor(Base):
    __tablename__ = "institution_majors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    duration_years = Column(Integer)
    learning_language = Column(String)
    description = Column(String)
    price = Column(Float)
    category = Column(Enum(InstitutionMajorCategory), nullable=False)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False)

    institution = relationship("Institution", back_populates="majors")


class InstitutionEnrollmentDocument(Base):
    __tablename__ = "institution_enrollment_documents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False)

    institution = relationship("Institution", back_populates="enrollment_documents")


class InstitutionEnrollmentRequirement(Base):
    __tablename__ = "institution_enrollment_requirements"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(Enum(EnrollmentRequirementType), nullable=False)
    value = Column(String)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False)

    institution = relationship("Institution", back_populates="enrollment_requirements")


class UniversitiesAnalysis(Base):
    __tablename__ = "universities_analysis"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="university_analyses")
    institutes = relationship(
        "UniversitiesAnalysisInstitutes", back_populates="analysis"
    )


class UniversitiesAnalysisInstitutes(Base):
    __tablename__ = "universities_analysis_institutes"

    id = Column(Integer, primary_key=True, index=True)
    universities_analysis_id = Column(
        Integer, ForeignKey("universities_analysis.id"), nullable=False
    )
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False)
    chance_percentage = Column(Float)

    analysis = relationship("UniversitiesAnalysis", back_populates="institutes")
    institution = relationship("Institution", back_populates="analysis_institutes")
    attributes = relationship(
        "UniversitiesAnalysisResultsAttributes", back_populates="institute_analysis"
    )
    plan = relationship(
        "UniversitiesAnalysisResultsPlan", back_populates="institute_analysis"
    )


class UniversitiesAnalysisResultsAttributes(Base):
    __tablename__ = "universities_analysis_results_attributes"

    id = Column(Integer, primary_key=True, index=True)
    universities_analysis_institutes_id = Column(
        Integer, ForeignKey("universities_analysis_institutes.id"), nullable=False
    )
    name = Column(String, nullable=False)
    type = Column(Enum(AttributeType), nullable=False)
    recommendation = Column(Text)

    institute_analysis = relationship(
        "UniversitiesAnalysisInstitutes", back_populates="attributes"
    )


class UniversitiesAnalysisResultsPlan(Base):
    __tablename__ = "universities_analysis_results_plan"

    id = Column(Integer, primary_key=True, index=True)
    universities_analysis_institutes_id = Column(
        Integer, ForeignKey("universities_analysis_institutes.id"), nullable=False
    )
    order = Column(Integer, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    duration_month = Column(Integer)

    institute_analysis = relationship(
        "UniversitiesAnalysisInstitutes", back_populates="plan"
    )
