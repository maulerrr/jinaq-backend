import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { PromptRegistry } from './prompt.registry'
import { ShortSummaryOfTest, TestResultsDto } from 'src/modules/tests/dtos/tests.dto'
import { MAJOR_CATEGORY } from '@prisma/client'

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

	async buildPerUniversityAnalysisPrompt(
		userId: number,
		institutionId: number,
	): Promise<BuiltPrompt> {
		const tpl = this.registry.get('perUniversityAnalysis')

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

		const universityData = await this.prisma.institution.findUnique({
			where: { id: institutionId },
		})

		const user = tpl.user
			.replace(/{{userProfile}}/g, JSON.stringify(userProfile))
			.replace(/{{universityData}}/g, JSON.stringify(universityData))

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

	async buildShortAnalysisPrompt(userId: number, testResult: TestResultsDto): Promise<BuiltPrompt> {
		const tpl = this.registry.get('shortAnalysis')

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

		const user = tpl.user
			.replace(/{{testResult}}/g, JSON.stringify(testResult))
			.replace(/{{userProfile}}/g, JSON.stringify(userProfile))

		return {
			messages: [
				{ role: 'system', content: tpl.system.trim() },
				{ role: 'user', content: user.trim() },
			],
			maxTokens: tpl.maxTokens,
		}
	}

	async buildMBTIAnalysisPrompt(
		userId: number,
		testResults: ShortSummaryOfTest[],
	): Promise<BuiltPrompt> {
		const tpl = this.registry.get('mbtiAnalysis')

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

		const user = tpl.user
			.replace(/{{testResults}}/g, JSON.stringify(testResults))
			.replace(/{{userProfile}}/g, JSON.stringify(userProfile))

		return {
			messages: [
				{ role: 'system', content: tpl.system.trim() },
				{ role: 'user', content: user.trim() },
			],
			maxTokens: tpl.maxTokens,
		}
	}

	async buildProfessionAnalysisPrompt(
		userId: number,
		testResults: ShortSummaryOfTest[],
	): Promise<BuiltPrompt> {
		const tpl = this.registry.get('professionAnalysis')

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

		const user = tpl.user
			.replace(/{{userProfile}}/g, JSON.stringify(userProfile))
			.replace(/{{testResults}}/g, JSON.stringify(testResults))

		return {
			messages: [
				{ role: 'system', content: tpl.system.trim() },
				{ role: 'user', content: user.trim() },
			],
			maxTokens: tpl.maxTokens,
		}
	}

	async buildMajorAnalysisPrompt(
		userId: number,
		testResults: ShortSummaryOfTest[],
	): Promise<BuiltPrompt> {
		const tpl = this.registry.get('majorAnalysis')

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

		const majorCategories = MAJOR_CATEGORY

		const user = tpl.user
			.replace(/{{userProfile}}/g, JSON.stringify(userProfile))
			.replace(/{{majorCategories}}/g, JSON.stringify(majorCategories))
			.replace(/{{testResults}}/g, JSON.stringify(testResults))

		return {
			messages: [
				{ role: 'system', content: tpl.system.trim() },
				{ role: 'user', content: user.trim() },
			],
			maxTokens: tpl.maxTokens,
		}
	}

	async buildAttributeAnalysisPrompt(
		userId: number,
		testResults: ShortSummaryOfTest[],
	): Promise<BuiltPrompt> {
		const tpl = this.registry.get('attributeAnalysis')

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

		const user = tpl.user
			.replace(/{{userProfile}}/g, JSON.stringify(userProfile))
			.replace(/{{testResults}}/g, JSON.stringify(testResults))

		return {
			messages: [
				{ role: 'system', content: tpl.system.trim() },
				{ role: 'user', content: user.trim() },
			],
			maxTokens: tpl.maxTokens,
		}
	}
}
