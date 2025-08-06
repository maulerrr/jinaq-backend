from datetime import datetime, timedelta
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID, uuid4

from fastapi import Response, Request, HTTPException, status, Depends
from jose import jwt

from app.core.config.config import get_settings
from app.core.database.session import get_async_session
from app.core.models.users_model import UserRole, SubscriptionType
from app.modules.users.users_repository import UserRepository
from sqlalchemy.ext.asyncio import AsyncSession


def create_session_token(user_id: int, user_role: UserRole, subscription_type: SubscriptionType) -> str:
    settings = get_settings()
    expire = datetime.utcnow() + timedelta(
        seconds=settings.security.jwt_session_token_expire_secs
    )
    to_encode = {
        "sub": str(user_id),
        "role": user_role.value,
        "subscription": subscription_type.value,
        "exp": expire,
        "iss": settings.security.jwt_issuer,
    }
    encoded_jwt = jwt.encode(
        to_encode, settings.security.jwt_secret_key.get_secret_value(), algorithm="HS256"
    )
    return encoded_jwt


def set_auth_cookies(response: Response, session_token: str, expires_at: datetime):
    settings = get_settings()
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        max_age=settings.security.jwt_session_token_expire_secs,
        expires=settings.security.jwt_session_token_expire_secs,
        samesite="Lax",
        secure=True,
    )


def clear_auth_cookies(response: Response):
    response.delete_cookie(key="session_token")


async def get_current_user(
    request: Request, session: AsyncSession = Depends(get_async_session)
) -> dict:
    session_token = request.cookies.get("session_token")
    if not session_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )
    try:
        settings = get_settings()
        payload = jwt.decode(
            session_token, settings.security.jwt_secret_key.get_secret_value(), algorithms=["HS256"]
        )
        user_id: int = int(payload.get("sub"))
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload"
            )
        
        user_repo = UserRepository(session)
        user = await user_repo.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
            )
        
        organization_name = None
        # if user.organization_id:
        #     organization = await user_repo.get_organization_by_id(user.organization_id) # Assuming this method exists or can be added
        #     if organization:
        #         organization_name = organization.name

        return {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "role": user.role.value,
            "subscription": user.subscription.value,
            "organization_name": organization_name,
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )
