"""
Database connection.
Imports config (which loads .env) so this module is safe to import anywhere.
"""

from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

client = AsyncIOMotorClient(settings.mongo_url)
db = client[settings.db_name]
