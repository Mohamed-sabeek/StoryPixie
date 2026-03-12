from fastapi import APIRouter, HTTPException
from app.models.story_models import StoryRequest, StoryResponse
from app.services.story_service import story_service
from app.core.logger import logger

router = APIRouter(prefix="/api", tags=["Story"])

@router.post("/story/generate", response_model=StoryResponse)
async def generate_story(request: StoryRequest):
    if not request.prompt.strip():
        logger.warning("Received empty prompt for story generation")
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
        
    try:
        story = await story_service.generate_complete_story(request.prompt)
        return story
    except Exception as e:
        logger.error(f"Error in generate_story endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
