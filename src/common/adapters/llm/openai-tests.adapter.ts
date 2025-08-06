import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import OpenAI from 'openai'
import { AppConfigService } from 'src/common/config/config.service'
import { PromptBuilderService } from 'src/common/llm/prompt.builder'
import {
	TestResultsDto,
	ShortAnalysisResponse,
	MBTIAnalysis,
	ProfessionAnalysis,
	MajorAnalysis,
	AnalysisAttribute,
	PersonalityAnalysisResponse,
	ShortSummaryOfTest,
} from 'src/modules/tests/dtos/tests.dto'

@Injectable()
export class OpenAITestsAdapter {
	private static readonly MAX_RETRIES = 3
	private readonly logger = new Logger(OpenAITestsAdapter.name)
	private readonly client: OpenAI
	private readonly promptBuilder: PromptBuilderService

	constructor(private readonly config: AppConfigService) {
		const openaiApiKey = this.config.openai.apiKey
		if (!openaiApiKey) {
			throw new InternalServerErrorException('OPENAI_API_KEY is not configured.')
		}
		this.client = new OpenAI({ apiKey: openaiApiKey })
	}

	async shortAnalysis(
		userId: number,
		testResults: TestResultsDto,
	): Promise<ShortAnalysisResponse | null> {
		const { messages, maxTokens } = await this.promptBuilder.buildShortAnalysisPrompt(
			userId,
			testResults,
		)

		let lastError: unknown
		for (let attempt = 1; attempt <= OpenAITestsAdapter.MAX_RETRIES; attempt++) {
			try {
				const res = await this.client.chat.completions.create({
					model: this.config.openai.model,
					max_tokens: maxTokens,
					messages: messages,
				})
				const text = res.choices[0]?.message?.content ?? '{}'
				this.logger.debug(`Attempt ${attempt}: LLM response text: ${text}`)

				const parsed = JSON.parse(text) as unknown
				if (!isShortAnalysisResponse(parsed)) {
					this.logger.error(
						`Attempt ${attempt}: LLM response did not match expected format`,
						parsed,
					)
					continue
				}
				return parsed
			} catch (err) {
				lastError = err
				this.logger.error(`Attempt ${attempt}: LLM error in runShortAnalysis`, err)
			}
		}

		this.logger.error(
			`All ${OpenAITestsAdapter.MAX_RETRIES} attempts failed for runShortAnalysis`,
			lastError,
		)
		return null
	}

	async MBTIAnalysis(
		userId: number,
		testResults: ShortSummaryOfTest[],
	): Promise<MBTIAnalysis | null> {
		const { messages, maxTokens } = await this.promptBuilder.buildMBTIAnalysisPrompt(
			userId,
			testResults,
		)

		let lastError: unknown
		for (let attempt = 1; attempt <= OpenAITestsAdapter.MAX_RETRIES; attempt++) {
			try {
				const res = await this.client.chat.completions.create({
					model: this.config.openai.model,
					max_tokens: maxTokens,
					messages: messages,
				})
				const text = res.choices[0]?.message?.content ?? '{}'
				this.logger.debug(`Attempt ${attempt}: LLM response text: ${text}`)

				const parsed = JSON.parse(text) as unknown
				if (!isMBTIAnalysis(parsed)) {
					this.logger.error(
						`Attempt ${attempt}: LLM response did not match expected format`,
						parsed,
					)
					continue
				}
				return parsed
			} catch (err) {
				lastError = err
				this.logger.error(`Attempt ${attempt}: LLM error in runMBTIAnalysis`, err)
			}
		}

		this.logger.error(
			`All ${OpenAITestsAdapter.MAX_RETRIES} attempts failed for runMBTIAnalysis`,
			lastError,
		)
		return null
	}

	async professionAnalysis(
		userId: number,
		testResults: ShortSummaryOfTest[],
	): Promise<ProfessionAnalysis[] | null> {
		const { messages, maxTokens } = await this.promptBuilder.buildProfessionAnalysisPrompt(
			userId,
			testResults,
		)

		let lastError: unknown
		for (let attempt = 1; attempt <= OpenAITestsAdapter.MAX_RETRIES; attempt++) {
			try {
				const res = await this.client.chat.completions.create({
					model: this.config.openai.model,
					max_tokens: maxTokens,
					messages: messages,
				})
				const text = res.choices[0]?.message?.content ?? '[]'
				this.logger.debug(`Attempt ${attempt}: LLM response text: ${text}`)

				const parsed = JSON.parse(text) as unknown
				if (!isProfessionAnalysisArray(parsed)) {
					this.logger.error(
						`Attempt ${attempt}: LLM response did not match expected format`,
						parsed,
					)
					continue
				}
				return parsed
			} catch (err) {
				lastError = err
				this.logger.error(`Attempt ${attempt}: LLM error in runProfessionAnalysis`, err)
			}
		}

		this.logger.error(
			`All ${OpenAITestsAdapter.MAX_RETRIES} attempts failed for runProfessionAnalysis`,
			lastError,
		)
		return null
	}

	async majorAnalysis(
		userId: number,
		testResults: ShortSummaryOfTest[],
	): Promise<MajorAnalysis[] | null> {
		const { messages, maxTokens } = await this.promptBuilder.buildMajorAnalysisPrompt(
			userId,
			testResults,
		)

		let lastError: unknown
		for (let attempt = 1; attempt <= OpenAITestsAdapter.MAX_RETRIES; attempt++) {
			try {
				const res = await this.client.chat.completions.create({
					model: this.config.openai.model,
					max_tokens: maxTokens,
					messages: messages,
				})
				const text = res.choices[0]?.message?.content ?? '[]'
				this.logger.debug(`Attempt ${attempt}: LLM response text: ${text}`)

				const parsed = JSON.parse(text) as unknown
				if (!isMajorAnalysisArray(parsed)) {
					this.logger.error(
						`Attempt ${attempt}: LLM response did not match expected format`,
						parsed,
					)
					continue
				}
				return parsed
			} catch (err) {
				lastError = err
				this.logger.error(`Attempt ${attempt}: LLM error in runMajorAnalysis`, err)
			}
		}

		this.logger.error(
			`All ${OpenAITestsAdapter.MAX_RETRIES} attempts failed for runMajorAnalysis`,
			lastError,
		)
		return null
	}

	async attributesAnalysis(
		userId: number,
		testResults: ShortSummaryOfTest[],
	): Promise<AnalysisAttribute[] | null> {
		const { messages, maxTokens } = await this.promptBuilder.buildAttributeAnalysisPrompt(
			userId,
			testResults,
		)

		let lastError: unknown
		for (let attempt = 1; attempt <= OpenAITestsAdapter.MAX_RETRIES; attempt++) {
			try {
				const res = await this.client.chat.completions.create({
					model: this.config.openai.model,
					max_tokens: maxTokens,
					messages: messages,
				})
				const text = res.choices[0]?.message?.content ?? '[]'
				this.logger.debug(`Attempt ${attempt}: LLM response text: ${text}`)

				const parsed = JSON.parse(text) as unknown
				if (!isAnalysisAttributeArray(parsed)) {
					this.logger.error(
						`Attempt ${attempt}: LLM response did not match expected format`,
						parsed,
					)
					continue
				}
				return parsed
			} catch (err) {
				lastError = err
				this.logger.error(`Attempt ${attempt}: LLM error in runAnalysisAttributes`, err)
			}
		}

		this.logger.error(
			`All ${OpenAITestsAdapter.MAX_RETRIES} attempts failed for runAnalysisAttributes`,
			lastError,
		)
		return null
	}

	async getPersonalityAnalysis(
		userId: number,
		summaries: ShortSummaryOfTest[],
	): Promise<PersonalityAnalysisResponse | null> {
		const mbti = await this.MBTIAnalysis(userId, summaries)
		if (!mbti) {
			this.logger.error('Failed to get MBTI analysis')
			return null
		}

		const professions = await this.professionAnalysis(userId, summaries)
		if (!professions) {
			this.logger.error('Failed to get profession analysis')
			return null
		}

		const majors = await this.majorAnalysis(userId, summaries)
		if (!majors) {
			this.logger.error('Failed to get major analysis')
			return null
		}

		const attributes = await this.attributesAnalysis(userId, summaries)
		if (!attributes) {
			this.logger.error('Failed to get attributes analysis')
			return null
		}

		return {
			mbti,
			professions,
			majors,
			attributes,
		}
	}
}

/**
 * Type guard for ShortAnalysisResponse
 * export interface ShortAnalysisResponse {
	analysis_summary: string
	analysis_key_factors: string[]
}
 */
function isShortAnalysisResponse(data: unknown): data is ShortAnalysisResponse {
	return (
		typeof data === 'object' &&
		data !== null &&
		'analysis_summary' in data &&
		'analysis_key_factors' in data &&
		typeof (data as ShortAnalysisResponse).analysis_summary === 'string' &&
		Array.isArray((data as ShortAnalysisResponse).analysis_key_factors)
	)
}

/*
 * Type guard for MBTIAnalysis
 * export interface MBTIAnalysis {
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
 */
function isMBTIAnalysis(data: unknown): data is MBTIAnalysis {
	return (
		typeof data === 'object' &&
		data !== null &&
		'title' in data &&
		'description' in data &&
		'mbtiCode' in data &&
		'mbtiName' in data &&
		Array.isArray((data as MBTIAnalysis).shortAttributes) &&
		Array.isArray((data as MBTIAnalysis).workStyles) &&
		typeof (data as MBTIAnalysis).introversionPercentage === 'number' &&
		typeof (data as MBTIAnalysis).thinkingPercentage === 'number' &&
		typeof (data as MBTIAnalysis).creativityPercentage === 'number' &&
		typeof (data as MBTIAnalysis).intuitionPercentage === 'number' &&
		typeof (data as MBTIAnalysis).planningPercentage === 'number' &&
		typeof (data as MBTIAnalysis).leadingPercentage === 'number'
	)
}

/*
 * Type guard for ProfessionAnalysis
 * export interface ProfessionAnalysis {
	professionId: number
	percentage: number
}
 */
function isProfessionAnalysis(data: unknown): data is ProfessionAnalysis {
	return (
		typeof data === 'object' &&
		data !== null &&
		'professionId' in data &&
		'percentage' in data &&
		typeof (data as ProfessionAnalysis).professionId === 'number' &&
		typeof (data as ProfessionAnalysis).percentage === 'number'
	)
}

function isProfessionAnalysisArray(data: unknown): data is ProfessionAnalysis[] {
	if (!Array.isArray(data)) return false
	for (const item of data) {
		if (!isProfessionAnalysis(item)) return false
	}
	return true
}

/*
 * Type guard for MajorAnalysis
 * export interface MajorAnalysis {
	category: MAJOR_CATEGORY
}
 */
function isMajorAnalysis(data: unknown): data is MajorAnalysis {
	return (
		typeof data === 'object' &&
		data !== null &&
		'category' in data &&
		typeof (data as MajorAnalysis).category === 'string'
	)
}

function isMajorAnalysisArray(data: unknown): data is MajorAnalysis[] {
	if (!Array.isArray(data)) return false
	for (const item of data) {
		if (!isMajorAnalysis(item)) return false
	}
	return true
}

/*
 * Type guard for AnalysisAttribute
 * export interface AnalysisAttribute {
	type: "PROS" | "CONS"
	name: string
	description: string
	recommendations: string
}
 */
function isAnalysisAttribute(data: unknown): data is AnalysisAttribute {
	return (
		typeof data === 'object' &&
		data !== null &&
		'type' in data &&
		'name' in data &&
		'description' in data &&
		'recommendations' in data &&
		(typeof (data as AnalysisAttribute).type === 'string' ||
			(data as AnalysisAttribute).type === 'PROS' ||
			(data as AnalysisAttribute).type === 'CONS') &&
		typeof (data as AnalysisAttribute).name === 'string' &&
		typeof (data as AnalysisAttribute).description === 'string' &&
		typeof (data as AnalysisAttribute).recommendations === 'string'
	)
}

function isAnalysisAttributeArray(data: unknown): data is AnalysisAttribute[] {
	if (!Array.isArray(data)) return false
	for (const item of data) {
		if (!isAnalysisAttribute(item)) return false
	}
	return true
}
