# StoryPixie Backend Deployment

## Environment variables

Use [`.env.example`](/d:/StoryPixie/backend/.env.example) as the template. Do not commit real secrets.

Required production variables:

- `GEMINI_API_KEY`
- `PRODUCTION_FRONTEND_URL`
- `CORS_ALLOWED_ORIGINS`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_CREDENTIALS_PATH` or `FIREBASE_CREDENTIALS_JSON`
- `FFMPEG_BINARY`

## Install dependencies

```bash
pip install -r requirements.txt
```

## Run locally

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Run in production

```bash
gunicorn -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
```

## Health check

```text
GET /api/health
```

## Production notes

- Restrict `CORS_ALLOWED_ORIGINS` to trusted frontend domains only.
- Rotate any previously exposed API keys before deployment.
- Install FFmpeg and ensure `ffmpeg -version` succeeds on the server.
- Firebase Auth tokens must be sent as `Authorization: Bearer <id_token>`.
- Store service account credentials outside the repository in the hosting environment.
