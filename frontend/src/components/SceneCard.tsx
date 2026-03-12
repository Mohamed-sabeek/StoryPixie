import React from 'react';

interface Scene {
  text: string;
  image: string;
}

const SceneCard: React.FC<{ scene: Scene; index: number }> = ({ scene, index }) => {
  return (
    <div className="card w-full max-w-4xl mx-auto mb-12 flex flex-col md:flex-row gap-8 items-center animate-fade-in-up">
      <div className={`flex-1 ${index % 2 !== 0 ? 'md:order-2' : ''}`}>
        <h3 className="text-sm font-bold uppercase tracking-widest text-light-primary dark:text-dark-primary mb-2">
          Scene {index + 1}
        </h3>
        <p className="text-lg leading-relaxed italic">
          "{scene.text}"
        </p>
      </div>
      <div className={`flex-1 w-full relative group ${index % 2 !== 0 ? 'md:order-1' : ''}`}>
        <div className="aspect-video rounded-xl overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
          <img 
            src={scene.image} 
            alt={`Scene ${index + 1}`} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <span className="text-white text-xs font-medium">AI Generated Image</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SceneCard;
