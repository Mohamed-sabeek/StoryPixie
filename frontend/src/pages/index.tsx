import React, { useState } from 'react';
import { useRouter } from 'next/router';
import HeroSection from '../components/HeroSection';
import PromptInput from '../components/PromptInput';
import GenerateButton from '../components/GenerateButton';
import Layout from '../components/Layout';

const suggestions: string[] = [
  "A cyberpunk detective solving a mystery in Neo-Tokyo.",
  "A curious cat who accidentally boards a spaceship.",
  "An ancient tree that tells stories to the forest animals.",
  "A group of children discovering a hidden underwater city."
];

export default function Home(): React.JSX.Element {
  const [prompt, setPrompt] = useState('');
  const router = useRouter();

  const handleGenerate = () => {
    if (prompt.trim()) {
      router.push({
        pathname: '/create',
        query: { prompt: prompt.trim() },
      });
    }
  };

  return (
    <Layout>
      <HeroSection />
      
      <div className="flex flex-col items-center mt-12 space-y-8 animate-fade-in">
        <h2 className="text-3xl font-bold">Try an Idea</h2>
        <PromptInput 
          value={prompt} 
          onChange={(e) => setPrompt(e.target.value)} 
        />
        <GenerateButton 
          onClick={handleGenerate} 
          isLoading={false} 
          text="Start Storytelling" 
        />
        
        <div className="flex flex-row flex-wrap justify-center items-center gap-3 w-full max-w-4xl mt-8">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setPrompt(suggestion)}
              className="text-xs md:text-sm px-5 py-2.5 rounded-full bg-gray-100 dark:bg-dark-surface hover:bg-light-primary hover:text-white dark:hover:bg-dark-primary dark:hover:text-dark-bg transition-all duration-300 border border-gray-200 dark:border-gray-800 whitespace-nowrap overflow-hidden text-ellipsis max-w-full"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
}
