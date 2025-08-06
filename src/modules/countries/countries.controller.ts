import {
	Controller,
	Delete,
	Get,
	Post,
	Put,
	Param,
	Body,
	Query,
	ParseIntPipe,
	HttpCode,
	HttpStatus,
} from '@nestjs/common'
import { PaginatedResponse } from 'src/common/utils/pagination.util'
import {
	CountryFilter,
	CountryDto,
	CreateCountryDto,
	UpdateCountryDto,
} from './dtos/countries.dtos'
import { CountriesService } from './countries.service'

@Controller('countries')
export class CountriesController {
	constructor(private readonly countriesService: CountriesService) {}

	@Get()
	async getAllCountries(@Query() filters: CountryFilter): Promise<PaginatedResponse<CountryDto>> {
		return this.countriesService.getAllCountries(filters)
	}

	@Get(':id')
	async getCountryById(@Param('id', ParseIntPipe) id: number): Promise<CountryDto> {
		return this.countriesService.getCountryById(id)
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	async createCountry(@Body() dto: CreateCountryDto): Promise<CountryDto> {
		return this.countriesService.createCountry(dto)
	}

	@Put(':id')
	async updateCountry(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: UpdateCountryDto,
	): Promise<CountryDto> {
		return this.countriesService.updateCountry(id, dto)
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	async deleteCountry(@Param('id', ParseIntPipe) id: number): Promise<void> {
		return this.countriesService.deleteCountry(id)
	}
}
