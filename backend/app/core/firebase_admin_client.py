import json

import firebase_admin
from firebase_admin import credentials

from app.config.settings import settings


def get_firebase_app():
    if firebase_admin._apps:
        return firebase_admin.get_app()

    credential = None
    if settings.FIREBASE_CREDENTIALS_JSON:
        credential = credentials.Certificate(json.loads(settings.FIREBASE_CREDENTIALS_JSON))
    elif settings.firebase_credentials_resolved_path:
        credential = credentials.Certificate(str(settings.firebase_credentials_resolved_path))

    if credential is None:
        raise RuntimeError(
            "Firebase Admin credentials are not configured. "
            "Set FIREBASE_CREDENTIALS_PATH or FIREBASE_CREDENTIALS_JSON."
        )

    options = {}
    if settings.FIREBASE_STORAGE_BUCKET:
        options["storageBucket"] = settings.FIREBASE_STORAGE_BUCKET

    return firebase_admin.initialize_app(credential, options)
