from typing import List

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from typing import List

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.countries.countries_repository import CountryRepository
from app.modules.countries.countries_schemas import CountryCreateRequest, CountryResponse, CountryFilter, CountryUpdateRequest


class CountryService:
    def __init__(self, session: AsyncSession):
        self.repository = CountryRepository(session)

    async def create_country(self, country_data: CountryCreateRequest) -> CountryResponse:
        # Check for existing country by name before creating
        existing_country = await self.repository.get_countries(CountryFilter(name=country_data.name))
        if existing_country:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Country with this name already exists",
            )
        country = await self.repository.create_country(country_data)
        return CountryResponse.model_validate(country)

    async def get_countries(self, country_filter: CountryFilter) -> List[CountryResponse]:
        countries = await self.repository.get_countries(country_filter)
        return [CountryResponse.model_validate(country) for country in countries]

    async def count_countries(self, country_filter: CountryFilter) -> int:
        return await self.repository.count_countries(country_filter)

    async def get_country_by_id(self, country_id: int) -> CountryResponse:
        country = await self.repository.get_country_by_id(country_id)
        if not country:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Country not found",
            )
        return CountryResponse.model_validate(country)

    async def update_country(self, country_id: int, country_data: CountryUpdateRequest) -> CountryResponse:
        country = await self.repository.get_country_by_id(country_id)
        if not country:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Country not found",
            )
        updated_country = await self.repository.update_country(country, country_data)
        return CountryResponse.model_validate(updated_country)

    async def delete_country(self, country_id: int):
        country = await self.repository.get_country_by_id(country_id)
        if not country:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Country not found",
            )
        await self.repository.delete_country(country)
