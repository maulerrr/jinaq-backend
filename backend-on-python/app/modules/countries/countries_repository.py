from typing import List, Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models.countries_model import Country
from app.modules.countries.countries_schemas import CountryCreateRequest, CountryFilter


class CountryRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_country(self, country_data: CountryCreateRequest) -> Country:
        country = Country(**country_data.model_dump())
        self.session.add(country)
        await self.session.commit()
        await self.session.refresh(country)
        return country

    async def get_countries(self, country_filter: CountryFilter) -> List[Country]:
        query = select(Country)
        if country_filter.name:
            query = query.where(Country.name.ilike(f"%{country_filter.name}%"))

        query = query.offset(country_filter.skip).limit(country_filter.page_size)
        
        result = await self.session.execute(query)
        return result.scalars().all()

    async def count_countries(self, country_filter: CountryFilter) -> int:
        query = select(func.count()).select_from(Country)
        if country_filter.name:
            query = query.where(Country.name.ilike(f"%{country_filter.name}%"))
        
        result = await self.session.execute(query)
        return result.scalar_one()

    async def get_country_by_id(self, country_id: int) -> Optional[Country]:
        result = await self.session.execute(select(Country).where(Country.id == country_id))
        return result.scalar_one_or_none()

    async def update_country(self, country: Country, country_data: CountryCreateRequest) -> Country:
        for field, value in country_data.model_dump(exclude_unset=True).items():
            setattr(country, field, value)
        self.session.add(country)
        await self.session.commit()
        await self.session.refresh(country)
        return country

    async def delete_country(self, country: Country):
        await self.session.delete(country)
        await self.session.commit()
