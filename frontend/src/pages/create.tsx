import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import StoryGenerator, { StoryConfig } from '../components/StoryGenerator';
import GenerationProgress from '../components/GenerationProgress';
import LoadingSpinner from '../components/LoadingSpinner';
import StoryViewer from '../components/StoryViewer';
import { Story } from '../components/StoryViewer';
import { generateStory } from '../services/api';
import { useStoryHistory } from '../hooks/useStoryHistory';
import DownloadStoryActions from '../components/DownloadStoryActions';

export default function CreateStory() {
  const router = useRouter();
  const [initialPrompt, setInitialPrompt] = useState('');
  const [lastConfig, setLastConfig] = useState<StoryConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [story, setStory] = useState<Story | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { saveStory } = useStoryHistory();

  useEffect(() => {
    if (router.query.prompt) {
      setInitialPrompt(router.query.prompt as string);
      // Removed the auto-generate call here to allow the user to see the advanced settings
      // and adjust the defaults before generating.
    }
  }, [router.query.prompt]);

  const handleGenerateConfig = async (config: StoryConfig) => {
    // Set loading state immediately for visual feedback
    setIsLoading(true);
    setError(null);
    setStory(null);
    setLastConfig(config);

    try {
      console.log("Sending request to backend:", config);
      
      // Artificial short delay to let the enter animation play out beautifully
      // and ensure the user feels the "Start" action was registered
      await new Promise(resolve => setTimeout(resolve, 800));

      const storyData = await generateStory(config);

      console.log("Received story from backend:", storyData);

      setStory(storyData);
      
      if (storyData && !storyData.error) {
        saveStory(config.prompt, storyData);
      }
    } catch (err) {
      console.error("Story generation failed:", err);
      setError('Oops! Something went wrong while weaving your story. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const retryGeneration = () => {
    if (lastConfig) {
      handleGenerateConfig(lastConfig);
    }
  };

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

        {isLoading && <GenerationProgress />}

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
            <StoryViewer story={story} />
            <DownloadStoryActions story={story} />
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
