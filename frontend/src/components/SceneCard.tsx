import React from 'react';

interface Scene {
  scene_number: number;
  title: string;
  narration: string;
  image_prompt: string;
}

const SceneCard: React.FC<{ scene: Scene; index: number }> = ({ scene, index }) => {
  return (
    <div className="card w-full max-w-4xl mx-auto mb-12 flex flex-col md:flex-row gap-8 items-center animate-fade-in-up">
      <div className={`flex-1 ${index % 2 !== 0 ? 'md:order-2' : ''}`}>
        <h3 className="text-sm font-bold uppercase tracking-widest text-light-primary dark:text-dark-primary mb-2">
          Scene {scene.scene_number || index + 1}: {scene.title}
        </h3>
        <p className="text-lg leading-relaxed italic">
          "{scene.narration}"
        </p>
      </div>
      <div className={`flex-1 w-full relative group ${index % 2 !== 0 ? 'md:order-1' : ''}`}>
        <div className="aspect-video rounded-xl overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-[1.02] bg-gray-100 dark:bg-dark-surface flex items-center justify-center p-6 text-center border border-dashed border-gray-300 dark:border-gray-700">
          <div className="flex flex-col items-center gap-3">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs text-gray-400 font-medium px-4">
              {scene.image_prompt}
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <span className="text-white text-xs font-medium italic">Visualization Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SceneCard;
