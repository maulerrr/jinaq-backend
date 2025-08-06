from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.core.database.connection import ASYNC_ENGINE
_ASYNC_SESSIONMAKER = async_sessionmaker(
    ASYNC_ENGINE, 
    expire_on_commit=False,
    class_=AsyncSession
)


async def get_async_session():
    async with _ASYNC_SESSIONMAKER() as session:
        try:
            yield session
        finally:
            await session.close()