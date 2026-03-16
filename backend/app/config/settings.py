from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    APP_NAME: str = "StoryPixie AI"
    PORT: int = 8000
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    GEMINI_API_KEY: str
    GEMINI_MODEL_NAME: str = "models/gemini-2.5-flash"
    TTS_MODEL_NAME: str = "models/gemini-2.5-flash-preview-tts"
    TTS_VOICE_FEMALE: str = "en-US-Female"
    TTS_VOICE_MALE: str = "en-US-Male"
    TTS_DEFAULT_VOICE: str = "female"
    TTS_AUDIO_FORMAT: str = "mp3"

    IMAGE_MODEL_NAME: str = "models/imagen-4.0-fast-generate-001"
    ENABLE_IMAGE_GENERATION: bool = False
    IMAGE_PLACEHOLDER_PATH: str = "/images/image-pending.svg"
    IMAGE_STYLE: str = "3D animated movie style, cinematic lighting"
    SCENE_COUNT: int = 3

  FRONTEND_URL: str = "http://localhost:3000"
PRODUCTION_FRONTEND_URL: str | None = "https://story-pixie.vercel.app"
CORS_ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,https://story-pixie.vercel.app"
    FIREBASE_STORAGE_BUCKET: str | None = None
    FIREBASE_CREDENTIALS_PATH: str | None = None
    FIREBASE_CREDENTIALS_JSON: str | None = None

    STORY_RATE_LIMIT_PER_MINUTE: int = 5
    TTS_RATE_LIMIT_PER_MINUTE: int = 20
    VIDEO_RATE_LIMIT_PER_MINUTE: int = 2
    RATE_LIMIT_WINDOW_SECONDS: int = 60

    MAX_PROMPT_LENGTH: int = 2000
    MAX_TTS_TEXT_LENGTH: int = 5000
    MAX_IMAGE_STYLE_LENGTH: int = 200

    FFMPEG_BINARY: str = "ffmpeg"

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_allowed_origins(self) -> list[str]:
        parsed = [origin.strip() for origin in self.CORS_ALLOWED_ORIGINS.split(",") if origin.strip()]
        if self.PRODUCTION_FRONTEND_URL and self.PRODUCTION_FRONTEND_URL not in parsed:
            parsed.append(self.PRODUCTION_FRONTEND_URL)
        if self.FRONTEND_URL and self.FRONTEND_URL not in parsed:
            parsed.append(self.FRONTEND_URL)
        return parsed

    @property
    def firebase_credentials_resolved_path(self) -> Path | None:
        if not self.FIREBASE_CREDENTIALS_PATH:
            return None
        path = Path(self.FIREBASE_CREDENTIALS_PATH)
        if not path.is_absolute():
            path = BASE_DIR / path
        return path


settings = Settings()
