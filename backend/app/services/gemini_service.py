from google import genai
from app.config.settings import settings
import json
import re

client = genai.Client(api_key=settings.GEMINI_API_KEY)

async def generate_story(prompt: str):
    # Determine the title from the prompt
    display_title = prompt
    
    # 1. Try to extract content after "story idea:"
    marker = "story idea:"
    if marker in prompt.lower():
        start_index = prompt.lower().find(marker) + len(marker)
        display_title = prompt[start_index:].strip()
    
    # 2. Robustly clean the title by removing common instruction keywords
    # This prevents leaked instructions like "important rules:" from appearing in the title
    instruction_keywords = [
        r"important rules.*",
        r"instructions.*",
        r"return only.*",
        r"you are an expert.*",
        r"write between.*",
        r"include a.*"
    ]
    
    for kw in instruction_keywords:
        # Case-insensitive split at the keyword and take the prefix
        parts = re.split(kw, display_title, flags=re.IGNORECASE)
        if parts:
            display_title = parts[0].strip()
    
    # Clean up trailing punctuation or spaces left after splitting
    display_title = re.sub(r"[:\-\s]+$", "", display_title)

    # 3. Final formatting: Capitalize and truncate if too long
    if len(display_title) > 50:
        display_title = display_title[:47] + "..."
    display_title = display_title.capitalize() if display_title else "AI Story"

    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL_NAME,
            contents=prompt
        )

        text = response.text

        # Try to convert JSON story to plain text
        try:
            # 1. Strip markdown code blocks if present
            cleaned_text = text.strip()
            if "```" in cleaned_text:
                json_match = re.search(r"```(?:json)?\s*(.*?)\s*```", cleaned_text, re.DOTALL)
                if json_match:
                    cleaned_text = json_match.group(1)
            
            # 2. If it's still not valid JSON, try to find the first '{' and last '}'
            try:
                data = json.loads(cleaned_text)
            except json.JSONDecodeError:
                json_block_match = re.search(r"({.*})", cleaned_text, re.DOTALL)
                if json_block_match:
                    data = json.loads(json_block_match.group(1))
                else:
                    raise ValueError("No JSON block found")

            # 3. Format the story text from the JSON structure
            title = data.get("title", "")
            scenes = data.get("scenes", [])

            story = title + "\n\n"
            for scene in scenes:
                if isinstance(scene, dict) and "narration" in scene:
                    story += scene.get("narration", "") + "\n\n"

            text = story.strip()

        except:
            # If parsing fails for any reason, return the raw text (or whatever survived)
            pass

        return {
            "title": display_title,
            "story_text": text
        }

    except Exception as e:
        return {
            "title": display_title,
            "story_text": f"Error generating story: {str(e)}"
        }