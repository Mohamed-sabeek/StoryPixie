import { useCallback, useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { Scene, Story } from '../components/StoryViewer';
import { db, isFirebaseConfigured } from '../lib/firebase';

export interface SavedStory extends Story {
  id: string;
  prompt: string;
  createdAt: number;
  image_urls: string[];
}

interface FirestoreStoryDocument {
  title: string;
  prompt: string;
  story_text?: string;
  scenes: Array<Record<string, unknown>>;
  image_urls: string[];
  created_at?: Timestamp | null;
  audio?: string;
  video?: string;
  error?: string;
}

const removeUndefinedFields = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value
      .map((item) => removeUndefinedFields(item))
      .filter((item) => item !== undefined) as T;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entryValue]) => entryValue !== undefined)
      .map(([entryKey, entryValue]) => [entryKey, removeUndefinedFields(entryValue)]);

    return Object.fromEntries(entries) as T;
  }

  return value;
};

const normalizeScene = (scene: Scene) => ({
  ...scene,
  image: scene.image && scene.image.startsWith('data:') ? scene.image : scene.image_url || null,
  image_url: scene.image_url || (scene.image && !scene.image.startsWith('data:') ? scene.image : null),
});

const toScene = (scene: Record<string, unknown>): Scene => normalizeScene({
  scene_number: Number(scene.scene_number || 0),
  text: typeof scene.text === 'string' ? scene.text : '',
  image: typeof scene.image === 'string' ? scene.image : null,
  image_url: typeof scene.image_url === 'string' ? scene.image_url : null,
  audio: typeof scene.audio === 'string' ? scene.audio : null,
  audio_url: typeof scene.audio_url === 'string' ? scene.audio_url : null,
  title: typeof scene.title === 'string' ? scene.title : undefined,
  narration: typeof scene.narration === 'string' ? scene.narration : undefined,
});

const mapFirestoreStory = (
  id: string,
  data: FirestoreStoryDocument | undefined
): SavedStory | null => {
  if (!data) {
    return null;
  }

  const createdAt =
    data.created_at instanceof Timestamp
      ? data.created_at.toMillis()
      : Date.now();

  const scenes = (data.scenes || []).map((scene) => toScene(scene));
  const prompt = data.prompt || '';
  const imageUrls = data.image_urls || scenes.map((scene) => scene.image_url || scene.image).filter(Boolean) as string[];

  return {
    id,
    title: data.title,
    prompt,
    story_text: data.story_text,
    scenes,
    audio: data.audio,
    video: data.video,
    error: data.error,
    createdAt,
    image_urls: imageUrls,
  };
};

const buildFirestoreStory = (prompt: string, story: Story): FirestoreStoryDocument => {
  const scenes = (story.scenes || []).map(normalizeScene);
  const firestoreScenes = scenes.map((scene) => ({
    scene_number: scene.scene_number,
    text: scene.text,
    title: scene.title,
    narration: scene.narration,
    audio_url:
      scene.audio_url || (scene.audio && !scene.audio.startsWith('data:') ? scene.audio : null),
    image: scene.image_url || null,
    image_url: scene.image_url || null,
  }));

  return removeUndefinedFields({
    title: story.title,
    prompt,
    story_text: story.story_text,
    scenes: firestoreScenes,
    image_urls: firestoreScenes.map((scene) => scene.image_url || scene.image).filter(Boolean) as string[],
    audio: story.audio,
    video: story.video,
    error: story.error,
    created_at: serverTimestamp() as unknown as Timestamp,
  });
};

const getCurrentUser = () => {
  const user = getAuth().currentUser;

  if (!user) {
    throw new Error('User must be logged in to access story history.');
  }

  return user;
};

const getStoriesCollection = (userId: string) => {
  if (!db) {
    throw new Error('Firebase Firestore is not configured.');
  }

  return collection(db, 'users', userId, 'stories');
};

export const useStoryHistory = () => {
  const [stories, setStories] = useState<SavedStory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStories = useCallback(async () => {
    const user = getAuth().currentUser;
    if (!user) {
      setStories([]);
      return [];
    }
    const storiesRef = getStoriesCollection(user.uid);
    const snapshot = await getDocs(query(storiesRef, orderBy('created_at', 'desc')));
    const loadedStories = snapshot.docs
      .map((storyDoc) => mapFirestoreStory(storyDoc.id, storyDoc.data() as FirestoreStoryDocument))
      .filter((story): story is SavedStory => Boolean(story));

    setStories(loadedStories);
    return loadedStories;
  }, []);

  useEffect(() => {
    const initializeHistory = async () => {
      if (!isFirebaseConfigured || !db) {
        setError('Firebase is not configured. Add the public Firebase env vars to use story history.');
        setIsLoaded(true);
        return;
      }

      try {
        await loadStories();
        setError(null);
      } catch (firestoreError) {
        console.error('Failed to initialize Firestore story history:', firestoreError);
        setError('Failed to connect to StoryPixie history.');
      } finally {
        setIsLoaded(true);
      }
    };

    void initializeHistory();
  }, [loadStories]);

  const saveStory = useCallback(async (prompt: string, storyParams: Story) => {
    try {
      const user = getCurrentUser();
      console.log('Saving story for user:', user.uid);
      const storiesRef = getStoriesCollection(user.uid);
      const storyDoc = await addDoc(storiesRef, buildFirestoreStory(prompt, storyParams));
      const snapshot = await getDoc(storyDoc);
      const savedStory = mapFirestoreStory(
        snapshot.id,
        snapshot.data() as FirestoreStoryDocument
      );

      if (!savedStory) {
        throw new Error('Saved story could not be loaded from Firestore.');
      }

      setStories((previousStories) => [savedStory, ...previousStories.filter((story) => story.id !== savedStory.id)]);
      setError(null);
      return savedStory;
    } catch (firestoreError) {
      console.error('Failed to save story history:', firestoreError);
      setError('The story was generated, but saving it to history failed.');
      throw firestoreError;
    }
  }, []);

  const getStory = useCallback(async (storyId: string) => {
    try {
      const user = getCurrentUser();
      const storyRef = doc(getStoriesCollection(user.uid), storyId);
      const snapshot = await getDoc(storyRef);
      const loadedStory = mapFirestoreStory(
        snapshot.id,
        snapshot.data() as FirestoreStoryDocument
      );

      if (!loadedStory) {
        throw new Error('Story not found.');
      }

      setError(null);
      return loadedStory;
    } catch (firestoreError) {
      console.error('Failed to load story from Firestore:', firestoreError);
      setError('Failed to load the selected story.');
      throw firestoreError;
    }
  }, []);

  const deleteStory = useCallback(async (storyId: string) => {
    try {
      const user = getCurrentUser();
      await deleteDoc(doc(getStoriesCollection(user.uid), storyId));
      setStories((previousStories) => previousStories.filter((story) => story.id !== storyId));
      setError(null);
    } catch (firestoreError) {
      console.error('Failed to delete story from Firestore:', firestoreError);
      setError('Failed to delete the selected story.');
      throw firestoreError;
    }
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      const user = getCurrentUser();
      const storiesRef = getStoriesCollection(user.uid);
      const snapshot = await getDocs(storiesRef);
      const batch = writeBatch(db!);

      snapshot.docs.forEach((storyDoc) => {
        batch.delete(storyDoc.ref);
      });

      await batch.commit();
      setStories([]);
      setError(null);
    } catch (firestoreError) {
      console.error('Failed to clear Firestore history:', firestoreError);
      setError('Failed to clear story history.');
      throw firestoreError;
    }
  }, []);

  return {
    stories,
    isLoaded,
    error,
    saveStory,
    getStory,
    deleteStory,
    clearHistory,
    refreshStories: loadStories,
  };
};
