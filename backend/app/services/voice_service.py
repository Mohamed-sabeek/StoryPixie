class VoiceService:
    @staticmethod
    async def prepare_narration_text(scenes: list):
        # In a real multimodal app, this could call Google TTS or OpenAI Audio.
        # This service would handle text-to-speech generation.
        for scene in scenes:
            if not scene.narration:
                scene.narration = scene.text # Fallback
        return scenes

voice_service = VoiceService()
