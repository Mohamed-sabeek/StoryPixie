from typing import Set


_cancelled_generation_ids: Set[str] = set()


def cancel_generation(generation_id: str) -> None:
    if generation_id:
        _cancelled_generation_ids.add(generation_id)


def is_generation_cancelled(generation_id: str | None) -> bool:
    return bool(generation_id) and generation_id in _cancelled_generation_ids


def clear_generation(generation_id: str | None) -> None:
    if generation_id:
        _cancelled_generation_ids.discard(generation_id)
