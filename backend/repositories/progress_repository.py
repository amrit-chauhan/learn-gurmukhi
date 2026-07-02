"""
Progress repository – raw MongoDB operations only.

Responsibilities:
  - Read all progress documents
  - Insert or update a single letter's history
  - Delete all progress documents

No business logic, no formatting – that belongs in the service layer.
"""

from typing import List, Dict, Any

from database import db
from config import settings


async def get_all() -> List[Dict[str, Any]]:
    """Return every progress document (without the _id field)."""
    return await db.progress.find({}, {"_id": 0}).to_list(1000)


async def upsert(letter_id: str, correct: bool) -> None:
    """
    Append *correct* to the history for *letter_id*.
    Creates the document if it does not exist.
    Trims history to the most recent `settings.progress_history_cap` entries.
    """
    existing = await db.progress.find_one({"letter_id": letter_id})

    if existing:
        history: List[bool] = existing.get("history", [])
        history.append(correct)
        history = history[-settings.progress_history_cap :]
        await db.progress.update_one(
            {"letter_id": letter_id},
            {"$set": {"history": history}},
        )
    else:
        await db.progress.insert_one(
            {"letter_id": letter_id, "history": [correct]}
        )


async def reset_all() -> None:
    """Delete every progress document – used by the reset endpoint."""
    await db.progress.delete_many({})
