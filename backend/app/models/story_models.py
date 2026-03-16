from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class StoryRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    prompt: str = Field(..., min_length=1, max_length=2000, example="A dragon protecting a lost kingdom")
    generation_id: Optional[str] = Field(default=None, max_length=128)
    genre: str = Field(..., min_length=1, max_length=50)
    scene_count: Literal[3, 5, 7, 10] = 3
    length: str = Field(..., min_length=1, max_length=20)
    image_style: str = Field(..., min_length=1, max_length=200)
    voice: Literal["male", "female"]
    mood: str = Field(..., min_length=1, max_length=50)


class CancelGenerationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    generation_id: str = Field(..., min_length=1, max_length=128)


class TTSRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    text: str = Field(..., min_length=1, max_length=5000)
    voice: Literal["male", "female"] = "female"


class TTSResponse(BaseModel):
    audio: str
    mime_type: str
    storage_url: Optional[str] = None


class Scene(BaseModel):
    scene_number: int
    text: str
    image: Optional[str] = None
    image_url: Optional[str] = None
    audio: Optional[str] = None
    audio_url: Optional[str] = None
    title: Optional[str] = None
    narration: Optional[str] = None


class StoryResponse(BaseModel):
    title: str
    story_text: Optional[str] = None
    scenes: List[Scene]
    prompt: Optional[str] = None
    video: Optional[str] = None


class VideoGenerationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    story: StoryResponse


class HealthResponse(BaseModel):
    status: str
