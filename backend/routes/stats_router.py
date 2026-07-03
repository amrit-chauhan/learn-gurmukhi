"""
Stats routes – time-tracking endpoints.

All routes are scoped to the active profile (X-Profile-Id header, or a
profile_id query param used by the sendBeacon fallback).

GET  /api/stats         →  return today + all-time time stats
POST /api/stats/update  →  add app / practice seconds
"""

from fastapi import APIRouter, Depends, Request

from dependencies import get_profile_id
from models.stats import TimeUpdateRequest
from rate_limit import limiter, WRITE_LIMIT
import services.stats_service as stats_service

router = APIRouter(prefix="/api", tags=["stats"])


@router.get("/stats", summary="Return today and all-time time-tracking stats")
async def get_stats(profile_id: str = Depends(get_profile_id)):
    return await stats_service.get_stats(profile_id)


@router.post("/stats/update", summary="Add app and/or practice seconds")
@limiter.limit(WRITE_LIMIT)
async def update_stats(request: Request, data: TimeUpdateRequest, profile_id: str = Depends(get_profile_id)):
    await stats_service.add_time(profile_id, data.app_seconds, data.practice_seconds)
    return {"ok": True}
