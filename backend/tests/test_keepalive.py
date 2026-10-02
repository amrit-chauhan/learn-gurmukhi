"""Tests for the secured Atlas keepalive endpoint."""

import asyncio
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

import server


class FakeDatabase:
    def __init__(self):
        self.commands = []

    async def command(self, name):
        self.commands.append(name)


def request_with_token(token):
    return SimpleNamespace(headers={"authorization": f"Bearer {token}"})


def test_keepalive_requires_the_cron_secret(monkeypatch):
    monkeypatch.setenv("CRON_SECRET", "expected-secret")

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(server.database_keepalive(request_with_token("wrong-secret")))

    assert exc_info.value.status_code == 401


def test_keepalive_pings_database_without_mutating_data(monkeypatch):
    monkeypatch.setenv("CRON_SECRET", "expected-secret")
    fake_database = FakeDatabase()
    monkeypatch.setattr(server.database, "db", fake_database)

    response = asyncio.run(
        server.database_keepalive(request_with_token("expected-secret"))
    )

    assert response == {"ok": True}
    assert fake_database.commands == ["ping"]
