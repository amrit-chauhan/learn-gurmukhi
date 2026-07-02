# CLAUDE.md

Guidance for agents working in this repo.

## What this is

A React + FastAPI + MongoDB flashcard app for learning the Gurmukhi (Punjabi) alphabet. Full architecture, data models, and feature history are documented in `docs/PRD.md` — read that first for anything beyond a small change.

## Layout

- `backend/` — FastAPI, layered as `routes/` → `services/` → `repositories/`. `data/alphabet_data.py` is the single source of truth for all 70 letters/numbers. `data/audio/{human,ai_cache}/` hold static, pre-generated mp3s served directly from disk — there is no live TTS generation or external API call.
- `frontend/src/` — CRA + CRACO. Pages in `pages/`, shared logic in `hooks/`, UI primitives (shadcn/ui) in `components/ui/`. Path alias `@/` → `frontend/src/`.
- `docs/PRD.md` — architecture, data models, feature history. `docs/design_guidelines.json` — design tokens (colors, typography) for the "Phulkari" theme.

## Conventions

- Backend: keep routes thin — HTTP concerns only. Business logic lives in `services/`, raw DB access in `repositories/`.
- Frontend: prefer extracting a hook over growing a page component; state that needs to persist across routes goes in `context/`.
- Audio: to add a new letter's audio, drop an mp3 into `data/audio/human/` (or `ai_cache/` for AI-voice) and set `audio_file` in `alphabet_data.py`. There is no fallback generation — a letter without a matching file 404s on `/api/tts/{id}`.

## Running things

```bash
# backend
cd backend && pip install -r requirements.txt && uvicorn server:app --reload --port 8001

# frontend
cd frontend && yarn install && yarn start

# tests (backend must be running; tests hit it via REACT_APP_BACKEND_URL)
cd backend && pytest tests/
```

## Known rough edges

- `backend/tests/` are integration tests against a live server, not isolated unit tests — no mocking/fixtures for MongoDB. If you add backend logic, prefer testing it via a real request against a locally running server, matching the existing style.
- Two of the test files' hardcoded expectations (`test_alphabet_app.py`, `test_refactored_backend.py`) previously drifted from the actual letter count when features were added — check assertions like counts still match `len(PUNJABI_ALPHABET)` when adding letters.
