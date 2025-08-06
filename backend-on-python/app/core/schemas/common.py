from typing import List, Generic, TypeVar
from fastapi import Query
from pydantic import BaseModel, Field
from pydantic.alias_generators import to_camel

T = TypeVar("T")

class BaseSchema(BaseModel):
    class Config:
        alias_generator = to_camel
        populate_by_name = True


class BaseFilter(BaseSchema):
    page: int = Query(default=1, ge=1, description="Page number for pagination")
    page_size: int = Query(default=10, ge=1, le=1000, description="Number of items per page")

    @property
    def skip(self) -> int:
        return (self.page - 1) * self.page_size


class PaginatedResponse(BaseSchema, Generic[T]):
    total: int
    page: int
    page_size: int
    items: List[T]
