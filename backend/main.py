from fastapi import FastAPI

app = FastAPI(title="StoryPixie API")

@app.get("/")
async def root():
    return {"message": "Welcome to StoryPixie API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
