from typing import List, Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models.organizations_model import Organization, OrganizationUser, OrganizationGroup
from app.core.models.users_model import User, SubscriptionType
from app.modules.organizations.organizations_schemas import (
    OrganizationCreate,
    OrganizationGroupUpdate,
    OrganizationUpdate,
    OrganizationSignUpRequest,
    OrganizationGroupCreate,
    OrganizationFilter,
    OrganizationUserUpdate,
)


class OrganizationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_organization(self, org_data: OrganizationCreate) -> Organization:
        organization = Organization(**org_data.model_dump())
        self.session.add(organization)
        await self.session.commit()
        await self.session.refresh(organization)
        return organization

    async def get_organizations(self, org_filter: OrganizationFilter) -> List[Organization]:
        query = select(Organization)
        if org_filter.name:
            query = query.where(Organization.name.ilike(f"%{org_filter.name}%"))
        if org_filter.email:
            query = query.where(Organization.email.ilike(f"%{org_filter.email}%"))
        if org_filter.subscription:
            query = query.where(Organization.subscription == org_filter.subscription)

        query = query.offset(org_filter.skip).limit(org_filter.page_size)

        result = await self.session.execute(query)
        return result.scalars().all()

    async def count_organizations(self, org_filter: OrganizationFilter) -> int:
        query = select(func.count()).select_from(Organization)
        if org_filter.name:
            query = query.where(Organization.name.ilike(f"%{org_filter.name}%"))
        if org_filter.email:
            query = query.where(Organization.email.ilike(f"%{org_filter.email}%"))
        if org_filter.subscription:
            query = query.where(Organization.subscription == org_filter.subscription)

        result = await self.session.execute(query)
        return result.scalar_one()

    async def get_organization_by_id(self, org_id: int) -> Optional[Organization]:
        result = await self.session.execute(select(Organization).where(Organization.id == org_id))
        return result.scalar_one_or_none()

    async def update_organization(self, organization: Organization, org_data: OrganizationUpdate) -> Organization:
        for field, value in org_data.model_dump(exclude_unset=True).items():
            setattr(organization, field, value)
        self.session.add(organization)
        await self.session.commit()
        await self.session.refresh(organization)
        return organization

    async def delete_organization(self, organization: Organization):
        await self.session.delete(organization)
        await self.session.commit()

    async def create_organization_user(self, org_user_data: OrganizationSignUpRequest) -> OrganizationUser:
        org_user = OrganizationUser(**org_user_data.model_dump())
        self.session.add(org_user)
        await self.session.commit()
        await self.session.refresh(org_user)
        return org_user

    async def get_organization_by_name(self, name: str) -> Optional[Organization]:
        result = await self.session.execute(select(Organization).where(Organization.name == name))
        return result.scalar_one_or_none()

    async def get_organization_user_by_user_id(self, user_id: int) -> Optional[OrganizationUser]:
        result = await self.session.execute(select(OrganizationUser).where(OrganizationUser.user_id == user_id))
        return result.scalar_one_or_none()

    async def get_organization_user_by_id(self, org_user_id: int) -> Optional[OrganizationUser]:
        result = await self.session.execute(select(OrganizationUser).where(OrganizationUser.id == org_user_id))
        return result.scalar_one_or_none()

    async def update_organization_user(self, org_user: OrganizationUser, org_user_data: OrganizationUserUpdate) -> OrganizationUser:
        for field, value in org_user_data.model_dump(exclude_unset=True).items():
            setattr(org_user, field, value)
        self.session.add(org_user)
        await self.session.commit()
        await self.session.refresh(org_user)
        return org_user

    async def delete_organization_user(self, org_user: OrganizationUser):
        await self.session.delete(org_user)
        await self.session.commit()

    async def create_organization_group(self, org_group_data: OrganizationGroupCreate) -> OrganizationGroup:
        org_group = OrganizationGroup(**org_group_data.model_dump())
        self.session.add(org_group)
        await self.session.commit()
        await self.session.refresh(org_group)
        return org_group

    async def get_organization_group_by_name_and_org_id(self, name: str, organization_id: int) -> Optional[OrganizationGroup]:
        result = await self.session.execute(
            select(OrganizationGroup).where(
                OrganizationGroup.name == name,
                OrganizationGroup.organization_id == organization_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_organization_group_by_id(self, org_group_id: int) -> Optional[OrganizationGroup]:
        result = await self.session.execute(select(OrganizationGroup).where(OrganizationGroup.id == org_group_id))
        return result.scalar_one_or_none()

    async def update_organization_group(self, org_group: OrganizationGroup, org_group_data: OrganizationGroupUpdate) -> OrganizationGroup:
        for field, value in org_group_data.model_dump(exclude_unset=True).items():
            setattr(org_group, field, value)
        self.session.add(org_group)
        await self.session.commit()
        await self.session.refresh(org_group)
        return org_group

    async def delete_organization_group(self, org_group: OrganizationGroup):
        await self.session.delete(org_group)
        await self.session.commit()

    async def bulk_create_users(self, users_data: List[dict]) -> List[User]:
        users = [User(**data) for data in users_data]
        self.session.add_all(users)
        await self.session.commit()
        for user in users:
            await self.session.refresh(user)
        return users

    async def bulk_create_organization_users(self, org_users_data: List[dict]) -> List[OrganizationUser]:
        org_users = [OrganizationUser(**data) for data in org_users_data]
        self.session.add_all(org_users)
        await self.session.commit()
        for org_user in org_users:
            await self.session.refresh(org_user)
        return org_users
