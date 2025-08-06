import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { hash } from 'bcrypt'
import { CreateUserDto, UpdateUserDto, UserFilter } from './dtos/users.dtos'
import { Prisma } from '@prisma/client'
import { paginatePrisma } from 'src/common/utils/prisma-pagination.util'

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

	async create(createUserDto: CreateUserDto) {
		const hashedPassword = await hash(createUserDto.password, 10)
		return this.prisma.user.create({
			data: {
				...createUserDto,
				password: hashedPassword,
			},
		})
	}

	findAll(filters: UserFilter) {
		const where: Prisma.UserWhereInput = {}

		if (filters.search) {
			where.OR = [
				{ username: { contains: filters.search, mode: 'insensitive' } },
				{ email: { contains: filters.search, mode: 'insensitive' } },
				{ firstName: { contains: filters.search, mode: 'insensitive' } },
				{ lastName: { contains: filters.search, mode: 'insensitive' } },
			]
		}

		if (filters.onboarded) where.onboarded = filters.onboarded
		if (filters.role) where.role = filters.role
		if (filters.subscription) where.subscription = filters.subscription
		if (filters.verified) where.verified = filters.verified

		const paginatedData = paginatePrisma(
			this.prisma.user,
			{
				where: where,
			},
			this.prisma.user,
			{ where },
			{
				page: filters.page,
				pageSize: filters.pageSize,
				disablePagination: filters.disablePagination,
			},
		)

		return paginatedData
	}

	findOne(id: number) {
		return this.prisma.user.findUnique({
			where: { id },
		})
	}

	async update(id: number, updateUserDto: UpdateUserDto) {
		if (updateUserDto.password) {
			updateUserDto.password = await hash(updateUserDto.password, 10)
		}
		return this.prisma.user.update({
			where: { id },
			data: updateUserDto,
		})
	}

	remove(id: number) {
		return this.prisma.user.delete({
			where: { id },
		})
	}
}
