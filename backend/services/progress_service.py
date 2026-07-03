"""
Progress service – business logic for the progress domain.

Responsibilities:
  - Shape the raw repository data into the map the frontend expects
  - Delegate writes and resets to the repository
  - Owns the definition of "history cap" (via config, applied in repository)

Every operation is scoped to a `profile_id` supplied by the route layer.
The service layer is the only caller of the repository; routes never
import from `repositories` directly.
"""

from models.progress import ProgressMap
import repositories.progress_repository as progress_repo


async def get_progress_map(profile_id: str) -> ProgressMap:
    """
    Return *profile_id*'s progress keyed by letter_id.

    Example output::

        {
            "ka": {"history": [True, False, True]},
            "sa": {"history": [True, True, True]},
        }
    """
    docs = await progress_repo.get_all(profile_id)
    return {
        doc["letter_id"]: {"history": doc.get("history", [])}
        for doc in docs
    }


async def record_answer(profile_id: str, letter_id: str, correct: bool) -> None:
    """Persist a single practice answer for *letter_id* under *profile_id*."""
    await progress_repo.upsert(profile_id, letter_id, correct)


async def reset_all(profile_id: str) -> None:
    """Wipe every progress record for *profile_id* – used by the reset endpoint."""
    await progress_repo.reset_all(profile_id)
