# StoryPixie Backend

Production-ready FastAPI backend for a Multimodal AI Storytelling Agent.

## Setup Instructions

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   - Open `.env` and replace `your_gemini_api_key_here` with your actual Google Gemini API Key.
   - You can get a key from [Google AI Studio](https://aistudio.google.com/).

4. **Run the server:**
   ```bash
   python -m app.main
   ```
   Or using uvicorn directly:
   ```bash
   uvicorn app.main:app --reload
   ```

## API Documentation

- **Interactive API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check:** `GET /api/health`
- **Generate Story:** `POST /api/story/generate`
  - Body: `{ "prompt": "..." }`

## Project Structure

- `app/main.py`: Entry point with global exception middleware.
- `app/routers/`:
    - `health_routes.py`: Health check endpoints.
    - `story_routes.py`: Story generation endpoints.
- `app/services/`:
    - `story_service.py`: Orchestration layer for the multimodal pipeline.
    - `gemini_service.py`: Direct integration with Google Gemini Pro.
    - `image_service.py`: Placeholder for future image generation.
    - `voice_service.py`: Placeholder for future TTS generation.
- `app/models/`: Pydantic data validation schemas.
- `app/core/`:
    - `logger.py`: Structured application logging.
- `app/config/`: Robust settings management.
- `app/utils/`: Specialized prompt engineering.
