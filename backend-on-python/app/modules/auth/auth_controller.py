from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.session import get_async_session
from app.core.utils.auth_utils import get_current_user, clear_auth_cookies # Updated import
from app.modules.auth.auth_schemas import (
    UserSignupRequest,
    UserLoginRequest,
    TokenResponse,
    CurrentUserResponse,
    UserOnboardingRequest,
)
from app.modules.auth.auth_service import AuthService

router = APIRouter()


@router.post("/signup", response_model=TokenResponse)
async def signup(
    response: Response,
    user_data: UserSignupRequest,
    session: AsyncSession = Depends(get_async_session),
):
    service = AuthService(session)
    return await service.signup_user(response, user_data)


@router.post("/login", response_model=TokenResponse)
async def login(
    response: Response,
    user_data: UserLoginRequest,
    session: AsyncSession = Depends(get_async_session),
):
    service = AuthService(session)
    return await service.login_user(response, user_data)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    request: Request,
    session: AsyncSession = Depends(get_async_session),
):
    session_token = request.cookies.get("session_token")
    if not session_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No access token found in cookies",
        )
    service = AuthService(session)
    await service.logout_user(response, session_token)
    clear_auth_cookies(response)
    return


@router.get("/me", response_model=CurrentUserResponse)
async def get_me(
    current_user: dict = Depends(get_current_user), # Using the new dependency
    session: AsyncSession = Depends(get_async_session),
):
    service = AuthService(session)
    user = await service.get_current_user(current_user["id"])
    return user

@router.post("/onboarding", response_model=CurrentUserResponse)
async def onboarding(
    user_data: UserOnboardingRequest,
    current_user: dict = Depends(get_current_user),  # Using the new dependency
    session: AsyncSession = Depends(get_async_session),
):
    service = AuthService(session)
    user = await service.onboard_user(current_user["id"], user_data)
    return user