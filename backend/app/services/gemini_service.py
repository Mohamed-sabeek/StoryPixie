from google import genai
from app.config.settings import settings
from app.services.image_service import generate_scene_image
import json
import re

client = genai.Client(api_key=settings.GEMINI_API_KEY)

async def generate_story(prompt: str, image_style_prompt: str = None, scene_count: int = 3):
    # Determine the title from the prompt for the response object
    display_title = prompt
    marker = "story idea:"
    if marker in prompt.lower():
        start_index = prompt.lower().find(marker) + len(marker)
        display_title = prompt[start_index:].strip()
    
    # ... (cleaning logic remains identical)
    instruction_keywords = [
        r"important rules.*",
        r"instructions.*",
        r"return only.*",
        r"you are an expert.*",
        r"write between.*",
        r"include a.*"
    ]
    
    for kw in instruction_keywords:
        parts = re.split(kw, display_title, flags=re.IGNORECASE)
        if parts:
            display_title = parts[0].strip()
    
    display_title = re.sub(r"[:\-\s]+$", "", display_title)
    if len(display_title) > 50:
        display_title = display_title[:47] + "..."
    display_title = display_title.capitalize() if display_title else "AI Story"

    try:
        # Use a prompt that ensures we get clear paras for scenes
        story_prompt = f"""
        You are a creative storyteller. Write an engaging story based on this idea: {display_title}.
        
        Format the story into exactly {scene_count} distinct paragraphs.
        Each paragraph should represent a clear scene in the story.
        
        Return ONLY the story text. No titles, no labels, no JSON.
        """

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL_NAME,
            contents=story_prompt
        )

        text = response.text
        
        # Split text into paragraphs (scenes)
        paragraphs = [p.strip() for p in re.split(r'\n\n+', text) if p.strip()]
        
        # Limit to scene_count
        paragraphs = paragraphs[:scene_count]
        
        scenes = []
        style = image_style_prompt or settings.IMAGE_STYLE
        
        for i, para in enumerate(paragraphs):
            # Create a descriptive image prompt
            image_prompt = f"{para}, {style}, highly detailed cinematic digital art"
            
            # Generate image for the scene
            image_data = generate_scene_image(image_prompt)
            
            scenes.append({
                "scene_number": i + 1,
                "text": para,
                "image": image_data
            })

        return {
            "title": display_title,
            "scenes": scenes
        }

    except Exception as e:
        # Fallback empty scenes with error msg in first one if necessary, 
        # or just return error structure
        return {
            "title": display_title,
            "scenes": [
                {
                    "scene_number": 1,
                    "text": f"Error generating story: {str(e)}",
                    "image": None
                }
            ]
        }