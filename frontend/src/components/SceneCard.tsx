import React from 'react';

interface Scene {
  scene_number: number;
  text: string;
  image: string | null;
}

const SceneCard: React.FC<{ scene: Scene; index: number }> = ({ scene, index }) => {
  return (
    <div className="card w-full max-w-5xl mx-auto mb-20 flex flex-col md:flex-row gap-10 items-center animate-fade-in-up">
      {/* LEFT SIDE: TEXT CONTENT */}
      <div className="flex-1 md:flex-[1.5] flex flex-col gap-4 text-left">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-light-primary/10 dark:bg-dark-primary/10 text-light-primary dark:text-dark-primary font-bold text-sm">
            {scene.scene_number}
          </span>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wide">
            Scene {scene.scene_number}
          </h3>
        </div>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-lg md:text-xl leading-relaxed text-gray-700 dark:text-gray-300">
            {scene.text}
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: IMAGE CONTENT */}
      <div className="flex-1 md:max-w-[400px] w-full">
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
