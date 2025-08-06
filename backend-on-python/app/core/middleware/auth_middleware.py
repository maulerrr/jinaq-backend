from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp
from app.core.config.config import get_settings

from app.core.utils.auth_utils import get_current_user
from app.core.models.users_model import UserRole, SubscriptionType


class AuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        settings = get_settings()
        for path_prefix in settings.security.public_paths:
            if request.url.path.startswith(path_prefix):
                response = await call_next(request)
                return response

        claims = get_current_user(request)
        if claims:
            request.state.user_id = int(claims.get("sub"))
            request.state.user_role = UserRole(claims.get("role"))
            request.state.user_subscription = SubscriptionType(claims.get("subscription"))
        else:
            request.state.user_id = None
            request.state.user_role = None
            request.state.user_subscription = None

        response = await call_next(request)
        return response
