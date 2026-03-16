import axios from "axios";
import { Story } from "../components/StoryViewer";
import { auth } from "../lib/firebase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const getAuthHeaders = async () => {
  const user = auth?.currentUser;
  if (!user) {
    throw new Error("User must be logged in to call the backend.");
  }

  const token = await user.getIdToken(true);
  return {
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Generate story from backend AI
 */
export const generateStory = async (data: any, signal?: AbortSignal) => {
  try {
    const payload = {
      prompt: data.prompt,
      generation_id: data.generationId,
      genre: data.genre,
      scene_count: data.scenes,
      length: data.length,
      image_style: data.imageStyle,
      voice: data.voice === "male" ? "male" : "female",
      mood: data.mood
    };

    const response = await api.post("/generate-story", payload, {
      signal,
      headers: await getAuthHeaders(),
    });

    return response.data;
  } catch (error) {
    if (
      signal?.aborted ||
      axios.isCancel(error) ||
      (axios.isAxiosError(error) && error.code === "ERR_CANCELED") ||
      (axios.isAxiosError(error) && error.message === "Network Error" && signal?.aborted) ||
      (error instanceof DOMException && error.name === "AbortError")
    ) {
      throw error;
    }

    if (process.env.NODE_ENV !== "production") console.error("Error generating story from backend:", error);
    throw error;
  }
};

export const cancelStoryGeneration = async (generationId: string) => {
  await api.post("/cancel-generation", {
    generation_id: generationId,
  }, {
    headers: await getAuthHeaders(),
  });
};

export const generateSceneSpeech = async (text: string, voice: "male" | "female") => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`/api/tts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({
        text,
        voice,
      }),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
};

export default api;
