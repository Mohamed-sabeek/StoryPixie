import React from 'react';

const AudioPlayer: React.FC<{ url: string }> = ({ url }) => {
  return (
    <div className="w-full p-4 bg-gray-100 dark:bg-dark-bg/50 rounded-xl">
      <audio 
        controls 
        className="w-full"
        src={url}
      >
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default AudioPlayer;
