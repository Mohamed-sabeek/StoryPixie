import asyncio
import base64
from google import genai
from google.genai import types
from app.config.settings import settings
from app.core.logger import logger
from app.services.firebase_storage import upload_audio

client = genai.Client(api_key=settings.GEMINI_API_KEY)
DEFAULT_FEMALE_VOICE = "Kore"
DEFAULT_MALE_VOICE = "Puck"
DEFAULT_TTS_MODEL = "gemini-2.5-flash-preview-tts"


def _resolve_voice_name(voice: str) -> str:
    configured_voice = settings.TTS_VOICE_MALE if (voice or "").lower() == "male" else settings.TTS_VOICE_FEMALE

    # Gemini TTS expects prebuilt voice names, not locale placeholders like en-US-Female.
    if configured_voice and configured_voice.startswith("en-"):
        return DEFAULT_MALE_VOICE if (voice or "").lower() == "male" else DEFAULT_FEMALE_VOICE

    return configured_voice or (DEFAULT_MALE_VOICE if (voice or "").lower() == "male" else DEFAULT_FEMALE_VOICE)


async def generate_speech(text: str, voice: str):
    voice_name = _resolve_voice_name(voice)
    model_name = (settings.TTS_MODEL_NAME or DEFAULT_TTS_MODEL).replace("models/", "", 1)
    logger.info(f"Generating TTS audio with voice={voice_name}")
    try:
        response = await asyncio.to_thread(
            client.models.generate_content,
            model=model_name,
            contents=text,
            config=types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(
                    language_code="en-US",
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name=voice_name
                        )
                    )
                ),
            ),
        )

        parts = []
        if response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
            parts = response.candidates[0].content.parts

        for part in parts:
            inline_data = getattr(part, "inline_data", None) or getattr(part, "inlineData", None)
            if inline_data and inline_data.data:
                audio_bytes = inline_data.data
                if not audio_bytes:
                    raise ValueError("Gemini returned empty audio")

                mime_type = (
                    getattr(inline_data, "mime_type", None)
                    or getattr(inline_data, "mimeType", None)
                    or "audio/wav"
                )
                logger.info(
                    "Gemini TTS audio ready: voice=%s mime_type=%s bytes=%s",
                    voice_name,
                    mime_type,
                    len(audio_bytes),
                )
                encoded_audio = base64.b64encode(audio_bytes).decode("utf-8")
                storage_url = await asyncio.to_thread(upload_audio, audio_bytes, mime_type)
                return {
                    "audio": f"data:{mime_type};base64,{encoded_audio}",
                    "mime_type": mime_type,
                    "storage_url": storage_url,
                }

        raise ValueError("Gemini TTS did not return audio data.")
    except Exception as error:
        logger.error(f"Gemini TTS failed: {error}", exc_info=True)
        raise
