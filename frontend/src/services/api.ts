import axios from 'axios';

import { Story } from '../components/StoryViewer';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const generateStory = async (prompt: string): Promise<Story> => {
  try {
    const response = await api.post('/generate-story', { prompt });
    return response.data;
  } catch (error) {
    console.error('Error generating story:', error);
    throw error;
  }
};

export default api;
