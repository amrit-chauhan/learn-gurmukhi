"""
Stats routes – time-tracking endpoints.

GET  /api/stats         →  return today + all-time time stats
POST /api/stats/update  →  add app / practice seconds
"""

from fastapi import APIRouter

from models.stats import TimeUpdateRequest
import services.stats_service as stats_service

router = APIRouter(prefix="/api", tags=["stats"])


@router.get("/stats", summary="Return today and all-time time-tracking stats")
async def get_stats():
    return await stats_service.get_stats()


@router.post("/stats/update", summary="Add app and/or practice seconds")
async def update_stats(data: TimeUpdateRequest):
    await stats_service.add_time(data.app_seconds, data.practice_seconds)
    return {"ok": True}
