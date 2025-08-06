import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import {
	PostCreateDto,
	PostUpdateDto,
	PostFilter,
	PostSummaryDto,
	CommentDto,
	PostCommentSubmitDto,
} from './dtos/posts.dto'
import { extractHashtags, extractMentions } from './utils/text.util'
import { PaginatedResponse, mapPaginatedResponse } from 'src/common/utils/pagination.util'
import { Prisma } from '@prisma/client'
import { paginatePrisma } from 'src/common/utils/prisma-pagination.util'
import { toPostsSummaryResponse, toCommentsResponse, PostWithDetails } from './utils/posts.mapper'

@Injectable()
export class PostsService {
	constructor(private readonly prisma: PrismaService) {}

	async getAllPosts(
		filters: PostFilter,
		currentUserId?: number,
	): Promise<PaginatedResponse<PostSummaryDto>> {
		const where: Prisma.PostWhereInput = {}
		if (filters.tags) {
			where.tags = { hasSome: filters.tags }
		}
		if (filters.mentions) {
			where.mentions = { hasSome: filters.mentions }
		}
		if (filters.userId) {
			where.authorId = filters.userId
		}
		if (filters.search) {
			where.content = { contains: filters.search, mode: 'insensitive' }
		}

		const paginatedPosts = await paginatePrisma(
			this.prisma.post,
			{
				where,
				include: {
					likes: true,
					comments: true,
					author: true,
				},
				orderBy: { createdAt: 'desc' },
			},
			this.prisma.post,
			{ where },
			filters,
		)

		return mapPaginatedResponse(paginatedPosts, post =>
			toPostsSummaryResponse(post as PostWithDetails, currentUserId),
		)
	}

	async getPostById(postId: number, currentUserId?: number): Promise<PostSummaryDto> {
		const post = await this.prisma.post.findUnique({
			where: { id: postId },
			include: {
				likes: true,
				comments: true,
				author: true,
			},
		})

		if (!post) {
			throw new NotFoundException('Post not found')
		}

		return toPostsSummaryResponse(post, currentUserId)
	}

	async createPost(postData: PostCreateDto, authorId: number): Promise<PostSummaryDto> {
		const tags = extractHashtags(postData.content)
		const mentions = extractMentions(postData.content)

		const newPost = await this.prisma.post.create({
			data: {
				authorId,
				content: postData.content,
				tags,
				mentions,
				projectId: postData.projectId,
			},
			include: {
				author: true,
			},
		})

		return {
			id: newPost.id,
			author: {
				id: newPost.author.id,
				name: `${newPost.author.firstName} ${newPost.author.lastName}`,
				organizationName: newPost.author.organizationName || undefined,
				avatarUrl: newPost.author.avatarKey || undefined,
			},
			content: newPost.content,
			tags: newPost.tags,
			mentions: newPost.mentions,
			mediaUrls: [],
			likes: 0,
			comments: 0,
			createdAt: newPost.createdAt,
			isLiked: false,
		}
	}

	async updatePost(
		postId: number,
		postData: PostUpdateDto,
		currentUserId: number,
	): Promise<PostSummaryDto> {
		const updatePayload: Prisma.PostUpdateInput = { ...postData }
		if (postData.content) {
			updatePayload.tags = extractHashtags(postData.content)
			updatePayload.mentions = extractMentions(postData.content)
		}

		const updatedPost = await this.prisma.post.update({
			where: { id: postId },
			data: updatePayload,
			include: {
				likes: true,
				comments: true,
				author: true,
			},
		})

		return toPostsSummaryResponse(updatedPost, currentUserId)
	}

	async deletePost(postId: number): Promise<void> {
		await this.prisma.post.delete({ where: { id: postId } })
	}

	async getCommentsForPost(
		postId: number,
		filters: PostFilter,
	): Promise<PaginatedResponse<CommentDto>> {
		const where = { postId }

		const paginatedComments = await paginatePrisma(
			this.prisma.comment,
			{
				where,
				include: {
					user: true,
				},
				orderBy: { createdAt: 'desc' },
			},
			this.prisma.comment,
			{ where },
			filters,
		)

		return mapPaginatedResponse(paginatedComments, toCommentsResponse)
	}

	async addCommentToPost(
		postId: number,
		userId: number,
		commentData: PostCommentSubmitDto,
	): Promise<CommentDto> {
		const newComment = await this.prisma.comment.create({
			data: {
				postId,
				userId,
				content: commentData.content,
			},
			include: {
				user: true,
			},
		})

		return toCommentsResponse(newComment)
	}

	async togglePostLike(postId: number, userId: number): Promise<{ liked: boolean }> {
		const existingLike = await this.prisma.postLike.findFirst({
			where: { postId, userId },
		})

		if (existingLike) {
			await this.prisma.postLike.delete({ where: { id: existingLike.id } })
			return { liked: false }
		} else {
			await this.prisma.postLike.create({ data: { postId, userId } })
			return { liked: true }
		}
	}
}
