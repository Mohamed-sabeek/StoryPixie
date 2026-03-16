from pathlib import Path
from uuid import uuid4

_VIDEO_PATHS: dict[str, Path] = {}


def register_video(path: str | Path) -> str:
    video_id = str(uuid4())
    _VIDEO_PATHS[video_id] = Path(path)
    return video_id


def get_video_path(video_id: str) -> Path | None:
    return _VIDEO_PATHS.get(video_id)
