"""Configuration behavior that must remain safe in serverless deployments."""

import os
import subprocess
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).parents[1]


def run_import(extra_env=None):
    env = os.environ.copy()
    env.pop("MONGO_URL", None)
    env.pop("MONGODB_URI", None)
    env.pop("DB_NAME", None)
    env.update(extra_env or {})
    return subprocess.run(
        [
            sys.executable,
            "-c",
            "import server; print(server.settings.mongo_url, server.settings.db_name)",
        ],
        cwd=BACKEND_DIR,
        env=env,
        capture_output=True,
        text=True,
        check=True,
    )


def test_server_can_start_without_database_configuration():
    result = run_import()
    assert result.stdout.strip() == "None punjabi_alphabet"


def test_vercel_mongodb_uri_is_supported():
    result = run_import({"MONGODB_URI": "mongodb://example.test:27017"})
    assert result.stdout.strip() == "mongodb://example.test:27017 punjabi_alphabet"
