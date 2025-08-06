import { User, Post, Comment, PostLike } from '@prisma/client'
import { AuthorDto, PostSummaryDto, CommentDto } from '../dtos/posts.dto'

export function toAuthorResponse(user: User): AuthorDto {
	return {
		id: user.id,
		name: `${user.firstName} ${user.lastName}`,
		organizationName: user.organizationName || undefined,
		avatarUrl: user.avatarKey || undefined,
	}
}

export type PostWithDetails = Post & {
	likes: PostLike[]
	comments: Comment[]
	author: User
}

export function toPostsSummaryResponse(
	post: PostWithDetails,
	currentUserId?: number,
): PostSummaryDto {
	const isLiked = currentUserId ? post.likes.some(like => like.userId === currentUserId) : false
	return {
		id: post.id,
		author: toAuthorResponse(post.author),
		content: post.content,
		tags: post.tags,
		mediaUrls: [], // TODO: mediaUrls add after S3 integration
		mentions: post.mentions,
		likes: post.likes.length,
		comments: post.comments.length,
		createdAt: post.createdAt,
		isLiked,
	}
}

type CommentWithAuthor = Comment & {
	user: User
}

export function toCommentsResponse(comment: CommentWithAuthor): CommentDto {
	return {
		id: comment.id,
		author: toAuthorResponse(comment.user),
		content: comment.content,
		createdAt: comment.createdAt,
	}
}
