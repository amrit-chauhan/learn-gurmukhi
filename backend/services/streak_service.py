"""
Streak service – streak calculation and check-in logic.

Grace-day rule
--------------
Within any ISO calendar week (Mon–Sun), one missed day is forgiven.
A second missed day in the same week breaks the streak.

Example  (walking backwards from today):
  Mon practiced  → streak 1
  Sun practiced  → streak 2
  Sat missed     → grace used for ISO week N, skip
  Fri practiced  → streak 3
  Thu missed     → grace already used for week N → BREAK  →  streak = 3
"""

from datetime import date, timedelta
from typing import Any, Dict, List

import repositories.streak_repository as streak_repo


def _calculate_streak(practiced_dates: List[str], today: str) -> int:
    """
    Return the current streak given a list of practiced ISO-date strings.

    Walks backwards from today (or yesterday when today is not practiced),
    applying the grace-day rule: at most one missed day per ISO week.
    """
    dates = set(practiced_dates)
    today_date = date.fromisoformat(today)
    yesterday = (today_date - timedelta(days=1)).isoformat()

    # Neither today nor yesterday → streak cannot be active
    if today not in dates and yesterday not in dates:
        return 0

    start = today_date if today in dates else today_date - timedelta(days=1)

    streak = 0
    grace_weeks_used: set = set()
    current = start

    while True:
        current_str = current.isoformat()
        iso = current.isocalendar()
        week_key = (iso[0], iso[1])  # (ISO year, ISO week number)

        if current_str in dates:
            streak += 1
            current -= timedelta(days=1)
        elif week_key not in grace_weeks_used:
            # Use the grace day for this week
            grace_weeks_used.add(week_key)
            current -= timedelta(days=1)
        else:
            # Already used grace this week → streak broken
            break

    return streak


async def checkin(profile_id: str) -> int:
    """
    Mark today as practiced for *profile_id*.

    Recalculates the current streak and persists it as the longest streak
    if it is a new personal best.  Returns the current streak value.
    """
    today = date.today().isoformat()
    await streak_repo.checkin(profile_id, today)

    data = await streak_repo.get_streak_data(profile_id)
    current = _calculate_streak(data["practiced_dates"], today)

    if current > data.get("longest_streak", 0):
        await streak_repo.update_longest_streak(profile_id, current)

    return current


async def get_streak(profile_id: str) -> Dict[str, Any]:
    """Return current streak, longest streak, and whether *profile_id* practiced today."""
    today = date.today().isoformat()
    data = await streak_repo.get_streak_data(profile_id)
    current = _calculate_streak(data["practiced_dates"], today)
    longest = max(data.get("longest_streak", 0), current)

    return {
        "current_streak": current,
        "longest_streak": longest,
        "practiced_today": today in set(data.get("practiced_dates", [])),
    }
