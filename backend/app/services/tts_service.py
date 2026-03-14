import asyncio
import base64
from google import genai
from google.genai import types
from app.config.settings import settings
from app.core.logger import logger

client = genai.Client(api_key=settings.GEMINI_API_KEY)
DEFAULT_FEMALE_VOICE = "Kore"
DEFAULT_MALE_VOICE = "Puck"


def _resolve_voice_name(voice: str) -> str:
    configured_voice = settings.TTS_VOICE_MALE if (voice or "").lower() == "male" else settings.TTS_VOICE_FEMALE

    # Gemini TTS expects prebuilt voice names, not locale placeholders like en-US-Female.
    if configured_voice and configured_voice.startswith("en-"):
        return DEFAULT_MALE_VOICE if (voice or "").lower() == "male" else DEFAULT_FEMALE_VOICE

    return configured_voice or (DEFAULT_MALE_VOICE if (voice or "").lower() == "male" else DEFAULT_FEMALE_VOICE)


async def generate_speech(text: str, voice: str):
    voice_name = _resolve_voice_name(voice)
    logger.info(f"Generating TTS audio with voice={voice_name}")
    try:
        response = await asyncio.to_thread(
            client.models.generate_content,
            model=settings.TTS_MODEL_NAME,
            contents=text,
            config=types.GenerateContentConfig(
                responseModalities=["AUDIO"],
                speechConfig=types.SpeechConfig(
                    voiceConfig=types.VoiceConfig(
                        prebuiltVoiceConfig=types.PrebuiltVoiceConfig(
                            voiceName=voice_name
                        )
                    )
                ),
            ),
        )

        for candidate in response.candidates or []:
            parts = candidate.content.parts if candidate.content and candidate.content.parts else []
            for part in parts:
                if part.inlineData and part.inlineData.data:
                    mime_type = part.inlineData.mimeType or "audio/wav"
                    encoded_audio = base64.b64encode(part.inlineData.data).decode("utf-8")
                    return {
                        "audio": f"data:{mime_type};base64,{encoded_audio}",
                        "mime_type": mime_type,
                    }

        raise ValueError("Gemini TTS did not return audio data.")
    except Exception as error:
        logger.error(f"Gemini TTS failed: {error}")
        raise
