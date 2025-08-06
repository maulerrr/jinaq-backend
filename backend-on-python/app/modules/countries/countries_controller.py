from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.session import get_async_session
from app.core.schemas.common import PaginatedResponse
from app.core.utils.pagination_utils import paginate
from app.modules.countries.countries_schemas import CountryCreateRequest, CountryResponse, CountryFilter, CountryUpdateRequest
from app.modules.countries.countries_service import CountryService

router = APIRouter()


@router.post("/", response_model=CountryResponse, status_code=status.HTTP_201_CREATED)
async def create_country(
    country_data: CountryCreateRequest,
    session: AsyncSession = Depends(get_async_session),
):
    service = CountryService(session)
    return await service.create_country(country_data)


@router.get("/", response_model=PaginatedResponse[CountryResponse])
async def get_countries(
    country_filter: CountryFilter = Depends(),
    session: AsyncSession = Depends(get_async_session),
):
    service = CountryService(session)
    countries = await service.get_countries(country_filter)
    total = await service.count_countries(country_filter)
    return paginate(items=countries, total=total, page=country_filter.page, page_size=country_filter.page_size)


@router.get("/{country_id}", response_model=CountryResponse)
async def get_country(
    country_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    service = CountryService(session)
    return await service.get_country_by_id(country_id)


@router.put("/{country_id}", response_model=CountryResponse)
async def update_country(
    country_id: int,
    country_data: CountryUpdateRequest,
    session: AsyncSession = Depends(get_async_session),
):
    service = CountryService(session)
    return await service.update_country(country_id, country_data)


@router.delete("/{country_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_country(
    country_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    service = CountryService(session)
    await service.delete_country(country_id)
    return
