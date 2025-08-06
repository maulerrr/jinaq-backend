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
					institution: {
						id: number
						name: string
						shortName?: string
						description?: string
						foundationYear?: string
						financingType: InstitutionFinancingType
						type: InstitutionType
						website?: string
						email?: string
						contactNumber?: string
						address?: string
						hasDorm: boolean
						imageUrl?: string
					}
					chancePercentage?: number
					attributes: {
						name: string
						type: AttributeType
						recommendation?: string
					}[]
					plan: {
						order: number
						name: string
						description?: string
						durationMonth?: number
					}[]
				}[]
			}
			`,
			maxTokens: 2048,
		},

		// Personality analysis prompt template
		personalityAnalysis: {
			system: 'You are an AI assistant that provides personality analysis based on test results.',
			user: `Analyze the provided test results to generate a comprehensive personality analysis.
			Test Results: {{testResults}}
			Required output format:
			{
				mbti: {
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
				professions: {
					professionId: number
					percentage: number
				}[]
				majors: {
					category: string
				}[]
				attributes: {
					type: "PROS" | "CONS"
					name: string
					description: string
					recommendations: string
				}[]
			}
			`,
			maxTokens: 2048,
		},

		// Short analysis prompt template
		shortAnalysis: {
			system: 'You are an AI assistant that provides a short analysis of test answers.',
			user: `Analyze the provided test answers and generate a short summary and key factors.
			Test Results: {{testResults}}
			Required output format:
			{
				analysis_summary: string
				analysis_key_factors: string[]
			}
			`,
			maxTokens: 1024,
		},
	}

	public get(key: string): PromptTemplate {
		const tpl = this.templates[key]
		if (!tpl) throw new Error(`No prompt template for key "${key}"`)
		return tpl
	}
}
