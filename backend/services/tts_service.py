"""
TTS service – audio pronunciation for Gurmukhi letters.

Serves real human-recorded audio files when available (downloaded from
discoversikhism.com), and falls back to AI-generated TTS for the ~14
letters that have no human recording.

Voice types:
  'human'  – serve the downloaded .mp3 file; raises LookupError if none exists
  'ai'     – generate (or load from cache) via OpenAI TTS
  'auto'   – human if available, else AI  (default)

Human files live in:  data/audio/human/{audio_file}.mp3
AI cache lives in:    data/audio/ai_cache/{letter_id}.mp3
"""

import asyncio
import logging
from pathlib import Path

from emergentintegrations.llm.openai import OpenAITextToSpeech

from config import settings
import services.alphabet_service as alphabet_service

logger = logging.getLogger(__name__)

_DATA_DIR = Path(__file__).parent.parent / "data" / "audio"
_HUMAN_DIR = _DATA_DIR / "human"
_AI_CACHE_DIR = _DATA_DIR / "ai_cache"
_AI_CACHE_DIR.mkdir(parents=True, exist_ok=True)


def _build_tts_text(letter: dict) -> str:
    """Build a phonetically informative TTS prompt for AI generation."""
    if letter["category"] == "number":
        return f"Punjabi number {letter['name']}: {letter['tts_text']}"
    return f"{letter['name']}: {letter['tts_text']}"


async def get_audio(letter_id: str, voice_type: str = "auto") -> bytes:
    """
    Return MP3 audio bytes for *letter_id*.

    voice_type: 'human' | 'ai' | 'auto'
    """
    letter = alphabet_service.get_by_id(letter_id)
    if letter is None:
        raise LookupError(f"Letter '{letter_id}' not found in alphabet")

    audio_file = letter.get("audio_file")
    has_human = audio_file is not None

    if voice_type == "human":
        if not has_human:
            raise LookupError(f"No human audio available for '{letter_id}'")
        try:
            return (_HUMAN_DIR / f"{audio_file}.mp3").read_bytes()
        except FileNotFoundError:
            raise LookupError(f"Human audio file missing for '{letter_id}'")

    if voice_type == "ai":
        return await _get_ai_audio(letter)

    # 'auto': prefer human, fall back to AI
    if has_human:
        human_path = _HUMAN_DIR / f"{audio_file}.mp3"
        if human_path.exists():
            return human_path.read_bytes()

    return await _get_ai_audio(letter)


async def _get_ai_audio(letter: dict) -> bytes:
    """Return AI-generated MP3 bytes (disk-cached after first generation)."""
    letter_id = letter["id"]
    cache_path = _AI_CACHE_DIR / f"{letter_id}.mp3"

    if cache_path.exists():
        return cache_path.read_bytes()

    if not settings.emergent_llm_key:
        raise RuntimeError("EMERGENT_LLM_KEY is not configured – cannot generate AI audio")

    tts_text = _build_tts_text(letter)
    logger.info("Generating AI TTS for '%s': %s", letter_id, tts_text)

    try:
        tts = OpenAITextToSpeech(api_key=settings.emergent_llm_key)
        audio_bytes: bytes = await asyncio.wait_for(
            tts.generate_speech(
                text=tts_text,
                model=settings.tts_model,
                voice=settings.tts_voice,
            ),
            timeout=20.0,
        )
    except asyncio.TimeoutError:
        logger.error("AI TTS timed out for '%s'", letter_id)
        raise RuntimeError(f"AI TTS timed out for '{letter_id}'")
    except Exception as exc:
        logger.error("AI TTS generation failed for '%s': %s", letter_id, exc)
        raise RuntimeError(f"AI TTS generation failed: {exc}") from exc

    cache_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        cache_path.write_bytes(audio_bytes)
        logger.info("AI TTS cached for '%s'", letter_id)
    except OSError:
        # Read-only filesystem (e.g. Vercel serverless) – return bytes without caching
        logger.warning("AI TTS: cannot write disk cache for '%s' (read-only FS)", letter_id)
    return audio_bytes
