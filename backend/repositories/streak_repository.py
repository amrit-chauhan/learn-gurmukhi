"""
Streak repository – raw MongoDB operations only.

Stores streak data in the user_stats collection, one document per profile:
  { profile_id: str, type: "streak_data", practiced_dates: [...], longest_streak: N }

Uses:
  $addToSet  – idempotent date insertion
  $max       – only updates longest_streak when the new value is greater
"""

from typing import Any, Dict

from database import db


async def checkin(profile_id: str, today: str) -> None:
    """Add *today* to *profile_id*'s practiced_dates set (idempotent)."""
    await db.user_stats.update_one(
        {"profile_id": profile_id, "type": "streak_data"},
        {"$addToSet": {"practiced_dates": today}},
        upsert=True,
    )


async def update_longest_streak(profile_id: str, value: int) -> None:
    """Persist *value* as longest_streak only if it exceeds the stored value."""
    await db.user_stats.update_one(
        {"profile_id": profile_id, "type": "streak_data"},
        {"$max": {"longest_streak": value}},
        upsert=True,
    )


async def get_streak_data(profile_id: str) -> Dict[str, Any]:
    """Return *profile_id*'s streak document, defaulting to empty if not found."""
    doc = await db.user_stats.find_one(
        {"profile_id": profile_id, "type": "streak_data"}, {"_id": 0}
    )
    if not doc:
        return {"practiced_dates": [], "longest_streak": 0}
    return {
        "practiced_dates": doc.get("practiced_dates", []),
        "longest_streak": doc.get("longest_streak", 0),
    }
