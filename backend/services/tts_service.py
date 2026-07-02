"""
TTS service – audio pronunciation for Gurmukhi letters.

Serves pre-recorded/pre-generated audio files:
  'human'  – real human recordings (downloaded from discoversikhism.com)
  'ai'     – AI-generated (OpenAI TTS) audio, pre-generated and cached to disk
  'auto'   – human if available, else AI  (default)

All 70 letters already have a cached file in one or both directories, so this
service is a pure static lookup — there is no live audio generation.

Human files live in:  data/audio/human/{audio_file}.mp3
AI files live in:     data/audio/ai_cache/{letter_id}.mp3
"""

from pathlib import Path

import services.alphabet_service as alphabet_service

_DATA_DIR = Path(__file__).parent.parent / "data" / "audio"
_HUMAN_DIR = _DATA_DIR / "human"
_AI_CACHE_DIR = _DATA_DIR / "ai_cache"


async def get_audio(letter_id: str, voice_type: str = "auto") -> bytes:
    """
    Return MP3 audio bytes for *letter_id*.

    voice_type: 'human' | 'ai' | 'auto'
    """
    letter = alphabet_service.get_by_id(letter_id)
    if letter is None:
        raise LookupError(f"Letter '{letter_id}' not found in alphabet")

    audio_file = letter.get("audio_file")
    human_path = _HUMAN_DIR / f"{audio_file}.mp3" if audio_file else None

    if voice_type == "human":
        if human_path is None or not human_path.exists():
            raise LookupError(f"No human audio available for '{letter_id}'")
        return human_path.read_bytes()

    if voice_type == "ai":
        return _get_ai_audio(letter_id)

    # 'auto': prefer human, fall back to AI
    if human_path is not None and human_path.exists():
        return human_path.read_bytes()
    return _get_ai_audio(letter_id)


def _get_ai_audio(letter_id: str) -> bytes:
    """Return pre-generated AI mp3 bytes from the on-disk cache."""
    cache_path = _AI_CACHE_DIR / f"{letter_id}.mp3"
    if not cache_path.exists():
        raise LookupError(f"No AI audio available for '{letter_id}'")
    return cache_path.read_bytes()
