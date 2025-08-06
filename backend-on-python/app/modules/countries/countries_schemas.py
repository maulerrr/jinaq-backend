from pydantic import BaseModel
from datetime import datetime
from typing import Optional

from app.core.schemas.common import BaseFilter


class CountryCreateRequest(BaseModel):
    name: str
    emoji: Optional[str] = None


class CountryUpdateRequest(BaseModel):
    name: Optional[str] = None
    emoji: Optional[str] = None


class CountryFilter(BaseFilter):
    name: Optional[str] = None


class CountryResponse(BaseModel):
    id: int
    name: str
    emoji: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
