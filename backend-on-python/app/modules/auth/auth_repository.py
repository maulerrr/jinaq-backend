from typing import List, Optional
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from typing import Optional

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models.users_model import (
    User,
    UserSession,
    SubscriptionType,
    UserRole,
    UserAcademic,
    UserLanguageProficiency,
)
from app.modules.auth.auth_schemas import UserOnboardingRequest, UserSignupRequest


class AuthRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_user_by_email_or_username(self, identifier: str) -> Optional[User]:
        result = await self.session.execute(
            select(User).where((User.email == identifier) | (User.username == identifier))
        )
        return result.scalar_one_or_none()

    async def create_user(self, user_data: UserSignupRequest, hashed_password: str) -> User:
        user = User(
            first_name=user_data.firstName,
            last_name=user_data.lastName,
            email=user_data.email,
            username=user_data.username,
            password=hashed_password,
            subscription=SubscriptionType.FREE,
            role=UserRole.USER,
            verified=False,
            onboarded=False,
        )
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def create_or_update_user_session(self, user_id: int, token: str, expires_at: datetime) -> UserSession:
        # Check if a session already exists for the user
        existing_session = await self.session.execute(
            select(UserSession).where(UserSession.user_id == user_id)
        )
        user_session = existing_session.scalar_one_or_none()

        if user_session:
            # Update existing session
            user_session.token = token
            user_session.expires_at = expires_at
            self.session.add(user_session)
        else:
            # Create new session
            user_session = UserSession(
                user_id=user_id,
                token=token,
                expires_at=expires_at,
            )
            self.session.add(user_session)
        
        await self.session.commit()
        await self.session.refresh(user_session)
        return user_session

    async def get_user_session_by_token(self, token: str) -> Optional[UserSession]:
        result = await self.session.execute(select(UserSession).where(UserSession.token == token))
        return result.scalar_one_or_none()

    async def delete_user_session(self, user_session: UserSession):
        await self.session.delete(user_session)
        await self.session.commit()

    async def get_user_by_id(self, user_id: int) -> Optional[User]:
        result = await self.session.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def update_user_onboarding(
        self, user: User, onboarding_data: UserOnboardingRequest
    ) -> User:
        user.date_of_birth = onboarding_data.dateOfBirth
        user.interests = onboarding_data.interests
        user.organization_name = onboarding_data.organizationName
        user.bio_about = onboarding_data.about
        user.onboarded = True

        if onboarding_data.academic:
            academic_info = UserAcademic(
                user_id=user.id, **onboarding_data.academic.dict()
            )
            self.session.add(academic_info)

        for lang_prof in onboarding_data.languages:
            language_proficiency = UserLanguageProficiency(
                user_id=user.id, **lang_prof.dict()
            )
            self.session.add(language_proficiency)

        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user
