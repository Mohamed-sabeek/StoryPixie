from pydantic import BaseModel, Field
from typing import List

class StoryRequest(BaseModel):
    prompt: str = Field(..., example="A dragon protecting a lost kingdom")
    genre: str
    scenes: int
    length: str
    image_style: str
    voice: str
    mood: str

class Scene(BaseModel):
    scene_number: int
    title: str
    narration: str
    image_prompt: str

class StoryResponse(BaseModel):
    title: str
    scenes: List[Scene]

class HealthResponse(BaseModel):
    status: str
