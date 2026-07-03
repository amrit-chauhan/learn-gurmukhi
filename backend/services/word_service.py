"""
Word service — practice-word vocabulary (common words, days, numbers 0-100).

Mirrors alphabet_service/tts_service but for the "Practice Words" feature.
Each word is a static dict from data/word_data.py; audio is a pre-generated
Punjabi (gTTS `pa`) mp3 in data/audio/words/{id}.mp3 (no human recordings).

There is no live generation — this is a pure static lookup, same as letters.
"""

from pathlib import Path

from data.word_data import PRACTICE_WORDS

_WORDS_AUDIO_DIR = Path(__file__).parent.parent / "data" / "audio" / "words"

# Index by id once at import for O(1) lookups.
_BY_ID = {w["id"]: w for w in PRACTICE_WORDS}


def get_all() -> list:
    """Return every practice word (common + days + numbers)."""
    return PRACTICE_WORDS


def get_by_id(word_id: str):
    """Return a single word dict, or None if unknown."""
    return _BY_ID.get(word_id)


def get_audio(word_id: str) -> bytes:
    """Return MP3 bytes for *word_id* from the on-disk word-audio cache."""
    if word_id not in _BY_ID:
        raise LookupError(f"Word '{word_id}' not found")
    path = _WORDS_AUDIO_DIR / f"{word_id}.mp3"
    if not path.exists():
        raise LookupError(f"No audio available for word '{word_id}'")
    return path.read_bytes()
