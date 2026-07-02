"""
Application configuration.
Loads .env once at import time; exposes a single `settings` singleton.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")


class Settings:
    """All configuration sourced from environment variables."""

    mongo_url: str = os.environ["MONGO_URL"]
    db_name: str = os.environ["DB_NAME"]
    cors_origins: str = os.environ.get("CORS_ORIGINS", "*")

    # Progress history cap – keep only this many recent results per letter
    progress_history_cap: int = 50


settings = Settings()
