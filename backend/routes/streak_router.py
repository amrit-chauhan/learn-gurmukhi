"""
Streak routes.

POST /api/streak/checkin  →  mark today as practiced, return current streak
"""

from fastapi import APIRouter

import services.streak_service as streak_service

router = APIRouter(prefix="/api", tags=["streak"])


@router.post("/streak/checkin", summary="Mark today as a practiced day")
async def checkin():
    current_streak = await streak_service.checkin()
    return {"ok": True, "current_streak": current_streak}
