from datetime import datetime
from typing import Any

from sqlalchemy import BigInteger, DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Base class which provides automated table name
    Args:
        DeclarativeBase (Any): Base for all models
    """

    __abstract__ = True


class TimestampMixin:
    """Timestamping mixin
    Adds `created_at` and `updated_at` columns to a table.
    """

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), onupdate=func.now()
    )
