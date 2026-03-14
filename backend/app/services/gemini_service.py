from google import genai
from app.config.settings import settings
from app.services.image_service import generate_scene_image
from app.core.cancellation import GenerationCancelled
from app.core.logger import logger
import re

client = genai.Client(api_key=settings.GEMINI_API_KEY)


async def _raise_if_cancelled(disconnect_checker=None):
    if disconnect_checker and await disconnect_checker():
        logger.info("Stopping generation after client disconnect.")
        raise GenerationCancelled()


def _parse_story_text(raw_text: str, fallback_title: str, scene_count: int):
    text = (raw_text or "").strip()
    if not text:
        return fallback_title, []

    title_match = re.search(r"^\s*Title:\s*(.+)$", text, flags=re.IGNORECASE | re.MULTILINE)
    title = title_match.group(1).strip() if title_match else fallback_title

    scene_pattern = re.compile(
        r"Scene\s+(\d+)\s*[-–]\s*(.+?)\n(.*?)(?=\n\s*Scene\s+\d+\s*[-–]|\Z)",
        flags=re.IGNORECASE | re.DOTALL,
    )
    matches = scene_pattern.findall(text)

    scenes = []
    for scene_number_text, scene_title, narration in matches:
        scene_number = int(scene_number_text)
        cleaned_narration = re.sub(r"\s+", " ", narration).strip()
        scenes.append(
            {
                "scene_number": scene_number,
                "title": scene_title.strip(),
                "narration": cleaned_narration,
                "text": cleaned_narration,
            }
        )

    scenes = [scene for scene in scenes if 1 <= scene["scene_number"] <= scene_count]
    scenes.sort(key=lambda scene: scene["scene_number"])
    return title, scenes

async def generate_story(user_prompt: str, ai_prompt: str = None, image_style_prompt: str = None, scene_count: int = 3, disconnect_checker=None):
    try:
        await _raise_if_cancelled(disconnect_checker)

        # 1. Generate a cinematic title from the raw user prompt
        title_prompt = f"Based on this story idea: '{user_prompt}', generate a short, cinematic, catchy story title (under 8 words). Return ONLY the title text."
        title_response = client.models.generate_content(
            model=settings.GEMINI_MODEL_NAME,
            contents=title_prompt
        )
        display_title = title_response.text.strip().replace('"', '').replace('*', '')
        if not display_title:
            display_title = "Shadows Beyond the Final Wall"

        # 2. Generate story text with a structured arc and exact scene count
        story_instructions = ai_prompt or f"""
You are a story generator for the StoryPixie app.

User prompt: {user_prompt}

Write a complete story that stays faithful to the user's prompt topic with exactly {scene_count} scenes.
Do not introduce fantasy elements unless the prompt asks for them.
Return plain text in this exact structure:
Title: <story title>

Scene 1 - <short scene title>
<scene narration>

Continue until Scene {scene_count}. Do not return JSON.
"""

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL_NAME,
            contents=story_instructions
        )
        await _raise_if_cancelled(disconnect_checker)

        text = response.text.strip()
        parsed_title, parsed_scenes = _parse_story_text(text, display_title, scene_count)

        # Fallback for malformed model output: preserve non-empty paragraphs as scene text.
        if len(parsed_scenes) != scene_count:
            paragraphs = [p.strip() for p in re.split(r"\n\s*\n+", text) if p.strip()]
            paragraphs = [
                paragraph for paragraph in paragraphs
                if not re.match(r"^\s*Title:\s*", paragraph, flags=re.IGNORECASE)
            ]

            parsed_scenes = []
            for index, paragraph in enumerate(paragraphs[:scene_count], start=1):
                cleaned_text = re.sub(r"\s+", " ", paragraph).strip()
                cleaned_text = re.sub(
                    r"^\s*Scene\s+\d+\s*[-–]\s*",
                    "",
                    cleaned_text,
                    flags=re.IGNORECASE,
                )
                parsed_scenes.append(
                    {
                        "scene_number": index,
                        "title": f"Scene {index}",
                        "narration": cleaned_text,
                        "text": cleaned_text,
                    }
                )

        while len(parsed_scenes) < scene_count:
            next_scene = len(parsed_scenes) + 1
            filler_text = (
                "The journey closes with a clear and satisfying resolution."
                if next_scene == scene_count
                else "The adventure pushes forward into the next cinematic beat."
            )
            parsed_scenes.append(
                {
                    "scene_number": next_scene,
                    "title": f"Scene {next_scene}",
                    "narration": filler_text,
                    "text": filler_text,
                }
            )

        parsed_scenes = parsed_scenes[:scene_count]
        style = image_style_prompt or settings.IMAGE_STYLE
        full_story_text = "\n\n".join(scene["text"] for scene in parsed_scenes)

        scenes = []
        for scene in parsed_scenes:
            await _raise_if_cancelled(disconnect_checker)
            image_prompt = f"{scene['text']}, in a {style} style, highly detailed cinematic artwork"
            image_data = generate_scene_image(image_prompt) or {}
            scenes.append({
                "scene_number": scene["scene_number"],
                "title": scene["title"],
                "narration": scene["narration"],
                "text": scene["text"],
                "image": image_data.get("inline_data"),
                "image_url": image_data.get("storage_url")
            })

        return {
            "title": parsed_title or display_title,
            "story_text": full_story_text,
            "scenes": scenes,
            "prompt": user_prompt
        }

    except GenerationCancelled:
        raise
    except Exception as e:
        return {
            "title": "A StoryPixie Tale",
            "story_text": "",
            "scenes": [
                {
                    "scene_number": 1,
                    "title": "Error",
                    "narration": f"Error generating story: {str(e)}",
                    "text": f"Error generating story: {str(e)}",
                    "image": None
                }
            ],
            "prompt": user_prompt,
            "error": str(e)
        }
