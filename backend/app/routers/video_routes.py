from fastapi import APIRouter, Depends, HTTPException

from app.config.settings import settings
from app.core.rate_limiter import rate_limit
from app.models.story_models import VideoGenerationRequest
from app.services.video_service import generate_story_video

router = APIRouter()

@router.post("/generate-video")
async def generate_video(
    payload: VideoGenerationRequest,
    _user=Depends(rate_limit(settings.VIDEO_RATE_LIMIT_PER_MINUTE)),
):
    video_path = await generate_story_video(payload.story.model_dump())
    if not video_path:
        raise HTTPException(status_code=500, detail="Failed to generate story video.")

    return {"video": video_path}
