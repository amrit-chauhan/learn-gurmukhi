"""Lazy MongoDB connection for local and serverless runtimes."""

from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConfigurationError, InvalidURI
from config import settings


class DatabaseConfigurationError(RuntimeError):
    """Raised when a database-backed route is used without a MongoDB URI."""


class LazyMongoDatabase:
    """Create the Motor client on first use, after runtime env injection."""

    def __init__(self):
        self._client = None
        self._database = None
        self._configuration = None

    def _connect(self):
        mongo_url = settings.mongo_url
        db_name = settings.db_name

        if not mongo_url:
            raise DatabaseConfigurationError(
                "MongoDB is not configured. Set MONGO_URL or MONGODB_URI in Vercel."
            )

        configuration = (mongo_url, db_name)
        if self._database is not None and self._configuration == configuration:
            return self._database

        try:
            new_client = AsyncIOMotorClient(mongo_url)
            new_database = new_client[db_name]
        except (ConfigurationError, InvalidURI, ValueError) as exc:
            raise DatabaseConfigurationError(
                "MongoDB is configured with an invalid connection string."
            ) from exc

        self.close()
        self._client = new_client
        self._database = new_database
        self._configuration = configuration
        return self._database

    def __getattr__(self, name):
        return getattr(self._connect(), name)

    def __getitem__(self, name):
        return self._connect()[name]

    def close(self):
        if self._client is not None:
            self._client.close()
        self._client = None
        self._database = None
        self._configuration = None


db = LazyMongoDatabase()
