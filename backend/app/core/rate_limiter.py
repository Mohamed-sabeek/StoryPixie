import time
from collections import defaultdict, deque
from threading import Lock

from fastapi import Depends, HTTPException, Request, status

from app.config.settings import settings
from app.core.auth import require_authenticated_user

_REQUEST_HISTORY: dict[str, deque[float]] = defaultdict(deque)
_RATE_LIMIT_LOCK = Lock()


def rate_limit(limit: int, window_seconds: int | None = None):
    effective_window = window_seconds or settings.RATE_LIMIT_WINDOW_SECONDS

    async def dependency(
        request: Request,
        user=Depends(require_authenticated_user),
    ):
        key = f"{request.url.path}:{user['uid']}"
        now = time.monotonic()

        with _RATE_LIMIT_LOCK:
            history = _REQUEST_HISTORY[key]
            while history and now - history[0] > effective_window:
                history.popleft()

            if len(history) >= limit:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded. Please try again later.",
                )

            history.append(now)

        return user

    return dependency
