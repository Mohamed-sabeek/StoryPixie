from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="StoryPixie API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Scene(BaseModel):
    text: str
    image: str

class Story(BaseModel):
    title: str
    scenes: List[Scene]
    audio: str
    video: str

class GenerateStoryRequest(BaseModel):
    prompt: str

@app.get("/")
async def root():
    return {"message": "Welcome to StoryPixie API"}

@app.post("/generate-story")
async def generate_story(request: GenerateStoryRequest):
    # Mock story for UI testing
    return {
        "title": f"The Tale of: {request.prompt}",
        "scenes": [
            {
                "text": "Once upon a time, in a world far away...",
                "image": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80"
            },
            {
                "text": "An adventurer set out on a grand quest to find the lost pixels.",
                "image": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
            }
        ],
        "audio": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "video": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
