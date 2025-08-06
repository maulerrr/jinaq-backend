from typing import List, Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models.cities_model import City
from app.modules.cities.cities_schemas import CityCreateRequest, CityFilter, CityUpdateRequest


class CityRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_city(self, city_data: CityCreateRequest) -> City:
        city = City(**city_data.model_dump())
        self.session.add(city)
        await self.session.commit()
        await self.session.refresh(city)
        return city

    async def get_cities(self, city_filter: CityFilter) -> List[City]:
        query = select(City)
        if city_filter.name:
            query = query.where(City.name.ilike(f"%{city_filter.name}%"))
        if city_filter.country_id:
            query = query.where(City.country_id == city_filter.country_id)

        query = query.offset(city_filter.skip).limit(city_filter.page_size)

        result = await self.session.execute(query)
        return result.scalars().all()

    async def count_cities(self, city_filter: CityFilter) -> int:
        query = select(func.count()).select_from(City)
        if city_filter.name:
            query = query.where(City.name.ilike(f"%{city_filter.name}%"))
        if city_filter.country_id:
            query = query.where(City.country_id == city_filter.country_id)
        
        result = await self.session.execute(query)
        return result.scalar_one()

    async def get_city_by_id(self, city_id: int) -> Optional[City]:
        result = await self.session.execute(select(City).where(City.id == city_id))
        return result.scalar_one_or_none()

    async def update_city(self, city: City, city_data: CityUpdateRequest) -> City:
        for field, value in city_data.model_dump(exclude_unset=True).items():
            setattr(city, field, value)
        self.session.add(city)
        await self.session.commit()
        await self.session.refresh(city)
        return city

    async def delete_city(self, city: City):
        await self.session.delete(city)
        await self.session.commit()
