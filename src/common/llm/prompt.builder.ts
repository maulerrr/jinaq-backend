import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { PromptRegistry } from './prompt.registry'

export interface BuiltPrompt {
	messages: { role: 'system' | 'user'; content: string }[]
	maxTokens?: number
}

@Injectable()
export class PromptBuilderService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly registry: PromptRegistry,
	) {}

	async buildUniversityAnalysisPrompt(
		userId: number,
		countryId: number,
		universitiesIds?: number[],
	): Promise<BuiltPrompt> {
		const tpl = this.registry.get('universityAnalysis')

		const userProfile = await this.prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				academicInfo: true,
				languageProficiencies: true,
				personalityAnalyses: true,
				interests: true,
			},
		})

		const universitiesData = await this.prisma.institution.findMany({
			where: {
				countryId: countryId,
				...(universitiesIds && universitiesIds.length > 0 ? { id: { in: universitiesIds } } : {}),
			},
		})

		const user = tpl.user
			.replace(/{{userProfile}}/g, JSON.stringify(userProfile))
			.replace(/{{universitiesData}}/g, JSON.stringify(universitiesData))

		return {
			messages: [
				{ role: 'system', content: tpl.system.trim() },
				{ role: 'user', content: user.trim() },
			],
			maxTokens: tpl.maxTokens,
		}
	}

	async buildPersonalityAnalysisPrompt(testResults: any[]): Promise<BuiltPrompt> {
		const tpl = this.registry.get('personalityAnalysis')
		await Promise.resolve()
		// TODO: Implement actual personality analysis prompt building logic

		const user = tpl.user.replace(/{{testResults}}/g, JSON.stringify(testResults))

		return {
			messages: [
				{ role: 'system', content: tpl.system.trim() },
				{ role: 'user', content: user.trim() },
			],
			maxTokens: tpl.maxTokens,
		}
	}

	async buildShortAnalysisPrompt(testResults: any): Promise<BuiltPrompt> {
		const tpl = this.registry.get('shortAnalysis')
		await Promise.resolve()
		// TODO: Implement short analysis prompt logic
		const user = tpl.user.replace(/{{testResults}}/g, JSON.stringify(testResults))

		return {
			messages: [
				{ role: 'system', content: tpl.system.trim() },
				{ role: 'user', content: user.trim() },
			],
			maxTokens: tpl.maxTokens,
		}
	}
}
