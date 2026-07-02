"""
Profile repository – raw MongoDB operations only.

Stores profile documents in the `profiles` collection:
  { id: str (uuid), name: str, avatar: str }

No business logic (seeding, 5-profile cap, reset fan-out) lives here –
that belongs in the service layer.
"""

from typing import Any, Dict, List, Optional

from database import db


async def get_all() -> List[Dict[str, Any]]:
    """Return every profile document (without the Mongo _id field)."""
    return await db.profiles.find({}, {"_id": 0}).to_list(100)


async def get(profile_id: str) -> Optional[Dict[str, Any]]:
    """Return a single profile by id, or None."""
    return await db.profiles.find_one({"id": profile_id}, {"_id": 0})


async def count() -> int:
    """Return the number of existing profiles."""
    return await db.profiles.count_documents({})


async def insert(profile: Dict[str, Any]) -> None:
    """Insert a new profile document."""
    await db.profiles.insert_one(dict(profile))


async def update(profile_id: str, fields: Dict[str, Any]) -> None:
    """Update the given fields on a profile (no-op if fields is empty)."""
    if not fields:
        return
    await db.profiles.update_one({"id": profile_id}, {"$set": fields})
