from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models.posts_model import Post, Comment
from app.core.utils.pagination_utils import paginate
from app.modules.posts.posts_repository import PostsRepository
from app.core.schemas.common import BaseFilter, PaginatedResponse
from app.modules.posts.posts_schemas import (
    PostCreateInternal,
    PostUpdateInternal,
    PostsSummaryResponse,
    AuthorResponse,
    CommentsResponse,
    PostCreateRequest,
    PostUpdateRequest,
    PostCommentsSubmitRequest,
    PostFilter,
)
from app.modules.users.users_repository import UserRepository
from app.core.utils.text_utils import extract_hashtags, extract_mentions


class PostsService:
    def __init__(self, session: AsyncSession):
        self.posts_repo = PostsRepository(session)
        self.users_repo = UserRepository(session)

    async def _get_author_response(self, user_id: int) -> AuthorResponse:
        user = await self.users_repo.get_user_by_id(user_id)
        if not user:
            # This should ideally not happen if FK constraints are properly enforced
            return AuthorResponse(name="Unknown", organization_name=None, avatar_url=None)

        organization_name = None
        # if user.organization_id:
        #     organization = await self.users_repo.get_organization_by_id(user.organization_id)
        #     if organization:
        #         organization_name = organization.name

        return AuthorResponse(
            id=user.id,
            name=f"{user.first_name} {user.last_name}",
            organization_name=organization_name,
            avatar_url=user.avatar_id,  # Assuming avatar_id is the URL or can be converted
        )

    async def get_all_posts(self, filters: PostFilter, current_user_id: Optional[int] = None) -> List[PostsSummaryResponse]:
        posts = await self.posts_repo.get_posts(filters)
        response_posts = []
        for post in posts:
            author_response = await self._get_author_response(post.author_id)
            is_liked = False
            if current_user_id:
                is_liked = await self.posts_repo.get_like(post.id, current_user_id) is not None
            response_posts.append(
                PostsSummaryResponse(
                    id=post.id,
                    author=author_response,
                    content=post.content,
                    mediaUrls=[],  # TODO: mediaUrls add after S3 integration
                    tags=post.tags,
                    mentions=post.mentions, # Include mentions
                    likes=len(post.likes),
                    comments=len(post.comments),
                    created_at=post.created_at,
                    is_liked=is_liked,
                )
            )
        return response_posts

    async def count_posts(self, filters: PostFilter) -> int:
        return await self.posts_repo.count_posts(filters)

    async def get_post_by_id(self, post_id: int, current_user_id: Optional[int] = None) -> Optional[PostsSummaryResponse]:
        post = await self.posts_repo.get_post_by_id(post_id)
        if not post:
            return None
        author_response = await self._get_author_response(post.author_id)
        is_liked = False
        if current_user_id:
            is_liked = await self.posts_repo.get_like(post.id, current_user_id) is not None
        return PostsSummaryResponse(
            id=post.id,
            author=author_response,
            content=post.content,
            tags=post.tags,
            mentions=post.mentions, # Include mentions
            mediaUrls=[],  # TODO: mediaUrls add after S3 integration
            likes=len(post.likes),
            comments=len(post.comments),
            created_at=post.created_at,
            is_liked=is_liked,
        )

    async def create_post(self, post_data: PostCreateRequest, author_id: int) -> PostsSummaryResponse:
        post_content = post_data.content
        extracted_tags = extract_hashtags(post_content)
        extracted_mentions = extract_mentions(post_content)

        # Create an instance of the internal model
        internal_post_data = PostCreateInternal(
            content=post_data.content,
            tags=extracted_tags,
            mentions=extracted_mentions
        )

        # Pass the internal model to the repository
        new_post = await self.posts_repo.create_post(internal_post_data, author_id)
        author_response = await self._get_author_response(new_post.author_id)
        return PostsSummaryResponse(
            id=new_post.id,
            author=author_response,
            content=new_post.content,
            tags=new_post.tags,
            mentions=new_post.mentions,
            mediaUrls=[],
            likes=0,
            comments=0,
            created_at=new_post.created_at,
        )

    async def update_post(self, post_id: int, post_data: PostUpdateRequest) -> Optional[PostsSummaryResponse]:
        # Create a dictionary for update values
        update_values = post_data.model_dump(exclude_unset=True) # Start with fields from request body

        if post_data.content is not None:
            extracted_tags = extract_hashtags(post_data.content)
            extracted_mentions = extract_mentions(post_data.content)
            update_values["tags"] = extracted_tags
            update_values["mentions"] = extracted_mentions

        # Create an instance of the internal update model or just pass the dict
        # Using the internal model for validation/type safety
        internal_update_data = PostUpdateInternal(**update_values)

        updated_post = await self.posts_repo.update_post(post_id, internal_update_data)
        if not updated_post:
            return None
        author_response = await self._get_author_response(updated_post.author_id)
        return PostsSummaryResponse(
            id=updated_post.id,
            author=author_response,
            content=updated_post.content,
            tags=updated_post.tags,
            mentions=updated_post.mentions,
            mediaUrls=[],
            likes=len(updated_post.likes), # Assuming likes is a list/collection in DB model
            comments=len(updated_post.comments), # Assuming comments is a list/collection in DB model
            created_at=updated_post.created_at,
        )

    async def delete_post(self, post_id: int) -> bool:
        return await self.posts_repo.delete_post(post_id)

    async def get_comments_for_post(self, post_id: int, filters: BaseFilter) -> List[CommentsResponse]:
        comments = await self.posts_repo.get_comments_for_post(post_id, filters)
        response_comments = []
        for comment in comments:
            author_response = await self._get_author_response(comment.user_id)
            response_comments.append(
                CommentsResponse(
                    id=comment.id,
                    author=author_response,
                    content=comment.content,
                    created_at=comment.created_at,
                )
            )
        return response_comments
    
    async def count_comments_for_post(self, post_id: int, filters: BaseFilter) -> int:
        return await self.posts_repo.count_comments_for_post(post_id, filters)

    async def add_comment_to_post(self, post_id: int, user_id: int, comment_data: PostCommentsSubmitRequest) -> CommentsResponse:
        new_comment = await self.posts_repo.add_comment_to_post(post_id, user_id, comment_data)
        author_response = await self._get_author_response(new_comment.user_id)
        return CommentsResponse(
            id=new_comment.id,
            author=author_response,
            content=new_comment.content,
            created_at=new_comment.created_at,
        )

    async def toggle_post_like(self, post_id: int, user_id: int) -> bool:
        existing_like = await self.posts_repo.get_like(post_id, user_id)
        if existing_like:
            await self.posts_repo.unlike_post(post_id, user_id)
            return False  # Unliked
        else:
            await self.posts_repo.like_post(post_id, user_id)
            return True  # Liked
