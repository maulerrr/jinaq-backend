import enum

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey,
    Enum,
    Text,
    DateTime,
    func,
)
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship

from app.core.models.base import Base
from app.core.models.professions_model import Professions


class TestSubmissionStatus(enum.Enum):
    COMPLETED = "COMPLETED"
    ACTIVE = "ACTIVE"
    NOT_STARTED = "NOT_STARTED"


class PersonalityAnalysisAttributeType(enum.Enum):
    PROS = "PROS"
    CONS = "CONS"


class Test(Base):
    __tablename__ = "tests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    tags = Column(ARRAY(String))
    estimated_time_minutes = Column(Integer)

    questions = relationship("Question", back_populates="test")
    submissions = relationship("TestSubmission", back_populates="test")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=False)
    question = Column(Text, nullable=False)
    order = Column(Integer, nullable=False)

    test = relationship("Test", back_populates="questions")
    answers = relationship("Answer", back_populates="question")


class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    answer = Column(Text, nullable=False)
    is_correct = Column(Boolean)

    question = relationship("Question", back_populates="answers")


class TestSubmission(Base):
    __tablename__ = "test_submission"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(TestSubmissionStatus), nullable=False)
    analysis_summary = Column(Text)
    analysis_key_factors = Column(ARRAY(String))

    test = relationship("Test", back_populates="submissions")
    user = relationship("User")
    submitted_answers = relationship(
        "TestSubmissionQuestion", back_populates="submission"
    )


class TestSubmissionQuestion(Base):
    __tablename__ = "test_submission_question"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("test_submission.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    answer_id = Column(Integer, ForeignKey("answers.id"), nullable=False)

    submission = relationship("TestSubmission", back_populates="submitted_answers")
    question = relationship("Question")
    answer = relationship("Answer")


class PersonalityAnalysis(Base):
    __tablename__ = "personality_analysis"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User")
    mbti = relationship("PersonalityAnalysisMbti", back_populates="analysis")
    professions = relationship(
        "PersonalityAnalysisProfessions", back_populates="analysis"
    )
    majors = relationship("PersonalityAnalysisMajors", back_populates="analysis")
    attributes = relationship(
        "PersonalityAnalysisAttributes", back_populates="analysis"
    )


class PersonalityAnalysisMbti(Base):
    __tablename__ = "personality_analysis_mbti"

    id = Column(Integer, primary_key=True, index=True)
    personality_analysis_id = Column(
        Integer, ForeignKey("personality_analysis.id"), nullable=False
    )
    title = Column(String)
    description = Column(Text)
    mbti_code = Column(String)
    mbti_name = Column(String)
    short_attributes = Column(ARRAY(String))
    work_styles = Column(ARRAY(String))
    introversion_percentage = Column(Integer)
    thinking_percentage = Column(Integer)
    creativity_percentage = Column(Integer)
    intuition_percentage = Column(Integer)
    planning_percentage = Column(Integer)
    leading_percentage = Column(Integer)

    analysis = relationship("PersonalityAnalysis", back_populates="mbti")


class PersonalityAnalysisProfessions(Base):
    __tablename__ = "personality_analysis_professions"

    id = Column(Integer, primary_key=True, index=True)
    personality_analysis_id = Column(
        Integer, ForeignKey("personality_analysis.id"), nullable=False
    )
    profession_id = Column(Integer, ForeignKey("professions.id"), nullable=False)
    percentage = Column(Integer)

    analysis = relationship("PersonalityAnalysis", back_populates="professions")
    profession = relationship(Professions)


class PersonalityAnalysisMajors(Base):
    __tablename__ = "personality_analysis_majors"

    id = Column(Integer, primary_key=True, index=True)
    personality_analysis_id = Column(
        Integer, ForeignKey("personality_analysis.id"), nullable=False
    )
    category = Column(String)

    analysis = relationship("PersonalityAnalysis", back_populates="majors")


class PersonalityAnalysisAttributes(Base):
    __tablename__ = "personality_analysis_attributes"

    id = Column(Integer, primary_key=True, index=True)
    personality_analysis_id = Column(
        Integer, ForeignKey("personality_analysis.id"), nullable=False
    )
    type = Column(Enum(PersonalityAnalysisAttributeType), nullable=False)
    name = Column(String)
    description = Column(Text)
    recommendations = Column(Text)

    analysis = relationship("PersonalityAnalysis", back_populates="attributes")
