from fastapi import APIRouter
from app.models.story_models import HealthResponse

router = APIRouter(prefix="/api", tags=["Health"])

@router.get("/health", response_model=HealthResponse)
async def health_check():
    return {"status": "backend running"}
