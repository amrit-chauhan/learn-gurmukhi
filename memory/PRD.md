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
- Audio: Human voice clips for 56/70 letters; AI TTS (OpenAI nova) for remaining 14 — AI audio cached to disk
- All letters included (consonants, vowels, matras, special marks) + 10 Punjabi numerals
- No specific design preference (warm Phulkari theme applied)
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
│       ├── human/                 ← 54 real mp3s from discoversikhism.com
│       └── ai_cache/              ← 14 AI-generated mp3s (persistent disk cache)
├── models/
│   ├── progress.py                ← Pydantic schemas for progress domain
│   └── stats.py                   ← Pydantic schemas for stats domain
├── repositories/
│   ├── progress_repository.py    ← raw MongoDB CRUD for progress
│   └── stats_repository.py       ← raw MongoDB CRUD for user_stats
├── services/
│   ├── alphabet_service.py       ← letter lookup + has_human_audio enrichment
│   ├── progress_service.py       ← progress formatting + delegation
│   ├── tts_service.py            ← serves human mp3 or AI-generated audio
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
- **56 letters**: Real human recordings from discoversikhism.com (stored in `/data/audio/human/`)
- **14 letters**: AI TTS via OpenAI (nova voice, tts-1) — generated on first request, cached to `/data/audio/ai_cache/`
- AI-only letters: v_i (ਇ), m_aa (ਕਾ), tippi (ੰ), addak (ੱ), nums 0-9
- API: `GET /api/tts/{letter_id}?type=human|ai|auto`
- Frontend: dual buttons per card (H badge = human, AI badge = AI voice); single AI button when no human audio

## Routes
- `/` — Home: mode selection, stats overview, nav to /stats and /settings
- `/select` — Letter selection grid with category filters
- `/study` — Flashcard study session
- `/stats` — Time-tracking statistics page

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

### Audio (2026-02 — Major Update)
- 54 real human voice mp3 clips from discoversikhism.com for 56 letter mappings
- AI TTS (OpenAI nova) for remaining 14 letters (persistent disk cache)
- ALL 70 AI audio files pre-generated and stored permanently on disk at startup
- Total on-disk: 54 human mp3s (~572KB) + 70 AI mp3s (~1.5MB) = ~2MB of audio
- Client-side preloader: on page load, all 126 audio files downloaded in background (concurrency=6)
- In-memory blob URL cache ensures instant playback with zero network wait
- HTTP Cache-Control: public, max-age=86400 set on backend (CDN overrides in preview env)
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

### Time Tracker (added 2026-02)
- App time: tracks only when browser tab is active (Page Visibility API)
- Practice time: tracks per study session
- Stats page at /stats: Today + All Time sections, "2h 34m" format
- MongoDB collection: user_stats

### Streak / Daily Goal (added 2026-02)
- Grace day rule: 1 missed day per ISO calendar week forgiven
- Streak fires when Study page mounts
- Home page: amber flame banner showing streak count

### Stats Page (added 2026-02)
- Tabbed hub: Overview | Letters | Time | Streak
- Overview: Recharts PieChart donut + 4 mastery cards
- Letters: 60-letter sortable grid with mastery borders + bottom sheet modal

### 3D Card Flip (added 2026-02)
- Tap anywhere on card flips it with CSS 3D animation
- Audio button guard: doesn't trigger flip (stopPropagation)

## Core Data Models
```
progress:    { letter_id: str, history: [bool] }
user_stats:  { type: "totals"|"daily", date?: str, app_seconds: int, practice_seconds: int }
             { type: "streak_data", practiced_dates: [str], longest_streak: int }
alphabet:    { id, gurmukhi, romanization, tts_text, name, category, audio_file: str|null, has_human_audio: bool }
```

## Mastery Logic
- Mastered (green): last 10 all correct (min 10 attempts)
- Struggling (red): >3 wrong in last N attempts
- Learning (amber): everything else with attempts
- New (grey): 0 attempts

## 3rd Party Integrations
- OpenAI TTS (nova voice, tts-1) via Emergent LLM Key — for 14 AI-only letters only

## P1 — Backlog
- [ ] Auto-play audio on card load (user suggested, pending confirmation)
- [ ] Stats page: per-letter history charts (sparkline)
- [ ] Custom letter groups / saved sets
- [ ] Offline support (cache TTS audio)
- [ ] Share progress / achievements
