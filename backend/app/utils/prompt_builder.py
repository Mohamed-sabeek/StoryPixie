class PromptBuilder:
    @staticmethod
    def build_story_prompt(user_prompt: str) -> str:
        return f"""
        Generate a creative and engaging story based on the follow prompt: "{user_prompt}"
        
        The story should be broken into 3 to 5 distinct scenes.
        For each scene, provide:
        1. story text: A descriptive paragraph of what happens in this scene.
        2. imagePrompt: A detailed prompt for an AI image generator to visualize this scene.
        3. narration text: A shorter version of the story text suitable for voice narration.
        
        Return the result ONLY as a JSON object with the following structure:
        {{
            "title": "Story Title",
            "scenes": [
                {{
                    "scene": 1,
                    "text": "...",
                    "imagePrompt": "...",
                    "narration": "..."
                }}
            ]
        }}
        """
