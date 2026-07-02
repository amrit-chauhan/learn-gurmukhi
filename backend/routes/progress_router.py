"""
Progress routes – CRUD for per-letter practice history.

All routes are scoped to the active profile (X-Profile-Id header).

GET  /api/progress         →  full progress map (letter_id → history)
POST /api/progress/update  →  record a single answer (correct / wrong)
POST /api/progress/reset   →  wipe all progress for the active profile
"""

from fastapi import APIRouter, Depends, Request

from dependencies import get_profile_id
from models.progress import ProgressUpdate
from rate_limit import limiter, WRITE_LIMIT
import services.progress_service as progress_service

router = APIRouter(prefix="/api", tags=["progress"])


@router.get("/progress", summary="Return progress for every letter")
async def get_progress(profile_id: str = Depends(get_profile_id)):
    return await progress_service.get_progress_map(profile_id)


@router.post("/progress/update", summary="Record a practice answer")
@limiter.limit(WRITE_LIMIT)
async def update_progress(request: Request, data: ProgressUpdate, profile_id: str = Depends(get_profile_id)):
    await progress_service.record_answer(profile_id, data.letter_id, data.correct)
    return {"ok": True}


@router.post("/progress/reset", summary="Wipe all progress data")
@limiter.limit(WRITE_LIMIT)
async def reset_progress(request: Request, profile_id: str = Depends(get_profile_id)):
    await progress_service.reset_all(profile_id)
    return {"ok": True}
