from pydantic import BaseModel, Field
from typing import List, Optional

class StoryRequest(BaseModel):
    prompt: str = Field(..., example="A dragon protecting a lost kingdom")
    generation_id: Optional[str] = None
    genre: str
    scene_count: Optional[int] = 3
    length: str
    image_style: str
    voice: str
    mood: str


class CancelGenerationRequest(BaseModel):
    generation_id: str

class Scene(BaseModel):
    scene_number: int
    text: str
    image: str = None  # Base64 string or URL
    image_url: Optional[str] = None

class StoryResponse(BaseModel):
    title: str
    story_text: Optional[str] = None
    scenes: List[Scene]
    prompt: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
