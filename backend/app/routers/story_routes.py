from fastapi import APIRouter
from app.models.story_models import StoryRequest
from app.services.story_service import generate_complete_story

router = APIRouter()

@router.post("/generate-story")
async def generate_story(request: StoryRequest):
    return await generate_complete_story(request)
