from pydantic import BaseModel, Field
from typing import List

class StoryRequest(BaseModel):
    prompt: str = Field(..., example="A dragon protecting a lost kingdom")

class Scene(BaseModel):
    scene: int
    text: str
    imagePrompt: str
    narration: str

class StoryResponse(BaseModel):
    title: str
    scenes: List[Scene]

class HealthResponse(BaseModel):
    status: str
