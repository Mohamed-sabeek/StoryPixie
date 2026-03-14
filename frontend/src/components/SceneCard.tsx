import React from 'react';

interface Scene {
  scene_number: number;
  text: string;
  image: string | null;
}

const SceneCard: React.FC<{ scene: Scene; index: number }> = ({ scene, index }) => {
  return (
    <div className="card w-full max-w-4xl mx-auto mb-16 flex flex-col gap-6 animate-fade-in-up">
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-bold text-light-primary dark:text-dark-primary">
          Scene {scene.scene_number}
        </h3>
      </div>
      
      <div className="w-full relative group shadow-2xl rounded-2xl overflow-hidden bg-gray-100 dark:bg-dark-surface border border-gray-200 dark:border-gray-800">
        {scene.image ? (
          <img 
            src={scene.image} 
            alt={`Scene ${scene.scene_number}`}
            className="w-full h-auto object-cover min-h-[300px] transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="aspect-video flex items-center justify-center p-12 text-center">
            <div className="flex flex-col items-center gap-4 text-gray-400">
              <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium italic">Image generation skipped or failed</p>
            </div>
          </div>
        )}
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg md:text-xl leading-relaxed text-gray-700 dark:text-gray-300">
          {scene.text}
        </p>
      </div>
      
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent mt-4"></div>
    </div>
  );
};

export default SceneCard;
