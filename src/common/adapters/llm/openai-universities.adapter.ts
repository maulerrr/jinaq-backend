import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { OpenAI } from 'openai'
import { PromptBuilderService } from 'src/common/llm/prompt.builder'
import { LLMUniversityAnalysisResponse } from 'src/modules/institutions/dtos/institutions.dto'
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
	): Promise<LLMUniversityAnalysisResponse | null> {
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
					response_format: { type: 'json_object' },
				})
				const text = res.choices[0]?.message?.content ?? 'null'
				this.logger.debug(`Attempt ${attempt}: LLM response text: ${text}`)

				const parsed = JSON.parse(text) as unknown
				if (isLLMUniversityAnalysisResponse(parsed)) {
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
}

/**
 * A basic type guard for LLMUniversityAnalysisResponse.
 * This implementation assumes the response object has the following structure:
 *
 * interface LLMUniversityAnalysisResponse {
 *   universityName: string;
 *   analysis: string;
 *   score: number;
 * }
 *
 * Update the properties and validations below based on the actual interface definition.
 */
function isLLMUniversityAnalysisResponse(parsed: unknown): parsed is LLMUniversityAnalysisResponse {
	if (typeof parsed !== 'object' || parsed === null) {
		return false
	}

	// TODO: implement proper
	const response = parsed as Record<string, unknown>
	return (
		typeof response.universityName === 'string' &&
		typeof response.analysis === 'string' &&
		typeof response.score === 'number'
	)
}
