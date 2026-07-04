"""
Stats service – business logic for the stats domain.

Responsibilities:
  - Determine today's date (server-side UTC)
  - Clamp incoming seconds to be non-negative
  - Delegate all reads / writes to the repository

Every operation is scoped to a `profile_id` supplied by the route layer.
"""

from datetime import date
from typing import Dict, Any

import repositories.stats_repository as stats_repo
import repositories.streak_repository as streak_repo
import services.streak_service as streak_service


async def get_stats(profile_id: str) -> Dict[str, Any]:
    """Return time-tracking stats + streak data for *profile_id* (today and all-time)."""
    today = date.today().isoformat()
    time_data = await stats_repo.get_stats(profile_id, today)
    try:
        streak_data = await streak_service.get_streak(profile_id)
    except Exception:
        streak_data = {"current_streak": 0, "longest_streak": 0, "practiced_today": False}
    return {**time_data, **streak_data}


async def get_daily(profile_id: str, start: str, end: str) -> Dict[str, Any]:
    """
    Return per-day time for *profile_id* within [start, end] inclusive.

    Shape:
      {
        "days": [{date, app_seconds, practice_seconds}, ...],
        "practiced_dates": [<ISO dates in range the user practiced>],
      }

    `days` only contains dates that have a daily document; the frontend fills
    in zeros for the rest of the visible month.
    """
    days = await stats_repo.get_daily_range(profile_id, start, end)

    try:
        streak_data = await streak_repo.get_streak_data(profile_id)
        practiced = sorted(
            d for d in streak_data.get("practiced_dates", []) if start <= d <= end
        )
    except Exception:
        practiced = []

    return {"days": days, "practiced_dates": practiced}


async def add_time(profile_id: str, app_seconds: int, practice_seconds: int) -> None:
    """Persist additional time for *profile_id*, clamping values to >= 0."""
    today = date.today().isoformat()
    await stats_repo.add_time(
        profile_id,
        today,
        max(0, app_seconds),
        max(0, practice_seconds),
    )
