from typing import List

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models.organizations_model import OrganizationSubscriptionType
from app.core.models.users_model import UserRole, SubscriptionType
from app.core.security.password import hash_password
from app.modules.organizations.organizations_repository import OrganizationRepository
from app.modules.organizations.organizations_schemas import (
    OrganizationCreate,
    OrganizationFilter,
    OrganizationGroupUpdate,
    OrganizationResponse,
    OrganizationUpdate,
    OrganizationSignUpRequest,
    OrganizationUserResponse,
    OrganizationGroupCreate,
    OrganizationGroupResponse,
    OrganizationUserExcelInsertRequest,
    OrganizationUserUpdate,
)


class OrganizationService:
    def __init__(self, session: AsyncSession):
        self.repository = OrganizationRepository(session)

    async def create_organization(self, org_data: OrganizationCreate) -> OrganizationResponse:
        existing_org = await self.repository.get_organization_by_name(org_data.name)
        if existing_org:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Organization with this name already exists",
            )
        organization = await self.repository.create_organization(org_data)
        return OrganizationResponse.model_validate(organization)

    async def get_organizations(self, org_filter: OrganizationFilter) -> List[OrganizationResponse]:
        organizations = await self.repository.get_organizations(org_filter)
        return [OrganizationResponse.model_validate(org) for org in organizations]

    async def count_organizations(self, org_filter: OrganizationFilter) -> int:
        return await self.repository.count_organizations(org_filter)

    async def get_organization_by_id(self, org_id: int) -> OrganizationResponse:
        organization = await self.repository.get_organization_by_id(org_id)
        if not organization:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found",
            )
        return OrganizationResponse.model_validate(organization)

    async def create_organization_user(self, org_user_data: OrganizationSignUpRequest) -> OrganizationUserResponse:
        # Check if user exists (assuming user_id refers to an existing user)
        # This would typically involve a dependency on a UserService or direct user repository access
        # For now, we'll assume user_id is valid.
        existing_org_user = await self.repository.get_organization_user_by_user_id(org_user_data.user_id)
        if existing_org_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User is already associated with an organization",
            )
        org_user = await self.repository.create_organization_user(org_user_data)
        return OrganizationUserResponse.model_validate(org_user)

    async def create_organization_group(self, org_group_data: OrganizationGroupCreate) -> OrganizationGroupResponse:
        existing_group = await self.repository.get_organization_group_by_name_and_org_id(
            org_group_data.name, org_group_data.organization_id
        )
        if existing_group:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Organization group with this name already exists for this organization",
            )
        org_group = await self.repository.create_organization_group(org_group_data)
        return OrganizationGroupResponse.model_validate(org_group)

    async def update_organization(self, org_id: int, org_data: OrganizationUpdate) -> OrganizationResponse:
        organization = await self.repository.get_organization_by_id(org_id)
        if not organization:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found",
            )
        updated_organization = await self.repository.update_organization(organization, org_data)
        return OrganizationResponse.model_validate(updated_organization)

    async def delete_organization(self, org_id: int):
        organization = await self.repository.get_organization_by_id(org_id)
        if not organization:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found",
            )
        await self.repository.delete_organization(organization)

    async def get_organization_user_by_id(self, org_user_id: int) -> OrganizationUserResponse:
        org_user = await self.repository.get_organization_user_by_id(org_user_id)
        if not org_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization user not found",
            )
        return OrganizationUserResponse.model_validate(org_user)

    async def update_organization_user(self, org_user_id: int, org_user_data: OrganizationUserUpdate) -> OrganizationUserResponse:
        org_user = await self.repository.get_organization_user_by_id(org_user_id)
        if not org_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization user not found",
            )
        updated_org_user = await self.repository.update_organization_user(org_user, org_user_data)
        return OrganizationUserResponse.model_validate(updated_org_user)

    async def delete_organization_user(self, org_user_id: int):
        org_user = await self.repository.get_organization_user_by_id(org_user_id)
        if not org_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization user not found",
            )
        await self.repository.delete_organization_user(org_user)

    async def get_organization_group_by_id(self, org_group_id: int) -> OrganizationGroupResponse:
        org_group = await self.repository.get_organization_group_by_id(org_group_id)
        if not org_group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization group not found",
            )
        return OrganizationGroupResponse.model_validate(org_group)

    async def update_organization_group(self, org_group_id: int, org_group_data: OrganizationGroupUpdate) -> OrganizationGroupResponse:
        org_group = await self.repository.get_organization_group_by_id(org_group_id)
        if not org_group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization group not found",
            )
        updated_org_group = await self.repository.update_organization_group(org_group, org_group_data)
        return OrganizationGroupResponse.model_validate(updated_org_group)

    async def delete_organization_group(self, org_group_id: int):
        org_group = await self.repository.get_organization_group_by_id(org_group_id)
        if not org_group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization group not found",
            )
        await self.repository.delete_organization_group(org_group)

    async def insert_users_from_excel(self, org_id: int, users_data: OrganizationUserExcelInsertRequest) -> List[OrganizationUserResponse]:
        organization = await self.repository.get_organization_by_id(org_id)
        if not organization:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found",
            )

        created_users = []
        created_org_users = []

        for user_entry in users_data.users:
            hashed_password = hash_password(user_entry.password)
            user_data_for_db = {
                "email": user_entry.email,
                "username": user_entry.email.split("@")[0],  # Simple username from email
                "password": hashed_password,
                "subscription": user_entry.subscription,
                "role": UserRole.USER,
                "verified": False,
                "onboarded": False,
            }
            created_user = await self.repository.bulk_create_users([user_data_for_db])
            if created_user:
                created_users.append(created_user[0])
                org_user_data_for_db = {
                    "user_id": created_user[0].id,
                    "organization_id": org_id,
                    "status": None,
                    "role": UserRole.USER, # Assuming students are users
                    "group_id": None,
                }
                created_org_user = await self.repository.bulk_create_organization_users([org_user_data_for_db])
                if created_org_user:
                    created_org_users.append(created_org_user[0])
        
        return [OrganizationUserResponse.model_validate(ou) for ou in created_org_users]
