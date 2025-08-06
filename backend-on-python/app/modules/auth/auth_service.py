from datetime import datetime, timedelta
from typing import Optional

from fastapi import HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config.config import get_settings
from app.core.models.users_model import User, UserSession, SubscriptionType
from app.core.security.password import hash_password, verify_password
from app.core.utils.auth_utils import create_session_token, set_auth_cookies, clear_auth_cookies
from app.modules.auth.auth_repository import AuthRepository
from app.modules.auth.auth_schemas import (
    UserSignupRequest,
    UserLoginRequest,
    UserResponse,
    TokenResponse,
    CurrentUserResponse,
    UserOnboardingRequest,
)


class AuthService:
    def __init__(self, session: AsyncSession):
        self.repository = AuthRepository(session)
        self.settings = get_settings()

    async def signup_user(self, response: Response, user_data: UserSignupRequest) -> TokenResponse:
        existing_user = await self.repository.get_user_by_email_or_username(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email or username already exists",
            )

        hashed_password = hash_password(user_data.password)
        user = await self.repository.create_user(user_data, hashed_password)
        session_token = create_session_token(user.id, user.role, user.subscription)
        expires_at = datetime.utcnow() + timedelta(
            seconds=self.settings.security.jwt_session_token_expire_secs
        )
        await self.repository.create_or_update_user_session(user.id, session_token, expires_at)
        set_auth_cookies(response, session_token, expires_at)
        return TokenResponse(
            sessionToken=session_token,
            expiresAt=expires_at,
        )

    async def login_user(self, response: Response, user_data: UserLoginRequest) -> TokenResponse:
        user = await self.repository.get_user_by_email_or_username(user_data.emailOrUsername)
        if not user or not verify_password(user_data.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        session_token = create_session_token(user.id, user.role, user.subscription)
        expires_at = datetime.utcnow() + timedelta(
            seconds=self.settings.security.jwt_session_token_expire_secs
        )

        await self.repository.create_or_update_user_session(user.id, session_token, expires_at)
        set_auth_cookies(response, session_token, expires_at)

        return TokenResponse(
            sessionToken=session_token,
            expiresAt=expires_at,
        )

    async def logout_user(self, response: Response, token: str):
        user_session = await self.repository.get_user_session_by_token(token)
        if user_session:
            await self.repository.delete_user_session(user_session)
        clear_auth_cookies(response)

    async def get_current_user(self, user_id: int) -> CurrentUserResponse:
        user = await self.repository.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return CurrentUserResponse(
            id=user.id,
            firstName=user.first_name,
            lastName=user.last_name,
            email=user.email,
            username=user.username,
            roles=[user.role], # Assuming single role for now
            verified=user.verified,
            onboarded=user.onboarded,
            avatarUrl=None, # Placeholder, implement avatar logic later
        )

    async def onboard_user(self, user_id: int, onboarding_data: UserOnboardingRequest) -> UserResponse:
        user = await self.repository.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        updated_user = await self.repository.update_user_onboarding(
            user,
            onboarding_data,
        )
        return UserResponse.model_validate(updated_user)
