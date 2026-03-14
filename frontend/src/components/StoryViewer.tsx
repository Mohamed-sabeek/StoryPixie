import React, { useEffect, useRef, useState } from 'react';
import SceneCard from './SceneCard';

export interface Scene {
  scene_number: number;
  text: string;
  image: string | null;
  image_url?: string | null;
  audio?: string | null;
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
  const [selectedVoice, setSelectedVoice] = useState<'male' | 'female'>('female');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [playingSceneNumber, setPlayingSceneNumber] = useState<number | null>(null);
  const [loadingSceneNumber, setLoadingSceneNumber] = useState<number | null>(null);
  const [highlightedSceneNumber, setHighlightedSceneNumber] = useState<number | null>(null);
  const [highlightedText, setHighlightedText] = useState<string>('');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const highlightTimerRef = useRef<number | null>(null);
  const highlightFallbackTimeoutRef = useRef<number | null>(null);
  const boundaryDetectedRef = useRef(false);
  const selectedVoiceRef = useRef<'male' | 'female'>('female');

  const clearHighlightTimers = () => {
    if (highlightTimerRef.current) {
      window.clearInterval(highlightTimerRef.current);
      highlightTimerRef.current = null;
    }
    if (highlightFallbackTimeoutRef.current) {
      window.clearTimeout(highlightFallbackTimeoutRef.current);
      highlightFallbackTimeoutRef.current = null;
    }
  };

  const getHighlightEndIndex = (text: string, charIndex: number) => {
    if (charIndex >= text.length) {
      return text.length;
    }

    const remainingText = text.slice(charIndex);
    const wordMatch = remainingText.match(/^\S+\s*/);
    return Math.min(text.length, charIndex + (wordMatch?.[0].length || 1));
  };

  useEffect(() => {
    if (!window.speechSynthesis) {
      return;
    }

    const syncVoices = () => {
      setAvailableVoices(window.speechSynthesis.getVoices());
    };

    syncVoices();
    window.speechSynthesis.addEventListener('voiceschanged', syncVoices);

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.removeEventListener('voiceschanged', syncVoices);
      }
      utteranceRef.current = null;
      clearHighlightTimers();
    };
  }, []);

  const setVoiceSelection = (voice: 'male' | 'female') => {
    selectedVoiceRef.current = voice;
    setSelectedVoice(voice);
  };

  const getPreferredVoice = (voice: 'male' | 'female') => {
    const malePatterns = [
      /male/i,
      /david/i,
      /guy/i,
      /mark/i,
      /james/i,
      /brian/i,
      /ravi/i,
      /steffan/i,
      /ryan/i,
      /andrew/i,
      /christopher/i,
      /daniel/i,
      /george/i,
      /liam/i,
      /alex/i,
      /aaron/i,
      /roger/i,
      /thomas/i,
      /paul/i,
      /michael/i,
      /nathan/i,
    ];
    const femalePatterns = [
      /female/i,
      /zira/i,
      /susan/i,
      /aria/i,
      /jenny/i,
      /samantha/i,
      /heera/i,
      /priya/i,
      /hazel/i,
      /ava/i,
      /emma/i,
      /linda/i,
      /nancy/i,
      /sonia/i,
      /sara/i,
      /victoria/i,
      /katya/i,
    ];
    const voicePatterns = voice === 'male' ? malePatterns : femalePatterns;

    const currentVoices = window.speechSynthesis?.getVoices() || availableVoices;
    const englishVoices = currentVoices.filter((voiceOption) =>
      /^en(-|_)?/i.test(voiceOption.lang || '')
    );
    const searchPools = [
      englishVoices.filter((voiceOption) => voiceOption.localService),
      englishVoices,
      currentVoices.filter((voiceOption) => voiceOption.localService),
      currentVoices,
    ];

    for (const searchPool of searchPools) {
      for (const pattern of voicePatterns) {
        const matchedVoice = searchPool.find((voiceOption) =>
          pattern.test(`${voiceOption.name} ${voiceOption.voiceURI}`)
        );
        if (matchedVoice) {
          return matchedVoice;
        }
      }
    }

    if (voice === 'male') {
      for (const searchPool of searchPools) {
        const nonFemaleVoice = searchPool.find(
          (voiceOption) =>
            !femalePatterns.some((pattern) =>
              pattern.test(`${voiceOption.name} ${voiceOption.voiceURI}`)
            )
        );
        if (nonFemaleVoice) {
          return nonFemaleVoice;
        }
      }
    }

    return searchPools.find((pool) => pool.length > 0)?.[0] || null;
  };

  if (!story) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-bounce mb-4 text-4xl">✨</div>
        <p className="text-gray-400 text-lg">Your masterpiece is being created...</p>
      </div>
    );
  }

  const handlePlayAudio = async (scene: Scene) => {
    const stopCurrentPlayback = () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      utteranceRef.current = null;
      boundaryDetectedRef.current = false;
      clearHighlightTimers();
      setPlayingSceneNumber(null);
      setHighlightedSceneNumber(null);
      setHighlightedText('');
    };

    if (playingSceneNumber === scene.scene_number) {
      stopCurrentPlayback();
      return;
    }

    stopCurrentPlayback();
    setLoadingSceneNumber(scene.scene_number);
    setPlayingSceneNumber(scene.scene_number);
    setHighlightedSceneNumber(scene.scene_number);
    setHighlightedText('');

    try {
      if (window.speechSynthesis) {
        const narrationText = scene.narration || scene.text;
        const utterance = new SpeechSynthesisUtterance(narrationText);
        utteranceRef.current = utterance;

        window.speechSynthesis.cancel();
        const matchingVoice = getPreferredVoice(selectedVoiceRef.current);

        if (matchingVoice) {
          utterance.voice = matchingVoice;
          utterance.lang = matchingVoice.lang;
        }

        utterance.rate = 0.95;
        utterance.pitch = selectedVoiceRef.current === 'male' ? 0.78 : 1.04;
        boundaryDetectedRef.current = false;

        utterance.onboundary = (event) => {
          if (typeof event.charIndex === 'number') {
            boundaryDetectedRef.current = true;
            clearHighlightTimers();
            const highlightEndIndex = getHighlightEndIndex(narrationText, event.charIndex);
            setHighlightedSceneNumber(scene.scene_number);
            setHighlightedText(narrationText.slice(0, highlightEndIndex));
          }
        };

        highlightFallbackTimeoutRef.current = window.setTimeout(() => {
          if (boundaryDetectedRef.current) {
            return;
          }

          const words = narrationText.match(/\S+\s*/g) || [];
          let wordIndex = 0;
          const fallbackIntervalMs = Math.max(320, Math.round(430 / utterance.rate));

          highlightTimerRef.current = window.setInterval(() => {
            if (wordIndex >= words.length) {
              clearHighlightTimers();
              return;
            }

            wordIndex += 1;
            const spokenWordCount = Math.min(wordIndex, words.length);
            const spokenText = words.slice(0, spokenWordCount).join('');
            setHighlightedSceneNumber(scene.scene_number);
            setHighlightedText(spokenText);
          }, fallbackIntervalMs);
        }, 1200);

        utterance.onend = () => {
          utteranceRef.current = null;
          boundaryDetectedRef.current = false;
          clearHighlightTimers();
          setPlayingSceneNumber(null);
          setHighlightedSceneNumber(scene.scene_number);
          setHighlightedText(narrationText);
        };

        utterance.onerror = () => {
          utteranceRef.current = null;
          boundaryDetectedRef.current = false;
          clearHighlightTimers();
          setPlayingSceneNumber(null);
          setHighlightedSceneNumber(null);
          setHighlightedText('');
        };

        window.speechSynthesis.speak(utterance);
      } else {
        setPlayingSceneNumber(null);
        setHighlightedSceneNumber(null);
        setHighlightedText('');
      }
    } catch (error) {
      console.error('Failed to generate or play TTS audio:', error);
      boundaryDetectedRef.current = false;
      clearHighlightTimers();
      setPlayingSceneNumber(null);
      setHighlightedSceneNumber(null);
      setHighlightedText('');
    } finally {
      setLoadingSceneNumber(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 w-full">
      <header className="mb-16 text-center">
        <h1 className="text-5xl md:text-7xl font-black mb-4 bg-clip-text text-transparent bg-linear-to-br from-light-primary to-purple-600 dark:from-dark-primary dark:to-blue-400">
          {story.title}
        </h1>
        <div className="w-24 h-2 bg-light-primary dark:bg-dark-primary mx-auto rounded-full"></div>
      </header>

      {story.scenes && story.scenes.length > 0 && (
        <div className="mb-10 flex justify-center">
          <div className="inline-flex items-center gap-4 rounded-full border border-gray-200 bg-white px-6 py-3 shadow-sm dark:border-gray-800 dark:bg-dark-surface">
                <span className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Voice
            </span>
            <div className="inline-flex rounded-full bg-gray-100 p-1 dark:bg-dark-bg/60">
              <button
                type="button"
                onClick={() => setVoiceSelection('female')}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  selectedVoice === 'female'
                    ? 'bg-light-primary text-white dark:bg-dark-primary dark:text-dark-bg'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Female
              </button>
              <button
                type="button"
                onClick={() => setVoiceSelection('male')}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  selectedVoice === 'male'
                    ? 'bg-light-primary text-white dark:bg-dark-primary dark:text-dark-bg'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Male
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* LEFT SIDE: STORY SCENES */}
        <div className="flex-1 w-full space-y-8 order-2 lg:order-1">
          {story.scenes && story.scenes.length > 0 ? (
            <div className="space-y-4">
              {story.scenes.map((scene, index) => (
                <SceneCard
                  key={index}
                  scene={scene}
                  index={index}
                  onPlayAudio={handlePlayAudio}
                  isPlaying={playingSceneNumber === scene.scene_number}
                  isLoadingAudio={loadingSceneNumber === scene.scene_number}
                  highlightedText={
                    highlightedSceneNumber === scene.scene_number ? highlightedText : null
                  }
                />
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
