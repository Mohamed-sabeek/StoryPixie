import React from 'react';

interface Scene {
  scene_number: number;
  text: string;
  image: string | null;
  image_url?: string | null;
  audio?: string | null;
  title?: string;
  narration?: string;
}

interface SceneCardProps {
  scene: Scene;
  index: number;
  onPlayAudio?: (scene: Scene) => void;
  isPlaying?: boolean;
  isLoadingAudio?: boolean;
  highlightedText?: string | null;
}

const SceneCard: React.FC<SceneCardProps> = ({
  scene,
  onPlayAudio,
  isPlaying,
  isLoadingAudio,
  highlightedText,
}) => {
  const fullText = scene.narration || scene.text;
  const highlightLength = highlightedText?.length || 0;
  const spokenText = highlightLength > 0 ? fullText.slice(0, highlightLength) : "";
  const remainingText = highlightLength > 0 ? fullText.slice(highlightLength) : fullText;

  return (
    <div
      className={`card relative w-full max-w-5xl mx-auto mb-20 flex flex-col md:flex-row gap-10 items-center animate-fade-in-up transition-all duration-500 ${
        isPlaying ? 'shadow-2xl ring-1 ring-light-primary/30 dark:ring-dark-primary/30' : ''
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-500 ${
          isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute inset-x-6 top-4 h-16 rounded-full bg-light-primary/10 blur-2xl dark:bg-dark-primary/10" />
      </div>

      {/* LEFT SIDE: TEXT CONTENT */}
      <div className="relative z-10 flex-1 md:flex-[1.5] flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-light-primary/10 dark:bg-dark-primary/10 text-light-primary dark:text-dark-primary font-bold text-sm">
              {scene.scene_number}
            </span>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wide">
              Scene {scene.scene_number}
            </h3>
          </div>

          {onPlayAudio && (
            <button
              type="button"
              onClick={() => onPlayAudio(scene)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                isPlaying
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-light-primary text-white hover:bg-blue-600 dark:bg-dark-primary dark:text-dark-bg'
              }`}
            >
              {isLoadingAudio ? (
                <span className="h-4 w-4 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  {isPlaying ? (
                    <path d="M7 6h3v12H7zm7 0h3v12h-3z" />
                  ) : (
                    <path d="M8 5v14l11-7z" />
                  )}
                </svg>
              )}
              <span>{isPlaying ? 'Stop' : 'Listen'}</span>
            </button>
          )}
        </div>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p
            className={`text-lg md:text-xl leading-relaxed transition-all duration-500 ${
              isPlaying
                ? 'text-gray-800 dark:text-gray-100'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {spokenText ? (
              <>
                <span
                  className={`box-decoration-clone rounded-lg px-1.5 py-0.5 text-light-text shadow-sm transition-all duration-300 ease-out filter-[drop-shadow(0_0_0.65rem_rgba(34,211,238,0.14))] dark:text-dark-text ${
                    isPlaying
                      ? 'bg-linear-to-r from-cyan-200/55 via-light-primary/32 to-blue-300/40 shadow-cyan-400/20 dark:from-cyan-100/22 dark:via-dark-primary/34 dark:to-blue-200/22'
                      : 'bg-linear-to-r from-light-primary/18 to-cyan-200/14 dark:from-dark-primary/20 dark:to-cyan-200/12'
                  }`}
                >
                  <span className="bg-linear-to-r from-cyan-700 via-sky-700 to-blue-700 bg-clip-text text-transparent transition-all duration-300 dark:from-cyan-100 dark:via-white dark:to-blue-100">
                    {spokenText}
                  </span>
                </span>
                <span className="transition-all duration-300 ease-out opacity-90">
                  {remainingText}
                </span>
              </>
            ) : (
              fullText
            )}
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: IMAGE CONTENT */}
      <div className="relative z-10 flex-1 md:max-w-100 w-full">
        <div className="relative group shadow-xl rounded-2xl overflow-hidden bg-gray-100 dark:bg-dark-surface border border-gray-200 dark:border-gray-800 transition-all duration-500 hover:shadow-2xl">
          {scene.image ? (
            <img 
              src={scene.image} 
              alt={`Scene ${scene.scene_number}`}
              className="w-full h-auto object-cover aspect-square md:aspect-auto transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="aspect-square flex items-center justify-center p-8 text-center bg-gray-50 dark:bg-dark-surface/50">
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs font-medium italic">Image Pending</p>
              </div>
            </div>
          )}
          
          <div className="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/5 rounded-2xl pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default SceneCard;
