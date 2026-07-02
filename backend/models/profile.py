"""
Pydantic / TypedDict schemas for the profile domain.

A profile is a local convenience selector (avatar + name) — NOT an
authentication identity. Up to `MAX_PROFILES` may exist at once.
"""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel
from typing_extensions import TypedDict

# Hard cap on how many profiles can exist.
MAX_PROFILES = 5


class ProfileCreate(BaseModel):
    """Request body for creating a profile."""
    name: str
    avatar: str


class ProfileUpdate(BaseModel):
    """Request body for editing a profile. Any field may be omitted."""
    name: Optional[str] = None
    avatar: Optional[str] = None


class Profile(TypedDict):
    """Shape of a profile document as returned to the client."""
    id: str
    name: str
    avatar: str
