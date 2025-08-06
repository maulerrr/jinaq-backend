import { Profession } from '@prisma/client'
import { ProfessionDto } from '../dtos/professions.dtos'

export function mapProfessionToDto(profession: Profession): ProfessionDto {
	return {
		id: profession.id,
		name: profession.name,
		category: profession.category,
		description: profession.description || undefined,
		startSalary: profession.startSalary ? parseFloat(profession.startSalary.toString()) : undefined,
		endSalary: profession.endSalary ? parseFloat(profession.endSalary.toString()) : undefined,
		popularity: profession.popularity || undefined,
		skills: profession.skills || [],
	}
}
