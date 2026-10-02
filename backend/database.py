"""
Database connection.
Imports config (which loads .env) so this module is safe to import anywhere.
"""

from motor.motor_asyncio import AsyncIOMotorClient
from config import settings


class DatabaseConfigurationError(RuntimeError):
    """Raised when a database-backed route is used without a MongoDB URI."""


class UnconfiguredDatabase:
    """Fail lazily so non-database routes can still start and be diagnosed."""

    def __getattr__(self, _name):
        raise DatabaseConfigurationError(
            "MongoDB is not configured. Set MONGO_URL or MONGODB_URI in Vercel."
        )


if settings.mongo_url:
    client = AsyncIOMotorClient(settings.mongo_url)
    db = client[settings.db_name]
else:
    client = None
    db = UnconfiguredDatabase()
