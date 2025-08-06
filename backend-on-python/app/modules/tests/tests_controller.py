from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.core.models.users_model import User
from app.core.utils.auth_utils import get_current_user
from app.modules.tests.tests_schemas import (
    TestSummaryResponse,
    TestDetailsResponse,
    TestQuestionResponse,
    TestQuestionSubmitRequest,
    PersonalityAnalysisResponse,
)
from app.modules.tests.tests_service import TestsService

router = APIRouter()


@router.get("/", response_model=List[TestSummaryResponse])
def get_tests(
    current_user: User = Depends(get_current_user),
    service: TestsService = Depends(),
):
    return service.get_all_tests_for_user(current_user.id)


@router.get("/{test_id}", response_model=TestDetailsResponse)
def get_test_details(
    test_id: int,
    current_user: User = Depends(get_current_user),
    service: TestsService = Depends(),
):
    return service.get_test_details(current_user.id, test_id)


@router.get("/{test_id}/questions/{question_id}", response_model=TestQuestionResponse)
def get_test_question(
    test_id: int,
    question_id: int,
    service: TestsService = Depends(),
):
    return service.get_test_question(test_id, question_id)


@router.post("/{test_id}/questions/{question_id}")
def submit_answer(
    test_id: int,
    question_id: int,
    data: TestQuestionSubmitRequest,
    current_user: User = Depends(get_current_user),
    service: TestsService = Depends(),
):
    service.submit_answer(current_user.id, test_id, question_id, data)
    return {"message": "Answer submitted successfully"}


@router.post("/analysis", response_model=PersonalityAnalysisResponse)
def analyze_tests(
    current_user: User = Depends(get_current_user),
    service: TestsService = Depends(),
):
    return service.analyze_tests(current_user.id)
