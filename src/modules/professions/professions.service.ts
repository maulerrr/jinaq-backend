import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import {
	CreateProfessionDto,
	ProfessionDto,
	ProfessionFilter,
	UpdateProfessionDto,
} from './dtos/professions.dtos'
import { mapProfessionToDto } from './utils/professions.mapper'
import { Prisma } from '@prisma/client'
import { paginatePrisma } from 'src/common/utils/prisma-pagination.util'
import { PaginatedResponse } from 'src/common/utils/pagination.util'

@Injectable()
export class ProfessionsService {
	public constructor(private readonly prismaService: PrismaService) {}

	async createProfession(dto: CreateProfessionDto): Promise<ProfessionDto> {
		const profession = await this.prismaService.profession.create({
			data: dto,
		})

		return mapProfessionToDto(profession)
	}

	async getAllProfessions(filters: ProfessionFilter): Promise<PaginatedResponse<ProfessionDto>> {
		const where: Prisma.ProfessionWhereInput = {}
		if (filters.search) {
			where.OR = [
				{ name: { contains: filters.search, mode: 'insensitive' } },
				{ description: { contains: filters.search, mode: 'insensitive' } },
			]
		}

		if (filters.popularity) {
			where.popularity = filters.popularity
		}
		if (filters.category) {
			where.category = filters.category
		}
		if (filters.skills && filters.skills.length > 0) {
			where.skills = { hasSome: filters.skills }
		}
		if (filters.maxSalary) {
			where.startSalary = { lte: filters.maxSalary }
			where.endSalary = { gte: filters.maxSalary }
		}
		if (filters.minSalary) {
			where.startSalary = { gte: filters.minSalary }
			where.endSalary = { lte: filters.minSalary }
		}

		const paginatedData = await paginatePrisma(
			this.prismaService.profession,
			{
				where: where,
				orderBy: { name: 'asc' },
			},
			this.prismaService.profession,
			{ where },
			{
				page: filters.page,
				pageSize: filters.pageSize,
				disablePagination: filters.disablePagination,
			},
		)
		return {
			data: paginatedData.data.map(mapProfessionToDto),
			pagination: paginatedData.pagination,
		}
	}

	async getProfessionById(id: number): Promise<ProfessionDto> {
		const profession = await this.prismaService.profession.findUnique({
			where: { id },
		})
		if (!profession) {
			throw new Error('Profession not found')
		}
		return mapProfessionToDto(profession)
	}

	async updateProfession(id: number, data: UpdateProfessionDto): Promise<ProfessionDto> {
		const updatedProfession = await this.prismaService.profession.update({
			where: { id },
			data,
		})
		return mapProfessionToDto(updatedProfession)
	}

	async deleteProfession(id: number): Promise<void> {
		await this.prismaService.profession.delete({
			where: { id },
		})
	}
}
