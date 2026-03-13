import React, { useState, useEffect } from 'react';

const steps = [
  'Initializing magic...',
  'Writing story...',
  'Generating scenes...',
  'Creating images...',
  'Generating narration...',
  'Rendering video...'
];

export default function GenerationProgress() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Mock progress progression for visualization purposes
  // In a real app, this would be driven by backend events
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2500); // Slightly faster for better UX feel during mock
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-3xl flex flex-col items-center mt-12 p-10 card glass animate-scale-in border border-light-primary/20 dark:border-dark-primary/20 shadow-2xl relative overflow-hidden group">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-light-primary/10 via-transparent to-dark-secondary/10 dark:from-dark-primary/10 dark:via-transparent dark:to-dark-secondary/10 opacity-50" />
      
      {/* Moving Shimmer Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" style={{ backgroundSize: '200% 100%' }} />

      {/* Hero Spinner */}
      <div className="relative mb-10 animate-float">
        <div className="w-28 h-28 rounded-full border-4 border-gray-100 dark:border-gray-800/50 shadow-inner" />
        <div className="w-28 h-28 rounded-full border-4 border-transparent border-t-light-primary border-r-light-primary/30 dark:border-t-dark-primary dark:border-r-dark-primary/30 animate-spin absolute top-0 left-0" />
        <div className="w-28 h-28 rounded-full border-4 border-transparent border-b-blue-400/50 border-l-blue-400/20 animate-spin-slow absolute top-0 left-0" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white dark:bg-dark-surface p-3 rounded-full shadow-lg">
            <svg className="w-10 h-10 text-light-primary dark:text-dark-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.642.316a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.823.771l-.465.541a2 2 0 01-1.836.755l-1.48-.184a2 2 0 01-1.784-2.433l.272-1.332a2 2 0 00-.167-1.522l-.367-.733a2 2 0 01.156-2.057l.733-.733a2 2 0 00.547-1.022l.477-2.387a6 6 0 00-.517-3.86l-.316-.642a6 6 0 01-.517-3.86l.512-2.559a2 2 0 00-.771-1.823l-.541-.465a2 2 0 01-.755-1.836l.184-1.48a2 2 0 012.433-1.784l1.332.272a2 2 0 001.522-.167l.733-.367a2 2 0 012.057.156l.733.733a2 2 0 001.022.547l2.387.477a6 6 0 003.86-.517l.642-.316a6 6 0 013.86-.517l2.559.512a2 2 0 001.823-.771l.465-.541a2 2 0 011.836-.755l1.48.184a2 2 0 011.784 2.433l-.272 1.332a2 2 0 00.167 1.522l.367.733a2 2 0 01-.156 2.057l-.733.733a2 2 0 00-.547 1.022l-.477 2.387a6 6 0 00.517 3.86l.316.642a6 6 0 01.517 3.86l-.512 2.559a2 2 0 00.771 1.823l.541.465a2 2 0 01.755 1.836l-.184 1.48a2 2 0 01-2.433 1.784l-1.332-.272a2 2 0 00-1.522.167l-.733.367a2 2 0 01-2.057-.156l-.733-.733z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="text-center mb-10 relative">
        <h3 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-light-primary via-blue-600 to-dark-secondary dark:from-dark-primary dark:via-blue-400 dark:to-dark-secondary animate-pulse">
          Crafting Your Universe
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Please wait while our AI weavers work their magic</p>
      </div>
      
      <div className="w-full space-y-4 px-4 relative z-10 max-w-lg">
        {steps.map((step, index) => {
          let stepStatus = "pending";
          if (index < currentStepIndex) stepStatus = "completed";
          if (index === currentStepIndex) stepStatus = "active";
          
          return (
            <div key={index} className={`flex items-center p-3 rounded-2xl transition-all duration-700 transform ${
              stepStatus === "active" 
                ? "opacity-100 scale-105 bg-white/80 dark:bg-dark-bg/80 shadow-xl border border-light-primary/30 dark:border-dark-primary/30 translate-x-1" 
                : stepStatus === "completed" 
                  ? "opacity-70 grayscale-[0.5] translate-x-0" 
                  : "opacity-30 translate-x-0"
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 shadow-sm transition-all duration-500 ${
                stepStatus === "completed" ? "bg-green-500 text-white" :
                stepStatus === "active" ? "bg-gradient-to-br from-light-primary to-blue-600 dark:from-dark-primary dark:to-dark-secondary text-white shadow-lg shadow-light-primary/20" :
                "bg-gray-100 dark:bg-gray-800 text-gray-400"
              }`}>
                {stepStatus === "completed" ? (
                  <svg className="w-5 h-5 animate-fade-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-xs font-black">{index + 1}</span>
                )}
              </div>
              <span className={`text-lg transition-colors duration-300 ${
                stepStatus === "active" ? "font-bold text-light-text dark:text-dark-text" : "font-medium text-gray-400"
              }`}>
                {step}
              </span>
              
              {/* Active Pulse Indicator right side */}
              {stepStatus === "active" && (
                <div className="ml-auto flex space-x-1 items-center">
                  <span className="text-xs text-light-primary dark:text-dark-primary font-bold mr-2 uppercase tracking-widest animate-pulse">Processing</span>
                  <div className="w-2 h-2 rounded-full bg-light-primary dark:bg-dark-primary animate-ping" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 w-full text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Estimated time: 10-20 seconds</p>
      </div>
    </div>
  );
}
