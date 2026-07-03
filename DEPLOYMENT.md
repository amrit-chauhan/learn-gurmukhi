# Deploying to Vercel

This is a full-stack app (React frontend + FastAPI backend). The recommended
setup is a **single Vercel project** serving both from one domain, configured by
the root [`vercel.json`](./vercel.json). Auto-deploy on every GitHub push is
Vercel's default once the repo is connected.

## Single project (recommended)

The root `vercel.json` builds both services and routes between them:
- `frontend/` → built with `@vercel/static-build` (`craco build` → `build/`),
  served as the site.
- `backend/server.py` → deployed as a `@vercel/python` serverless function.
- `/api/*` is routed to the Python function; everything else falls back to the
  SPA's `index.html`. Static files (JS/CSS/fonts) are served directly.

Because both run on the same domain, the frontend calls the backend at the
relative path `/api` — so `REACT_APP_BACKEND_URL` is pinned to an empty string in
`vercel.json`'s build env, and you do **not** need to set it yourself.

### Steps

1. **MongoDB Atlas** — create a free M0 cluster, copy the connection string.
2. **Import the repo** into Vercel as a new project. Leave the Root Directory at
   the repo root (do **not** point it at `frontend/` or `backend/` — the root
   `vercel.json` drives the build).
3. Set these **environment variables** on the project (used by the backend
   function at runtime):

   | Variable       | Value                                                          |
   |----------------|-----------------------------------------------------------------|
   | `MONGO_URL`    | Your Atlas connection string, e.g. `mongodb+srv://user:pass@cluster.mongodb.net/` |
   | `DB_NAME`      | `punjabi_alphabet`                                              |
   | `CORS_ORIGINS` | Optional — same-origin needs no CORS; leave default `*` or set your domain |
   | `RATE_LIMIT_*` | Optional — override the F-001 rate limits (see below)          |

4. **Deploy.** The app is live on one URL; the API is under `/<url>/api`.
5. **Auto-deploy:** with the repo connected, every push to the production branch
   redeploys automatically — no further setup.

> **Note — audio in serverless:** the backend serves pre-generated mp3s from
> `backend/data/audio/`. `vercel.json` bundles them into the function via
> `includeFiles: "data/**"` so `/api/tts/{id}` works. If audio 404s after deploy,
> check that glob against the build logs.

## Alternative: two separate projects

If you'd rather split them (e.g. to scale independently), each subdirectory still
has its own `backend/vercel.json` and `frontend/vercel.json`. Deploy `backend/`
(Root Directory `backend/`, env `MONGO_URL` + `DB_NAME` + `CORS_ORIGINS`) and
`frontend/` (Root Directory `frontend/`, Preset **Create React App**, env
`REACT_APP_BACKEND_URL` = the backend URL) as two projects. The root
`vercel.json` is ignored when a project's Root Directory is a subdirectory.

## Bot & DDoS protection

Protection is layered: **Cloudflare in front (primary)** + **app-level rate
limiting (defence-in-depth)**.

### 1. Cloudflare (free plan — primary defence, no code)

Put the frontend (and ideally the API) behind Cloudflare by using a custom domain
proxied through Cloudflare (orange-cloud the DNS records). Then, in the Cloudflare
dashboard:

1. **DDoS protection** — always on for every plan, including Free. Nothing to
   configure; L3/4 attacks are absorbed automatically.
2. **Bot Fight Mode** — Security → Settings (or Security → Bots) → enable
   **Bot Fight Mode**. It challenges known bot patterns on every request at no cost.
3. **Rate limiting rule** — the Free plan includes **one** rate-limiting rule.
   Point it at the most abusable path:
   - Security → WAF → **Rate limiting rules** → **Create rule**.
   - If matching **incoming requests** with URI Path *contains* `/api/`.
   - When rate exceeds e.g. **100 requests per 1 minute** per client IP.
   - Action: **Managed Challenge** (recommended for API/login) — use **Block**
     only for obviously malicious paths.

Recommended: use **Managed Challenge** rather than Block so real users hitting a
burst get a challenge instead of a hard failure.

### 2. App-level rate limiting (already in the code)

The FastAPI backend uses [`slowapi`](https://pypi.org/project/slowapi/) so
protection holds even without Cloudflare in front (e.g. if the API is reached
directly). Limits are **per client IP**:

- **Global default** — every route: `RATE_LIMIT_DEFAULT` (default `240/minute`).
- **Write endpoints** — stricter: `RATE_LIMIT_WRITE` (default `60/minute`) on
  `POST /api/progress/update`, `POST /api/progress/reset`, `POST /api/stats/update`,
  `POST /api/streak/checkin`, `POST /api/profiles`, `PATCH /api/profiles/{id}`,
  `POST /api/profiles/{id}/reset`.

Exceeding a limit returns **HTTP 429** with a JSON error body. Configure via
env vars in the backend Vercel project:

| Variable              | Default      | Purpose                                        |
|-----------------------|--------------|------------------------------------------------|
| `RATE_LIMIT_ENABLED`  | `true`       | Set `false` to disable (e.g. load testing).    |
| `RATE_LIMIT_DEFAULT`  | `240/minute` | Global per-IP limit on all routes.             |
| `RATE_LIMIT_WRITE`    | `60/minute`  | Tighter per-IP limit on mutation endpoints.    |

> **Note on serverless / multiple instances:** slowapi's default storage is
> in-memory, so counters are per-process. On Vercel's serverless functions each
> instance counts independently — the app-level limiter is a safety net, and
> Cloudflare (above) is the authoritative cross-instance limiter. For a single
> long-running backend (e.g. a container/VM), the in-memory limiter is accurate;
> point slowapi at Redis if you need shared counters across instances.

## Notes

- **MongoDB**: use MongoDB Atlas (free M0 cluster). Connection string format:
  `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority`
- **Audio files**: 54 human recordings + 70 AI-generated clips (~2 MB total)
  are bundled with the backend deployment and served directly as static
  files — no extra CDN setup required, and no external API calls at runtime.
- If a new letter is added in the future without a cached audio file, `GET
  /api/tts/{letter_id}` will return a 404 for that letter until an audio file
  is added to `backend/data/audio/human/` or `backend/data/audio/ai_cache/`.
