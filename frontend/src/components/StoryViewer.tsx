import React from 'react';
import SceneCard from './SceneCard';
import AudioPlayer from './AudioPlayer';
import VideoPlayer from './VideoPlayer';

export interface Story {
  title: string;
  scenes: Array<{ text: string; image: string }>;
  audio: string;
  video: string;
}

const StoryViewer: React.FC<{ story: Story }> = ({ story }) => {
  return (
    <div className="w-full py-12 px-4">
      <h2 className="text-4xl md:text-6xl font-black text-center mb-16 tracking-tight">
        {story.title}
      </h2>
      
      <div className="space-y-16">
        {story.scenes.map((scene, index) => (
          <SceneCard key={index} scene={scene} index={index} />
        ))}
      </div>
      
      <div className="max-w-4xl mx-auto mt-24 space-y-12">
        <div className="card">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <svg className="h-6 w-6 text-light-primary dark:text-dark-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
            Narration Audio
          </h3>
          <AudioPlayer url={story.audio} />
        </div>
        
        <div className="card">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <svg className="h-6 w-6 text-light-primary dark:text-dark-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
            Animated Story
          </h3>
          <VideoPlayer url={story.video} />
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;
