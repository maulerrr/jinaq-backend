import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import {
	TestSummaryDto,
	TestDetailsDto,
	TestQuestionDto,
	TestQuestionSubmitDto,
	PersonalityAnalysisDto,
	TestResultsDto,
	ShortSummaryOfTest,
} from './dtos/tests.dto'
import {
	toTestSummaryDto,
	toTestDetailsDto,
	toTestQuestionDto,
	toPersonalityAnalysisDto,
} from './utils/tests.mapper'
import { PromptBuilderService } from 'src/common/llm/prompt.builder'
import { TestSubmissionStatus } from '@prisma/client'
import { OpenAITestsAdapter } from 'src/common/adapters/llm/openai-tests.adapter'

@Injectable()
export class TestsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly llmAdapter: OpenAITestsAdapter, // Keep for future implementation by user
		private readonly promptBuilderService: PromptBuilderService, // Keep for future implementation by user
	) {}

	async getAllTestsForUser(userId: number): Promise<TestSummaryDto[]> {
		const tests = await this.prisma.test.findMany({
			include: {
				questions: true, // To get all_questions_count
			},
		})

		const summaries: TestSummaryDto[] = []
		for (const test of tests) {
			const submission = await this.prisma.testSubmission.findFirst({
				where: {
					userId: userId,
					testId: test.id,
				},
				include: {
					test: {
						include: {
							questions: true,
						},
					},
					submittedAnswers: {
						include: {
							question: true,
							answer: true,
						},
					}, // To get completed_questions_count
				},
			})
			summaries.push(toTestSummaryDto(test, submission ?? undefined))
		}
		return summaries
	}

	async getTestDetails(userId: number, testId: number): Promise<TestDetailsDto> {
		const test = await this.prisma.test.findUnique({
			where: { id: testId },
			include: {
				questions: true,
			},
		})

		if (!test) {
			throw new NotFoundException('Test not found')
		}

		const submission = await this.prisma.testSubmission.findFirst({
			where: {
				userId: userId,
				testId: test.id,
			},
			include: {
				test: {
					include: {
						questions: true,
					},
				},
				submittedAnswers: {
					orderBy: {
						id: 'asc', // Order by ID to get the last submitted answer
					},
					include: {
						question: true,
						answer: true,
					},
				},
			},
		})

		return toTestDetailsDto(test, submission ?? undefined)
	}

	async getTestQuestion(testId: number, questionId: number): Promise<TestQuestionDto> {
		const question = await this.prisma.question.findUnique({
			where: { id: questionId },
			include: {
				answers: true,
			},
		})

		if (!question || question.testId !== testId) {
			throw new NotFoundException('Question not found')
		}

		const nextQuestion = await this.prisma.question.findFirst({
			where: {
				testId: testId,
				order: {
					gt: question.order,
				},
			},
			orderBy: {
				order: 'asc',
			},
		})

		const previousQuestion = await this.prisma.question.findFirst({
			where: {
				testId: testId,
				order: {
					lt: question.order,
				},
			},
			orderBy: {
				order: 'desc',
			},
		})

		return toTestQuestionDto(question, nextQuestion?.id, previousQuestion?.id)
	}

	async submitAnswer(
		userId: number,
		testId: number,
		questionId: number,
		data: TestQuestionSubmitDto,
	): Promise<{ message: string }> {
		let submission = await this.prisma.testSubmission.findFirst({
			where: {
				userId: userId,
				testId: testId,
			},
			include: {
				test: {
					include: {
						questions: true,
					},
				},
				submittedAnswers: true,
			},
		})

		if (!submission) {
			submission = await this.prisma.testSubmission.create({
				data: {
					userId: userId,
					testId: testId,
					status: TestSubmissionStatus.NOT_STARTED,
				},
				include: {
					test: {
						include: {
							questions: true,
						},
					},
					submittedAnswers: true,
				},
			})
		}

		await this.prisma.testSubmissionQuestion.create({
			data: {
				submissionId: submission.id,
				questionId: questionId,
				answerId: data.answerId,
			},
		})

		// Re-fetch submission to get updated submittedAnswers count
		const updatedSubmission = await this.prisma.testSubmission.findUnique({
			where: { id: submission.id },
			include: {
				test: {
					include: {
						questions: true,
					},
				},
				submittedAnswers: {
					include: {
						question: true,
						answer: true,
					},
				},
			},
		})

		if (!updatedSubmission) {
			throw new NotFoundException('Test submission not found after update')
		}

		if (updatedSubmission.submittedAnswers.length === updatedSubmission.test.questions.length) {
			const testResults: TestResultsDto = {
				testName: updatedSubmission.test.name,
				testResults: updatedSubmission.submittedAnswers.map(sa => ({
					question: sa.question.question,
					answer: sa.answer.answer,
				})),
			}

			const llmResponse = await this.llmAdapter.shortAnalysis(userId, testResults)

			if (!llmResponse) {
				throw new HttpException('Failed to get analysis from LLM', HttpStatus.INTERNAL_SERVER_ERROR)
			}

			await this.prisma.testSubmission.update({
				where: { id: updatedSubmission.id },
				data: {
					analysisSummary: llmResponse.analysis_summary,
					analysisKeyFactors: llmResponse.analysis_key_factors,
					status: TestSubmissionStatus.COMPLETED,
				},
			})
		} else {
			await this.prisma.testSubmission.update({
				where: { id: updatedSubmission.id },
				data: { status: TestSubmissionStatus.ACTIVE },
			})
		}

		return { message: 'Answer submitted successfully' }
	}

	async analyzeTests(userId: number): Promise<PersonalityAnalysisDto> {
		const testsCount = await this.prisma.test.count()

		const submissions = await this.prisma.testSubmission.findMany({
			where: { userId: userId },
			include: {
				test: true,
				submittedAnswers: {
					include: {
						question: true,
						answer: true,
					},
				},
			},
		})

		if (submissions.length < testsCount) {
			throw new HttpException('Not all tests are completed', HttpStatus.BAD_REQUEST)
		}

		if (submissions.length === 0) {
			throw new NotFoundException('No test submissions found for user')
		}

		if (!submissions.every(sub => sub.status === TestSubmissionStatus.COMPLETED)) {
			throw new HttpException('All tests must be completed before analysis', HttpStatus.BAD_REQUEST)
		}

		const shortSummaries: ShortSummaryOfTest[] = submissions.map(sub => ({
			testName: sub.test.name,
			shortAnalysis: {
				analysis_summary: sub.analysisSummary ?? '',
				analysis_key_factors: sub.analysisKeyFactors,
			},
		}))

		const llmResponse = await this.llmAdapter.getPersonalityAnalysis(userId, shortSummaries)

		if (!llmResponse) {
			throw new HttpException(
				'Failed to get personality analysis from LLM',
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}

		const analysis = await this.prisma.personalityAnalysis.create({
			data: {
				userId: userId,
				mbti: {
					create: {
						title: llmResponse.mbti.title,
						description: llmResponse.mbti.description,
						mbtiCode: llmResponse.mbti.mbtiCode,
						mbtiName: llmResponse.mbti.mbtiName,
						shortAttributes: llmResponse.mbti.shortAttributes,
						workStyles: llmResponse.mbti.workStyles,
						introversionPercentage: llmResponse.mbti.introversionPercentage,
						thinkingPercentage: llmResponse.mbti.thinkingPercentage,
						creativityPercentage: llmResponse.mbti.creativityPercentage,
						intuitionPercentage: llmResponse.mbti.intuitionPercentage,
						planningPercentage: llmResponse.mbti.planningPercentage,
						leadingPercentage: llmResponse.mbti.leadingPercentage,
					},
				},
				professions: {
					create: llmResponse.professions.map(p => ({
						professionId: p.professionId,
						percentage: p.percentage,
					})),
				},
				majors: {
					create: llmResponse.majors.map(m => ({
						category: m.category,
					})),
				},
				attributes: {
					create: llmResponse.attributes.map(a => ({
						type: a.type,
						name: a.name,
						description: a.description,
						recommendations: a.recommendations,
					})),
				},
			},
			include: {
				mbti: true,
				professions: { include: { profession: true } },
				majors: true,
				attributes: true,
			},
		})

		return toPersonalityAnalysisDto(analysis)
	}
}
