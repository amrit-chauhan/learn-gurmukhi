"""
Pydantic schemas for the progress domain.

AlphabetLetter  – shape of a single letter entry (TypedDict for type-checking only).
ProgressUpdate  – request body for POST /api/progress/update.
ProgressRecord  – shape of a document stored in MongoDB.
ProgressMap     – response shape for GET /api/progress.
"""

from __future__ import annotations

from typing import Dict, List, Any
from typing_extensions import TypedDict
from pydantic import BaseModel


class AlphabetLetter(TypedDict):
    """Shape of a single entry in the alphabet data list."""
    id: str
    gurmukhi: str
    romanization: str
    tts_text: str
    name: str
    category: str


class ProgressUpdate(BaseModel):
    """Request body for recording a single practice answer."""
    letter_id: str
    correct: bool


class ProgressRecord(TypedDict):
    """Shape of a document as stored in MongoDB."""
    letter_id: str
    history: List[bool]


class LetterProgress(TypedDict):
    """Per-letter slice returned inside ProgressMap."""
    history: List[bool]


# GET /api/progress response: { "<letter_id>": { "history": [...] }, ... }
ProgressMap = Dict[str, LetterProgress]
