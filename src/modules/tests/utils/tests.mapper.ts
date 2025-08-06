import {
	Test,
	TestSubmission,
	Question,
	Answer,
	PersonalityAnalysis,
	PersonalityAnalysisMbti,
	PersonalityAnalysisProfession,
	PersonalityAnalysisMajor,
	PersonalityAnalysisAttribute,
	TestSubmissionQuestion,
} from '@prisma/client'
import {
	TestSummaryDto,
	TestDetailsDto,
	AnswerDto,
	TestQuestionDto,
	PersonalityAnalysisDto,
	PersonalityAnalysisMbtiDto,
	PersonalityAnalysisProfessionDto,
	PersonalityAnalysisMajorDto,
	PersonalityAnalysisAttributeDto,
} from '../dtos/tests.dto'

type TestWithRelations = Test & {
	questions: Question[]
}

type TestSubmissionWithRelations = TestSubmission & {
	test: TestWithRelations
	submittedAnswers: (TestSubmissionQuestion & { question: Question; answer: Answer })[]
}

type QuestionWithRelations = Question & {
	answers: Answer[]
}

type PersonalityAnalysisWithRelations = PersonalityAnalysis & {
	mbti: PersonalityAnalysisMbti | null
	professions: (PersonalityAnalysisProfession & { profession: { id: number; name: string } })[]
	majors: PersonalityAnalysisMajor[]
	attributes: PersonalityAnalysisAttribute[]
}

export function toTestSummaryDto(
	test: TestWithRelations,
	submission?: TestSubmissionWithRelations,
): TestSummaryDto {
	return {
		id: test.id,
		title: test.name,
		description: test.description ?? '',
		allQuestionsCount: test.questions.length,
		estimatedTimeInMinutes: test.estimatedTimeMinutes ?? 0,
		completedQuestionsCount: submission?.submittedAnswers.length ?? 0,
		status: submission?.status ?? 'NOT_STARTED',
	}
}

export function toTestDetailsDto(
	test: TestWithRelations,
	submission?: TestSubmissionWithRelations,
): TestDetailsDto {
	const lastQuestionId =
		submission && submission.submittedAnswers.length > 0
			? submission.submittedAnswers[submission.submittedAnswers.length - 1].questionId
			: test.questions.length > 0
				? test.questions[0].id
				: undefined

	return {
		...toTestSummaryDto(test, submission),
		lastQuestionId: lastQuestionId,
	}
}

export function toAnswerDto(answer: Answer): AnswerDto {
	return {
		id: answer.id,
		answer: answer.answer,
	}
}

export function toTestQuestionDto(
	question: QuestionWithRelations,
	nextQuestionId?: number,
	previousQuestionId?: number,
): TestQuestionDto {
	return {
		id: question.id,
		question: question.question,
		answers: question.answers.map(toAnswerDto),
		nextQuestionId: nextQuestionId,
		previousQuestionId: previousQuestionId,
	}
}

export function toPersonalityAnalysisMbtiDto(
	mbti: PersonalityAnalysisMbti,
): PersonalityAnalysisMbtiDto {
	return {
		title: mbti.title ?? '',
		description: mbti.description ?? '',
		mbtiCode: mbti.mbtiCode ?? '',
		mbtiName: mbti.mbtiName ?? '',
		shortAttributes: mbti.shortAttributes,
		workStyles: mbti.workStyles,
		introversionPercentage: mbti.introversionPercentage ?? 0,
		thinkingPercentage: mbti.thinkingPercentage ?? 0,
		creativityPercentage: mbti.creativityPercentage ?? 0,
		intuitionPercentage: mbti.intuitionPercentage ?? 0,
		planningPercentage: mbti.planningPercentage ?? 0,
		leadingPercentage: mbti.leadingPercentage ?? 0,
	}
}

export function toPersonalityAnalysisProfessionDto(
	profession: PersonalityAnalysisProfession & { profession: { id: number; name: string } },
): PersonalityAnalysisProfessionDto {
	return {
		professionId: profession.professionId,
		percentage: profession.percentage ?? 0,
	}
}

export function toPersonalityAnalysisMajorDto(
	major: PersonalityAnalysisMajor,
): PersonalityAnalysisMajorDto {
	return {
		category: major.category,
	}
}

export function toPersonalityAnalysisAttributeDto(
	attribute: PersonalityAnalysisAttribute,
): PersonalityAnalysisAttributeDto {
	return {
		type: attribute.type,
		name: attribute.name ?? '',
		description: attribute.description ?? '',
		recommendations: attribute.recommendations ?? '',
	}
}

export function toPersonalityAnalysisDto(
	analysis: PersonalityAnalysisWithRelations,
): PersonalityAnalysisDto {
	return {
		id: analysis.id,
		mbti: analysis.mbti
			? toPersonalityAnalysisMbtiDto(analysis.mbti)
			: ({} as PersonalityAnalysisMbtiDto), // Provide a default empty object or handle null explicitly
		professions: analysis.professions.map(toPersonalityAnalysisProfessionDto),
		majors: analysis.majors.map(toPersonalityAnalysisMajorDto),
		attributes: analysis.attributes.map(toPersonalityAnalysisAttributeDto),
	}
}
