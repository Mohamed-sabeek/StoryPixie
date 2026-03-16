import asyncio
import base64
import html
import re
from google import genai
from app.config.settings import settings
from app.services.image_service import generate_scene_image
from app.core.cancellation import GenerationCancelled
from app.core.generation_registry import is_generation_cancelled
from app.core.logger import logger

client = genai.Client(api_key=settings.GEMINI_API_KEY)
INTER_SCENE_IMAGE_DELAY_SECONDS = 1.0


async def _raise_if_cancelled(disconnect_checker=None, generation_id=None):
    if is_generation_cancelled(generation_id):
        logger.info(f"Stopping generation for cancelled generation_id={generation_id}.")
        raise GenerationCancelled()

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


def _build_fallback_scene_image(scene_number: int, scene_title: str, scene_text: str):
    safe_title = html.escape(scene_title or f"Scene {scene_number}")
    safe_excerpt = html.escape((scene_text or "").strip()[:160])
    safe_scene_label = html.escape(f"Scene {scene_number}")

    svg = f"""
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="55%" stop-color="#1d4ed8" />
      <stop offset="100%" stop-color="#22d3ee" />
    </linearGradient>
    <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.20)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0.08)" />
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="48" fill="url(#bg)" />
  <circle cx="780" cy="250" r="180" fill="rgba(255,255,255,0.10)" />
  <circle cx="220" cy="180" r="110" fill="rgba(255,255,255,0.08)" />
  <rect x="92" y="120" width="840" height="784" rx="36" fill="url(#panel)" stroke="rgba(255,255,255,0.18)" />
  <text x="140" y="220" font-family="Arial, sans-serif" font-size="44" font-weight="700" fill="#e0f2fe">{safe_scene_label}</text>
  <text x="140" y="300" font-family="Arial, sans-serif" font-size="64" font-weight="800" fill="#ffffff">{safe_title}</text>
  <foreignObject x="140" y="360" width="744" height="360">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; color: #dbeafe; font-size: 34px; line-height: 1.45;">
      {safe_excerpt}
    </div>
  </foreignObject>
  <text x="140" y="860" font-family="Arial, sans-serif" font-size="28" font-weight="600" fill="#bae6fd">
    StoryPixie fallback artwork
  </text>
</svg>
""".strip()

    encoded_svg = base64.b64encode(svg.encode("utf-8")).decode("utf-8")
    return {
        "inline_data": f"data:image/svg+xml;base64,{encoded_svg}",
        "storage_url": None,
    }

async def generate_story(
    user_prompt: str,
    ai_prompt: str = None,
    image_style_prompt: str = None,
    scene_count: int = 3,
    disconnect_checker=None,
    generation_id=None,
):
    try:
        await _raise_if_cancelled(disconnect_checker, generation_id)

        # 1. Generate a cinematic title from the raw user prompt
        title_prompt = f"Based on this story idea: '{user_prompt}', generate a short, cinematic, catchy story title (under 8 words). Return ONLY the title text."
        title_response = await asyncio.to_thread(
            client.models.generate_content,
            model=settings.GEMINI_MODEL_NAME,
            contents=title_prompt
        )
        await _raise_if_cancelled(disconnect_checker, generation_id)
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

        response = await asyncio.to_thread(
            client.models.generate_content,
            model=settings.GEMINI_MODEL_NAME,
            contents=story_instructions
        )
        await _raise_if_cancelled(disconnect_checker, generation_id)

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
            await _raise_if_cancelled(disconnect_checker, generation_id)
            image_prompt = f"{scene['text']}, in a {style} style, highly detailed cinematic artwork"
            image_data = await generate_scene_image(image_prompt) or {}
            await _raise_if_cancelled(disconnect_checker, generation_id)

            if not image_data.get("inline_data"):
                logger.warning(
                    f"Using fallback scene artwork for scene {scene['scene_number']} after image generation failure."
                )
                image_data = _build_fallback_scene_image(
                    scene["scene_number"],
                    scene["title"],
                    scene["text"],
                )

            scenes.append({
                "scene_number": scene["scene_number"],
                "title": scene["title"],
                "narration": scene["narration"],
                "text": scene["text"],
                "image": image_data.get("inline_data"),
                "image_url": image_data.get("storage_url"),
                "audio": None,
            })

            if scene["scene_number"] < len(parsed_scenes):
                await asyncio.sleep(INTER_SCENE_IMAGE_DELAY_SECONDS)

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
