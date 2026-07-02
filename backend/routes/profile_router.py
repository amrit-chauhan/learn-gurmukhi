"""
Profile routes – manage the local selectable profiles.

GET   /api/profiles              →  list all profiles (seeds 5 defaults if empty)
POST  /api/profiles              →  create a new profile (up to MAX_PROFILES)
PATCH /api/profiles/{id}         →  edit a profile's name / avatar
POST  /api/profiles/{id}/reset   →  wipe that profile's progress + stats + streak
"""

from fastapi import APIRouter, HTTPException

from models.profile import ProfileCreate, ProfileUpdate
import services.profile_service as profile_service

router = APIRouter(prefix="/api", tags=["profiles"])


@router.get("/profiles", summary="List all profiles")
async def list_profiles():
    return await profile_service.list_profiles()


@router.post("/profiles", summary="Create a new profile")
async def create_profile(data: ProfileCreate):
    try:
        return await profile_service.create_profile(data.name, data.avatar)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc))


@router.patch("/profiles/{profile_id}", summary="Edit a profile's name / avatar")
async def update_profile(profile_id: str, data: ProfileUpdate):
    updated = await profile_service.update_profile(profile_id, data.name, data.avatar)
    if updated is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return updated


@router.post("/profiles/{profile_id}/reset", summary="Reset a profile's progress and stats")
async def reset_profile(profile_id: str):
    await profile_service.reset_profile(profile_id)
    return {"ok": True}
