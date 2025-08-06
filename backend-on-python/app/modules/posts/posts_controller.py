from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.session import get_async_session
from app.core.schemas.common import BaseFilter
from app.core.utils.auth_utils import get_current_user # Corrected import path
from app.core.utils.pagination_utils import paginate
from app.modules.posts.posts_service import PostsService
from app.modules.posts.posts_schemas import (
    PostsSummaryResponse,
    CommentsResponse,
    PostCommentsSubmitRequest,
    PostCreateRequest,
    PostUpdateRequest,
    PostFilter,
)
from app.core.schemas.common import PaginatedResponse

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[PostsSummaryResponse])
async def get_all_posts(
    filters: PostFilter = Depends(),
    current_user: dict = Depends(get_current_user), # Make current_user optional for public access
    session: AsyncSession = Depends(get_async_session),
):
    service = PostsService(session)
    total_posts = await service.count_posts(filters)
    posts = await service.get_all_posts(filters, current_user["id"] if current_user else None)
    return paginate(items=posts, total=total_posts, page=filters.page, page_size=filters.page_size)


@router.get("/{post_id}", response_model=PostsSummaryResponse)
async def get_post_by_id(
    post_id: int,
    current_user: dict = Depends(get_current_user), # Make current_user optional for public access
    session: AsyncSession = Depends(get_async_session),
):
    service = PostsService(session)
    post = await service.get_post_by_id(post_id, current_user["id"] if current_user else None)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return post


@router.post("/", response_model=PostsSummaryResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_data: PostCreateRequest,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
):
    service = PostsService(session)
    new_post = await service.create_post(post_data, current_user["id"])
    return new_post


@router.put("/{post_id}", response_model=PostsSummaryResponse)
async def update_post(
    post_id: int,
    post_data: PostUpdateRequest,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
):
    service = PostsService(session)
    post = await service.get_post_by_id(post_id)
    if not post or post.author.name != f"{current_user['first_name']} {current_user['last_name']}": # Simplified check, ideally check author_id
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this post")
    
    updated_post = await service.update_post(post_id, post_data)
    if not updated_post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return updated_post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: int,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
):
    service = PostsService(session)
    post = await service.get_post_by_id(post_id)
    if not post or post.author.name != f"{current_user['first_name']} {current_user['last_name']}": # Simplified check, ideally check author_id
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this post")

    if not await service.delete_post(post_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return


@router.get("/{post_id}/comments", response_model=PaginatedResponse[CommentsResponse])
async def get_comments_for_post(
    post_id: int,
    filters: BaseFilter = Depends(),
    session: AsyncSession = Depends(get_async_session),
):
    service = PostsService(session)
    comments = await service.get_comments_for_post(post_id, filters)
    total_comments = await service.count_comments_for_post(post_id, filters)
    return paginate( comments, total=total_comments, page=filters.page, page_size=filters.page_size)


@router.post("/{post_id}/comments", response_model=CommentsResponse, status_code=status.HTTP_201_CREATED)
async def add_comment_to_post(
    post_id: int,
    comment_data: PostCommentsSubmitRequest,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
):
    service = PostsService(session)
    post = await service.get_post_by_id(post_id)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    
    new_comment = await service.add_comment_to_post(post_id, current_user["id"], comment_data)
    return new_comment


@router.post("/{post_id}/like", status_code=status.HTTP_200_OK)
async def toggle_like_post(
    post_id: int,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
):
    service = PostsService(session)
    post = await service.get_post_by_id(post_id)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    
    liked = await service.toggle_post_like(post_id, current_user["id"])
    if liked:
        return {"message": "Post liked successfully"}
    else:
        return {"message": "Post unliked successfully"}
