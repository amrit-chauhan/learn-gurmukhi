"""
Streak repository – raw MongoDB operations only.

Stores all streak data in the user_stats collection under
  { type: "streak_data", practiced_dates: [...], longest_streak: N }

Uses:
  $addToSet  – idempotent date insertion
  $max       – only updates longest_streak when the new value is greater
"""

from typing import Any, Dict

from database import db


async def checkin(today: str) -> None:
    """Add *today* to the practiced_dates set (idempotent)."""
    await db.user_stats.update_one(
        {"type": "streak_data"},
        {"$addToSet": {"practiced_dates": today}},
        upsert=True,
    )


async def update_longest_streak(value: int) -> None:
    """Persist *value* as longest_streak only if it exceeds the stored value."""
    await db.user_stats.update_one(
        {"type": "streak_data"},
        {"$max": {"longest_streak": value}},
        upsert=True,
    )


async def get_streak_data() -> Dict[str, Any]:
    """Return the streak document, defaulting to empty if not found."""
    doc = await db.user_stats.find_one({"type": "streak_data"}, {"_id": 0})
    if not doc:
        return {"practiced_dates": [], "longest_streak": 0}
    return {
        "practiced_dates": doc.get("practiced_dates", []),
        "longest_streak": doc.get("longest_streak", 0),
    }
