from fastapi import Depends, HTTPException, Request, status
from firebase_admin import auth as firebase_auth

from app.core.firebase_admin_client import get_firebase_app
from app.core.logger import logger


async def require_authenticated_user(request: Request):
    authorization = request.headers.get("Authorization", "")
    scheme, _, token = authorization.partition(" ")

    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization token.",
        )

    try:
        get_firebase_app()
        decoded_token = firebase_auth.verify_id_token(token)
        request.state.user = decoded_token
        return decoded_token
    except Exception as error:
        logger.warning("Firebase token verification failed: %s", error, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed.",
        ) from error


AuthenticatedUser = Depends(require_authenticated_user)
