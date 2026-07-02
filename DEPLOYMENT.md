# ──────────────────────────────────────────────────────────────
#  Deploying to Vercel — Step-by-Step Guide
# ──────────────────────────────────────────────────────────────
#
# This is a full-stack app (React frontend + FastAPI backend).
# Deploy as TWO separate Vercel projects:
#
# ┌─────────────────────────────────────────────────────────────┐
# │  PROJECT 1 — Backend (FastAPI)                              │
# └─────────────────────────────────────────────────────────────┘
#
# 1. Create a new Vercel project.
# 2. Set the Root Directory to:  backend/
# 3. Framework Preset:           Other
# 4. Build & Output Settings:    leave as auto-detect
# 5. Set these Environment Variables in the Vercel dashboard:
#
#    MONGO_URL          <your MongoDB Atlas connection string>
#                       e.g. mongodb+srv://user:pass@cluster.mongodb.net/punjabi
#    DB_NAME            punjabi_alphabet
#    CORS_ORIGINS       https://your-frontend.vercel.app
#    EMERGENT_LLM_KEY   <your Emergent AI key>
#
# 6. Deploy → note the deployment URL (e.g. https://punjabi-api.vercel.app)
#
# ──────────────────────────────────────────────────────────────
#
# ┌─────────────────────────────────────────────────────────────┐
# │  PROJECT 2 — Frontend (React)                               │
# └─────────────────────────────────────────────────────────────┘
#
# 1. Create a new Vercel project.
# 2. Set the Root Directory to:  frontend/
# 3. Framework Preset:           Create React App
# 4. Build Command:              yarn build
# 5. Output Directory:           build
# 6. Set this Environment Variable:
#
#    REACT_APP_BACKEND_URL   https://punjabi-api.vercel.app
#                            (the backend URL from Project 1)
#
# 7. Deploy → your app is live!
#
# ──────────────────────────────────────────────────────────────
#
# NOTES:
#
# • MongoDB: use MongoDB Atlas (free M0 cluster).
#   Connection string format:
#   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
#
# • Audio files: 54 human recordings + 70 AI-generated clips are bundled
#   with the backend deployment (~2 MB total). They're served directly
#   from the serverless function — no extra CDN setup required.
#
# • AI TTS: If a new letter is added in the future, the AI audio will be
#   generated on first request (not cached to disk on Vercel's read-only
#   filesystem), but it will still work correctly.
#
# • emergentintegrations library: installed from a custom PyPI index
#   configured in backend/pip.conf — Vercel reads this automatically.
#
# ──────────────────────────────────────────────────────────────
