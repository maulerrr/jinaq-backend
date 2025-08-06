import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Param,
	Body,
	Query,
	UseGuards,
	ParseIntPipe,
	HttpCode,
	HttpStatus,
	ForbiddenException,
} from '@nestjs/common'
import { PostsService } from './posts.service'
import { PostCreateDto, PostUpdateDto, PostFilter, PostCommentSubmitDto } from './dtos/posts.dto'
import { ApiTags } from '@nestjs/swagger'
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator'
import { UserAuthGuard } from 'src/common/guards/user-auth.guard'
import { User } from '@prisma/client'

@ApiTags('posts')
@Controller('posts')
export class PostsController {
	constructor(private readonly postsService: PostsService) {}

	@Get()
	@UseGuards(UserAuthGuard)
	async getAllPosts(@Query() filters: PostFilter, @GetCurrentUser() user: User) {
		return this.postsService.getAllPosts(filters, user.id)
	}

	@Get(':id')
	@UseGuards(UserAuthGuard)
	async getPostById(@Param('id', ParseIntPipe) id: number, @GetCurrentUser() user: User) {
		return this.postsService.getPostById(id, user.id)
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@UseGuards(UserAuthGuard)
	async createPost(@Body() postData: PostCreateDto, @GetCurrentUser() user: User) {
		return this.postsService.createPost(postData, user.id)
	}

	@Put(':id')
	@UseGuards(UserAuthGuard)
	async updatePost(
		@Param('id', ParseIntPipe) id: number,
		@Body() postData: PostUpdateDto,
		@GetCurrentUser() user: User,
	) {
		const post = await this.postsService.getPostById(id)
		if (post.author.id !== user.id) {
			throw new ForbiddenException('Not authorized to update this post')
		}
		return this.postsService.updatePost(id, postData, user.id)
	}

	@Delete(':id')
	@UseGuards(UserAuthGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	async deletePost(@Param('id', ParseIntPipe) id: number, @GetCurrentUser() user: User) {
		const post = await this.postsService.getPostById(id)
		if (post.author.id !== user.id) {
			throw new ForbiddenException('Not authorized to delete this post')
		}
		await this.postsService.deletePost(id)
	}

	@Get(':id/comments')
	async getCommentsForPost(@Param('id', ParseIntPipe) id: number, @Query() filters: PostFilter) {
		return this.postsService.getCommentsForPost(id, filters)
	}

	@Post(':id/comments')
	@UseGuards(UserAuthGuard)
	@HttpCode(HttpStatus.CREATED)
	async addCommentToPost(
		@Param('id', ParseIntPipe) id: number,
		@Body() commentData: PostCommentSubmitDto,
		@GetCurrentUser() user: User,
	) {
		return this.postsService.addCommentToPost(id, user.id, commentData)
	}

	@Post(':id/like')
	@UseGuards(UserAuthGuard)
	@HttpCode(HttpStatus.OK)
	async toggleLikePost(@Param('id', ParseIntPipe) id: number, @GetCurrentUser() user: User) {
		return this.postsService.togglePostLike(id, user.id)
	}
}
