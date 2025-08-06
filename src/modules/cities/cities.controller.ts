import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Query,
} from '@nestjs/common'
import { PaginatedResponse } from 'src/common/utils/pagination.util'
import { CitiesService } from './cities.service'
import { CityFilter, CityDto, CreateCityDto, UpdateCityDto } from './dtos/cities.dtos'

@Controller('cities')
export class CitiesController {
	constructor(private readonly citiesService: CitiesService) {}

	@Get()
	async getAllCities(@Query() filters: CityFilter): Promise<PaginatedResponse<CityDto>> {
		return this.citiesService.getAllCities(filters)
	}
	@Get(':id')
	async getCityById(@Param('id', ParseIntPipe) id: number): Promise<CityDto> {
		return this.citiesService.getCityById(id)
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	async createCity(@Body() dto: CreateCityDto): Promise<CityDto> {
		return this.citiesService.createCity(dto)
	}

	@Put(':id')
	async updateCity(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: UpdateCityDto,
	): Promise<CityDto> {
		return this.citiesService.updateCity(id, dto)
	}

	@Delete(':id')
	async deleteCity(@Param('id', ParseIntPipe) id: number): Promise<void> {
		return this.citiesService.deleteCity(id)
	}
}
