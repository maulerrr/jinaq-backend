import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PaginatedResponse } from 'src/common/utils/pagination.util'
import { paginatePrisma } from 'src/common/utils/prisma-pagination.util'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateCityDto, CityDto, CityFilter, UpdateCityDto } from './dtos/cities.dtos'
import { mapCityToDto } from './utils/cities.mapper'

@Injectable()
export class CitiesService {
	constructor(private readonly prismaService: PrismaService) {}

	async createCity(dto: CreateCityDto): Promise<CityDto> {
		const city = await this.prismaService.city.create({
			data: dto,
		})

		return mapCityToDto(city)
	}

	async getAllCities(filters: CityFilter): Promise<PaginatedResponse<CityDto>> {
		const where: Prisma.CityWhereInput = {}
		if (filters.search) {
			where.OR = [{ name: { contains: filters.search, mode: 'insensitive' } }]
		}

		const paginatedData = await paginatePrisma(
			this.prismaService.city,
			{
				where: where,
				orderBy: { name: 'asc' },
			},
			this.prismaService.city,
			{ where },
			{
				page: filters.page,
				pageSize: filters.pageSize,
				disablePagination: filters.disablePagination,
			},
		)
		return {
			data: paginatedData.data.map(mapCityToDto),
			pagination: paginatedData.pagination,
		}
	}

	async getCityById(id: number): Promise<CityDto> {
		const city = await this.prismaService.city.findUnique({
			where: { id },
		})
		if (!city) {
			throw new Error('City not found')
		}
		return mapCityToDto(city)
	}

	async updateCity(id: number, dto: UpdateCityDto): Promise<CityDto> {
		const city = await this.prismaService.city.update({
			where: { id },
			data: dto,
		})
		return mapCityToDto(city)
	}

	async deleteCity(id: number): Promise<void> {
		await this.prismaService.city.delete({
			where: { id },
		})
	}
}
