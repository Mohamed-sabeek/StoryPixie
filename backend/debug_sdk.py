from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

try:
    print("Testing with 'gemini-2.0-flash'...")
    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents='Say hello'
    )
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error flash: {e}")

try:
    print("\nTesting with 'models/gemini-2.0-flash'...")
    response = client.models.generate_content(
        model='models/gemini-2.0-flash',
        contents='Say hello'
    )
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error models/flash: {e}")
