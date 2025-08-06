from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.session import get_async_session
from app.core.schemas.common import PaginatedResponse
from app.core.utils.pagination_utils import paginate
from app.modules.cities.cities_schemas import CityCreateRequest, CityResponse, CityFilter, CityUpdateRequest
from app.modules.cities.cities_service import CityService

router = APIRouter()


@router.post("/", response_model=CityResponse, status_code=status.HTTP_201_CREATED)
async def create_city(
    city_data: CityCreateRequest,
    session: AsyncSession = Depends(get_async_session),
):
    service = CityService(session)
    return await service.create_city(city_data)


@router.get("/", response_model=PaginatedResponse[CityResponse])
async def get_cities(
    city_filter: CityFilter = Depends(),
    session: AsyncSession = Depends(get_async_session),
):
    service = CityService(session)
    cities = await service.get_cities(city_filter)
    total = await service.count_cities(city_filter)
    return paginate(items=cities, total=total, page=city_filter.page, page_size=city_filter.page_size)


@router.get("/{city_id}", response_model=CityResponse)
async def get_city(
    city_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    service = CityService(session)
    return await service.get_city_by_id(city_id)


@router.put("/{city_id}", response_model=CityResponse)
async def update_city(
    city_id: int,
    city_data: CityUpdateRequest,
    session: AsyncSession = Depends(get_async_session),
):
    service = CityService(session)
    return await service.update_city(city_id, city_data)


@router.delete("/{city_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_city(
    city_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    service = CityService(session)
    await service.delete_city(city_id)
    return
