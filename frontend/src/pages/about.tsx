import React from 'react';
import Layout from '../components/Layout';

export default function About(): React.JSX.Element {
  return (
    <Layout>
      <div className="py-20 max-w-4xl mx-auto">
        <h1 className="text-5xl font-black mb-12 tracking-tight">About StoryPixie</h1>
        
        <div className="space-y-12 text-lg text-gray-700 dark:text-gray-300">
          <section className="animate-fade-in-up" style={{ animationDelay: '0s' }}>
            <h2 className="text-3xl font-bold mb-4 text-dark-text dark:text-white">Project Vision</h2>
            <p>
              StoryPixie is an AI-powered multimodal storytelling agent designed to bring your imagination to life. By simply entering a text prompt, StoryPixie orchestrates a complex AI pipeline to generate a rich, interleaved experience consisting of story text, AI-generated images, professional-sounding voice narration, and an animated video.
            </p>
          </section>

          <section className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-3xl font-bold mb-4 text-dark-text dark:text-white">Technology Stack</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-light-primary dark:text-dark-primary font-bold mb-2">Frontend</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Next.js & React</li>
                  <li>Tailwind CSS</li>
                  <li>Axios for API calls</li>
                  <li>Responsive Design & Dark/Light Mode</li>
                </ul>
              </div>
              <div className="card">
                <h3 className="text-light-primary dark:text-dark-primary font-bold mb-2">Backend</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>FastAPI (Python)</li>
                  <li>Gemini AI (Google GenAI SDK)</li>
                  <li>Vertex AI Imagen (Images)</li>
                  <li>Google TTS (Audio)</li>
                  <li>MoviePy (Video)</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-3xl font-bold mb-4 text-dark-text dark:text-white">The AI Pipeline</h2>
            <p className="mb-4">
              When you submit a prompt, the following steps occur:
            </p>
            <ol className="list-decimal list-inside space-y-4">
              <li><strong>Gemini AI</strong> processes your prompt and generates multiple storyboard scenes, including narration text and image prompts.</li>
              <li><strong>Imagen (Vertex AI)</strong> generates high-quality images based on the specific scene descriptions.</li>
              <li><strong>Google Text-to-Speech</strong> converts the story text into a natural-sounding audio narration.</li>
              <li><strong>MoviePy</strong> compiles the images and audio into a final animated story video.</li>
              <li>Everything is served via a unified interface, creating a seamless storytelling experience.</li>
            </ol>
          </section>
        </div>
      </div>
    </Layout>
  );
}
