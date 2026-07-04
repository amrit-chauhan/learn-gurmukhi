"""
Words routes — read-only access to the practice-word vocabulary + its audio.

GET /api/words              →  list of every practice word
GET /api/words/tts/{id}     →  MP3 pronunciation (Punjabi AI voice)

HTTP status mapping for TTS:
  200  – MP3 stream returned
  404  – word id not found, or no cached audio file
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

import services.word_service as word_service

router = APIRouter(prefix="/api", tags=["words"])

# Audio files are immutable – cache aggressively in browser / CDN.
_CACHE_HEADERS = {
    "Cache-Control": "public, max-age=86400, immutable",
    "Content-Type": "audio/mpeg",
}


@router.get("/words", summary="Return all practice words (common, days, numbers)")
async def get_words():
    return word_service.get_all()


@router.get("/words/tts/{word_id}", summary="Stream MP3 audio for a practice word")
async def get_word_tts(word_id: str):
    try:
        audio_bytes = word_service.get_audio(word_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return Response(content=audio_bytes, media_type="audio/mpeg", headers=_CACHE_HEADERS)
