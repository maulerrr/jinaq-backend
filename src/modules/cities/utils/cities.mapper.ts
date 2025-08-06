import { City } from '@prisma/client'
import { CityDto } from '../dtos/cities.dtos'

export function mapCityToDto(city: City): CityDto {
	return {
		id: city.id,
		name: city.name,
		countryId: city.countryId,
		createdAt: city.createdAt,
		updatedAt: city.updatedAt,
	}
}
