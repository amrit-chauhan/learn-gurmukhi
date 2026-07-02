"""
Alphabet routes – read-only access to the Gurmukhi letter list.

GET /api/alphabet  →  list of all 60 letters
"""

from fastapi import APIRouter

import services.alphabet_service as alphabet_service

router = APIRouter(prefix="/api", tags=["alphabet"])


@router.get("/alphabet", summary="Return the full Punjabi Gurmukhi alphabet")
async def get_alphabet():
    return alphabet_service.get_all()
