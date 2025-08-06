from typing import List, TypeVar, Generic

from app.core.schemas.common import PaginatedResponse

T = TypeVar("T")

def paginate(items: List[T], total: int, page: int, page_size: int) -> PaginatedResponse[T]:
    """
    Creates a paginated response object.

    Args:
        items: The list of items for the current page.
        total: The total number of items available.
        page: The current page number (1-indexed).
        page_size: The maximum number of items per page.

    Returns:
        A PaginatedResponse object.
    """
    return PaginatedResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=items
    )
