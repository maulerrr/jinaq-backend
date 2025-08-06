from fastapi import APIRouter

from app.modules.auth import auth_controller
from app.modules.users import users_controller
from app.modules.countries import countries_controller
from app.modules.cities import cities_controller
from app.modules.organizations import organizations_controller
from app.modules.posts import posts_controller
from app.modules.universities import universities_controller
from app.modules.tests import tests_controller

auth_router = APIRouter(prefix='/api/v1')
auth_router.include_router(auth_controller.router, prefix="/auth", tags=["auth"])

api_router = APIRouter(
    prefix='/api/v1',
    responses={
        401: {
            "description": "No `Authorization` access token header, token is invalid or user removed",
            "content": {
                "application/json": {
                    "examples": {
                        "not authenticated": {
                            "summary": "No authorization token header",
                            "value": {"detail": "Not authenticated"},
                        },
                    }
                }
            },
        },
    }
)

api_router.include_router(users_controller.router, prefix="/users", tags=["users"])
api_router.include_router(countries_controller.router, prefix="/countries", tags=["countries"])
api_router.include_router(cities_controller.router, prefix="/cities", tags=["cities"])
api_router.include_router(organizations_controller.router, prefix="/organizations", tags=["organizations"])
api_router.include_router(posts_controller.router, prefix="/posts", tags=["posts"])
api_router.include_router(universities_controller.router, prefix="/universities", tags=["universities"])
api_router.include_router(tests_controller.router, prefix="/tests", tags=["tests"])
