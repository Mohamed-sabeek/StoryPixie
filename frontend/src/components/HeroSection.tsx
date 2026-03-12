import { useRouter } from 'next/router';
import React from 'react';

const HeroSection: React.FC = () => {
  const router = useRouter();

  return (
    <section className="relative py-20 overflow-hidden flex flex-col items-center justify-center text-center px-4">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 dark:opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-light-primary dark:bg-dark-primary rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400 dark:bg-dark-secondary rounded-full blur-[150px]"></div>
      </div>
      
      <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight animate-fade-in">
        Your Imagination, <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-light-primary to-blue-600 dark:from-dark-primary dark:to-dark-secondary">
          AI Narrated.
        </span>
      </h1>
      
      <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mb-10">
        StoryPixie turns your simple prompts into immersive multimodal experiences with scenes, images, and voice.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={() => router.push('/create')} className="btn-primary text-lg">
          Start Drawing Stories
        </button>
        <button onClick={() => router.push('/about')} className="px-8 py-3 rounded-full font-bold border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300">
          How It Works
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
