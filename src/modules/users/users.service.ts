import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { UserUpdate, UserProfileResponse, UserFilter } from './dtos/users.dtos'
import { paginatePrisma } from '../../common/utils/prisma-pagination.util'
import { PaginatedResponse } from '../../common/utils/pagination.util'
import { hash } from 'bcryptjs'

@Injectable()
export class UserService {
	constructor(private readonly prisma: PrismaService) {}

	async getUsers(userFilter: UserFilter): Promise<PaginatedResponse<UserProfileResponse>> {
		const { page, pageSize, disablePagination, ...filters } = userFilter

		const paginatedUsers = await paginatePrisma(
			this.prisma.user,
			{ where: filters },
			this.prisma.user,
			{ where: filters },
			{ page, pageSize, disablePagination },
		)

		return {
			...paginatedUsers,
			data: paginatedUsers.data.map(user => ({
				id: Number(user.id),
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				username: user.username,
				role: user.role,
				verified: user.verified,
				onboarded: user.onboarded,
				avatarUrl: null, // TODO: Implement avatar logic
				cityId: user.cityId ? Number(user.cityId) : null,
			})),
		}
	}

	async getUserById(userId: number): Promise<UserProfileResponse> {
		const user = await this.prisma.user.findUnique({ where: { id: BigInt(userId) } })
		if (!user) {
			throw new NotFoundException('User not found')
		}
		return {
			id: Number(user.id),
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			username: user.username,
			role: user.role,
			verified: user.verified,
			onboarded: user.onboarded,
			avatarUrl: null, // TODO: Implement avatar logic
			cityId: user.cityId ? Number(user.cityId) : null,
		}
	}

	async updateUser(userId: number, userData: UserUpdate): Promise<UserProfileResponse> {
		const user = await this.prisma.user.findUnique({ where: { id: BigInt(userId) } })
		if (!user) {
			throw new NotFoundException('User not found')
		}

		if (userData.password) {
			userData.password = await hash(userData.password, 10)
		}

		const updatedUser = await this.prisma.user.update({
			where: { id: BigInt(userId) },
			data: userData,
		})

		return {
			id: Number(updatedUser.id),
			firstName: updatedUser.firstName,
			lastName: updatedUser.lastName,
			email: updatedUser.email,
			username: updatedUser.username,
			role: updatedUser.role,
			verified: updatedUser.verified,
			onboarded: updatedUser.onboarded,
			avatarUrl: null, // TODO: Implement avatar logic
			cityId: updatedUser.cityId ? Number(updatedUser.cityId) : null,
		}
	}

	async deleteUser(userId: number): Promise<void> {
		const user = await this.prisma.user.findUnique({ where: { id: BigInt(userId) } })
		if (!user) {
			throw new NotFoundException('User not found')
		}
		await this.prisma.user.delete({ where: { id: BigInt(userId) } })
	}
}
