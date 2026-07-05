"""
Alphabet routes – read-only access to the Gurmukhi letter list.

GET /api/alphabet  →  list of all 60 letters
"""

from fastapi import APIRouter, Response

import services.alphabet_service as alphabet_service

router = APIRouter(prefix="/api", tags=["alphabet"])


@router.get("/alphabet", summary="Return the full Punjabi Gurmukhi alphabet")
async def get_alphabet(response: Response):
    # The alphabet is static, in-process data (no DB call). Let the browser and
    # any CDN cache it so repeat page loads don't re-request it — and so a cold
    # backend isn't on the critical path for returning visitors. Kept to a
    # modest window so newly added letters still surface reasonably quickly.
    response.headers["Cache-Control"] = "public, max-age=3600"
    return alphabet_service.get_all()
