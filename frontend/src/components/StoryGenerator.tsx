import React, { useState, useEffect } from "react";
import PromptInput from "./PromptInput";
import StoryControls from "./StoryControls";
import GenerateButton from "./GenerateButton";

export interface StoryConfig {
  prompt: string;
  genre: string;
  scenes: number;
  length: string;
  imageStyle: string;
  voice: string;
  mood: string;
}

interface StoryGeneratorProps {
  onGenerate: (config: StoryConfig) => void;
  isLoading: boolean;
  initialPrompt?: string;
}

export default function StoryGenerator({
  onGenerate,
  isLoading,
  initialPrompt,
}: StoryGeneratorProps) {
  const [prompt, setPrompt] = useState<string>("");

  // Default story settings
  const [genre, setGenre] = useState<string>("fantasy");
  const [scenes, setScenes] = useState<number>(3);
  const [length, setLength] = useState<string>("short");
  const [imageStyle, setImageStyle] = useState<string>("pixar_style");
  const [voice, setVoice] = useState<string>("female_narrator");
  const [mood, setMood] = useState<string>("epic");

  // Pre-fill prompt if coming from home page
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() !== "") {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  const handleGenerateClick = () => {
    if (!prompt.trim()) {
      console.warn("Prompt is empty. Generation cancelled.");
      return;
    }

    const config: StoryConfig = {
      prompt: prompt.trim(),
      genre,
      scenes,
      length,
      imageStyle,
      voice,
      mood,
    };

    console.log("Generating story with configuration:", config);

    onGenerate(config);
  };

  return (
    <div className="w-full max-w-3xl flex flex-col items-center space-y-6 animate-fade-in-up">
      <h1 className="text-4xl font-black mb-2 text-center">
        What's the Story?
      </h1>

      {/* Prompt Input */}
      <PromptInput
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={isLoading}
      />

      {/* Settings Header */}
      <div className="w-full text-left -mb-2 mt-4 ml-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
          Story Settings
        </h3>
      </div>

      {/* Story Controls */}
      <StoryControls
        genre={genre}
        setGenre={setGenre}
        scenes={scenes}
        setScenes={setScenes}
        length={length}
        setLength={setLength}
        imageStyle={imageStyle}
        setImageStyle={setImageStyle}
        mood={mood}
        setMood={setMood}
      />

      {/* Generate Button */}
      <div className="pt-4">
        <GenerateButton
          onClick={handleGenerateClick}
          isLoading={isLoading}
          text="Start Storytelling"
          disabled={isLoading || prompt.trim() === ""}
        />
      </div>
    </div>
  );
}
