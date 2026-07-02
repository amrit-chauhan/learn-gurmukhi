"""
Progress service – business logic for the progress domain.

Responsibilities:
  - Shape the raw repository data into the map the frontend expects
  - Delegate writes and resets to the repository
  - Owns the definition of "history cap" (via config, applied in repository)

The service layer is the only caller of the repository; routes never
import from `repositories` directly.
"""

from models.progress import ProgressMap
import repositories.progress_repository as progress_repo


async def get_progress_map() -> ProgressMap:
    """
    Return progress keyed by letter_id.

    Example output::

        {
            "ka": {"history": [True, False, True]},
            "sa": {"history": [True, True, True]},
        }
    """
    docs = await progress_repo.get_all()
    return {
        doc["letter_id"]: {"history": doc.get("history", [])}
        for doc in docs
    }


async def record_answer(letter_id: str, correct: bool) -> None:
    """Persist a single practice answer for *letter_id*."""
    await progress_repo.upsert(letter_id, correct)


async def reset_all() -> None:
    """Wipe every progress record – used by the reset endpoint."""
    await progress_repo.reset_all()
