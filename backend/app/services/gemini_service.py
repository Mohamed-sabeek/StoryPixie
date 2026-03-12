from google import genai
from google.genai import types, errors
import json
import asyncio
from app.config.settings import settings
from app.utils.prompt_builder import PromptBuilder
from app.models.story_models import StoryResponse
from app.core.logger import logger

class GeminiService:
    def __init__(self):
        if not settings.GEMINI_API_KEY:
            logger.error("GEMINI_API_KEY is not set in environment variables")
        
        # New SDK Client initialization
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model_name = settings.GEMINI_MODEL_NAME

    async def generate_story(self, user_prompt: str) -> StoryResponse:
        logger.info(f"Generating story for prompt: {user_prompt[:50]} (Model: {self.model_name})")
        full_prompt = PromptBuilder.build_story_prompt(user_prompt)
        
        try:
            # CRITICAL: Use client.aio for true async support in the new SDK
            response = await self.client.aio.models.generate_content(
                model=self.model_name,
                contents=full_prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            
            if not response.text:
                logger.error("Empty response received from Gemini")
                raise ValueError("Empty response from Gemini")
                
            story_data = json.loads(response.text)
            logger.info("Successfully generated story from Gemini")
            return StoryResponse(**story_data)
            
        except errors.ClientError as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                logger.warning(f"Rate limit hit for model {self.model_name}.")
                raise Exception(
                    f"Gemini API rate limit hit. You've exceeded the free tier quota for {self.model_name}. "
                    "Please wait a minute and try again."
                )
            if "404" in str(e):
                logger.error(f"Model {self.model_name} not found (404).")
                raise Exception(f"Gemini model {self.model_name} not found. Please check settings.py.")
            logger.error(f"Gemini Client Error: {str(e)}")
            raise e
        except Exception as e:
            logger.error(f"Unexpected Error in GeminiService: {str(e)}")
            raise Exception(f"Failed to generate story with Gemini: {str(e)}")

gemini_service = GeminiService()
