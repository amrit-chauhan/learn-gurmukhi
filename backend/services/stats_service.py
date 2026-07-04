"""
Stats service – business logic for the stats domain.

Responsibilities:
  - Determine today's date (server-side UTC)
  - Clamp incoming seconds to be non-negative
  - Delegate all reads / writes to the repository

Every operation is scoped to a `profile_id` supplied by the route layer.
"""

from datetime import date, timedelta
from typing import Dict, Any, List

import repositories.stats_repository as stats_repo
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


async def get_daily(profile_id: str, days: int = 365) -> List[Dict[str, Any]]:
    """
    Return per-day time stats for *profile_id* over the last *days* days
    (default one year), oldest → newest. Only days with recorded activity are
    present; the frontend fills the gaps as "no study".
    """
    days = max(1, min(days, 366))
    since = (date.today() - timedelta(days=days - 1)).isoformat()
    return await stats_repo.get_daily_history(profile_id, since)


async def add_time(profile_id: str, app_seconds: int, practice_seconds: int) -> None:
    """Persist additional time for *profile_id*, clamping values to >= 0."""
    today = date.today().isoformat()
    await stats_repo.add_time(
        profile_id,
        today,
        max(0, app_seconds),
        max(0, practice_seconds),
    )
