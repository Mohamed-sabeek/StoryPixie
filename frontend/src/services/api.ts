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
export const generateStory = async (data: any) => {
  try {
    const payload = {
      prompt: data.prompt,
      genre: data.genre,
      scenes: data.scenes,
      length: data.length,
      image_style: data.imageStyle,
      voice: data.voice,
      mood: data.mood
    };

    console.log("Sending payload to backend:", payload);

    const response = await api.post("/generate-story", payload);

    console.log("Received story from backend:", response.data);

    return response.data;
  } catch (error) {
    console.error("Error generating story from backend:", error);
    throw error;
  }
};

export default api;