# PRD: Learn Punjabi — Gurmukhi Flashcard App

## Original Problem Statement
"Please make me an app for learning the punjabi alphabet. i should be able to select certain letters and then it will test me on them (i can click to reveal the answer). and i should be able to do it the other way around (e.g. see the gurmukhi letter and try to guess the sound, as well as a different mode to see the sound and guess the gurmukhi letter). I should be able to swipe left or right to tell the app that i got it right or wrong. it should store how well i do for each letter and when selecting which letters to test myself on, it should be green for ones that are good (e.g. have a criteria for getting 10/10 in the last 10 tries), red if theyre bad (e.g. if i got more than 3 wrong in the last 10 tries), or orange for inbetween. the web app should also be optimised for mobile use."

Additional requests:
- Configurable Spaced Repetition algorithm (toggleable, per-mastery weight sliders)
- Pseudo-random deck guarantee (non-SR mode: 2×N deck, each letter appears at least once)
- Backend modular refactor (routes/services/repositories layers)
- Frontend modular refactor (custom hooks, split components)
- Time Tracker: track total/daily app time (tab-active) and practice time (study sessions), shown on dedicated Stats page
- Real human voice audio (no AI TTS) — downloaded from discoversikhism.com

## User Choices
- Romanization + audio pronunciation button
- Audio: human voice clips for most letters; AI-generated audio (Google TTS, authentic Punjabi `pa` voice reading Gurmukhi) for every letter — all files are pre-generated and committed to the repo as static mp3s (no live generation at runtime). Regenerated via `backend/scripts/generate_ai_audio.py` from a single reviewable Gurmukhi SPEECH map (letters say name+sound, numbers say just the number word)
- All letters included (consonants, vowels, matras, special marks) + 10 Punjabi numerals
- No specific design preference (warm Phulkari theme applied — see `docs/design_guidelines.json`)
- Time Tracker: Stats on a new /stats page
- App time tracking: only when tab is active/focused
- Time display format: "2h 34m"
- Voice toggle in settings (Human preferred / AI Voice)
- Dual audio buttons on flashcard: H (green) for human, AI (blue) for AI generated

## Backend Architecture
```
backend/
├── server.py                      ← app factory, middleware, lifespan
├── config.py                      ← Settings singleton (env vars)
├── database.py                    ← Motor client + db reference
├── data/
│   ├── alphabet_data.py           ← 70 letters + numbers with audio_file field
│   └── audio/
│       ├── human/                 ← real mp3s from discoversikhism.com
│       └── ai_cache/              ← pre-generated AI mp3s (static, committed to repo)
├── models/
│   ├── progress.py                ← Pydantic schemas for progress domain
│   └── stats.py                   ← Pydantic schemas for stats domain
├── repositories/
│   ├── progress_repository.py    ← raw MongoDB CRUD for progress
│   └── stats_repository.py       ← raw MongoDB CRUD for user_stats
├── services/
│   ├── alphabet_service.py       ← letter lookup + has_human_audio enrichment
│   ├── progress_service.py       ← progress formatting + delegation
│   ├── tts_service.py            ← serves human or AI mp3 from disk (static lookup only)
│   └── stats_service.py          ← time-tracking business logic
└── routes/
    ├── __init__.py               ← re-exports all routers
    ├── alphabet_router.py        ← GET /api/alphabet
    ├── progress_router.py        ← GET/POST /api/progress
    ├── tts_router.py             ← GET /api/tts/{letter_id}?type=human|ai|auto
    └── stats_router.py           ← GET/POST /api/stats
```

## Frontend Architecture
```
frontend/src/
├── App.js                         ← Router, AppTimeTracker wrapper
├── pages/
│   ├── Home.jsx                   ← Landing (mode select, stats nav)
│   ├── LetterSelect.jsx           ← Letter grid with category filters
│   ├── Study.jsx                  ← Flashcard session
│   └── Stats.jsx                  ← Time-tracking statistics page
├── hooks/
│   ├── useStudySession.js         ← Deck building, answer recording
│   ├── useAudioPlayer.js          ← play(letterId, voiceType) - fetches TTS
│   ├── useKeyboardStudy.js        ← Keyboard shortcuts
│   ├── useLetterSelection.js      ← Letter selection state
│   ├── useAppTimeTracker.js       ← Global app time (tab-active)
│   └── usePracticeTimeTracker.js  ← Per-session practice time
├── components/
│   ├── Flashcard.jsx              ← 3D flip + dual audio buttons (H badge + AI badge)
│   ├── LetterGridItem.jsx
│   ├── SettingsModal.jsx          ← Voice toggle + Smart Review settings
│   ├── common/SrBadge.jsx
│   ├── home/StatsBar.jsx, MasteryLegend.jsx
│   └── study/StudyHeader, SessionScore, AnswerButtons, ResultsScreen
├── context/
│   ├── ProgressContext.jsx
│   └── SettingsContext.jsx        ← voicePreference: 'human' | 'ai'
├── constants/ (modes.js, categories.js)
└── utils/srAlgorithm.js
```

## Audio Architecture
- Human recordings from discoversikhism.com, stored in `backend/data/audio/human/`
- Letters without a human recording use a pre-generated AI voice (OpenAI TTS, nova), stored in `backend/data/audio/ai_cache/`
- Both directories are static, committed assets — the backend does not call any external TTS API at runtime, it only reads files from disk
- AI-only letters: v_i (ਇ), m_aa (ਕਾ), tippi (ੰ), addak (ੱ), nums 0-9, and a few others
- API: `GET /api/tts/{letter_id}?type=human|ai|auto`
- Frontend: dual buttons per card (H badge = human, AI badge = AI voice); single AI button when no human audio
- If a new letter is added later without an audio file, `/api/tts/{id}` returns 404 for that letter until a file is added — there is no automatic generation fallback (see "Removed" section below)

## Routes
- `/` — Home: mode selection, stats overview, nav to /stats and /settings
- `/select` — Letter selection grid with category filters
- `/study` — Flashcard study session
- `/words` — Practice Words hub (Common Words / Words in Songs / Days of the Week / Numbers 0–100)
- `/word-select` — Per-section word grid: mastery colours + select subset + choose practice mode
- `/word-study` — Practice-word flashcard session (Gurmukhi → romanization + translation + audio)
- `/stats` — Time-tracking statistics page (includes a clickable month Calendar)

## Practice Words
- "Practice Words" section for learning vocabulary (separate from the alphabet).
- Four sections: **Common Words**, **Words in Songs** (vocabulary common in Punjabi music — Sidhu Moose Wala / Karan Aujla / Diljit / Arjan Dhillon, wedding & classic songs), **Days of the Week** (7), **Numbers 0–100** (spoken Punjabi number words).
- Data: `backend/data/word_data.py` (`PRACTICE_WORDS`), each `{id, gurmukhi, romanization, translation, category}`. Categories may overlap in vocabulary (songs ↔ common) — that's intentional.
- Selection page (`/word-select`): grid of every word in a section, colour-coded by **word mastery** (`frontend/src/utils/wordMastery.js`, a shorter window than letters — last **3** tries: green = last 3 all correct, red = last 3 all wrong, amber = in between, grey = new). Tap/drag to select a subset. Numbers are shown in order 0→100.
- Two practice modes (`useWordSession`): **Practice Random** (primary) shuffles the selected words (or all if none selected); **Practice in Order** walks the whole section once in order and **resumes** where you left off (position persisted per profile+section in `localStorage`, cleared after a full pass).
- Flashcard: front shows the Gurmukhi spelling; answer side shows how to say it (romanization) + English translation + a pronunciation button (rendered once outside the 3D flip stage so it doesn't mirror onto the reverse face).
- Audio: pre-generated Punjabi voice (Google TTS `pa`) per word in `backend/data/audio/words/{id}.mp3`, generated by `backend/scripts/generate_word_audio.py`. Fetched lazily (not preloaded) since there are hundreds.
- API: `GET /api/words` (list) and `GET /api/words/tts/{word_id}` (mp3). Per-word correctness history is stored in the same `progress` collection as letters.

## Stats Calendar
- The Stats page has a **Calendar** tab: a month grid (with prev/next navigation) where days with recorded activity are marked; tapping any day shows that day's **App time** and **Practice time**.
- Backend: `GET /api/stats/daily?start=YYYY-MM-DD&end=YYYY-MM-DD` returns per-day `{date, app_seconds, practice_seconds}` for the range (from the existing `type:"daily"` docs in `user_stats`) plus the profile's `practiced_dates`.

## What's Been Implemented

### Core App
- 60 Punjabi letters: vowel carriers (3), consonants (31), nukta variants (6), independent vowels (9), matras (9), special marks (2)
- 10 Punjabi numerals (0-9)
- Two study modes: Gurmukhi→Sound and Sound→Gurmukhi
- Letter selection grid with 7 category filter tabs (All, Carriers, Consonants, Nukta, Vowels, Matras, Special, Numbers)
- Mastery colour coding: green / amber / red / grey
- Swipeable flashcards (framer-motion), tap to reveal (3D card flip)
- Correct/Wrong buttons + keyboard shortcuts
- Progress persistence in MongoDB
- Session results screen with score + wrong answers list
- Reset progress button

### Audio
- Real human voice mp3 clips from discoversikhism.com for the majority of letters
- Pre-generated AI voice (OpenAI TTS, nova) for the remaining letters — generated once, permanently committed to disk
- Total on-disk: ~572KB human + ~1.5MB AI = ~2MB of audio
- Client-side preloader: on page load, all audio files downloaded in background (concurrency=6)
- In-memory blob URL cache ensures instant playback with zero network wait
- HTTP Cache-Control: public, max-age=86400 set on backend
- Dual audio buttons on flashcard: H (green badge) = human voice, AI (blue badge) = AI voice
- Settings: Voice Preference toggle (Human / AI Voice)
- API: `?type=human|ai|auto` query parameter

### Spaced Repetition
- Toggleable SR via Settings modal
- SR OFF: 2×N pseudo-random deck (each letter guaranteed once)
- SR ON: weighted random deck (struggling letters appear more)
- Configurable per-mastery weights (sliders 0–10×)
- Session multiplier: 1×, 1.5×, 2×, 3×, 5× (uncapped — "All" option always enabled)
- Default multiplier: 3×
- Avoid back-to-back toggle

### Time Tracker
- App time: tracks only when browser tab is active (Page Visibility API)
- Practice time: tracks per study session
- Stats page at /stats: Today + All Time sections, "2h 34m" format
- MongoDB collection: user_stats

### Streak / Daily Goal
- Grace day rule: 1 missed day per ISO calendar week forgiven
- Streak fires when Study page mounts
- Home page: amber flame banner showing streak count

### Stats Page
- Tabbed hub: Overview | Letters | Time | Streak
- Overview: Recharts PieChart donut + 4 mastery cards
- Letters: 60-letter sortable grid with mastery borders + bottom sheet modal

### 3D Card Flip
- Tap anywhere on card flips it with CSS 3D animation
- Audio button guard: doesn't trigger flip (stopPropagation)

## Removed (repo cleanup)
- Live AI TTS generation via the proprietary `emergentintegrations` package and `EMERGENT_LLM_KEY` was removed. All AI-voice audio was already pre-generated and committed to `backend/data/audio/ai_cache/`, so the backend now only ever reads static files — no external API call, no vendor lock-in, no custom pip index required.

## Core Data Models
```
profiles:    { id: str (uuid), name: str, avatar: str }          # server-side, shared across devices
progress:    { profile_id: str, letter_id: str, history: [bool] }
user_stats:  { profile_id: str, type: "totals"|"daily", date?: str, app_seconds: int, practice_seconds: int }
             { profile_id: str, type: "streak_data", practiced_dates: [str], longest_streak: int }
alphabet:    { id, gurmukhi, romanization, tts_text, name, category, group, audio_file: str|null, has_human_audio: bool }
```

### User Profiles (server-shared, no auth)
Up to 5 profiles (5 seeded on first load) live in the `profiles` collection in
MongoDB. All progress/stats/streak documents are scoped by `profile_id`, and the
active profile is passed on every request via the `X-Profile-Id` header (resolved
by the `get_profile_id` dependency; falls back to `"default"` for header-less
clients). Profiles are therefore **persisted server-side and shared across every
device/browser** that reaches the deployment — not local to one browser. There is
no login: anyone using the deployment picks from the same shared set. The client
only remembers the *last-picked* profile id in `localStorage` as a UX shortcut to
skip the selection screen; the profiles and their progress always live on the
server. (`group` on `alphabet` is the pedagogical section from F-002.)

## Mastery Logic
- Mastered (green): last 10 all correct (min 10 attempts)
- Struggling (red): >3 wrong in last N attempts
- Learning (amber): everything else with attempts
- New (grey): 0 attempts

## P1 — Backlog
- [ ] Auto-play audio on card load
- [ ] Stats page: per-letter history charts (sparkline)
- [ ] Custom letter groups / saved sets
- [ ] Offline support (cache TTS audio)
- [ ] Share progress / achievements
