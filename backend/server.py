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
import os
import secrets
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from slowapi.middleware import SlowAPIMiddleware

import database
from config import settings
from rate_limit import limiter
from routes import (
    alphabet_router,
    words_router,
    progress_router,
    tts_router,
    stats_router,
    streak_router,
    profile_router,
)

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
    logger.info(
        "Server ready. Human audio: %d files, AI cache: %d files.",
        human_count,
        ai_count,
    )
    yield
    # ── shutdown ──────────────────────────────────────────────────────────
    database.db.close()


app = FastAPI(title="Punjabi Alphabet API", lifespan=lifespan)


@app.get("/api/health", tags=["health"])
async def health():
    """Expose readiness without ever returning a database credential."""
    return {
        "status": "ok",
        "database_configured": bool(
            os.environ.get("MONGODB_URI") or os.environ.get("MONGO_URL")
        ),
    }


@app.get("/api/cron/keepalive", include_in_schema=False)
async def database_keepalive(request: Request):
    """Keep the free Atlas cluster active without reading or changing user data."""
    cron_secret = os.environ.get("CRON_SECRET")
    authorization = request.headers.get("authorization", "")
    if not cron_secret or not secrets.compare_digest(
        authorization, f"Bearer {cron_secret}"
    ):
        raise HTTPException(status_code=401, detail="Unauthorized")

    await database.db.command("ping")
    return {"ok": True}


@app.exception_handler(database.DatabaseConfigurationError)
async def database_configuration_error_handler(_request, exc):
    """Return an actionable response instead of crashing the whole function."""
    return JSONResponse(status_code=503, content={"detail": str(exc)})


# ── Rate limiting ───────────────────────────────────────────────────────────────
# App-level defence-in-depth (per-client-IP). Primary bot/DDoS defence is
# Cloudflare in front of the deployment — see docs/DEPLOYMENT.md.
# SlowAPIMiddleware applies the global default limit to every route; write
# endpoints add a stricter limit via @limiter.limit decorators.
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

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
app.include_router(words_router)
app.include_router(progress_router)
app.include_router(tts_router)
app.include_router(stats_router)
app.include_router(streak_router)
app.include_router(profile_router)
