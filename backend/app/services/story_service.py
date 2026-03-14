from app.utils.prompt_builder import build_story_prompt
from app.services.gemini_service import generate_story
from fastapi import HTTPException


async def generate_complete_story(request):
    try:
        # Build AI prompt
        prompt = build_story_prompt(
            request.prompt,
            request.genre,
            request.scenes,
            request.length,
            request.image_style,
            request.voice,
            request.mood
        )

        print("[Story Service] Prompt built successfully")

        # Call Gemini service
        story = await generate_story(prompt, image_style_prompt=request.image_style)

        if not story:
            raise HTTPException(
                status_code=500,
                detail="Gemini returned an empty response"
            )

        print("[Story Service] Story generated successfully")

        return story

    except Exception as e:
        print("[Story Service] Error generating story:", str(e))

        raise HTTPException(
            status_code=500,
            detail=f"Story generation failed: {str(e)}"
        )