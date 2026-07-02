"""
Progress routes – CRUD for per-letter practice history.

GET  /api/progress         →  full progress map (letter_id → history)
POST /api/progress/update  →  record a single answer (correct / wrong)
POST /api/progress/reset   →  wipe all progress
"""

from fastapi import APIRouter

from models.progress import ProgressUpdate
import services.progress_service as progress_service

router = APIRouter(prefix="/api", tags=["progress"])


@router.get("/progress", summary="Return progress for every letter")
async def get_progress():
    return await progress_service.get_progress_map()


@router.post("/progress/update", summary="Record a practice answer")
async def update_progress(data: ProgressUpdate):
    await progress_service.record_answer(data.letter_id, data.correct)
    return {"ok": True}


@router.post("/progress/reset", summary="Wipe all progress data")
async def reset_progress():
    await progress_service.reset_all()
    return {"ok": True}
