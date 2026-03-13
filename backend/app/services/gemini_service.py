from google import genai
from app.config.settings import settings
import json

client = genai.Client(api_key=settings.GEMINI_API_KEY)

async def generate_story(prompt: str):
    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL_NAME,
            contents=prompt
        )

        text = response.text

        # Try to convert JSON story to plain text
        try:
            data = json.loads(text)

            title = data.get("title", "")
            scenes = data.get("scenes", [])

            story = title + "\n\n"

            for scene in scenes:
                story += scene["narration"] + "\n\n"

            text = story

        except:
            # If it's already text, keep it
            pass

        return {
            "title": "AI Story",
            "story_text": text
        }

    except Exception as e:
        return {
            "title": "AI Story",
            "story_text": f"Error generating story: {str(e)}"
        }