from app.utils.prompt_builder import build_story_prompt
from app.services.gemini_service import generate_story
from fastapi import HTTPException
from app.core.cancellation import GenerationCancelled
from app.core.logger import logger

async def _raise_if_cancelled(disconnect_checker=None):
    if disconnect_checker and await disconnect_checker():
        logger.info("Story generation cancelled by disconnected client.")
        raise GenerationCancelled()


async def generate_complete_story(request, disconnect_checker=None):
    try:
        await _raise_if_cancelled(disconnect_checker)

        # Get scene count safely
        scene_count = getattr(request, "scene_count", 3)

        # Enforce supported scene count values for strong consistency
        if scene_count not in (3, 5, 7, 10):
            raise HTTPException(
                status_code=400,
                detail="scene_count must be one of [3, 5, 7, 10]"
            )

        # Build AI prompt and preserve user prompt for response display
        ai_prompt = build_story_prompt(
            request.prompt,
            request.genre,
            scene_count,
            request.length,
            request.image_style,
            request.voice,
            request.mood
        )

        print("[Story Service] Prompt built successfully")
        await _raise_if_cancelled(disconnect_checker)

        # Call Gemini service with separate user prompt and structurally compliant AI instructions
        story = await generate_story(
            user_prompt=request.prompt,
            ai_prompt=ai_prompt,
            image_style_prompt=request.image_style,
            scene_count=scene_count,
            disconnect_checker=disconnect_checker
        )

        if not story:
            raise HTTPException(
                status_code=500,
                detail="Gemini returned an empty response"
            )

        print("[Story Service] Story generated successfully")

        return story

    except GenerationCancelled:
        raise
    except Exception as e:
        print("[Story Service] Error generating story:", str(e))

        raise HTTPException(
            status_code=500,
            detail=f"Story generation failed: {str(e)}"
        )
