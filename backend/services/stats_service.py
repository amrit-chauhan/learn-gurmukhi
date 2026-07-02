"""
Stats service – business logic for the stats domain.

Responsibilities:
  - Determine today's date (server-side UTC)
  - Clamp incoming seconds to be non-negative
  - Delegate all reads / writes to the repository
"""

from datetime import date
from typing import Dict, Any

import repositories.stats_repository as stats_repo
import services.streak_service as streak_service


async def get_stats() -> Dict[str, Any]:
    """Return time-tracking stats + streak data for today and all-time."""
    today = date.today().isoformat()
    time_data = await stats_repo.get_stats(today)
    try:
        streak_data = await streak_service.get_streak()
    except Exception:
        streak_data = {"current_streak": 0, "longest_streak": 0, "practiced_today": False}
    return {**time_data, **streak_data}


async def add_time(app_seconds: int, practice_seconds: int) -> None:
    """Persist additional time, clamping values to >= 0."""
    today = date.today().isoformat()
    await stats_repo.add_time(
        today,
        max(0, app_seconds),
        max(0, practice_seconds),
    )
