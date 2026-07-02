"""
Pydantic schemas for the stats domain.

TimeUpdateRequest  – request body for POST /api/stats/update.
StatsResponse      – response shape for GET /api/stats.
"""

from __future__ import annotations

from pydantic import BaseModel
from typing_extensions import TypedDict


class TimeUpdateRequest(BaseModel):
    """Request body for adding time to stats. Both fields in whole seconds."""
    app_seconds: int
    practice_seconds: int


class StatsResponse(TypedDict):
    """Shape returned by GET /api/stats."""
    total_app_seconds: int
    total_practice_seconds: int
    today_app_seconds: int
    today_practice_seconds: int
