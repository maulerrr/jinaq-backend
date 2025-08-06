import { Injectable, NotFoundException } from '@nestjs/common'
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

	buildPrompt(userId: number, input: string): BuiltPrompt {
		const user = this.prisma.user.findUnique({ where: { id: userId } })
		if (!user) throw new NotFoundException(`User #${userId} not found`)

		const promptTemplate = this.registry.get('default')
		const messages = [
			{ role: 'user', content: input },
			{ role: 'system', content: promptTemplate },
		]

		return { messages, maxTokens: 1024 }
	}
}
