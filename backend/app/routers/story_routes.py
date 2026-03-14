from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from app.models.story_models import StoryRequest
from app.core.cancellation import GenerationCancelled
from app.services.story_service import generate_complete_story

router = APIRouter()

@router.post("/generate-story")
async def generate_story(request: Request, payload: StoryRequest):
    try:
        return await generate_complete_story(
            payload,
            disconnect_checker=request.is_disconnected
        )
    except GenerationCancelled:
        return JSONResponse(
            status_code=499,
            content={"detail": "Story generation cancelled by client."}
        )
