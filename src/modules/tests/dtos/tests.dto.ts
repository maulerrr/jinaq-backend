import {
	TestSubmissionStatus,
	PersonalityAnalysisAttributeType,
	MAJOR_CATEGORY,
} from '@prisma/client'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString, IsArray } from 'class-validator'
import { Type } from 'class-transformer'

export class TestSummaryDto {
	@ApiProperty()
	@IsInt()
	id: number

	@ApiProperty()
	@IsString()
	title: string

	@ApiProperty()
	@IsString()
	description: string

	@ApiProperty({ name: 'allQuestionsCount' })
	@IsInt()
	allQuestionsCount: number

	@ApiProperty({ name: 'estimatedTimeInMinutes' })
	@IsInt()
	estimatedTimeInMinutes: number

	@ApiProperty({ name: 'completedQuestionsCount' })
	@IsInt()
	completedQuestionsCount: number

	@ApiProperty({ enum: TestSubmissionStatus })
	status: TestSubmissionStatus
}

export class TestDetailsDto extends TestSummaryDto {
	@ApiPropertyOptional({ name: 'lastQuestionId' })
	@IsOptional()
	@IsInt()
	lastQuestionId?: number
}

export class AnswerDto {
	@ApiProperty()
	@IsInt()
	id: number

	@ApiProperty()
	@IsString()
	answer: string
}

export class TestQuestionDto {
	@ApiProperty()
	@IsInt()
	id: number

	@ApiProperty()
	@IsString()
	question: string

	@ApiProperty({ type: [AnswerDto] })
	@IsArray()
	@Type(() => AnswerDto)
	answers: AnswerDto[]

	@ApiPropertyOptional({ name: 'nextQuestionId' })
	@IsOptional()
	@IsInt()
	nextQuestionId?: number

	@ApiPropertyOptional({ name: 'previousQuestionId' })
	@IsOptional()
	@IsInt()
	previousQuestionId?: number
}

export class TestQuestionSubmitDto {
	@ApiProperty({ name: 'answerId' })
	@IsInt()
	answerId: number
}

export class ShortAnalysisDto {
	@ApiProperty()
	@IsString()
	analysisSummary: string

	@ApiProperty({ type: [String] })
	@IsArray()
	@IsString({ each: true })
	analysisKeyFactors: string[]
}

export class PersonalityAnalysisMbtiDto {
	@ApiProperty()
	@IsString()
	title: string

	@ApiProperty()
	@IsString()
	description: string

	@ApiProperty({ name: 'mbtiCode' })
	@IsString()
	mbtiCode: string

	@ApiProperty({ name: 'mbtiName' })
	@IsString()
	mbtiName: string

	@ApiProperty({ name: 'shortAttributes', type: [String] })
	@IsArray()
	@IsString({ each: true })
	shortAttributes: string[]

	@ApiProperty({ name: 'workStyles', type: [String] })
	@IsArray()
	@IsString({ each: true })
	workStyles: string[]

	@ApiProperty({ name: 'introversionPercentage' })
	@IsInt()
	introversionPercentage: number

	@ApiProperty({ name: 'thinkingPercentage' })
	@IsInt()
	thinkingPercentage: number

	@ApiProperty({ name: 'creativityPercentage' })
	@IsInt()
	creativityPercentage: number

	@ApiProperty({ name: 'intuitionPercentage' })
	@IsInt()
	intuitionPercentage: number

	@ApiProperty({ name: 'planningPercentage' })
	@IsInt()
	planningPercentage: number

	@ApiProperty({ name: 'leadingPercentage' })
	@IsInt()
	leadingPercentage: number
}

export class PersonalityAnalysisProfessionDto {
	@ApiProperty({ name: 'professionId' })
	@IsInt()
	professionId: number

	@ApiProperty()
	@IsInt()
	percentage: number
}

export class PersonalityAnalysisMajorDto {
	@ApiProperty()
	@IsString()
	category: string
}

export class PersonalityAnalysisAttributeDto {
	@ApiProperty({ enum: PersonalityAnalysisAttributeType })
	type: PersonalityAnalysisAttributeType

	@ApiProperty()
	@IsString()
	name: string

	@ApiProperty()
	@IsString()
	description: string

	@ApiProperty()
	@IsString()
	recommendations: string
}

export class PersonalityAnalysisDto {
	@ApiProperty()
	@IsInt()
	id: number

	@ApiProperty({ type: PersonalityAnalysisMbtiDto })
	@Type(() => PersonalityAnalysisMbtiDto)
	mbti: PersonalityAnalysisMbtiDto

	@ApiProperty({ type: [PersonalityAnalysisProfessionDto] })
	@IsArray()
	@Type(() => PersonalityAnalysisProfessionDto)
	professions: PersonalityAnalysisProfessionDto[]

	@ApiProperty({ type: [PersonalityAnalysisMajorDto] })
	@IsArray()
	@Type(() => PersonalityAnalysisMajorDto)
	majors: PersonalityAnalysisMajorDto[]

	@ApiProperty({ type: [PersonalityAnalysisAttributeDto] })
	@IsArray()
	@Type(() => PersonalityAnalysisAttributeDto)
	attributes: PersonalityAnalysisAttributeDto[]
}

// Interfaces for LLM responses (to be implemented by user)
export interface MBTIAnalysis {
	title: string
	description: string
	mbtiCode: string
	mbtiName: string
	shortAttributes: string[]
	workStyles: string[]
	introversionPercentage: number
	thinkingPercentage: number
	creativityPercentage: number
	intuitionPercentage: number
	planningPercentage: number
	leadingPercentage: number
}

export interface ProfessionAnalysis {
	professionId: number
	percentage: number
}

export interface MajorAnalysis {
	category: MAJOR_CATEGORY
}

export interface AnalysisAttribute {
	type: PersonalityAnalysisAttributeType
	name: string
	description: string
	recommendations: string
}

export interface PersonalityAnalysisResponse {
	mbti: MBTIAnalysis
	professions: ProfessionAnalysis[]
	majors: MajorAnalysis[]
	attributes: AnalysisAttribute[]
}

export interface ShortAnalysisResponse {
	analysis_summary: string
	analysis_key_factors: string[]
}

export interface TestResultsDto {
	testName: string
	testResults: TestQuestionAnswer[]
}

export interface TestQuestionAnswer {
	question: string
	answer: string
}

export interface ShortSummaryOfTest {
	testName: string
	shortAnalysis: ShortAnalysisResponse
}
