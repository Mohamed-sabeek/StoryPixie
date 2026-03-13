def build_story_prompt(prompt, genre, scenes, length, image_style, voice, mood):
    return f"""
You are an expert AI storyteller.

Write a {genre} story.

Story mood: {mood}

Number of scenes: {scenes}

Narration length: {length}

Each scene must include:
- scene_number
- title
- narration
- image_prompt

Image style: {image_style}

Story idea:
{prompt}

IMPORTANT RULES:
1. Return ONLY valid JSON.
2. Do NOT include explanations or markdown.
3. The number of scenes MUST be exactly {scenes}.
4. The response must strictly follow the JSON structure below.

Required JSON format:

{{
  "title": "Story title",
  "scenes": [
    {{
      "scene_number": 1,
      "title": "Scene title",
      "narration": "Narration describing what happens in the scene",
      "image_prompt": "Detailed description for generating the scene image in {image_style} style"
    }},
    {{
      "scene_number": 2,
      "title": "Scene title",
      "narration": "Narration describing what happens in the scene",
      "image_prompt": "Detailed description for generating the scene image in {image_style} style"
    }}
  ]
}}

Remember:
Return ONLY JSON.
"""