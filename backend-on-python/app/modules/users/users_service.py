from typing import List

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security.password import hash_password
from app.modules.users.users_repository import UserRepository
from app.modules.users.users_schemas import UserUpdate, UserProfileResponse, UserFilter


class UserService:
    def __init__(self, session: AsyncSession):
        self.repository = UserRepository(session)

    async def get_users(self, user_filter: UserFilter) -> List[UserProfileResponse]:
        users = await self.repository.get_users(user_filter)
        return [UserProfileResponse(
            id=user.id,
            firstName=user.first_name,
            lastName=user.last_name,
            email=user.email,
            username=user.username,
            role=user.role,
            verified=user.verified,
            onboarded=user.onboarded,
            avatarUrl=user.avatar_id,  # TODO: avatar_id is a part of URL or path
            cityId=user.city_id,
        ) for user in users]

    async def count_users(self, user_filter: UserFilter) -> int:
        return await self.repository.count_users(user_filter)

    async def get_user_by_id(self, user_id: int) -> UserProfileResponse:
        user = await self.repository.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return UserProfileResponse(
            id=user.id,
            firstName=user.first_name,
            lastName=user.last_name,
            email=user.email,
            username=user.username,
            role=user.role,
            verified=user.verified,
            onboarded=user.onboarded,
            avatarUrl=user.avatar_id,  # TODO: avatar_id is a part of URL or path
            cityId=user.city_id,
        )

    async def update_user(self, user_id: int, user_data: UserUpdate) -> UserProfileResponse:
        user = await self.repository.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        if user_data.password:
            user_data.password = hash_password(user_data.password)
        updated_user = await self.repository.update_user(user, user_data)
        return UserProfileResponse(
            id=updated_user.id,
            firstName=updated_user.first_name,
            lastName=updated_user.last_name,
            email=updated_user.email,
            username=updated_user.username,
            role=updated_user.role,
            verified=updated_user.verified,
            onboarded=updated_user.onboarded,
            avatarUrl=updated_user.avatar_id,  # TODO: avatar_id is a part of URL or path
            cityId=updated_user.city_id,
        )

    async def delete_user(self, user_id: int):
        user = await self.repository.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        await self.repository.delete_user(user)
