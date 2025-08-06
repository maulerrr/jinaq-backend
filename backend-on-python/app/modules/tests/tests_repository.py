from typing import List, Optional

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.core.models.tests_models import (
    Test,
    TestSubmission,
    Question,
    TestSubmissionQuestion,
    PersonalityAnalysis,
)


class TestsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_tests(self) -> List[Test]:
        return self.db.query(Test).all()

    def get_test_by_id(self, test_id: int) -> Optional[Test]:
        return self.db.query(Test).filter(Test.id == test_id).first()

    def get_user_test_submission(
        self, user_id: int, test_id: int
    ) -> Optional[TestSubmission]:
        return (
            self.db.query(TestSubmission)
            .filter(TestSubmission.user_id == user_id, TestSubmission.test_id == test_id)
            .first()
        )

    def create_test_submission(self, user_id: int, test_id: int) -> TestSubmission:
        submission = TestSubmission(user_id=user_id, test_id=test_id, status="NOT_STARTED")
        self.db.add(submission)
        self.db.commit()
        self.db.refresh(submission)
        return submission

    def get_question_by_id(self, question_id: int) -> Optional[Question]:
        return self.db.query(Question).filter(Question.id == question_id).first()

    def get_next_question(self, test_id: int, current_order: int) -> Optional[Question]:
        return (
            self.db.query(Question)
            .filter(Question.test_id == test_id, Question.order > current_order)
            .order_by(Question.order)
            .first()
        )

    def get_previous_question(
        self, test_id: int, current_order: int
    ) -> Optional[Question]:
        return (
            self.db.query(Question)
            .filter(Question.test_id == test_id, Question.order < current_order)
            .order_by(Question.order.desc())
            .first()
        )

    def submit_answer(
        self, submission_id: int, question_id: int, answer_id: int
    ) -> TestSubmissionQuestion:
        submission_question = TestSubmissionQuestion(
            submission_id=submission_id, question_id=question_id, answer_id=answer_id
        )
        self.db.add(submission_question)
        self.db.commit()
        self.db.refresh(submission_question)
        return submission_question

    def update_submission_status(self, submission_id: int, status: str):
        submission = (
            self.db.query(TestSubmission)
            .filter(TestSubmission.id == submission_id)
            .first()
        )
        submission.status = status
        self.db.commit()

    def update_submission_analysis(
        self, submission_id: int, analysis_summary: str, analysis_key_factors: List[str]
    ):
        submission = (
            self.db.query(TestSubmission)
            .filter(TestSubmission.id == submission_id)
            .first()
        )
        submission.analysis_summary = analysis_summary
        submission.analysis_key_factors = analysis_key_factors
        self.db.commit()

    def get_all_user_submissions(self, user_id: int) -> List[TestSubmission]:
        return (
            self.db.query(TestSubmission).filter(TestSubmission.user_id == user_id).all()
        )

    def create_personality_analysis(
        self, user_id: int, analysis_data: dict
    ) -> PersonalityAnalysis:
        analysis = PersonalityAnalysis(user_id=user_id, **analysis_data)
        self.db.add(analysis)
        self.db.commit()
        self.db.refresh(analysis)
        return analysis
