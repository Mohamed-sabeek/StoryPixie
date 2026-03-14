import React from 'react';
import SceneCard from './SceneCard';

export interface Scene {
  scene_number: number;
  text: string;
  image: string | null;
}

export interface Story {
  title: string;
  scenes?: Scene[];
  story_text?: string; // For backward compatibility or errors
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
    <div className="max-w-4xl mx-auto py-12 px-4 w-full">
      <header className="mb-16 text-center">
        <h1 className="text-5xl md:text-7xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-br from-light-primary to-purple-600 dark:from-dark-primary dark:to-blue-400">
          {story.title}
        </h1>
        <div className="w-24 h-2 bg-light-primary dark:bg-dark-primary mx-auto rounded-full"></div>
      </header>
      
      {story.scenes && story.scenes.length > 0 ? (
        <div className="space-y-4">
          {story.scenes.map((scene, index) => (
            <SceneCard key={index} scene={scene} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-lg md:text-xl leading-relaxed whitespace-pre-line text-gray-800 dark:text-gray-200">
          {story.story_text}
        </div>
      )}

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
