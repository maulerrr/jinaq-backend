from pydantic import EmailStr
from datetime import datetime
from typing import List, Optional

from app.core.models.users_model import UserRole, SubscriptionType
from app.core.schemas.common import BaseFilter, BaseSchema
from app.modules.cities.cities_schemas import CityResponse # Assuming CityResponse is available


class UserUpdate(BaseSchema):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: Optional[str] = None
    dateOfBirth: Optional[datetime] = None
    subscription: Optional[SubscriptionType] = None
    verified: Optional[bool] = None
    interests: Optional[List[str]] = None
    organizationName: Optional[str] = None
    cityId: Optional[int] = None
    about: Optional[str] = None
    bannerId: Optional[int] = None
    avatarId: Optional[int] = None
    onboarded: Optional[bool] = None
    role: Optional[UserRole] = None


class UserFilter(BaseFilter):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    role: Optional[UserRole] = None
    subscription: Optional[SubscriptionType] = None
    verified: Optional[bool] = None
    onboarded: Optional[bool] = None


class UserProfileResponse(BaseSchema):
    id: int
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: EmailStr
    username: str
    role: UserRole
    verified: bool
    onboarded: bool
    avatarUrl: Optional[str] = None
    organizationName: Optional[str] = None
    city: Optional[CityResponse] = None # Assuming CityResponse is available

    class Config(BaseSchema.Config):
        from_attributes = True
