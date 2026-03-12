class ImageService:
    @staticmethod
    async def prepare_image_prompts(scenes: list):
        # In a real multimodal app, this could call DALL-E, Stable Diffusion, or Imagen.
        # For now, it ensures each scene has a valid image prompt ready for processing.
        for scene in scenes:
            if not scene.imagePrompt:
                scene.imagePrompt = f"Cinematic visualization of: {scene.text[:50]}"
        return scenes

image_service = ImageService()
