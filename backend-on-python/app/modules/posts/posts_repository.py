from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_
from sqlalchemy.orm import selectinload

from app.core.schemas.common import BaseFilter
from app.core.models.posts_model import Post, Comment, PostLike
from app.modules.posts.posts_schemas import PostCreateInternal, PostCreateRequest, PostUpdateInternal, PostUpdateRequest, PostCommentsSubmitRequest, PostFilter


class PostsRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_posts(self, filters: PostFilter) -> List[Post]:
        query = select(Post).options(selectinload(Post.likes)).options(selectinload(Post.comments)).order_by(Post.created_at.desc())  # Default sort by newest first

        if filters.tags:
            query = query.where(Post.tags.overlap(filters.tags)) # Use tags directly as List[str]
        if filters.mentions:
            query = query.where(Post.mentions.overlap(filters.mentions)) # Filter by mentions
        if filters.user_id:
            query = query.where(Post.author_id == filters.user_id)
        if filters.search:
            search_pattern = f"%{filters.search}%"
            query = query.where(Post.content.ilike(search_pattern))

        query = query.offset(filters.skip).limit(filters.page_size)
        result = await self.session.execute(query)
        return result.scalars().all()

    async def count_posts(self, filters: PostFilter) -> int:
        query = select(func.count()).select_from(Post)
        if filters.tags:
            query = query.where(Post.tags.overlap(filters.tags)) # Use tags directly as List[str]
        if filters.mentions:
            query = query.where(Post.mentions.overlap(filters.mentions)) # Filter by mentions
        if filters.user_id:
            query = query.where(Post.author_id == filters.user_id)
        if filters.search:
            search_pattern = f"%{filters.search}%"
            query = query.where(Post.content.ilike(search_pattern))
        result = await self.session.execute(query)
        return result.scalar_one()

    async def get_post_by_id(self, post_id: int) -> Optional[Post]:
        stmt = (
            select(Post)
            .where(Post.id == post_id)
            # Eagerly load likes and comments
            .options(selectinload(Post.likes))
            .options(selectinload(Post.comments))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create_post(self, post_data: PostCreateInternal, author_id: int) -> Post:
        new_post = Post(
            author_id=author_id,
            content=post_data.content,
            tags=post_data.tags,
            mentions=post_data.mentions
        )
        self.session.add(new_post)
        await self.session.commit()
        await self.session.refresh(new_post)
        return new_post

    async def update_post(self, post_id: int, post_data: PostUpdateInternal) -> Optional[Post]:
        post = await self.get_post_by_id(post_id)
        if post:
            for field, value in post_data.model_dump(exclude_unset=True, by_alias=False).items():
                setattr(post, field, value)
            await self.session.commit()
            await self.session.refresh(post)
        return post

    async def delete_post(self, post_id: int) -> bool:
        post = await self.get_post_by_id(post_id)
        if post:
            await self.session.delete(post)
            await self.session.commit()
            return True
        return False

    async def get_comments_for_post(self, post_id: int, filters: BaseFilter) -> List[Comment]:
        result = await self.session.execute(
            select(Comment).where(Comment.post_id == post_id).offset(filters.skip).limit(filters.page_size)
        )
        return result.scalars().all()

    async def count_comments_for_post(self, post_id: int, filters: BaseFilter) -> int:
        result = await self.session.execute(
            select(func.count()).where(Comment.post_id == post_id).select_from(Comment)
        )
        return result.scalar_one()

    async def add_comment_to_post(self, post_id: int, user_id: int, comment_data: PostCommentsSubmitRequest) -> Comment:
        new_comment = Comment(post_id=post_id, user_id=user_id, content=comment_data.content)
        self.session.add(new_comment)
        await self.session.commit()
        await self.session.refresh(new_comment)
        return new_comment

    async def get_like(self, post_id: int, user_id: int) -> Optional[PostLike]:
        result = await self.session.execute(
            select(PostLike).where(PostLike.post_id == post_id, PostLike.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def like_post(self, post_id: int, user_id: int) -> PostLike:
        new_like = PostLike(post_id=post_id, user_id=user_id)
        self.session.add(new_like)
        await self.session.commit()
        await self.session.refresh(new_like)
        return new_like

    async def unlike_post(self, post_id: int, user_id: int) -> bool:
        existing_like = await self.session.execute(
            select(PostLike).where(PostLike.post_id == post_id, PostLike.user_id == user_id)
        )
        like = existing_like.scalar_one_or_none()
        if like:
            await self.session.delete(like)
            await self.session.commit()
            return True
        return False
