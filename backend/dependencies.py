"""
Shared FastAPI dependencies.

`get_profile_id` extracts the active profile from the request so every
progress / stats / streak query can be scoped to a single profile.

Resolution order:
  1. `X-Profile-Id` request header (the normal path — set as an axios default
     header by the frontend's ProfileContext).
  2. `profile_id` query parameter (fallback for `navigator.sendBeacon`, which
     cannot set custom headers).
  3. `DEFAULT_PROFILE_ID` when neither is present (keeps pre-profile clients and
     the integration tests working against a single implicit profile).
"""

from typing import Optional

from fastapi import Header, Query

# Implicit profile used when a request carries no profile identifier at all.
DEFAULT_PROFILE_ID = "default"


async def get_profile_id(
    x_profile_id: Optional[str] = Header(default=None, alias="X-Profile-Id"),
    profile_id: Optional[str] = Query(default=None),
) -> str:
    """Return the active profile id for the current request."""
    return x_profile_id or profile_id or DEFAULT_PROFILE_ID
