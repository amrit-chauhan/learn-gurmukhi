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

## Notes

- **MongoDB**: use MongoDB Atlas (free M0 cluster). Connection string format:
  `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority`
- **Audio files**: 54 human recordings + 70 AI-generated clips (~2 MB total)
  are bundled with the backend deployment and served directly as static
  files — no extra CDN setup required, and no external API calls at runtime.
- If a new letter is added in the future without a cached audio file, `GET
  /api/tts/{letter_id}` will return a 404 for that letter until an audio file
  is added to `backend/data/audio/human/` or `backend/data/audio/ai_cache/`.
