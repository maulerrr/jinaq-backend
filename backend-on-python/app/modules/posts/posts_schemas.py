from datetime import datetime
from typing import List, Optional

from fastapi import Query
from pydantic import Field
from app.core.schemas.common import BaseSchema


class AuthorResponse(BaseSchema):
    id: int
    name: str
    organization_name: Optional[str] = None
    avatar_url: Optional[str] = None


class PostsSummaryResponse(BaseSchema):
    id: int
    author: AuthorResponse
    content: str
    tags: List[str] = Field(default_factory=list)
    mediaUrls: List[str] = Field(default_factory=list)
    mentions: List[str] = Field(default_factory=list) # New field for mentions
    likes: int
    comments: int
    created_at: datetime
    is_liked: bool = False


class CommentsResponse(BaseSchema):
    id: int
    author: AuthorResponse
    content: str
    created_at: datetime


from app.core.schemas.common import BaseFilter


class PostCommentsSubmitRequest(BaseSchema):
    content: str = Field(..., min_length=1)


class PostCreateRequest(BaseSchema):
    content: str = Field(..., min_length=1)


class PostUpdateRequest(BaseSchema):
    content: Optional[str] = Field(None, min_length=1)


class PostFilter(BaseFilter):
    tags: Optional[List[str]] = Query(None, description="Filter by tags")
    mentions: Optional[List[str]] = Query(None, description="Filter by mentions")
    user_id: Optional[int] = Query(None, description="Filter by user ID")
    search: Optional[str] = Query(None, description="Search by title or content")

class PostCreateInternal(BaseSchema):
    content: str
    tags: List[str] # Required for internal creation
    mentions: List[str] # Required for internal creation

class PostUpdateInternal(BaseSchema):
    content: Optional[str] = None
    tags: Optional[List[str]] = None # Optional for updates
    mentions: Optional[List[str]] = None # Optional for updates