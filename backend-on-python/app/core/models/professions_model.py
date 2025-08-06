from sqlalchemy import Column, Integer, String, DECIMAL, Enum
from sqlalchemy.orm import relationship
from app.core.models.base import Base

class Professions(Base):
    __tablename__ = "professions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    category = Column(String) # category is a string now, could be Enum if defined
    description = Column(String)
    start_salary = Column(DECIMAL(10, 2))
    end_salary = Column(DECIMAL(10, 2))
    popularity = Column(Enum("LOW", "MEDIUM", "HIGH", name="popularity_enum"))
    skills = Column(String) # Assuming skills is a string, could be Array of String if defined

    personality_analyses = relationship("PersonalityAnalysisProfessions", back_populates="profession")
