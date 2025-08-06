import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsOptional, IsArray, IsInt, IsNumber } from 'class-validator'
import { PaginationParamsFilter } from 'src/common/utils/pagination.util'

export class AuthorDto {
	@ApiProperty()
	id: number

	@ApiProperty()
	name: string

	@ApiProperty({ required: false })
	organizationName?: string

	@ApiProperty({ required: false })
	avatarUrl?: string
}

export class PostSummaryDto {
	@ApiProperty()
	id: number

	@ApiProperty({ type: () => AuthorDto })
	author: AuthorDto

	@ApiProperty()
	content: string

	@ApiProperty({ type: [String] })
	tags: string[]

	@ApiProperty({ type: [String] })
	mediaUrls: string[]

	@ApiProperty({ type: [String] })
	mentions: string[]

	@ApiProperty()
	likes: number

	@ApiProperty()
	comments: number

	@ApiProperty()
	createdAt: Date

	@ApiProperty()
	isLiked: boolean
}

export class CommentDto {
	@ApiProperty()
	id: number

	@ApiProperty({ type: () => AuthorDto })
	author: AuthorDto

	@ApiProperty()
	content: string

	@ApiProperty()
	createdAt: Date
}

export class PostCommentSubmitDto {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	content: string
}

export class PostCreateDto {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	content: string

	@ApiProperty({ required: false })
	@IsNumber()
	@IsOptional()
	projectId?: number
}

export class PostUpdateDto {
	@ApiProperty({ required: false })
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	content?: string
}

export class PostFilter extends PaginationParamsFilter {
	@ApiProperty({ required: false, type: [String] })
	@IsArray()
	@IsOptional()
	tags?: string[]

	@ApiProperty({ required: false, type: [String] })
	@IsArray()
	@IsOptional()
	mentions?: string[]

	@ApiProperty({ required: false })
	@IsInt()
	@IsOptional()
	userId?: number

	@ApiProperty({ required: false })
	@IsString()
	@IsOptional()
	search?: string
}
