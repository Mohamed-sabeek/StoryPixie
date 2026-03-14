import React, { useState, useEffect } from 'react';

const steps = [
  'Initializing magic...',
  'Writing story...',
  'Generating scenes...',
  'Creating images...',
  'Generating narration...',
  'Rendering video...'
];

interface GenerationProgressProps {
  onCancel?: () => void;
}

export default function GenerationProgress({ onCancel }: GenerationProgressProps) {
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
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-light-primary/10 via-transparent to-dark-secondary/10 dark:from-dark-primary/10 dark:via-transparent dark:to-dark-secondary/10 opacity-50" />
      
      {/* Moving Shimmer Effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" style={{ backgroundSize: '200% 100%' }} />

      {/* Hero Spinner */}
      <div className="relative z-10 mb-10 animate-float">
        <div className="w-28 h-28 rounded-full border-4 border-gray-100 dark:border-gray-800/50 shadow-inner" />
        <div className="w-28 h-28 rounded-full border-4 border-transparent border-t-light-primary border-r-light-primary/30 dark:border-t-dark-primary dark:border-r-dark-primary/30 animate-spin absolute top-0 left-0" />
        <div className="w-28 h-28 rounded-full border-4 border-transparent border-b-blue-400/50 border-l-blue-400/20 animate-spin-slow absolute top-0 left-0" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative flex h-18 w-18 items-center justify-center rounded-full bg-white/95 dark:bg-dark-surface shadow-[0_10px_30px_rgba(59,130,246,0.16)] ring-1 ring-cyan-300/20 dark:ring-dark-primary/20">
            <div className="absolute inset-1 rounded-full bg-radial-[circle_at_top] from-cyan-200/35 via-white to-transparent dark:from-dark-primary/20 dark:via-dark-surface dark:to-transparent" />
            <div className="absolute inset-3 rounded-full border border-cyan-300/25 dark:border-dark-primary/20" />
            <svg className="relative h-12 w-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="17" fill="url(#portalGlow)" />
              <ellipse cx="32" cy="35" rx="14" ry="6.5" fill="url(#ringGlow)" className="animate-pulse" />
              <path d="M23 24L32 19L41 24V40L32 45L23 40V24Z" fill="url(#crystalFill)" stroke="url(#crystalStroke)" strokeWidth="1.8" />
              <path d="M32 19V45" stroke="#E0F2FE" strokeOpacity="0.85" strokeWidth="1.8" />
              <path d="M23 24L32 29L41 24" stroke="#BAE6FD" strokeOpacity="0.9" strokeWidth="1.8" />
              <path d="M23 40L32 34L41 40" stroke="#7DD3FC" strokeOpacity="0.9" strokeWidth="1.8" />
              <circle cx="20" cy="27" r="1.5" fill="#67E8F9" className="animate-pulse" />
              <circle cx="45" cy="22" r="1.8" fill="#60A5FA" className="animate-pulse" />
              <circle cx="46.5" cy="35.5" r="1.3" fill="#93C5FD" className="animate-pulse" />
              <defs>
                <radialGradient id="portalGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(32 32) rotate(90) scale(17)">
                  <stop stopColor="#67E8F9" stopOpacity="0.28" />
                  <stop offset="1" stopColor="#67E8F9" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="ringGlow" x1="18" y1="35" x2="46" y2="35" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#22D3EE" />
                  <stop offset="1" stopColor="#60A5FA" />
                </linearGradient>
                <linearGradient id="crystalFill" x1="32" y1="19" x2="32" y2="45" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ECFEFF" />
                  <stop offset="0.55" stopColor="#67E8F9" />
                  <stop offset="1" stopColor="#3B82F6" />
                </linearGradient>
                <linearGradient id="crystalStroke" x1="23" y1="19" x2="41" y2="45" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#A5F3FC" />
                  <stop offset="1" stopColor="#2563EB" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
      
      <div className="text-center mb-10 relative z-10">
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
      <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 w-full text-center relative z-10">
        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Estimated time: 10-20 seconds</p>
        {onCancel && (
          <button
            onClick={onCancel}
            type="button"
            className="mt-5 inline-flex items-center rounded-full border border-red-300 bg-white/90 px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 dark:border-red-500/30 dark:bg-dark-bg/90 dark:text-red-400 dark:hover:bg-red-900/20 cursor-pointer"
          >
            Stop Generating
          </button>
        )}
      </div>
    </div>
  );
}
