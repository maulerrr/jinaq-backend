import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import {
	CreateCountryDto,
	CountryDto,
	CountryFilter,
	UpdateCountryDto,
} from './dtos/countries.dtos'
import { mapCountryToDto } from './utils/countries.mapper'
import { Prisma } from '@prisma/client'
import { paginatePrisma } from 'src/common/utils/prisma-pagination.util'
import { PaginatedResponse } from 'src/common/utils/pagination.util'

@Injectable()
export class CountriesService {
	constructor(private readonly prismaService: PrismaService) {}

	async createCountry(dto: CreateCountryDto): Promise<CountryDto> {
		const country = await this.prismaService.country.create({
			data: dto,
		})

		return mapCountryToDto(country)
	}

	async getAllCountries(filters: CountryFilter): Promise<PaginatedResponse<CountryDto>> {
		const where: Prisma.CountryWhereInput = {}
		if (filters.search) {
			where.OR = [{ name: { contains: filters.search, mode: 'insensitive' } }]
		}

		const paginatedData = await paginatePrisma(
			this.prismaService.country,
			{
				where: where,
				orderBy: { name: 'asc' },
			},
			this.prismaService.country,
			{ where },
			{
				page: filters.page,
				pageSize: filters.pageSize,
				disablePagination: filters.disablePagination,
			},
		)
		return {
			data: paginatedData.data.map(mapCountryToDto),
			pagination: paginatedData.pagination,
		}
	}

	async getCountryById(id: number): Promise<CountryDto> {
		const country = await this.prismaService.country.findUnique({
			where: { id },
		})
		if (!country) {
			throw new Error('Country not found')
		}
		return mapCountryToDto(country)
	}

	async updateCountry(id: number, data: UpdateCountryDto): Promise<CountryDto> {
		const updatedCountry = await this.prismaService.country.update({
			where: { id },
			data,
		})
		return mapCountryToDto(updatedCountry)
	}

	async deleteCountry(id: number): Promise<void> {
		await this.prismaService.country.delete({
			where: { id },
		})
	}
}
