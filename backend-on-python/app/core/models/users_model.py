from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, Integer, String, Text, Float
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, relationship, mapped_column
from typing import List
from app.core.models.cities_model import City
from app.core.models.interests_model import InterestsEnum

from app.core.models.base import Base, TimestampMixin
from app.core.models.posts_model import Comment, Post, PostLike
from app.core.models.universities_models import UniversitiesAnalysis

if TYPE_CHECKING:
    from app.core.models.organizations_model import Organization


class UserRole(str, Enum):
    USER = "USER"
    SUPERADMIN = "SUPERADMIN"
    MINISTRY = "MINISTRY"


class SubscriptionType(str, Enum):
    FREE = "FREE"
    PAID = "PAID"


class LanguageLevel(str, Enum):
    NATIVE = "NATIVE"
    FLUENT = "FLUENT"
    BEGINNER = "BEGINNER"


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, index=True)
    first_name: Mapped[str] = mapped_column(String)
    last_name: Mapped[str] = mapped_column(String)
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole, name="user_role_enum", create_type=True),
        default=UserRole.USER,
        nullable=False,
    )
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    username: Mapped[str] = mapped_column(String, unique=True, index=True)
    password: Mapped[str] = mapped_column(String)
    date_of_birth: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    subscription: Mapped[SubscriptionType] = mapped_column(
        SQLEnum(SubscriptionType, name="subscription_type_enum", create_type=True),
        default=SubscriptionType.FREE,
        nullable=False,
    )
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    organization_name: Mapped[str | None] = mapped_column(String, nullable=True)
    city_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("cities.id"), nullable=True)
    bio_about: Mapped[str | None] = mapped_column(Text, nullable=True)
    banner_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    avatar_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    onboarded: Mapped[bool] = mapped_column(Boolean, default=False)
    interests: Mapped[List[InterestsEnum]] = mapped_column(
        ARRAY(SQLEnum(InterestsEnum, name="interests_enum", create_type=False)),
        nullable=True,
    )

    sessions: Mapped[list["UserSession"]] = relationship(back_populates="user")

    city: Mapped["City"] = relationship(
        "City",
        primaryjoin="User.city_id == City.id",
        viewonly=True,
    )

    posts: Mapped[List["Post"]] = relationship(
        "Post",
        back_populates="author_user",
        cascade="all, delete-orphan",
    )

    comments: Mapped[List["Comment"]] = relationship(
        "Comment",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    likes: Mapped[List["PostLike"]] = relationship(
        "PostLike",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    academic_info: Mapped["UserAcademic"] = relationship(
        "UserAcademic",
        back_populates="user",
        cascade="all, delete-orphan",
        uselist=False,
    )

    language_proficiencies: Mapped[List["UserLanguageProficiency"]] = relationship(
        "UserLanguageProficiency",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    
    university_analyses: Mapped[List["UniversitiesAnalysis"]] = relationship(
        "UniversitiesAnalysis",
        back_populates="user",
        cascade="all, delete-orphan",
    )


class UserAcademic(Base):
    __tablename__ = "users_academic"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id"), unique=True)
    gpa: Mapped[float | None] = mapped_column(Float, nullable=True)
    sat: Mapped[int | None] = mapped_column(Integer, nullable=True)
    ielts: Mapped[float | None] = mapped_column(Float, nullable=True)
    toefl: Mapped[int | None] = mapped_column(Integer, nullable=True)

    user: Mapped["User"] = relationship(back_populates="academic_info")


class UserLanguageProficiency(Base):
    __tablename__ = "users_language_proficiency"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id"))
    language: Mapped[str] = mapped_column(String)
    level: Mapped[LanguageLevel] = mapped_column(
        SQLEnum(LanguageLevel, name="language_level_enum", create_type=True)
    )

    user: Mapped["User"] = relationship(back_populates="language_proficiencies")


class UserSession(Base, TimestampMixin):
    __tablename__ = "user_sessions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id"))
    token: Mapped[str] = mapped_column(String, unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    user: Mapped["User"] = relationship(back_populates="sessions")
