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

    # ── Rate limiting (slowapi) ──────────────────────────────────────────────
    # Per-client-IP limits applied to the API as app-level defence-in-depth
    # behind Cloudflare (see docs/DEPLOYMENT.md). Disable with
    # RATE_LIMIT_ENABLED=false (e.g. for load tests).
    rate_limit_enabled: bool = os.environ.get("RATE_LIMIT_ENABLED", "true").lower() != "false"
    # Generous global default so normal use (and the integration test suite,
    # which fires many requests from one host) never trips it.
    rate_limit_default: str = os.environ.get("RATE_LIMIT_DEFAULT", "240/minute")
    # Tighter limit for write / mutation endpoints (abuse-prone).
    rate_limit_write: str = os.environ.get("RATE_LIMIT_WRITE", "60/minute")


settings = Settings()
