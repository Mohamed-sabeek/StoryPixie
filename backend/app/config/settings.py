from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    GEMINI_API_KEY: str
    GEMINI_MODEL_NAME: str = "models/gemini-2.0-flash"
    TTS_MODEL_NAME: str = "models/gemini-2.5-flash-preview-tts"
    TTS_VOICE_FEMALE: str = "en-US-Female"
    TTS_VOICE_MALE: str = "en-US-Male"
    TTS_DEFAULT_VOICE: str = "female"
    TTS_AUDIO_FORMAT: str = "mp3"
    IMAGE_MODEL_NAME: str = "models/imagen-4.0-fast-generate-001"
    ENABLE_IMAGE_GENERATION: bool = False
    IMAGE_PLACEHOLDER_PATH: str = "/images/image-pending.svg"
    SCENE_COUNT: int = 3
    IMAGE_STYLE: str = "3D animated movie style, cinematic lighting"
    PORT: int = 8000
    APP_NAME: str = "StoryPixie AI"
    
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
