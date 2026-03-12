from app.services.gemini_service import gemini_service
from app.services.image_service import image_service
from app.services.voice_service import voice_service
from app.models.story_models import StoryResponse
from app.core.logger import logger

class StoryService:
    async def generate_complete_story(self, user_prompt: str) -> StoryResponse:
        logger.info(f"Starting complete story generation pipeline for: {user_prompt[:30]}")
        
        # 1. Generate core story using Gemini
        story = await gemini_service.generate_story(user_prompt)
        
        # 2. Process image prompts (placeholder for future AI generation)
        story.scenes = await image_service.prepare_image_prompts(story.scenes)
        
        # 3. Process narration text (placeholder for future TTS generation)
        story.scenes = await voice_service.prepare_narration_text(story.scenes)
        
        logger.info(f"Successfully completed story pipeline for '{story.title}'")
        return story

story_service = StoryService()
