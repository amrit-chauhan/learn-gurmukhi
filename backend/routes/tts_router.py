"""
TTS routes – audio pronunciation for a single letter.

GET /api/tts/{letter_id}?type=auto   →  human if available, else AI  (default)
GET /api/tts/{letter_id}?type=human  →  human recording only (404 if none)
GET /api/tts/{letter_id}?type=ai     →  AI-generated audio (cached to disk)

HTTP status mapping:
  200  – MP3 stream returned
  404  – letter_id not found, or requested voice type has no cached file
"""

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response

import services.tts_service as tts_service

router = APIRouter(prefix="/api", tags=["tts"])

# Audio files are immutable – cache aggressively in browser / CDN
_CACHE_HEADERS = {
    "Cache-Control": "public, max-age=86400, immutable",
    "Content-Type": "audio/mpeg",
}


@router.get("/tts/{letter_id}", summary="Stream MP3 audio for a letter")
async def get_tts(
    letter_id: str,
    type: str = Query("auto", description="Voice type: auto | human | ai"),
):
    if type not in ("auto", "human", "ai"):
        raise HTTPException(status_code=400, detail="type must be 'auto', 'human', or 'ai'")

    try:
        audio_bytes = await tts_service.get_audio(letter_id, voice_type=type)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

    return Response(content=audio_bytes, media_type="audio/mpeg", headers=_CACHE_HEADERS)
