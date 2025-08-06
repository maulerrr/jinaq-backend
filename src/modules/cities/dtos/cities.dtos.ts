import { PaginationParamsFilter } from 'src/common/utils/pagination.util'
import { IsOptional, IsString, IsInt } from 'class-validator'
import { Type } from 'class-transformer'

export class CityFilter extends PaginationParamsFilter {
	@IsOptional()
	@IsString()
	search?: string

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	countryId?: number
}

export class CityDto {
	id: number
	name: string
	countryId: number
	createdAt: Date
	updatedAt: Date
}

export class CreateCityDto {
	@IsString()
	name: string

	@IsInt()
	@Type(() => Number)
	countryId: number
}

export class UpdateCityDto {
	@IsOptional()
	@IsString()
	name?: string

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	countryId?: number
}
