import {
	Controller,
	Get,
	Post,
	Param,
	Body,
	UseGuards,
	ParseIntPipe,
	HttpCode,
	HttpStatus,
	NotFoundException,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator'
import { UserAuthGuard } from 'src/common/guards/user-auth.guard'
import { User } from '@prisma/client'
import { TestsService } from './tests.service'
import {
	TestSummaryDto,
	TestDetailsDto,
	TestQuestionDto,
	TestQuestionSubmitDto,
	PersonalityAnalysisDto,
} from './dtos/tests.dto'

@ApiTags('tests')
@Controller('tests')
export class TestsController {
	constructor(private readonly testsService: TestsService) {}

	@Get('/')
	@UseGuards(UserAuthGuard)
	@HttpCode(HttpStatus.OK)
	async getAllTestsForUser(@GetCurrentUser() user: User): Promise<TestSummaryDto[]> {
		return this.testsService.getAllTestsForUser(user.id)
	}

	@Get(':testId')
	@UseGuards(UserAuthGuard)
	@HttpCode(HttpStatus.OK)
	async getTestDetails(
		@Param('testId', ParseIntPipe) testId: number,
		@GetCurrentUser() user: User,
	): Promise<TestDetailsDto> {
		const testDetails = await this.testsService.getTestDetails(user.id, testId)
		if (!testDetails) {
			throw new NotFoundException('Test not found')
		}
		return testDetails
	}

	@Get(':testId/questions/:questionId')
	@HttpCode(HttpStatus.OK)
	async getTestQuestion(
		@Param('testId', ParseIntPipe) testId: number,
		@Param('questionId', ParseIntPipe) questionId: number,
	): Promise<TestQuestionDto> {
		const question = await this.testsService.getTestQuestion(testId, questionId)
		if (!question) {
			throw new NotFoundException('Question not found')
		}
		return question
	}

	@Post(':testId/questions/:questionId')
	@UseGuards(UserAuthGuard)
	@HttpCode(HttpStatus.OK)
	async submitAnswer(
		@Param('testId', ParseIntPipe) testId: number,
		@Param('questionId', ParseIntPipe) questionId: number,
		@Body() data: TestQuestionSubmitDto,
		@GetCurrentUser() user: User,
	): Promise<{ message: string }> {
		return this.testsService.submitAnswer(user.id, testId, questionId, data)
	}

	@Post('analysis')
	@UseGuards(UserAuthGuard)
	@HttpCode(HttpStatus.OK)
	async analyzeTests(@GetCurrentUser() user: User): Promise<PersonalityAnalysisDto> {
		return this.testsService.analyzeTests(user.id)
	}
}
