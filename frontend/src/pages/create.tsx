import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Layout from '../components/Layout';
import StoryGenerator, { StoryConfig } from '../components/StoryGenerator';
import GenerationProgress from '../components/GenerationProgress';
import StoryViewer from '../components/StoryViewer';
import { Story } from '../components/StoryViewer';
import { cancelStoryGeneration, generateStory } from '../services/api';
import { useStoryHistory } from '../hooks/useStoryHistory';
import DownloadStoryActions from '../components/DownloadStoryActions';
import { useAuth } from '../context/AuthContext';

export default function CreateStory() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [initialPrompt, setInitialPrompt] = useState('');
  const [narrationVoice, setNarrationVoice] = useState<'male' | 'female'>('female');
  const [lastConfig, setLastConfig] = useState<StoryConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [story, setStory] = useState<Story | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyNotice, setHistoryNotice] = useState<string | null>(null);
  const { saveStory } = useStoryHistory();
  const abortControllerRef = useRef<AbortController | null>(null);
  const generationIdRef = useRef<string | null>(null);

  const sleepWithAbort = (ms: number, signal: AbortSignal) =>
    new Promise<void>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        cleanup();
        resolve();
      }, ms);

      const cleanup = () => {
        window.clearTimeout(timeoutId);
        signal.removeEventListener('abort', handleAbort);
      };

      const handleAbort = () => {
        cleanup();
        reject(new DOMException('Generation cancelled by user.', 'AbortError'));
      };

      signal.addEventListener('abort', handleAbort);
    });

  useEffect(() => {
    if (router.query.prompt) {
      setInitialPrompt(router.query.prompt as string);
      // Removed the auto-generate call here to allow the user to see the advanced settings
      // and adjust the defaults before generating.
    }
  }, [router.query.prompt]);

  useEffect(() => {
    if (!loading && !user) {
      void router.replace('/login');
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (error !== 'Story generation stopped.') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setError((currentError) =>
        currentError === 'Story generation stopped.' ? null : currentError
      );
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [error]);

  const handleGenerateConfig = async (config: StoryConfig) => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const generationId = crypto.randomUUID();
    generationIdRef.current = generationId;

    // Set loading state immediately for visual feedback
    setIsLoading(true);
    setError(null);
    setHistoryNotice(null);
    setStory(null);
    setLastConfig(config);

    try {
      console.log("Sending request to backend:", config);
      
      // Artificial short delay to let the enter animation play out beautifully
      // and ensure the user feels the "Start" action was registered
      await sleepWithAbort(800, controller.signal);

      const storyData = await generateStory(
        { ...config, generationId },
        controller.signal
      );

      console.log("Received story from backend:", storyData);

      setStory(storyData);
      
      if (storyData && !storyData.error) {
        try {
          await saveStory(config.prompt, storyData);
        } catch {
          setHistoryNotice('Story generated successfully, but saving to Firestore history failed.');
        }
      }
    } catch (err) {
      if (
        controller.signal.aborted ||
        err instanceof DOMException && err.name === 'AbortError' ||
        axios.isCancel(err) ||
        (axios.isAxiosError(err) && err.code === 'ERR_CANCELED') ||
        (axios.isAxiosError(err) && err.message === 'Network Error' && controller.signal.aborted)
      ) {
        setError('Story generation stopped.');
        return;
      }

      console.error("Story generation failed:", err);
      setError('Oops! Something went wrong while weaving your story. Please try again.');
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      if (generationIdRef.current === generationId) {
        generationIdRef.current = null;
      }
      setIsLoading(false);
    }
  };

  const stopGeneration = async () => {
    const controller = abortControllerRef.current;
    const generationId = generationIdRef.current;
    abortControllerRef.current = null;
    generationIdRef.current = null;

    if (!controller && !generationId) {
      return;
    }

    if (generationId) {
      try {
        await cancelStoryGeneration(generationId);
      } catch {
        // Best-effort server-side cancellation.
      }
    }

    try {
      controller?.abort();
    } catch {
      // Aborting an already-cancelled request should be a no-op for the UI.
    }
  };

  useEffect(() => {
    return () => {
      if (generationIdRef.current) {
        void cancelStoryGeneration(generationIdRef.current).catch(() => undefined);
      }
      abortControllerRef.current?.abort();
    };
  }, []);

  const retryGeneration = () => {
    if (lastConfig) {
      handleGenerateConfig(lastConfig);
    }
  };

  if (loading || !user) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-light-primary dark:border-dark-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-12 flex flex-col items-center">
        {!story && !isLoading && (
          <StoryGenerator 
            onGenerate={handleGenerateConfig} 
            isLoading={isLoading} 
            initialPrompt={initialPrompt}
          />
        )}

        {isLoading && <GenerationProgress onCancel={stopGeneration} />}

        {error && (
          <div className="card border-red-500 border-2 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-6 flex flex-col items-center">
            <p className="text-lg font-bold mb-4">{error}</p>
            <button 
              onClick={retryGeneration} 
              className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {story && (
          <div className="w-full flex flex-col items-center">
            {historyNotice && (
              <div className="mb-6 max-w-3xl w-full rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-amber-800">
                {historyNotice}
              </div>
            )}
            <StoryViewer
              story={story}
              selectedVoice={narrationVoice}
              onVoiceChange={setNarrationVoice}
            />
            <DownloadStoryActions story={story} selectedVoice={narrationVoice} />
            <div className="mt-12 flex gap-4">
              <button 
                onClick={() => setStory(null)} 
                className="btn-primary"
              >
                Create Another Story
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
