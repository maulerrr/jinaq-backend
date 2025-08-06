from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.session import get_async_session
from app.core.schemas.common import PaginatedResponse
from app.core.utils.pagination_utils import paginate
from app.modules.users.users_schemas import UserProfileResponse, UserUpdate, UserFilter
from app.modules.users.users_service import UserService

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[UserProfileResponse])
async def get_users(
    user_filter: UserFilter = Depends(),
    session: AsyncSession = Depends(get_async_session),
):
    service = UserService(session)
    users = await service.get_users(user_filter)
    total = await service.count_users(user_filter) # Assuming a count_users method exists or can be added
    return paginate(items=users, total=total, page=user_filter.page, page_size=user_filter.page_size)


@router.get("/{user_id}", response_model=UserProfileResponse)
async def get_user(
    user_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    service = UserService(session)
    return await service.get_user_by_id(user_id)


@router.put("/{user_id}", response_model=UserProfileResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    session: AsyncSession = Depends(get_async_session),
):
    service = UserService(session)
    return await service.update_user(user_id, user_data)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    service = UserService(session)
    await service.delete_user(user_id)
    return
