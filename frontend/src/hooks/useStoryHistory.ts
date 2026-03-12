import { useState, useEffect } from 'react';
import { Story } from '../components/StoryViewer';

export interface SavedStory extends Story {
  id: string;
  prompt: string;
  createdAt: number;
}

const STORAGE_KEY = 'storypixie_history';

export const useStoryHistory = () => {
  const [stories, setStories] = useState<SavedStory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load stories from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setStories(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load story history:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save stories to localStorage whenever the array changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
      } catch (error) {
        console.error('Failed to save story history:', error);
      }
    }
  }, [stories, isLoaded]);

  const saveStory = (prompt: string, storyParams: Story) => {
    const newStory: SavedStory = {
      ...storyParams,
      id: crypto.randomUUID(),
      prompt,
      createdAt: Date.now(),
    };
    
    setStories((prev) => [newStory, ...prev]);
    return newStory;
  };

  const deleteStory = (id: string) => {
    setStories((prev) => prev.filter((s) => s.id !== id));
  };

  const clearHistory = () => {
    setStories([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    stories,
    isLoaded,
    saveStory,
    deleteStory,
    clearHistory,
  };
};
