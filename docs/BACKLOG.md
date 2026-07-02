# BACKLOG

Dispatch queue for feature work. This file is parsed by the coordinator to build a
DAG and fan out subagents — treat IDs, `Depends on`, `Touches`, and `Collides with`
as load-bearing, not decoration. Completed features move to `## Done` at the bottom.

Format per feature: **ID / Status / Depends on / Collides with / Parallel-safe /
Touches / Done when**, then **Context** and **Out of scope**.

- **Status:** `todo | in-progress | done | blocked`
- **Depends on:** hard ordering — needs the other feature's output to exist.
- **Collides with:** shares a file with the named feature ⇒ must not run in the same
  batch, even without a real dependency.

---

## Build plan (DAG)

Collisions drive the schedule:

- `backend/data/alphabet_data.py` — shared by **F-002** and **F-004**
- `backend/server.py` — shared by **F-001** and **F-003**
- `frontend/src/App.js`, `frontend/src/pages/Home.jsx` — shared by **F-003** and **F-004**

That yields two collision-free batches (run each batch's items **in parallel**;
batches run in order):

```
Batch 1 (parallel):  F-002 (content restructure)   F-003 (user profiles)
Batch 2 (parallel):  F-001 (bot/DOS protection)    F-004 (writing/tracing mode)
```

Why this order: F-004 uses the alphabet grouping from F-002 and the routing/nav
from F-003, so it runs after both. F-001 edits `server.py` which F-003 also edits
(to register the profile router), so it runs after F-003. F-002 and F-003 share no
files; F-001 and F-004 share no files.

**Coordinator note — `docs/`:** every feature would otherwise edit `PRD.md` /
this backlog and collide. Subagents must **not** touch `docs/`. The coordinator
updates `docs/PRD.md` and flips statuses here after each batch.

---

## F-001: Bot / DDoS protection

- **Status:** todo
- **Depends on:** none
- **Collides with:** F-003 (`backend/server.py`)
- **Parallel-safe:** yes (pair with F-004)
- **Touches:** `backend/server.py`, `backend/requirements.txt`, `backend/config.py`, `docs/DEPLOYMENT.md`
- **Done when:** requests exceeding a per-IP limit to `/api/*` get HTTP 429 (verify
  with a burst of `curl`s against a locally running backend); `docs/DEPLOYMENT.md`
  documents the Cloudflare setup steps; existing tests still pass.

### Context
Research decision (do NOT re-research): use a **two-layer** approach.
1. **Cloudflare free tier (deployment/infra, no app code):** always-on L3/4 DDoS
   protection, **Bot Fight Mode** (Security → Settings), and the **one** free
   rate-limiting rule (10k requests/day quota) pointed at the most abusable path.
   This is the primary defense and costs nothing.
2. **App-level rate limiting (code):** add `slowapi` (Starlette/FastAPI limiter
   backed by an in-memory or Redis store) as defense-in-depth so protection holds
   even without Cloudflare in front. Apply a sane global default (e.g. 60/min per
   IP) plus a tighter limit on write endpoints (`/api/progress/update`,
   `/api/stats`, and the new profile write routes). Wire the limiter into
   `server.py` via middleware/exception handler; make limits configurable in
   `config.py`.
Document the Cloudflare click-path in `DEPLOYMENT.md` (enable Bot Fight Mode; add
a rate-limiting rule with action=Managed Challenge for `/api/*`).

### Out of scope
No paid Cloudflare features, no CAPTCHA UI in the frontend, no auth/login system,
no WAF custom rules beyond the one documented rate-limit rule. Do not touch
`docs/PRD.md` or this backlog.

---

## F-002: Content restructure (teaching order + numerals subheading)

- **Status:** todo
- **Depends on:** none
- **Collides with:** F-004 (`backend/data/alphabet_data.py`)
- **Parallel-safe:** yes (pair with F-003)
- **Touches:** `backend/data/alphabet_data.py`, `frontend/src/constants/categories.js`, `frontend/src/pages/LetterSelect.jsx`, `frontend/src/components/LetterGridItem.jsx` (read-only likely)
- **Done when:** the letter-selection grid renders letters grouped under section
  **subheadings** in pedagogical order, with **Numbers** as its own clearly
  separated section; `len(PUNJABI_ALPHABET)` is unchanged (still 70) and the
  backend `test_alphabet_app.py` / `test_refactored_backend.py` count assertions
  still pass; verify visually against a running frontend.

### Context
Research decision (do NOT re-research): Gurmukhi is taught in this order —
(1) the 3 **vowel carriers** (ੳ ਅ ੲ), (2) the **35 consonants** grouped in rows of
five by place of articulation (the traditional varnmala rows), (3) **independent
vowels + matras** (best taught by running all matras against one familiar consonant
like ਮ), then (4) **numerals 0–9** as a distinct group. The current grid uses flat
category filter tabs with no visual grouping; numerals are just another tab.
Restructure so the selection screen presents ordered, labelled **sections** (with
subheadings) rather than one undifferentiated grid — and definitively split the
numerals under their own subheading as the user requested. Prefer expressing group
/ ordering metadata in `alphabet_data.py` (e.g. a `group` or `row` field) so the
frontend renders sections from data rather than hardcoding.

### Out of scope
Do NOT add or remove any letters/numbers (count stays 70). Do not change study/
flashcard logic, audio, or the SR algorithm. Keep the existing category-filter
behavior working. Do not touch `docs/PRD.md` or this backlog.

---

## F-003: User profiles (5 selectable, avatars, settings, persistence)

- **Status:** todo
- **Depends on:** none
- **Collides with:** F-001 (`backend/server.py`), F-004 (`frontend/src/App.js`, `frontend/src/pages/Home.jsx`)
- **Parallel-safe:** yes (pair with F-002)
- **Touches:** `backend/server.py`, `backend/models/`, `backend/repositories/progress_repository.py`, `backend/repositories/stats_repository.py`, `backend/services/progress_service.py`, `backend/services/stats_service.py`, `backend/routes/` (progress, stats, streak + new profile router), new `backend/repositories/profile_repository.py` / `services/profile_service.py` / `routes/profile_router.py`, `frontend/src/App.js`, `frontend/src/pages/Home.jsx`, `frontend/src/context/ProgressContext.jsx`, new `frontend/src/context/ProfileContext.jsx`, new `frontend/src/pages/ProfileSelect.jsx` + `Settings.jsx`
- **Done when:** user can pick one of 5 profiles (each an avatar + name) on first
  visit; the choice persists in `localStorage` so returning users skip selection;
  all progress/stats/streak reads+writes are scoped by `profile_id`; a Settings
  page lets the user edit a profile's avatar/name and reset a single profile's
  stats/progress. Verify end-to-end against a running stack: two profiles have
  independent progress; reload keeps the active profile; reset clears only that
  profile.

### Context
The app currently has **no user concept** — `progress`, `user_stats`, and streak
documents are global (see `progress_repository.py`: `find({})` with no owner).
Introduce a `profile_id` dimension end-to-end:
- **Backend:** a `profiles` collection (id, name, avatar) seeded/creatable up to 5;
  add `profile_id` to progress/stats/streak documents and filter every query by it;
  new profile CRUD routes; reset-by-profile. Pass `profile_id` from the client
  (header like `X-Profile-Id`, or path/query param — pick one and be consistent).
- **Frontend:** a `ProfileContext` holding the active profile (persisted to
  `localStorage`, mirroring `SettingsContext`'s pattern); a `ProfileSelect` page
  shown when no profile is chosen; a `Settings` page (the PRD references `/settings`
  but it's currently only a modal) for editing/resetting profiles; send the active
  `profile_id` on every API call in `ProgressContext` (and stats hooks).
Avatars: a small configurable set (emoji or preset images) is fine — "configurable"
means the user can change which avatar a profile uses, not upload arbitrary files.

### Out of scope
No passwords/real auth — profiles are a local convenience selector, not security.
No cloud sync / multi-device. Do not touch `backend/data/alphabet_data.py`,
`LetterSelect.jsx`, `constants/`, or the tracing feature. Do not touch `docs/PRD.md`
or this backlog. (Note: this feature reshapes the progress/stats API — F-001's
rate-limiter, added afterward in Batch 2, should cover the new write routes.)

---

## F-004: Writing / tracing mode

- **Status:** todo
- **Depends on:** F-002 (uses restructured alphabet grouping), F-003 (uses routing + nav shell)
- **Collides with:** F-002 (`backend/data/alphabet_data.py`, if metadata added), F-003 (`frontend/src/App.js`, `frontend/src/pages/Home.jsx`)
- **Parallel-safe:** yes (pair with F-001)
- **Touches:** `frontend/src/App.js`, `frontend/src/pages/Home.jsx`, `frontend/src/constants/modes.js`, new `frontend/src/pages/Tracing.jsx` (+ a canvas component/hook), `frontend/public/` or `frontend/src/` for bundled Gurmukhi fonts, possibly `backend/data/alphabet_data.py` (only if per-letter variation metadata is needed)
- **Done when:** a new Writing mode is reachable from Home; it offers **two
  sub-modes** — (a) **trace** over a dotted/outlined guide, (b) **free draw** with
  no hint; the user can draw with pointer/touch, **reveal** the correct letter, and
  see **3 visual variations** of each letter (rendered in 3 distinct Gurmukhi fonts,
  including a handwriting-style face, to reflect real-world/handwritten variation).
  Verify on a running frontend with both mouse and touch emulation: dotted guide
  shows in trace mode and is absent in free mode; reveal shows all 3 variants.

### Context
No writing/tracing exists today; modes live in `frontend/src/constants/modes.js`
and are launched from `Home.jsx` → `LetterSelect` → `Study`. Add Writing as a
peer mode. Rendering approach: draw the target glyph on an HTML canvas (pointer
events for the user's strokes); for the **dotted guide**, render the glyph as an
outlined/low-opacity layer under the drawing surface. For the **3 variations**,
bundle three Gurmukhi web fonts (e.g. a clean sans like Noto Sans Gurmukhi, a
traditional face, and a handwriting/joined face) and render the same Unicode char
in each — this covers the "different fonts/apps / handwritten" requirement without
needing per-letter image assets. The **reveal** shows the intended glyph (all three
variants) overlaid or beside the user's drawing.

### Out of scope
No stroke-order scoring / handwriting recognition / ML grading — reveal is manual,
user self-assesses (matching the app's existing swipe-right/wrong pattern if wired
to progress at all). No backend audio changes. Keep it a frontend-only feature
unless variation metadata genuinely requires an `alphabet_data.py` field. Do not
touch `docs/PRD.md` or this backlog.

---

## Done

_(nothing yet)_
