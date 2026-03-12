import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-light-primary dark:border-dark-primary border-t-transparent dark:border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-4 border-blue-400 dark:border-dark-secondary border-b-transparent dark:border-b-transparent rounded-full animate-spin-slow"></div>
      </div>
      <p className="text-xl font-bold animate-pulse text-gray-500">
        Weaving your story...
      </p>
    </div>
  );
};

export default LoadingSpinner;
