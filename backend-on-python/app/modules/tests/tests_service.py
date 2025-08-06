from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database.session import get_async_session
from app.modules.llm.llm_service import LLMService
from app.modules.llm.prompt_builder import (
    build_personality_analysis_prompt,
    build_short_analysis_prompt,
)
from app.modules.tests.tests_repository import TestsRepository
from app.modules.tests.tests_schemas import (
    TestSummaryResponse,
    TestDetailsResponse,
    TestQuestionResponse,
    TestQuestionSubmitRequest,
    PersonalityAnalysisResponse,
)
from app.modules.users.users_repository import UserRepository


class TestsService:
    def __init__(self, db: Session = Depends(get_async_session)):
        self.repository = TestsRepository(db)
        self.users_repository = UserRepository(db)
        self.llm_service = LLMService()

    def get_all_tests_for_user(self, user_id: int):
        tests = self.repository.get_all_tests()
        summaries = []
        for test in tests:
            submission = self.repository.get_user_test_submission(user_id, test.id)
            summaries.append(
                TestSummaryResponse(
                    id=test.id,
                    title=test.name,
                    description=test.description,
                    all_questions_count=len(test.questions),
                    estimated_time_in_minutes=test.estimated_time_minutes,
                    completed_questions_count=len(submission.submitted_answers)
                    if submission
                    else 0,
                    status=submission.status if submission else "NOT_STARTED",
                )
            )
        return summaries

    def get_test_details(self, user_id: int, test_id: int):
        test = self.repository.get_test_by_id(test_id)
        if not test:
            raise HTTPException(status_code=404, detail="Test not found")

        submission = self.repository.get_user_test_submission(user_id, test.id)
        last_question_id = (
            submission.submitted_answers[-1].question_id
            if submission and submission.submitted_answers
            else test.questions[0].id
        )

        return TestDetailsResponse(
            id=test.id,
            title=test.name,
            description=test.description,
            all_questions_count=len(test.questions),
            estimated_time_in_minutes=test.estimated_time_minutes,
            completed_questions_count=len(submission.submitted_answers)
            if submission
            else 0,
            status=submission.status if submission else "NOT_STARTED",
            last_question_id=last_question_id,
        )

    def get_test_question(self, test_id: int, question_id: int):
        question = self.repository.get_question_by_id(question_id)
        if not question or question.test_id != test_id:
            raise HTTPException(status_code=404, detail="Question not found")

        next_q = self.repository.get_next_question(test_id, question.order)
        prev_q = self.repository.get_previous_question(test_id, question.order)

        return TestQuestionResponse(
            id=question.id,
            question=question.question,
            answers=question.answers,
            next_question_id=next_q.id if next_q else None,
            previous_question_id=prev_q.id if prev_q else None,
        )

    def submit_answer(
        self, user_id: int, test_id: int, question_id: int, data: TestQuestionSubmitRequest
    ):
        submission = self.repository.get_user_test_submission(user_id, test_id)
        if not submission:
            submission = self.repository.create_test_submission(user_id, test_id)

        self.repository.submit_answer(submission.id, question_id, data.answer_id)

        if len(submission.submitted_answers) == len(submission.test.questions):
            self.repository.update_submission_status(submission.id, "COMPLETED")
            self._run_short_analysis(submission)
        else:
            self.repository.update_submission_status(submission.id, "ACTIVE")

    def analyze_tests(self, user_id: int) -> PersonalityAnalysisResponse:
        submissions = self.repository.get_all_user_submissions(user_id)
        if not all(sub.status == "COMPLETED" for sub in submissions):
            raise HTTPException(
                status_code=400, detail="All tests must be completed before analysis"
            )

        test_results = [
            {
                "test_name": sub.test.name,
                "analysis_summary": sub.analysis_summary,
                "analysis_key_factors": sub.analysis_key_factors,
            }
            for sub in submissions
        ]

        prompt = build_personality_analysis_prompt(test_results)
        llm_response = self.llm_service.get_personality_analysis(prompt)

        if not llm_response:
            raise HTTPException(
                status_code=500, detail="Failed to get analysis from LLM"
            )

        return self.repository.create_personality_analysis(user_id, llm_response)

    def _run_short_analysis(self, submission):
        test_results = {
            "test_name": submission.test.name,
            "answers": [
                {"question": sa.question.question, "answer": sa.answer.answer}
                for sa in submission.submitted_answers
            ],
        }
        prompt = build_short_analysis_prompt(test_results)
        llm_response = self.llm_service.get_short_analysis(prompt)

        if llm_response:
            self.repository.update_submission_analysis(
                submission.id,
                llm_response["analysis_summary"],
                llm_response["analysis_key_factors"],
            )
