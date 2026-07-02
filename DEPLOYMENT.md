# Deploying to Vercel

This is a full-stack app (React frontend + FastAPI backend). Deploy as two
separate Vercel projects.

## Project 1 — Backend (FastAPI)

1. Create a new Vercel project.
2. Set the Root Directory to `backend/`.
3. Framework Preset: **Other**.
4. Build & Output Settings: leave as auto-detect.
5. Set these environment variables in the Vercel dashboard:

   | Variable       | Value                                                    |
   |----------------|-----------------------------------------------------------|
   | `MONGO_URL`    | Your MongoDB Atlas connection string, e.g. `mongodb+srv://user:pass@cluster.mongodb.net/punjabi` |
   | `DB_NAME`      | `punjabi_alphabet`                                        |
   | `CORS_ORIGINS` | `https://your-frontend.vercel.app`                        |

6. Deploy → note the deployment URL (e.g. `https://punjabi-api.vercel.app`).

## Project 2 — Frontend (React)

1. Create a new Vercel project.
2. Set the Root Directory to `frontend/`.
3. Framework Preset: **Create React App**.
4. Build Command: `yarn build`.
5. Output Directory: `build`.
6. Set this environment variable:

   | Variable                 | Value                                              |
   |---------------------------|----------------------------------------------------|
   | `REACT_APP_BACKEND_URL`  | The backend URL from Project 1                     |

7. Deploy → the app is live.

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
