import asyncio
from app.utils.prompt_builder import build_story_prompt
from app.services.gemini_service import generate_story
from app.services.tts_service import generate_speech
from fastapi import HTTPException
from app.core.cancellation import GenerationCancelled
from app.core.generation_registry import clear_generation, is_generation_cancelled
from app.core.logger import logger
from app.services.video_service import generate_story_video

async def _raise_if_cancelled(disconnect_checker=None, generation_id=None):
    if is_generation_cancelled(generation_id):
        logger.info(f"Story generation cancelled explicitly for generation_id={generation_id}.")
        raise GenerationCancelled()

    if disconnect_checker and await disconnect_checker():
        logger.info("Story generation cancelled by disconnected client.")
        raise GenerationCancelled()


async def generate_complete_story(request, disconnect_checker=None):
    try:
        generation_id = getattr(request, "generation_id", None)
        await _raise_if_cancelled(disconnect_checker, generation_id)

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

        logger.info("Prompt built successfully")
        await _raise_if_cancelled(disconnect_checker, generation_id)

        # Call Gemini service with separate user prompt and structurally compliant AI instructions
        story = await generate_story(
            user_prompt=request.prompt,
            ai_prompt=ai_prompt,
            image_style_prompt=request.image_style,
            scene_count=scene_count,
            disconnect_checker=disconnect_checker,
            generation_id=generation_id
        )

        if not story:
            raise HTTPException(
                status_code=500,
                detail="Gemini returned an empty response"
            )

        for i, scene in enumerate(story.get("scenes", [])):
            await _raise_if_cancelled(disconnect_checker, generation_id)
            narration = scene.get("narration") or scene.get("text")

            if not narration:
                scene["audio"] = None
                continue

            if i > 0:
                await asyncio.sleep(6)

            for attempt in range(3):
                try:
                    audio_result = await generate_speech(narration, request.voice)

                    if audio_result and "audio" in audio_result:
                        scene["audio"] = audio_result["audio"]
                        scene["audio_url"] = audio_result.get("storage_url")
                    else:
                        scene["audio"] = None
                        scene["audio_url"] = None
                    break
                except Exception as audio_error:
                    if attempt < 2 and "429" in str(audio_error):
                        wait = 10 * (attempt + 1)
                        logger.warning(f"TTS rate limited for scene {scene.get('scene_number')}, retrying in {wait}s")
                        await asyncio.sleep(wait)
                    else:
                        logger.error(
                            f"Failed to generate scene audio for scene {scene.get('scene_number')}: {audio_error}",
                            exc_info=True,
                        )
                        scene["audio"] = None
                        scene["audio_url"] = None
                        break

        audio_count = sum(1 for scene in story.get("scenes", []) if scene.get("audio"))
        total_scene_count = len(story.get("scenes", []))
        logger.info(
            f"Audio generation summary: {audio_count}/{total_scene_count} scenes contain audio"
        )

        video_path = await generate_story_video(story)
        story["video"] = video_path

        logger.info("Story generated successfully")

        return story

    except GenerationCancelled:
        raise
    except Exception as e:
        logger.error("Error generating story: %s", str(e), exc_info=True)

        raise HTTPException(
            status_code=500,
            detail=f"Story generation failed: {str(e)}"
        )
    finally:
        clear_generation(getattr(request, "generation_id", None))
