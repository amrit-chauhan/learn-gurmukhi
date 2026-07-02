"""
Progress repository – raw MongoDB operations only.

Every document carries a `profile_id` and every query is scoped to it, so
each profile has an independent set of per-letter histories.

No business logic, no formatting – that belongs in the service layer.
"""

from typing import List, Dict, Any

from database import db
from config import settings


async def get_all(profile_id: str) -> List[Dict[str, Any]]:
    """Return every progress document for *profile_id* (without the _id field)."""
    return await db.progress.find(
        {"profile_id": profile_id}, {"_id": 0}
    ).to_list(1000)


async def upsert(profile_id: str, letter_id: str, correct: bool) -> None:
    """
    Append *correct* to the history for *letter_id* within *profile_id*.
    Creates the document if it does not exist.
    Trims history to the most recent `settings.progress_history_cap` entries.
    """
    key = {"profile_id": profile_id, "letter_id": letter_id}
    existing = await db.progress.find_one(key)

    if existing:
        history: List[bool] = existing.get("history", [])
        history.append(correct)
        history = history[-settings.progress_history_cap :]
        await db.progress.update_one(key, {"$set": {"history": history}})
    else:
        await db.progress.insert_one({**key, "history": [correct]})


async def reset_all(profile_id: str) -> None:
    """Delete every progress document for *profile_id*."""
    await db.progress.delete_many({"profile_id": profile_id})
