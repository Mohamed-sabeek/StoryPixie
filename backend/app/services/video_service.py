import base64
import binascii
import shutil
import subprocess
import tempfile
from pathlib import Path

from app.config.settings import settings
from app.core.logger import logger
from app.services.firebase_storage import upload_video


def _save_data_url_file(data_url: str, file_path: Path) -> None:
    if not data_url or "," not in data_url:
        raise ValueError("Invalid data URL payload.")

    _, encoded = data_url.split(",", 1)
    file_path.write_bytes(base64.b64decode(encoded))


async def generate_story_video(story: dict) -> str | None:
    ffmpeg_binary = shutil.which(settings.FFMPEG_BINARY) or shutil.which("ffmpeg")
    if not ffmpeg_binary:
        logger.warning("FFmpeg is not installed. Skipping story video generation.")
        return None

    scenes = story.get("scenes", [])
    if not scenes:
        logger.warning("Story has no scenes. Skipping story video generation.")
        return None

    temp_dir_path = Path(tempfile.mkdtemp(prefix="storypixie_video_"))
    scene_videos: list[Path] = []

    try:
        for scene in scenes:
            scene_id = scene.get("scene_number")
            image_data = scene.get("image")
            audio_data = scene.get("audio")

            if not image_data or not audio_data:
                logger.warning(
                    "Skipping video clip generation for scene %s because image or audio is missing.",
                    scene_id,
                )
                continue

            image_path = temp_dir_path / f"scene_{scene_id}.png"
            audio_path = temp_dir_path / f"scene_{scene_id}.wav"
            video_path = temp_dir_path / f"scene_{scene_id}.mp4"

            try:
                _save_data_url_file(image_data, image_path)
                _save_data_url_file(audio_data, audio_path)
            except (ValueError, binascii.Error) as decode_error:
                logger.warning(
                    "Skipping video clip generation for scene %s because media decoding failed: %s",
                    scene_id,
                    decode_error,
                )
                continue

            clip_command = [
                ffmpeg_binary,
                "-y",
                "-loop",
                "1",
                "-i",
                str(image_path),
                "-i",
                str(audio_path),
                "-c:v",
                "libx264",
                "-tune",
                "stillimage",
                "-c:a",
                "aac",
                "-b:a",
                "192k",
                "-pix_fmt",
                "yuv420p",
                "-shortest",
                str(video_path),
            ]

            result = subprocess.run(
                clip_command,
                capture_output=True,
                text=True,
                check=False,
            )

            if result.returncode != 0:
                logger.error(
                    "FFmpeg failed to generate scene clip for scene %s: %s",
                    scene_id,
                    result.stderr.strip(),
                )
                continue

            scene_videos.append(video_path)

        if not scene_videos:
            logger.warning("No scene video clips were generated. Skipping final story video.")
            return None

        concat_file = temp_dir_path / "concat.txt"
        concat_file.write_text(
            "".join(f"file '{video_path.as_posix()}'\n" for video_path in scene_videos),
            encoding="utf-8",
        )

        final_video = temp_dir_path / "story_video.mp4"
        concat_command = [
            ffmpeg_binary,
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(concat_file),
            "-c",
            "copy",
            str(final_video),
        ]

        result = subprocess.run(
            concat_command,
            capture_output=True,
            text=True,
            check=False,
        )

        if result.returncode != 0:
            logger.error("FFmpeg failed to merge story video: %s", result.stderr.strip())
            return None

        video_url = upload_video(final_video.read_bytes())
        if not video_url:
            logger.error("Story video upload failed after successful local generation.")
            return None

        logger.info("Story video generated successfully: %s", video_url)
        return video_url
    except Exception as error:
        logger.error("Story video generation failed: %s", error, exc_info=True)
        return None
    finally:
        shutil.rmtree(temp_dir_path, ignore_errors=True)
