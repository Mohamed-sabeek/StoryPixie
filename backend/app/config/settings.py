from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

# Get the directory where settings.py is located, then go up to backend/
BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    GEMINI_API_KEY: str
    GEMINI_MODEL_NAME: str = "gemini-flash-latest"
    PORT: int = 8000
    APP_NAME: str = "StoryPixie AI"
    
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
