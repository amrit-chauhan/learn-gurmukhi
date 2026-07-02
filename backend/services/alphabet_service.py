"""
Alphabet service – read-only access to the static alphabet data.

Thin layer that keeps route handlers decoupled from the data source
(currently an in-process constant; could become a DB call later).

Enriches each letter with `has_human_audio` derived from the `audio_file` field.
"""

from typing import List, Dict, Any, Optional

from data.alphabet_data import PUNJABI_ALPHABET


def _enrich(letter: Dict[str, Any]) -> Dict[str, Any]:
    """Add computed fields before returning to callers."""
    return {**letter, "has_human_audio": letter.get("audio_file") is not None}


def get_all() -> List[Dict[str, Any]]:
    """Return the full alphabet list with computed fields."""
    return [_enrich(l) for l in PUNJABI_ALPHABET]


def get_by_id(letter_id: str) -> Optional[Dict[str, Any]]:
    """Return the enriched letter with the given id, or None if not found."""
    raw = next((l for l in PUNJABI_ALPHABET if l["id"] == letter_id), None)
    return _enrich(raw) if raw is not None else None
