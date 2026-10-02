"""Regression checks for the Vercel Services deployment contract."""

import json
from pathlib import Path


def test_fastapi_service_uses_asgi_entrypoint():
    config_path = Path(__file__).parents[2] / "vercel.json"
    config = json.loads(config_path.read_text())

    backend = config["services"]["backend"]
    assert backend["framework"] == "fastapi"
    assert backend["entrypoint"] == "server:app"


def test_atlas_keepalive_runs_twice_each_month():
    config_path = Path(__file__).parents[2] / "vercel.json"
    config = json.loads(config_path.read_text())

    assert config["crons"] == [
        {
            "path": "/api/cron/keepalive",
            "schedule": "0 0 1,15 * *",
        }
    ]
