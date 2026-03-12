import React, { useState } from 'react';
import Layout from '../components/Layout';
import StoryViewer from '../components/StoryViewer';
import DownloadStoryActions from '../components/DownloadStoryActions';
import { useStoryHistory, SavedStory } from '../hooks/useStoryHistory';

export default function HistoryPage() {
  const { stories, isLoaded, deleteStory, clearHistory } = useStoryHistory();
  const [selectedStory, setSelectedStory] = useState<SavedStory | null>(null);

  if (!isLoaded) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-light-primary dark:border-dark-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
        {selectedStory ? (
          <div>
            <button
              onClick={() => setSelectedStory(null)}
              className="mb-8 flex items-center text-gray-600 dark:text-gray-400 hover:text-light-primary dark:hover:text-dark-primary transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to History
            </button>
            <StoryViewer story={selectedStory} />
            <DownloadStoryActions story={selectedStory} />
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-10">
              <h1 className="text-4xl font-black">Story History</h1>
              {stories.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium text-sm"
                >
                  Clear History
                </button>
              )}
            </div>

            {stories.length === 0 ? (
              <div className="text-center py-20 card">
                <p className="text-xl text-gray-500 dark:text-gray-400 mb-6">
                  You haven't generated any stories yet.
                </p>
                <a href="/create" className="btn-primary inline-block">
                  Create Your First Story
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories.map((story) => (
                  <div key={story.id} className="card flex flex-col items-start hover:-translate-y-1 hover:shadow-xl cursor-pointer group" onClick={() => setSelectedStory(story)}>
                    <div className="w-full flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold line-clamp-1 group-hover:text-light-primary dark:group-hover:text-dark-primary transition-colors">
                        {story.title}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteStory(story.id);
                        }}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete story"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 flex-grow">
                      "{story.prompt}"
                    </p>
                    
                    <div className="text-xs text-gray-500 w-full flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-4">
                      <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                      <span className="text-light-primary dark:text-dark-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Read Story &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
