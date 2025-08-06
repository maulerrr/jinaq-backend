from pydantic import BaseModel
from datetime import datetime
from typing import Optional

from app.core.schemas.common import BaseFilter, BaseSchema


class CityCreateRequest(BaseSchema):
    name: str
    country_id: int


class CityUpdateRequest(BaseSchema):
    name: Optional[str] = None
    country_id: Optional[int] = None


class CityFilter(BaseFilter):
    name: Optional[str] = None
    country_id: Optional[int] = None


class CityResponse(BaseSchema):
    id: int
    name: str
    country_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
