import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import PromptInput from '../components/PromptInput';
import GenerateButton from '../components/GenerateButton';
import LoadingSpinner from '../components/LoadingSpinner';
import StoryViewer from '../components/StoryViewer';
import { Story } from '../components/StoryViewer';
import { generateStory } from '../services/api';
import { useStoryHistory } from '../hooks/useStoryHistory';
import DownloadStoryActions from '../components/DownloadStoryActions';

export default function CreateStory() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [story, setStory] = useState<Story | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { saveStory } = useStoryHistory();

  useEffect(() => {
    if (router.query.prompt) {
      const initialPrompt = router.query.prompt as string;
      setPrompt(initialPrompt);
      handleGenerate(initialPrompt);
    }
  }, [router.query.prompt]);

  const handleGenerate = async (targetPrompt?: string) => {
    const activePrompt = targetPrompt || prompt;
    if (!activePrompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setStory(null);

    try {
      const data = await generateStory(activePrompt);
      setStory(data);
      saveStory(activePrompt, data);
    } catch (err) {
      setError('Oops! Something went wrong while weaving your story. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="py-12 flex flex-col items-center">
        {!story && !isLoading && (
          <div className="w-full flex flex-col items-center space-y-8 animate-fade-in-up">
            <h1 className="text-4xl font-black mb-4">What's the Story?</h1>
            <PromptInput 
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)} 
              placeholder="Enter your imagination here..."
            />
            <GenerateButton 
              onClick={() => handleGenerate()} 
              isLoading={isLoading} 
              text="Generate Story" 
            />
          </div>
        )}

        {isLoading && <LoadingSpinner />}

        {error && (
          <div className="card border-red-500 border-2 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-6 flex flex-col items-center">
            <p className="text-lg font-bold mb-4">{error}</p>
            <button 
              onClick={() => handleGenerate()} 
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
