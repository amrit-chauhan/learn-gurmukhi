"""
Profile service – business logic for the profile domain.

Responsibilities:
  - Seed the default set of profiles on first access
  - Enforce the MAX_PROFILES cap on creation
  - Create / edit profiles
  - Reset a single profile: fan out to progress + stats + streak repositories

Profiles are a local convenience selector (avatar + name), not auth identities.
"""

import uuid
from typing import Any, Dict, List, Optional

from models.profile import MAX_PROFILES
import repositories.profile_repository as profile_repo
import repositories.progress_repository as progress_repo
import repositories.stats_repository as stats_repo

# Seeded on first access so a fresh install always offers 5 pickable profiles.
DEFAULT_PROFILES = [
    {"name": "Simran", "avatar": "🦚"},
    {"name": "Arjan", "avatar": "🦁"},
    {"name": "Jasleen", "avatar": "🦋"},
    {"name": "Kabir", "avatar": "🐯"},
    {"name": "Noor", "avatar": "🌸"},
]


async def list_profiles() -> List[Dict[str, Any]]:
    """Return all profiles, seeding the default set if none exist yet."""
    profiles = await profile_repo.get_all()
    if not profiles:
        for preset in DEFAULT_PROFILES:
            await profile_repo.insert(
                {"id": str(uuid.uuid4()), "name": preset["name"], "avatar": preset["avatar"]}
            )
        profiles = await profile_repo.get_all()
    return profiles


async def create_profile(name: str, avatar: str) -> Dict[str, Any]:
    """Create a new profile. Raises ValueError if the MAX_PROFILES cap is reached."""
    if await profile_repo.count() >= MAX_PROFILES:
        raise ValueError(f"Cannot create more than {MAX_PROFILES} profiles")
    profile = {"id": str(uuid.uuid4()), "name": name, "avatar": avatar}
    await profile_repo.insert(profile)
    return profile


async def update_profile(
    profile_id: str, name: Optional[str], avatar: Optional[str]
) -> Optional[Dict[str, Any]]:
    """Update a profile's name and/or avatar. Returns the updated profile, or None if not found."""
    if await profile_repo.get(profile_id) is None:
        return None
    fields: Dict[str, Any] = {}
    if name is not None:
        fields["name"] = name
    if avatar is not None:
        fields["avatar"] = avatar
    await profile_repo.update(profile_id, fields)
    return await profile_repo.get(profile_id)


async def reset_profile(profile_id: str) -> None:
    """Wipe all progress, time-tracking, and streak data for a single profile."""
    await progress_repo.reset_all(profile_id)
    await stats_repo.reset_all(profile_id)
