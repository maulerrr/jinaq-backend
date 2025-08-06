from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.session import get_async_session
from app.core.schemas.common import PaginatedResponse
from app.core.utils.pagination_utils import paginate
from app.modules.organizations.organizations_schemas import (
    OrganizationCreate,
    OrganizationResponse,
    OrganizationSignUpRequest,
    OrganizationUserResponse,
    OrganizationGroupCreate,
    OrganizationGroupResponse,
    OrganizationUserExcelInsertRequest,
    OrganizationFilter,
    OrganizationUpdate,
    OrganizationUserUpdate,
    OrganizationGroupUpdate,
)
from app.modules.organizations.organizations_service import OrganizationService

router = APIRouter()


@router.post("/", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    org_data: OrganizationCreate,
    session: AsyncSession = Depends(get_async_session),
):
    service = OrganizationService(session)
    return await service.create_organization(org_data)


@router.get("/", response_model=PaginatedResponse[OrganizationResponse])
async def get_organizations(
    org_filter: OrganizationFilter = Depends(),
    session: AsyncSession = Depends(get_async_session),
):
    service = OrganizationService(session)
    organizations = await service.get_organizations(org_filter)
    total = await service.count_organizations(org_filter) # Assuming a count_organizations method exists or can be added
    return paginate(items=organizations, total=total, page=org_filter.page, page_size=org_filter.page_size)


@router.get("/{org_id}", response_model=OrganizationResponse)
async def get_organization(
    org_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    service = OrganizationService(session)
    return await service.get_organization_by_id(org_id)


@router.put("/{org_id}", response_model=OrganizationResponse)
async def update_organization(
    org_id: int,
    org_data: OrganizationUpdate,
    session: AsyncSession = Depends(get_async_session),
):
    service = OrganizationService(session)
    return await service.update_organization(org_id, org_data)


@router.delete("/{org_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_organization(
    org_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    service = OrganizationService(session)
    await service.delete_organization(org_id)
    return


@router.post("/users", response_model=OrganizationUserResponse, status_code=status.HTTP_201_CREATED)
async def create_organization_user(
    org_user_data: OrganizationSignUpRequest,
    session: AsyncSession = Depends(get_async_session),
):
    service = OrganizationService(session)
    return await service.create_organization_user(org_user_data)


@router.post("/groups", response_model=OrganizationGroupResponse, status_code=status.HTTP_201_CREATED)
async def create_organization_group(
    org_group_data: OrganizationGroupCreate,
    session: AsyncSession = Depends(get_async_session),
):
    service = OrganizationService(session)
    return await service.create_organization_group(org_group_data)


@router.get("/users/{org_user_id}", response_model=OrganizationUserResponse)
async def get_organization_user(
    org_user_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    service = OrganizationService(session)
    return await service.get_organization_user_by_id(org_user_id)


@router.put("/users/{org_user_id}", response_model=OrganizationUserResponse)
async def update_organization_user(
    org_user_id: int,
    org_user_data: OrganizationUserUpdate,
    session: AsyncSession = Depends(get_async_session),
):
    service = OrganizationService(session)
    return await service.update_organization_user(org_user_id, org_user_data)


@router.delete("/users/{org_user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_organization_user(
    org_user_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    service = OrganizationService(session)
    await service.delete_organization_user(org_user_id)
    return


@router.get("/groups/{org_group_id}", response_model=OrganizationGroupResponse)
async def get_organization_group(
    org_group_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    service = OrganizationService(session)
    return await service.get_organization_group_by_id(org_group_id)


@router.put("/groups/{org_group_id}", response_model=OrganizationGroupResponse)
async def update_organization_group(
    org_group_id: int,
    org_group_data: OrganizationGroupUpdate,
    session: AsyncSession = Depends(get_async_session),
):
    service = OrganizationService(session)
    return await service.update_organization_group(org_group_id, org_group_data)


@router.delete("/groups/{org_group_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_organization_group(
    org_group_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    service = OrganizationService(session)
    await service.delete_organization_group(org_group_id)
    return


@router.post("/{org_id}/users/insert", response_model=List[OrganizationUserResponse], status_code=status.HTTP_201_CREATED)
async def insert_users_from_excel(
    org_id: int,
    users_data: OrganizationUserExcelInsertRequest,
    session: AsyncSession = Depends(get_async_session),
):
    service = OrganizationService(session)
    return await service.insert_users_from_excel(org_id, users_data)
