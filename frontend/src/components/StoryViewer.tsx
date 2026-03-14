import React from 'react';
import SceneCard from './SceneCard';

export interface Scene {
  scene_number: number;
  text: string;
  image: string | null;
  image_url?: string | null;
  title?: string;
  narration?: string;
}

export interface Story {
  title: string;
  scenes?: Scene[];
  story_text?: string;
  prompt?: string;
  audio?: string;
  video?: string;
  error?: string;
}

export default function StoryViewer({ story }: { story: Story | null }) {
  if (!story) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-bounce mb-4 text-4xl">✨</div>
        <p className="text-gray-400 text-lg">Your masterpiece is being created...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 w-full">
      <header className="mb-16 text-center">
        <h1 className="text-5xl md:text-7xl font-black mb-4 bg-clip-text text-transparent bg-linear-to-br from-light-primary to-purple-600 dark:from-dark-primary dark:to-blue-400">
          {story.title}
        </h1>
        <div className="w-24 h-2 bg-light-primary dark:bg-dark-primary mx-auto rounded-full"></div>
      </header>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* LEFT SIDE: STORY SCENES */}
        <div className="flex-1 w-full space-y-8 order-2 lg:order-1">
          {story.scenes && story.scenes.length > 0 ? (
            <div className="space-y-4">
              {story.scenes.map((scene, index) => (
                <SceneCard key={index} scene={scene} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-lg md:text-xl leading-relaxed whitespace-pre-line text-gray-800 dark:text-gray-200 bg-white dark:bg-dark-surface p-8 rounded-3xl shadow-xl">
              {story.story_text}
            </div>
          )}
        </div>

        {/* RIGHT SIDE / SIDEBAR: PROMPT DISPLAY */}
        {story.prompt && (
          <aside className="w-full lg:w-80 order-1 lg:order-2 sticky top-8">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-light-primary animate-pulse"></span>
                  <p className="text-xs font-bold uppercase tracking-widest text-light-primary/80">Story Prompt</p>
                </div>
                
                <p className="text-gray-300 text-sm leading-relaxed font-medium italic">
                  "{story.prompt}"
                </p>
                
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <p className="text-[10px] text-gray-500 uppercase tracking-tighter">AI Analysis</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Visualizing {story.scenes?.length || 0} unique scenes with cinematic consistency.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      {story.error && (
        <div className="mt-12 p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-600 rounded-2xl">
          <p className="font-bold flex items-center gap-2 mb-2">
            <span className="text-xl">⚠️</span> System Note:
          </p>
          <p>{story.error}</p>
        </div>
      )}
    </div>
  );
}
