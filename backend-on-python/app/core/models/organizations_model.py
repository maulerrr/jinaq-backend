from enum import Enum
from typing import TYPE_CHECKING, List

from sqlalchemy import BigInteger, ForeignKey, String
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, relationship, mapped_column

from app.core.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.core.models.users_model import User


class OrganizationSubscriptionType(str, Enum):
    FREE = "FREE"
    PAID = "PAID"


class OrganizationUserRole(str, Enum):
    STUDYING = "STUDYING"
    GRADUATED = "GRADUATED"
    STAFF = "STAFF"
    STUDENT = "STUDENT"


class Organization(Base, TimestampMixin):
    __tablename__ = "organizations"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    short_name: Mapped[str | None] = mapped_column(String, nullable=True)
    email: Mapped[str | None] = mapped_column(String, nullable=True)
    subscription: Mapped[OrganizationSubscriptionType] = mapped_column(
        SQLEnum(OrganizationSubscriptionType, name="organization_subscription_type_enum", create_type=True),
        default=OrganizationSubscriptionType.FREE,
        nullable=False,
    )

    organization_users: Mapped[List["OrganizationUser"]] = relationship(
        "OrganizationUser",
        back_populates="organization",
    )
    organization_groups: Mapped[List["OrganizationGroup"]] = relationship(
        "OrganizationGroup",
        back_populates="organization",
    )


class OrganizationUser(Base, TimestampMixin):
    __tablename__ = "organization_users"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id"))
    organization_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("organizations.id"))
    status: Mapped[str | None] = mapped_column(String, nullable=True)
    role: Mapped[OrganizationUserRole] = mapped_column(
        SQLEnum(OrganizationUserRole, name="organization_user_role_enum", create_type=True),
        default=OrganizationUserRole.STUDENT,
        nullable=False,
    )
    group_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("organization_groups.id"), nullable=True)

    user: Mapped["User"] = relationship("User")
    organization: Mapped["Organization"] = relationship(
        "Organization", back_populates="organization_users"
    )
    group: Mapped["OrganizationGroup"] = relationship("OrganizationGroup", back_populates="organization_users")


class OrganizationGroup(Base, TimestampMixin):
    __tablename__ = "organization_groups"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, index=True)
    organization_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("organizations.id"))
    name: Mapped[str] = mapped_column(String, nullable=False)

    organization: Mapped["Organization"] = relationship(
        "Organization", back_populates="organization_groups"
    )
    organization_users: Mapped[List["OrganizationUser"]] = relationship(
        "OrganizationUser", back_populates="group"
    )
