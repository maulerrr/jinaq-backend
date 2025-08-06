import { PopularityEnum, ProfessionCategory } from '@prisma/client'
import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator'
import { PaginationParamsFilter } from 'src/common/utils/pagination.util'

export class ProfessionDto {
	id: number
	name: string
	category: ProfessionCategory
	description?: string
	startSalary?: number
	endSalary?: number
	popularity?: PopularityEnum
	skills?: string[]
}

export class CreateProfessionDto {
	@IsString()
	name: string

	@IsEnum(ProfessionCategory)
	category: ProfessionCategory

	@IsOptional()
	@IsString()
	description?: string

	@IsOptional()
	@IsNumber()
	startSalary?: number

	@IsOptional()
	@IsNumber()
	endSalary?: number

	@IsOptional()
	@IsEnum(PopularityEnum)
	popularity?: PopularityEnum

	@IsOptional()
	@IsString({ each: true })
	skills?: string[]
}

export class UpdateProfessionDto {
	@IsOptional()
	@IsString()
	name?: string

	@IsOptional()
	@IsEnum(ProfessionCategory)
	category?: ProfessionCategory

	@IsOptional()
	@IsString()
	description?: string

	@IsOptional()
	@IsNumber()
	startSalary?: number

	@IsOptional()
	@IsNumber()
	endSalary?: number

	@IsOptional()
	@IsEnum(PopularityEnum)
	popularity?: PopularityEnum

	@IsOptional()
	@IsString({ each: true })
	skills?: string[]
}

export class ProfessionFilter extends PaginationParamsFilter {
	@IsOptional()
	@IsString()
	search?: string

	@IsOptional()
	@IsEnum(PopularityEnum as unknown as object)
	popularity?: PopularityEnum

	@IsOptional()
	@IsString()
	category?: ProfessionCategory

	@IsOptional()
	@IsString({ each: true })
	skills?: string[]

	@IsOptional()
	@IsNumber()
	maxSalary?: number

	@IsOptional()
	@IsNumber()
	minSalary?: number
}
