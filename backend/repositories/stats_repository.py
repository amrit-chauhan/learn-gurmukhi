"""
Stats repository – raw MongoDB operations only.

Responsibilities:
  - Read totals and today's daily stats
  - Atomically increment time counters (upsert if not present)

No business logic or formatting – that belongs in the service layer.
"""

from typing import Dict, Any

from database import db


async def get_stats(today: str) -> Dict[str, int]:
    """Return totals document and today's daily document, merged into a flat dict."""
    totals = await db.user_stats.find_one({"type": "totals"}, {"_id": 0}) or {}
    today_doc = await db.user_stats.find_one({"type": "daily", "date": today}, {"_id": 0}) or {}

    return {
        "total_app_seconds": totals.get("app_seconds", 0),
        "total_practice_seconds": totals.get("practice_seconds", 0),
        "today_app_seconds": today_doc.get("app_seconds", 0),
        "today_practice_seconds": today_doc.get("practice_seconds", 0),
    }


async def add_time(today: str, app_seconds: int, practice_seconds: int) -> None:
    """
    Atomically increment time counters.

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
        {"type": "totals"},
        {"$inc": inc},
        upsert=True,
    )
    await db.user_stats.update_one(
        {"type": "daily", "date": today},
        {"$inc": inc},
        upsert=True,
    )
