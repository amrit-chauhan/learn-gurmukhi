"""Health endpoint regression checks."""

import asyncio

from server import health


def test_health_reports_database_configuration_without_exposing_value(monkeypatch):
    monkeypatch.setenv("MONGODB_URI", "mongodb://username:password@example.test/db")

    response = asyncio.run(health())

    assert response == {"status": "ok", "database_configured": True}
    assert "password" not in str(response)


def test_health_reports_missing_database_configuration(monkeypatch):
    monkeypatch.delenv("MONGODB_URI", raising=False)
    monkeypatch.delenv("MONGO_URL", raising=False)

    response = asyncio.run(health())

    assert response == {"status": "ok", "database_configured": False}
