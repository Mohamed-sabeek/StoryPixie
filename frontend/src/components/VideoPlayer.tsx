import React from 'react';

const VideoPlayer: React.FC<{ url: string }> = ({ url }) => {
  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black">
      <video 
        controls 
        className="w-full h-full"
        src={url}
      >
        Your browser does not support the video element.
      </video>
    </div>
  );
};

export default VideoPlayer;
