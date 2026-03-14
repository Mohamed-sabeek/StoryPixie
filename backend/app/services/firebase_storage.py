import firebase_admin
from firebase_admin import credentials, storage
import uuid
import os

# Define the path to the firebase key
# Ensuring it's relative to the ROOT of the project where firebase_key.json is located
FIREBASE_KEY_PATH = "firebase_key.json"

# Initialize Firebase Admin SDK only once
if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_KEY_PATH)
    firebase_admin.initialize_app(cred, {
        "storageBucket": "storypixie-c3839.firebasestorage.app"
    })

bucket = storage.bucket()

def upload_image(image_bytes):
    """
    Uploads image bytes to Firebase Storage and returns the public URL.
    """
    try:
        filename = f"storypixie/{uuid.uuid4()}.png"
        blob = bucket.blob(filename)
        
        # Upload the image bytes
        blob.upload_from_string(image_bytes, content_type="image/png")
        
        # Make the blob publicly viewable
        blob.make_public()
        
        return blob.public_url
    except Exception as e:
        print(f"Error uploading to Firebase: {str(e)}")
        return None