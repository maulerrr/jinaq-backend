from pydantic import EmailStr, Field
from datetime import datetime
from typing import List, Optional

from app.core.models.users_model import UserRole, SubscriptionType, LanguageLevel
from app.core.schemas.common import BaseSchema


class UserSignupRequest(BaseSchema):
    firstName: str = Field(min_length=1)
    lastName: str = Field(min_length=1)
    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8)


class UserAcademicRequest(BaseSchema):
    gpa: Optional[float] = None
    sat: Optional[int] = None
    ielts: Optional[float] = None
    toefl: Optional[int] = None


class UserLanguageProficiencyRequest(BaseSchema):
    language: str
    level: LanguageLevel


class UserOnboardingRequest(BaseSchema):
    dateOfBirth: datetime
    interests: List[str] = Field(default_factory=list)
    organizationName: Optional[str] = None
    about: Optional[str] = None
    academic: Optional[UserAcademicRequest] = None
    languages: List[UserLanguageProficiencyRequest] = Field(default_factory=list)


class UserLoginRequest(BaseSchema):
    emailOrUsername: str
    password: str


class UserResponse(BaseSchema):
    id: int
    email: EmailStr
    username: str
    role: UserRole
    subscription: SubscriptionType
    verified: bool
    onboarded: bool
    createdAt: datetime
    updatedAt: datetime

    class Config(BaseSchema.Config):
        from_attributes = True


class TokenResponse(BaseSchema):
    sessionToken: str
    expiresAt: datetime


class CurrentUserResponse(BaseSchema):
    id: int
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: EmailStr
    username: str
    roles: List[UserRole] # Assuming roles can be multiple in future
    verified: bool
    onboarded: bool
    avatarUrl: Optional[str] = None

    class Config(BaseSchema.Config):
        from_attributes = True
