import { IsString, IsEmail, IsOptional, IsBoolean, IsEnum, IsNumber } from 'class-validator'
import { UserRole, SubscriptionType } from '@prisma/client'
import { PaginationParamsFilter } from 'src/common/utils/pagination.util'

export class UserProfileResponse {
	@IsNumber()
	id: number

	@IsString()
	firstName: string

	@IsString()
	lastName: string

	@IsEmail()
	email: string

	@IsString()
	username: string

	@IsEnum(UserRole)
	role: UserRole

	@IsBoolean()
	verified: boolean

	@IsBoolean()
	onboarded: boolean

	@IsOptional()
	@IsString()
	avatarUrl?: string | null

	@IsOptional()
	@IsNumber()
	cityId?: number | null
}
export class CreateUserDto {
	@IsString()
	firstName: string

	@IsString()
	lastName: string

	@IsEmail()
	email: string

	@IsString()
	username: string

	@IsString()
	password: string

	@IsEnum(UserRole)
	role: UserRole

	@IsBoolean()
	verified?: boolean = false

	@IsBoolean()
	onboarded?: boolean = false
}

export class UpdateUserDto {
	@IsOptional()
	@IsString()
	firstName?: string

	@IsOptional()
	@IsString()
	lastName?: string

	@IsOptional()
	@IsEmail()
	email?: string

	@IsOptional()
	@IsString()
	username?: string

	@IsOptional()
	@IsString()
	password?: string

	@IsOptional()
	@IsEnum(UserRole)
	role?: UserRole

	@IsOptional()
	@IsBoolean()
	verified?: boolean = false

	@IsOptional()
	@IsBoolean()
	onboarded?: boolean = false
}

export class UserFilter extends PaginationParamsFilter {
	@IsOptional()
	@IsString()
	search: string

	@IsOptional()
	@IsEnum(UserRole)
	role?: UserRole

	@IsOptional()
	@IsEnum(SubscriptionType)
	subscription?: SubscriptionType

	@IsOptional()
	@IsBoolean()
	verified?: boolean

	@IsOptional()
	@IsBoolean()
	onboarded?: boolean
}
