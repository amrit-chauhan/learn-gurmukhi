"""
Streak routes.

Scoped to the active profile (X-Profile-Id header).

POST /api/streak/checkin  →  mark today as practiced, return current streak
"""

from fastapi import APIRouter, Depends, Request

from dependencies import get_profile_id
from rate_limit import limiter, WRITE_LIMIT
import services.streak_service as streak_service

router = APIRouter(prefix="/api", tags=["streak"])


@router.post("/streak/checkin", summary="Mark today as a practiced day")
@limiter.limit(WRITE_LIMIT)
async def checkin(request: Request, profile_id: str = Depends(get_profile_id)):
    current_streak = await streak_service.checkin(profile_id)
    return {"ok": True, "current_streak": current_streak}
