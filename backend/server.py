"""
Application entry point.

Responsibilities (only):
  - Create the FastAPI instance
  - Register CORS middleware
  - Include all route modules
  - Manage the DB connection lifespan

Everything else lives in config / database / routes / services / repositories.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

import database  # ensures Motor client is created on startup
from config import settings
from routes import alphabet_router, progress_router, tts_router, stats_router, streak_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── startup ───────────────────────────────────────────────────────────
    # All audio (human + AI) is pre-generated and served as static files.
    from pathlib import Path
    base = Path(__file__).parent / "data" / "audio"
    human_count = len(list((base / "human").glob("*.mp3")))
    ai_count = len(list((base / "ai_cache").glob("*.mp3")))
    logger.info("Server ready. Human audio: %d files, AI cache: %d files.", human_count, ai_count)
    yield
    # ── shutdown ──────────────────────────────────────────────────────────
    database.client.close()


app = FastAPI(title="Punjabi Alphabet API", lifespan=lifespan)

# ── Middleware ────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=settings.cors_origins.split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(alphabet_router)
app.include_router(progress_router)
app.include_router(tts_router)
app.include_router(stats_router)
app.include_router(streak_router)
