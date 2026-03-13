import React from 'react';

export interface Story {
  title: string;
  story_text?: string;
  scenes?: any[];
  audio?: string;
  video?: string;
  error?: string;
}

export default function StoryViewer({ story }: { story: Story | null }) {
  if (!story) {
    return (
      <div className="text-center py-10 text-gray-400">
        Generating story...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-12 px-4 text-left w-full">
      <h1 className="text-4xl md:text-5xl font-black mb-8">{story.title}</h1>
      
      <div className="text-lg md:text-xl leading-relaxed whitespace-pre-line text-gray-800 dark:text-gray-200">
        {story.story_text}
      </div>

      {story.error && (
        <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-lg">
          <p className="font-bold">Note:</p>
          <p>{story.error}</p>
        </div>
      )}
    </div>
  );
}
