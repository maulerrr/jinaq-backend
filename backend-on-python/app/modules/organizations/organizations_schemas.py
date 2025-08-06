from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional

from app.core.models.organizations_model import OrganizationSubscriptionType, OrganizationUserRole
from app.core.schemas.common import BaseFilter


class OrganizationCreate(BaseModel):
    name: str
    short_name: Optional[str] = None
    email: Optional[EmailStr] = None
    subscription: OrganizationSubscriptionType = OrganizationSubscriptionType.FREE


class OrganizationFilter(BaseFilter):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    subscription: Optional[OrganizationSubscriptionType] = None


class OrganizationResponse(BaseModel):
    id: int
    name: str
    short_name: Optional[str] = None
    email: Optional[EmailStr] = None
    subscription: OrganizationSubscriptionType
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrganizationSignUpRequest(BaseModel):
    user_id: int
    organization_id: int
    status: Optional[str] = None
    role: OrganizationUserRole = OrganizationUserRole.STUDENT
    group_id: Optional[int] = None


class OrganizationUserResponse(BaseModel):
    id: int
    user_id: int
    organization_id: int
    status: Optional[str] = None
    role: OrganizationUserRole
    group_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrganizationGroupCreate(BaseModel):
    organization_id: int
    name: str


class OrganizationGroupResponse(BaseModel):
    id: int
    organization_id: int
    name: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrganizationUserExcelInsert(BaseModel):
    email: EmailStr
    password: str
    subscription: OrganizationSubscriptionType


class OrganizationUserExcelInsertRequest(BaseModel):
    users: List[OrganizationUserExcelInsert]


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    short_name: Optional[str] = None
    email: Optional[EmailStr] = None
    subscription: Optional[OrganizationSubscriptionType] = None


class OrganizationUserUpdate(BaseModel):
    status: Optional[str] = None
    role: Optional[OrganizationUserRole] = None
    group_id: Optional[int] = None


class OrganizationGroupUpdate(BaseModel):
    name: Optional[str] = None


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    short_name: Optional[str] = None
    email: Optional[EmailStr] = None
    subscription: Optional[OrganizationSubscriptionType] = None


class OrganizationUserUpdate(BaseModel):
    status: Optional[str] = None
    role: Optional[OrganizationUserRole] = None
    group_id: Optional[int] = None


class OrganizationGroupUpdate(BaseModel):
    name: Optional[str] = None
