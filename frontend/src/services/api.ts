import axios from "axios";
import { Story } from "../components/StoryViewer";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Generate story from backend AI
 */
export const generateStory = async (data: any, signal?: AbortSignal) => {
  try {
    const payload = {
      prompt: data.prompt,
      genre: data.genre,
      scene_count: data.scenes,
      length: data.length,
      image_style: data.imageStyle,
      voice: data.voice,
      mood: data.mood
    };

    console.log("Sending payload to backend:", payload);

    const response = await api.post("/generate-story", payload, { signal });

    console.log("Received story from backend:", response.data);

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

    console.error("Error generating story from backend:", error);
    throw error;
  }
};

export default api;
