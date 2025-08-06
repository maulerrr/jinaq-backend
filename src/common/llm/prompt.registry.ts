import { Injectable } from '@nestjs/common'

export interface PromptTemplate {
	system: string
	user: string
	maxTokens?: number
}

@Injectable()
export class PromptRegistry {
	private readonly templates: Record<string, PromptTemplate> = {
		default: {
			system: 'You are a helpful assistant.',
			user: 'Please assist with the following request:',
			maxTokens: 1024,
		},

		// University analysis prompt template
		universityAnalysis: {
			system: 'You are an AI assistant that provides university analysis.',
			user: `Analyze the user profile and the provided university data to generate a comprehensive university analysis.
			User Profile: {{userProfile}}
			Universities Data: {{universitiesData}}
			Required output format:
			{
				institutes: {
					institutionId: number // ID of the institution
					chancePercentage: number // Probability of acceptance
				}[]
			}
			`,
			maxTokens: 8192,
		},

		perUniversityAnalysis: {
			system: 'You are an AI assistant that provides analysis for a specific university.',
			user: `Analyze the user profile and the provided university data to generate a comprehensive university analysis.
			User Profile: {{userProfile}}
			University Data: {{universityData}}
			Required output format:
			{
				attributes: [
					{
						name: string // Name of the attribute (e.g. "Академическая успеваемость")
						type: AttributeType // Type of the attribute (only either "PROS" or "CONS")
						recommendation?: string // Optional recommendation for the attribute (e.g. "Улучшить успеваемость")
						description?: string // Optional description of the attribute (e.g. "Высокие баллы по профильным предметам важны для поступления в университет")
					}, ... // at least three of PROS and three of CONS attributes
				],
				plan: [
					{
						order: number // Order of the plan: 1, 2, 3, etc.
						name: string // Name of the plan: e.g. Повышение ЕНТ балла
						description?: string // Description of the plan: e.g. Подготовка к ЕНТ по профильным предметам
						durationMonth?: number // Duration in months: e.g. 6
					}, ... // at least three plans
				]
			}
			`,
			maxTokens: 8192,
		},

		// Short analysis prompt template
		shortAnalysis: {
			system: 'You are an AI assistant that provides a short analysis of test answers.',
			user: `Analyze the provided test answers and generate a short summary and key factors.
			Test Results: {{testResult}}
			Required output format:
			{
				analysis_summary: string
				analysis_key_factors: string[]
			}
			`,
			maxTokens: 2048,
		},

		mbtiAnalysis: {
			system: 'You are an AI assistant that provides MBTI personality analysis.',
			user: `Analyze the provided MBTI test results and generate a comprehensive analysis.
			Test Results: {{testResults}}
			Required output format:
			{
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
			`,
			maxTokens: 4096,
		},

		professionAnalysis: {
			system: 'You are an AI assistant that provides profession analysis based on user profile.',
			user: `Analyze the provided user profile and generate a profession analysis.
			User Profile: {{userProfile}}
			Required output format:
			[
				{
					professionId: number // ID of the profession
					percentage: number // Probability of suitability for the profession
				}, ... // at least six professions with probabilities
			]
			`,
			maxTokens: 4096,
		},

		majorAnalysis: {
			system: 'You are an AI assistant that provides major analysis based on user profile.',
			user: `Analyze the provided user profile and generate a major analysis.
			User Profile: {{userProfile}}
			Available Major Categories: {{majorCategories}}
			Required output format:
			[
				{
					category: string // Name of the major category
				}, ... // at least three major categories
			]
			`,
			maxTokens: 4096,
		},

		attributeAnalysis: {
			system: 'You are an AI assistant that provides personality attribute analysis.',
			user: `Analyze the provided user profile and generate a personality attribute analysis.
			User Profile: {{userProfile}}
			Required output format:
			[
				{
					type: "PROS" | "CONS" // Type of the attribute 
					name: string // Name of the attribute (e.g. Аналитическое мышление)
					description: string // Description of the attribute (e.g Способность разбирать сложные проблемы на составные части и находить логические решения)
					recommendations: string // Recommendations for improvement (e.g. Развивайте аналитические навыки через решение логических задач и участие в дебатах)
				}, ... // at least three PROS and three CONS attributes
			]
			`,
			maxTokens: 4096,
		},
	}

	public get(key: string): PromptTemplate {
		const tpl = this.templates[key]
		if (!tpl) throw new Error(`No prompt template for key "${key}"`)
		return tpl
	}
}
