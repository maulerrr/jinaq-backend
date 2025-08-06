from typing import List

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.cities.cities_repository import CityRepository
from app.modules.cities.cities_schemas import CityCreateRequest, CityResponse, CityFilter, CityUpdateRequest
from app.modules.countries.countries_repository import CountryRepository
from app.modules.countries.countries_schemas import CountryFilter


class CityService:
    def __init__(self, session: AsyncSession):
        self.repository = CityRepository(session)
        self.country_repository = CountryRepository(session)

    async def create_city(self, city_data: CityCreateRequest) -> CityResponse:
        country = await self.country_repository.get_countries(CountryFilter(id=city_data.country_id))
        if not country:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Country not found",
            )

        existing_city = await self.repository.get_cities(CityFilter(name=city_data.name, country_id=city_data.country_id))
        if existing_city:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="City with this name already exists in this country",
            )

        city = await self.repository.create_city(city_data)
        return CityResponse.model_validate(city)

    async def get_cities(self, city_filter: CityFilter) -> List[CityResponse]:
        cities = await self.repository.get_cities(city_filter)
        return [CityResponse.model_validate(city) for city in cities]

    async def count_cities(self, city_filter: CityFilter) -> int:
        return await self.repository.count_cities(city_filter)

    async def get_city_by_id(self, city_id: int) -> CityResponse:
        city = await self.repository.get_city_by_id(city_id)
        if not city:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="City not found",
            )
        return CityResponse.model_validate(city)

    async def update_city(self, city_id: int, city_data: CityUpdateRequest) -> CityResponse:
        city = await self.repository.get_city_by_id(city_id)
        if not city:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="City not found",
            )
        updated_city = await self.repository.update_city(city, city_data)
        return CityResponse.model_validate(updated_city)

    async def delete_city(self, city_id: int):
        city = await self.repository.get_city_by_id(city_id)
        if not city:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="City not found",
            )
        await self.repository.delete_city(city)
