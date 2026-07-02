"""
Routes package – re-exports every APIRouter so server.py stays clean.
"""

from routes.alphabet_router import router as alphabet_router
from routes.progress_router import router as progress_router
from routes.tts_router import router as tts_router
from routes.stats_router import router as stats_router
from routes.streak_router import router as streak_router
from routes.profile_router import router as profile_router

__all__ = [
    "alphabet_router",
    "progress_router",
    "tts_router",
    "stats_router",
    "streak_router",
    "profile_router",
]
