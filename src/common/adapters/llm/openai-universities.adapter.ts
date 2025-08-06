import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { OpenAI } from 'openai'
import { PromptBuilderService } from 'src/common/llm/prompt.builder'
import {
	InstituteProbability,
	UniversityAnalysis,
} from 'src/modules/institutions/dtos/institutions.dto'
import { AppConfigService } from 'src/common/config/config.service'

@Injectable()
export class OpenAIUniversitiesAdapter {
	private static readonly MAX_RETRIES = 3
	private readonly logger = new Logger(OpenAIUniversitiesAdapter.name)
	private readonly client: OpenAI
	private readonly promptBuilder: PromptBuilderService

	constructor(private readonly config: AppConfigService) {
		const openaiApiKey = this.config.openai.apiKey
		if (!openaiApiKey) {
			throw new InternalServerErrorException('OPENAI_API_KEY is not configured.')
		}
		this.client = new OpenAI({ apiKey: openaiApiKey })
	}

	async getUniversityAnalysis(
		userId: number,
		countryId: number,
		universitiesIds?: number[],
	): Promise<InstituteProbability[] | null> {
		const { messages, maxTokens } = await this.promptBuilder.buildUniversityAnalysisPrompt(
			userId,
			countryId,
			universitiesIds,
		)

		let lastError: unknown
		for (let attempt = 1; attempt <= OpenAIUniversitiesAdapter.MAX_RETRIES; attempt++) {
			try {
				const res = await this.client.chat.completions.create({
					model: this.config.openai.model,
					max_tokens: maxTokens,
					messages: messages,
				})
				const text = res.choices[0]?.message?.content ?? '[]'
				this.logger.debug(`Attempt ${attempt}: LLM response text: ${text}`)

				const parsed = JSON.parse(text) as unknown
				if (isInstituteProbabilityArray(parsed)) {
					return parsed
				}
				this.logger.error(`Attempt ${attempt}: LLM response did not match expected format`, parsed)
			} catch (err) {
				lastError = err
				this.logger.error(`Attempt ${attempt}: LLM error in getUniversityAnalysis`, err)
			}
		}

		this.logger.error(
			`All ${OpenAIUniversitiesAdapter.MAX_RETRIES} attempts failed for getUniversityAnalysis`,
			lastError,
		)
		throw new InternalServerErrorException('AI university analysis failed after retries')
	}

	async getAnalysisByUniversity(
		userId: number,
		institution: number,
	): Promise<UniversityAnalysis | null> {
		const { messages, maxTokens } = await this.promptBuilder.buildPerUniversityAnalysisPrompt(
			userId,
			institution,
		)

		let lastError: unknown
		for (let attempt = 1; attempt <= OpenAIUniversitiesAdapter.MAX_RETRIES; attempt++) {
			try {
				const res = await this.client.chat.completions.create({
					model: this.config.openai.model,
					max_tokens: maxTokens,
					messages: messages,
				})
				const text = res.choices[0]?.message?.content ?? '[]'
				this.logger.debug(`Attempt ${attempt}: LLM response text: ${text}`)

				const parsed = JSON.parse(text) as unknown
				if (isPerUniversityAnalysis(parsed)) {
					return parsed
				}
				this.logger.error(`Attempt ${attempt}: LLM response did not match expected format`, parsed)
			} catch (err) {
				lastError = err
				this.logger.error(`Attempt ${attempt}: LLM error in getAnalysisByUniversity`, err)
			}
		}

		this.logger.error(
			`All ${OpenAIUniversitiesAdapter.MAX_RETRIES} attempts failed for getAnalysisByUniversity`,
			lastError,
		)
		throw new InternalServerErrorException('AI university analysis failed after retries')
	}
}

function isInstituteProbability(data: unknown): InstituteProbability | null {
	if (typeof data !== 'object' || data === null) {
		return null
	}

	const response = data as Record<string, unknown>
	if (typeof response.institutionId !== 'number' || typeof response.chancePercentage !== 'number') {
		return null
	}

	return {
		institutionId: response.institutionId,
		chancePercentage: response.chancePercentage,
	}
}

function isInstituteProbabilityArray(data: unknown): data is InstituteProbability[] {
	if (!Array.isArray(data)) {
		return false
	}

	for (const item of data) {
		if (!isInstituteProbability(item)) {
			return false // If any item is invalid, return false
		}
	}

	return true
}

function isPerUniversityAnalysis(data: unknown): data is UniversityAnalysis {
	if (typeof data !== 'object' || data === null) {
		return false
	}

	const response = data as Record<string, unknown>
	return (
		Array.isArray(response.attributes) &&
		Array.isArray(response.plan) &&
		response.attributes.every(attr => {
			if (typeof attr !== 'object' || attr === null) return false
			const a = attr as Record<string, unknown>
			return (
				typeof a.name === 'string' &&
				['PROS', 'CONS'].includes(a.type as string) &&
				(typeof a.recommendation === 'string' || a.recommendation === undefined) &&
				(typeof a.description === 'string' || a.description === undefined)
			)
		}) &&
		response.plan.every(p => {
			const planItem = p as Record<string, unknown>
			return (
				typeof planItem.order === 'number' &&
				typeof planItem.name === 'string' &&
				(typeof planItem.description === 'string' || planItem.description === undefined) &&
				(typeof planItem.durationMonth === 'number' || planItem.durationMonth === undefined)
			)
		})
	)
}
