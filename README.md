# Learn Gurmukhi

A mobile-optimized flashcard app for learning the Punjabi (Gurmukhi) alphabet — pick which letters to study, quiz yourself in either direction (letter → sound or sound → letter), and track mastery over time with a spaced-repetition algorithm, streaks, and a stats dashboard.

## Stack

- **Frontend**: React (Create React App + CRACO), Tailwind CSS, shadcn/ui, framer-motion, Recharts
- **Backend**: FastAPI, Motor (async MongoDB driver)
- **Database**: MongoDB

## Project Structure

```
backend/    FastAPI app (routes/services/repositories layers) + static audio files
frontend/   React app (pages/components/hooks)
docs/       Product requirements & design reference docs
```

See `docs/PRD.md` for the full architecture breakdown and feature history.

## Running locally

### Backend

```bash
cd backend
pip install -r requirements.txt
# Create backend/.env with MONGO_URL, DB_NAME, CORS_ORIGINS
uvicorn server:app --reload --port 8001
```

### Frontend

```bash
cd frontend
yarn install
# Create frontend/.env with REACT_APP_BACKEND_URL=http://localhost:8001
yarn start
```

## Tests

```bash
cd backend
pytest tests/
```

Note: most tests under `backend/tests/` are integration tests that hit a running server via `REACT_APP_BACKEND_URL` rather than using FastAPI's `TestClient` — start the backend first.

## Deployment

See `DEPLOYMENT.md` for Vercel deployment instructions.
