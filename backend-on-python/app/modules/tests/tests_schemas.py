from typing import List, Optional

from pydantic import BaseModel, Field

from app.core.models.tests_models import (
    TestSubmissionStatus,
    PersonalityAnalysisAttributeType,
)


class TestSummaryResponse(BaseModel):
    id: int
    title: str
    description: str
    all_questions_count: int = Field(..., alias="allQuestionsCount")
    estimated_time_in_minutes: int = Field(..., alias="estimatedTimeInMinutes")
    completed_questions_count: int = Field(..., alias="completedQuestionsCount")
    status: TestSubmissionStatus

    class Config:
        from_attributes = True
        validate_by_name = True


class TestDetailsResponse(TestSummaryResponse):
    last_question_id: Optional[int] = Field(None, alias="lastQuestionId")

    class Config:
        validate_by_name = True


class AnswerResponse(BaseModel):
    id: int
    answer: str

    class Config:
        from_attributes = True


class TestQuestionResponse(BaseModel):
    id: int
    question: str
    answers: List[AnswerResponse]
    next_question_id: Optional[int] = Field(None, alias="nextQuestionId")
    previous_question_id: Optional[int] = Field(None, alias="previousQuestionId")

    class Config:
        from_attributes = True
        validate_by_name = True


class TestQuestionSubmitRequest(BaseModel):
    answer_id: int = Field(..., alias="answerId")

    class Config:
        validate_by_name = True


class ShortAnalysisResponse(BaseModel):
    analysis_summary: str
    analysis_key_factors: List[str]

    class Config:
        from_attributes = True


class PersonalityAnalysisMbtiResponse(BaseModel):
    title: str
    description: str
    mbti_code: str
    mbti_name: str
    short_attributes: List[str]
    work_styles: List[str]
    introversion_percentage: int
    thinking_percentage: int
    creativity_percentage: int
    intuition_percentage: int
    planning_percentage: int
    leading_percentage: int

    class Config:
        from_attributes = True


class PersonalityAnalysisProfessionsResponse(BaseModel):
    profession_id: int
    percentage: int

    class Config:
        from_attributes = True


class PersonalityAnalysisMajorsResponse(BaseModel):
    category: str

    class Config:
        from_attributes = True


class PersonalityAnalysisAttributesResponse(BaseModel):
    type: PersonalityAnalysisAttributeType
    name: str
    description: str
    recommendations: str

    class Config:
        from_attributes = True


class PersonalityAnalysisResponse(BaseModel):
    id: int
    mbti: PersonalityAnalysisMbtiResponse
    professions: List[PersonalityAnalysisProfessionsResponse]
    majors: List[PersonalityAnalysisMajorsResponse]
    attributes: List[PersonalityAnalysisAttributesResponse]

    class Config:
        from_attributes = True
