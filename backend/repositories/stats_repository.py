"""
Stats repository – raw MongoDB operations only.

Time-tracking and streak data live in the `user_stats` collection. Every
document carries a `profile_id`, so counters are independent per profile.

No business logic or formatting – that belongs in the service layer.
"""

from typing import Dict, Any

from database import db


async def get_stats(profile_id: str, today: str) -> Dict[str, int]:
    """Return totals + today's daily document for *profile_id*, merged into a flat dict."""
    totals = await db.user_stats.find_one(
        {"profile_id": profile_id, "type": "totals"}, {"_id": 0}
    ) or {}
    today_doc = await db.user_stats.find_one(
        {"profile_id": profile_id, "type": "daily", "date": today}, {"_id": 0}
    ) or {}

    return {
        "total_app_seconds": totals.get("app_seconds", 0),
        "total_practice_seconds": totals.get("practice_seconds", 0),
        "today_app_seconds": today_doc.get("app_seconds", 0),
        "today_practice_seconds": today_doc.get("practice_seconds", 0),
    }


async def get_daily_history(profile_id: str, since: str) -> list:
    """
    Return every daily document for *profile_id* dated on/after *since* (an ISO
    date string), sorted oldest → newest. Each item carries the date and its
    app / practice second counters.
    """
    cursor = db.user_stats.find(
        {"profile_id": profile_id, "type": "daily", "date": {"$gte": since}},
        {"_id": 0, "date": 1, "app_seconds": 1, "practice_seconds": 1},
    ).sort("date", 1)
    return [
        {
            "date": doc["date"],
            "app_seconds": doc.get("app_seconds", 0),
            "practice_seconds": doc.get("practice_seconds", 0),
        }
        async for doc in cursor
    ]


async def add_time(profile_id: str, today: str, app_seconds: int, practice_seconds: int) -> None:
    """
    Atomically increment time counters for *profile_id*.

    Builds a $inc payload from whichever values are > 0, then upserts both
    the all-time totals document and today's daily document.
    """
    inc: Dict[str, int] = {}
    if app_seconds > 0:
        inc["app_seconds"] = app_seconds
    if practice_seconds > 0:
        inc["practice_seconds"] = practice_seconds

    if not inc:
        return

    await db.user_stats.update_one(
        {"profile_id": profile_id, "type": "totals"},
        {"$inc": inc},
        upsert=True,
    )
    await db.user_stats.update_one(
        {"profile_id": profile_id, "type": "daily", "date": today},
        {"$inc": inc},
        upsert=True,
    )


async def reset_all(profile_id: str) -> None:
    """Delete every user_stats document for *profile_id* (totals, daily, and streak_data)."""
    await db.user_stats.delete_many({"profile_id": profile_id})
