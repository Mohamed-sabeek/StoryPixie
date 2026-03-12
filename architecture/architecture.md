# StoryPixie Architecture

## Overview

StoryPixie is an AI-powered multimodal storytelling agent.

## System Components

- **Frontend (Next.js)**: User interface for prompt input and story viewing.
- **Backend (FastAPI)**: Orchestrates AI generation and manages media storage.
- **AI Layer (Gemini)**: Generates story content and prompts for other media.
- **Media Generation**:
    - Imagen: Image generation.
    - Google TTS: Audio narration.
    - MoviePy: Video assembly.
- **Cloud Infrastructure**:
    - Cloud Run: Hosting backend.
    - Cloud Storage: Storing generated media assets.
