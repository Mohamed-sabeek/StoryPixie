import uuid

from firebase_admin import storage

from app.core.firebase_admin_client import get_firebase_app
from app.core.logger import logger


def get_bucket():
    get_firebase_app()
    return storage.bucket()


def upload_bytes(file_bytes: bytes, *, folder: str, extension: str, content_type: str) -> str | None:
    try:
        bucket = get_bucket()
        filename = f"{folder}/{uuid.uuid4()}.{extension}"
        blob = bucket.blob(filename)
        blob.upload_from_string(file_bytes, content_type=content_type)
        blob.make_public()
        return blob.public_url
    except Exception as error:
        logger.error("Error uploading %s asset to Firebase Storage: %s", folder, error, exc_info=True)
        return None


def upload_image(image_bytes: bytes) -> str | None:
    return upload_bytes(
        image_bytes,
        folder="storypixie/images",
        extension="png",
        content_type="image/png",
    )


def upload_audio(audio_bytes: bytes, mime_type: str = "audio/wav") -> str | None:
    extension = "wav" if "wav" in mime_type else "mp3"
    return upload_bytes(
        audio_bytes,
        folder="storypixie/audio",
        extension=extension,
        content_type=mime_type,
    )


def upload_video(video_bytes: bytes) -> str | None:
    return upload_bytes(
        video_bytes,
        folder="storypixie/videos",
        extension="mp4",
        content_type="video/mp4",
    )
