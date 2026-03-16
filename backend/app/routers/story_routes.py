from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from app.models.story_models import CancelGenerationRequest, StoryRequest, TTSRequest, TTSResponse
from app.core.auth import require_authenticated_user
from app.core.cancellation import GenerationCancelled
from app.core.generation_registry import cancel_generation
from app.core.logger import logger
from app.core.rate_limiter import rate_limit
from app.config.settings import settings
from app.services.story_service import generate_complete_story
from app.services.tts_service import generate_speech

router = APIRouter()

@router.post("/generate-story")
async def generate_story(
    request: Request,
    payload: StoryRequest,
    _user=Depends(rate_limit(settings.STORY_RATE_LIMIT_PER_MINUTE)),
):
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


@router.post("/cancel-generation")
async def cancel_story_generation(
    payload: CancelGenerationRequest,
    _user=Depends(require_authenticated_user),
):
    cancel_generation(payload.generation_id)
    return {"status": "cancelled", "generation_id": payload.generation_id}


async def _generate_tts_response(payload: TTSRequest):
    text = (payload.text or "").strip()
    voice = (payload.voice or "female").strip() or "female"

    logger.info(
        "TTS request received: voice=%s text_length=%s",
        voice,
        len(text),
    )

    try:
        if not text:
            raise ValueError("TTS request text is empty")

        result = await generate_speech(text, voice)

        if not result or "audio" not in result or not result["audio"]:
            raise ValueError("No audio returned from TTS")

        audio_payload = result["audio"]
        if not isinstance(audio_payload, str) or not audio_payload.startswith("data:"):
            raise ValueError("TTS returned an invalid audio payload")

        audio_size = len(audio_payload.split(",", 1)[1]) if "," in audio_payload else len(audio_payload)
        logger.info(
            "TTS response ready: voice=%s mime_type=%s audio_payload_size=%s",
            voice,
            result.get("mime_type", "audio/wav"),
            audio_size,
        )

        return {
            "audio": audio_payload,
            "mime_type": result.get("mime_type", "audio/wav"),
        }
    except Exception as error:
        logger.error(f"TTS API failed: {error}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to generate speech audio",
        ) from error


@router.post("/tts", response_model=TTSResponse)
async def generate_tts(
    payload: TTSRequest,
    _user=Depends(rate_limit(settings.TTS_RATE_LIMIT_PER_MINUTE)),
):
    return await _generate_tts_response(payload)


@router.post("/api/tts", response_model=TTSResponse)
async def generate_tts_api(
    payload: TTSRequest,
    _user=Depends(rate_limit(settings.TTS_RATE_LIMIT_PER_MINUTE)),
):
    return await _generate_tts_response(payload)
