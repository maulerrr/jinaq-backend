from typing import List, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.core.models.users_model import User
from app.modules.users.users_schemas import UserUpdate, UserFilter


class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_users(self, user_filter: UserFilter) -> List[User]:
        query = select(User)
        if user_filter.email:
            query = query.where(User.email.ilike(f"%{user_filter.email}%"))
        if user_filter.username:
            query = query.where(User.username.ilike(f"%{user_filter.username}%"))
        if user_filter.role:
            query = query.where(User.role == user_filter.role)
        if user_filter.subscription:
            query = query.where(User.subscription == user_filter.subscription)
        if user_filter.verified is not None:
            query = query.where(User.verified == user_filter.verified)
        if user_filter.onboarded is not None:
            query = query.where(User.onboarded == user_filter.onboarded)

        query = query.offset(user_filter.skip).limit(user_filter.page_size)

        result = await self.session.execute(query)
        return result.scalars().all()

    async def count_users(self, user_filter: UserFilter) -> int:
        query = select(func.count()).select_from(User)
        if user_filter.email:
            query = query.where(User.email.ilike(f"%{user_filter.email}%"))
        if user_filter.username:
            query = query.where(User.username.ilike(f"%{user_filter.username}%"))
        if user_filter.role:
            query = query.where(User.role == user_filter.role)
        if user_filter.subscription:
            query = query.where(User.subscription == user_filter.subscription)
        if user_filter.verified is not None:
            query = query.where(User.verified == user_filter.verified)
        if user_filter.onboarded is not None:
            query = query.where(User.onboarded == user_filter.onboarded)
        
        result = await self.session.execute(query)
        return result.scalar_one()

    async def get_user_by_id(self, user_id: int) -> Optional[User]:
        stmt = (
            select(User)
            .where(User.id == user_id)
            .options(joinedload(User.city))  # eager-load the city relationship
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def update_user(self, user: User, user_data: UserUpdate) -> User:
        update_data = user_data.model_dump(exclude_unset=True, by_alias=True)
        for field, value in update_data.items():
            if value is not None:
                setattr(user, field, value)
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def delete_user(self, user: User):
        await self.session.delete(user)
        await self.session.commit()
