import { Country } from '@prisma/client'
import { CountryDto } from '../dtos/countries.dtos'

export function mapCountryToDto(country: Country): CountryDto {
	return {
		id: country.id,
		name: country.name,
		emoji: country.emoji,
		createdAt: country.createdAt,
		updatedAt: country.updatedAt,
	}
}
