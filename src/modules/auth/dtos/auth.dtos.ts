import {
	IsString,
	IsEmail,
	IsOptional,
	IsBoolean,
	IsArray,
	IsEnum,
	IsDateString,
	IsNumber,
} from 'class-validator'
import { UserRole, SubscriptionType, LanguageLevel, InterestsEnum } from '@prisma/client'

// Signup
export class UserSignupRequest {
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
}

// Login
export class UserLoginRequest {
	@IsString()
	emailOrUsername: string

	@IsString()
	password: string
}

// Token response
export class TokenResponse {
	@IsString()
	sessionToken: string

	@IsDateString()
	expiresAt: Date
}

// Current user response
export class CurrentUserResponse {
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

	@IsArray()
	@IsEnum(UserRole, { each: true })
	roles: UserRole[]

	@IsBoolean()
	verified: boolean

	@IsBoolean()
	onboarded: boolean

	@IsOptional()
	@IsString()
	avatarUrl?: string | null
}

// Onboarding
export class UserAcademicDto {
	@IsOptional()
	@IsNumber()
	gpa?: number

	@IsOptional()
	@IsNumber()
	sat?: number

	@IsOptional()
	@IsNumber()
	ielts?: number

	@IsOptional()
	@IsNumber()
	toefl?: number
}

export class UserLanguageProficiencyDto {
	@IsString()
	language: string

	@IsEnum(LanguageLevel)
	level: LanguageLevel
}

export class UserOnboardingRequest {
	@IsDateString()
	dateOfBirth: Date

	@IsArray()
	@IsEnum(InterestsEnum, { each: true })
	interests: InterestsEnum[]

	@IsOptional()
	@IsString()
	organizationName?: string

	@IsOptional()
	@IsString()
	about?: string

	@IsOptional()
	academic?: UserAcademicDto

	@IsArray()
	languages: UserLanguageProficiencyDto[]
}

// Generic user response
export class UserResponse {
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

	@IsEnum(SubscriptionType)
	subscription: SubscriptionType

	@IsBoolean()
	verified: boolean

	@IsBoolean()
	onboarded: boolean
}
