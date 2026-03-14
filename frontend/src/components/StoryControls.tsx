import React from 'react';
import GenreSelector from './selectors/GenreSelector';
import SceneSelector from './selectors/SceneSelector';
import LengthSelector from './selectors/LengthSelector';
import ImageStyleSelector from './selectors/ImageStyleSelector';
import MoodSelector from './selectors/MoodSelector';

interface StoryControlsProps {
  genre: string;
  setGenre: (val: string) => void;
  scenes: number;
  setScenes: (val: number) => void;
  length: string;
  setLength: (val: string) => void;
  imageStyle: string;
  setImageStyle: (val: string) => void;
  mood: string;
  setMood: (val: string) => void;
}

export default function StoryControls({
  genre, setGenre,
  scenes, setScenes,
  length, setLength,
  imageStyle, setImageStyle,
  mood, setMood
}: StoryControlsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full p-6 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-2xl animate-fade-in-up mt-4">
      <GenreSelector value={genre} onChange={setGenre} />
      <SceneSelector value={scenes} onChange={setScenes} />
      <LengthSelector value={length} onChange={setLength} />
      <ImageStyleSelector value={imageStyle} onChange={setImageStyle} />
      <MoodSelector value={mood} onChange={setMood} />
    </div>
  );
}
