import { PaginationParamsFilter } from 'src/common/utils/pagination.util'
import { IsOptional, IsString } from 'class-validator'

export class CountryFilter extends PaginationParamsFilter {
	@IsOptional()
	@IsString()
	search?: string
}

export class CountryDto {
	id: number
	name: string
	emoji?: string | null
	createdAt: Date
	updatedAt: Date
}

export class CreateCountryDto {
	@IsString()
	name: string

	@IsOptional()
	@IsString()
	emoji?: string
}

export class UpdateCountryDto {
	@IsOptional()
	@IsString()
	name?: string

	@IsOptional()
	@IsString()
	emoji?: string
}
