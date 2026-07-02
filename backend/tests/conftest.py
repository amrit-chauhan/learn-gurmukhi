"""
Shared pytest setup.

Some test modules import backend modules directly (e.g. services.streak_service)
to unit-test pure logic without needing a live server. That import chain pulls
in config.py, which requires MONGO_URL/DB_NAME to be set. Provide harmless
defaults so those unit tests can run without any local .env or database.

This does not affect the live-server integration tests, which talk to
whatever server/DB the developer/CI has actually started.
"""

import os

os.environ.setdefault("MONGO_URL", "mongodb://localhost:27017")
os.environ.setdefault("DB_NAME", "punjabi_test")
os.environ.setdefault("CORS_ORIGINS", "*")
