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


def test_vercel_mongodb_uri_takes_precedence_over_legacy_name():
    result = run_import(
        {
            "MONGODB_URI": "mongodb://vercel.example.test:27017",
            "MONGO_URL": "mongodb://legacy.example.test:27017",
        }
    )
    assert result.stdout.strip() == (
        "mongodb://vercel.example.test:27017 punjabi_alphabet"
    )


def test_copied_quotes_and_whitespace_are_removed_from_uri():
    result = run_import(
        {"MONGODB_URI": '  "mongodb://example.test:27017/punjabi"  '}
    )
    assert result.stdout.strip() == "mongodb://example.test:27017/punjabi punjabi_alphabet"


def test_invalid_uri_does_not_crash_application_import():
    result = run_import({"MONGODB_URI": '"mongodb://example.test:27017"'})
    assert result.returncode == 0


def test_database_uses_environment_injected_after_import():
    env = os.environ.copy()
    env.pop("MONGO_URL", None)
    env.pop("MONGODB_URI", None)
    result = subprocess.run(
        [
            sys.executable,
            "-c",
            (
                "import os, database; "
                "os.environ['MONGODB_URI']='mongodb://late.example.test:27017'; "
                "database.db.profiles; "
                "print(database.db._configuration[0])"
            ),
        ],
        cwd=BACKEND_DIR,
        env=env,
        capture_output=True,
        text=True,
        check=True,
    )
    assert result.stdout.strip() == "mongodb://late.example.test:27017"


def test_invalid_uri_reports_actionable_syntax_error(monkeypatch):
    monkeypatch.setenv("MONGODB_URI", "mongodb://user:pa@ss@example.test/db")

    import database

    lazy_database = database.LazyMongoDatabase()
    try:
        lazy_database.profiles
    except database.DatabaseConfigurationError as exc:
        assert "syntax is invalid" in str(exc)
        assert "URL-encoded" in str(exc)
    else:
        raise AssertionError("Expected invalid URI to be rejected")
