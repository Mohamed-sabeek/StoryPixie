import React, { useState } from 'react';
import { Story } from './StoryViewer';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface DownloadProps {
  story: Story;
}

const DownloadStoryActions: React.FC<DownloadProps> = ({ story }) => {
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isImagesLoading, setIsImagesLoading] = useState(false);

  const downloadPDF = async () => {
    setIsPdfLoading(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = margin;

      // Add Title
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      const titleLines = pdf.splitTextToSize(story.title, pageWidth - 2 * margin);
      pdf.text(titleLines, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += titleLines.length * 10 + 10;

      // Add Content (Scenes or Plain Text)
      if (story.scenes && story.scenes.length > 0) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');

        for (let i = 0; i < story.scenes.length; i++) {
          const scene = story.scenes[i];
          
          // Add text
          const textLines = pdf.splitTextToSize(`Scene ${i + 1}: ${scene.narration}`, pageWidth - 2 * margin);
          
          // Check page break for text
          if (yPosition + textLines.length * 7 > pdf.internal.pageSize.getHeight() - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          
          pdf.text(textLines, margin, yPosition);
          yPosition += textLines.length * 7 + 10;
        }
      } else if (story.story_text) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        const storyLines = pdf.splitTextToSize(story.story_text, pageWidth - 2 * margin);
        
        // Handle multi-page plain text
        let lineIndex = 0;
        const pageHeight = pdf.internal.pageSize.getHeight() - margin;
        
        while (lineIndex < storyLines.length) {
          const linesForPage = [];
          while (lineIndex < storyLines.length && yPosition + 7 < pageHeight) {
            linesForPage.push(storyLines[lineIndex]);
            lineIndex++;
            yPosition += 7;
          }
          
          pdf.text(linesForPage, margin, yPosition - (linesForPage.length * 7));
          
          if (lineIndex < storyLines.length) {
            pdf.addPage();
            yPosition = margin;
          }
        }
      }

      pdf.save(`${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsPdfLoading(false);
    }
  };

  const downloadImages = async () => {
    setIsImagesLoading(true);
    try {
      const zip = new JSZip();
      const imgFolder = zip.folder("scenes");

      if (!imgFolder) throw new Error("Could not create ZIP folder");

      const promises = (story.scenes || []).map(async (scene, index) => {
        if (!scene.image_prompt || true) return; // Images not yet implemented
        try {
          const response = await fetch(scene.image_prompt);
          const blob = await response.blob();
          imgFolder!.file(`scene_${index + 1}.jpg`, blob);
        } catch (err) {
          console.error(`Failed to fetch image ${index + 1}:`, err);
        }
      });

      await Promise.all(promises);

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_images.zip`);
    } catch (error) {
      console.error('Error creating ZIP:', error);
      alert('Failed to download images. Please try again.');
    } finally {
      setIsImagesLoading(false);
    }
  };

  const downloadMedia = async (url: string, filename: string) => {
    // If it's an external URL (like our mock data), opening in a new tab is the most reliable fallback
    // Since fetch() will throw a CORS TypeError before it even reaches the catch block if the server doesn't allow it.
    if (url.startsWith('http')) {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      saveAs(blob, filename);
    } catch (error) {
      console.error(`Error downloading ${filename}:`, error);
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const getSafeTitle = () => story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 pt-12 border-t border-gray-200 dark:border-gray-800">
      <h3 className="text-2xl font-bold mb-6 text-center">Download Your Story</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* PDF Download */}
        <button
          onClick={downloadPDF}
          disabled={isPdfLoading}
          className="flex flex-col items-center justify-center p-6 card hover:ring-2 hover:ring-light-primary dark:hover:ring-dark-primary transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPdfLoading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-light-primary dark:border-dark-primary mb-3"></div>
          ) : (
            <svg className="h-8 w-8 mb-3 text-gray-500 group-hover:text-light-primary dark:group-hover:text-dark-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          <span className="font-semibold text-sm">Download PDF</span>
        </button>

        {/* Images ZIP Download */}
        <button
          onClick={downloadImages}
          disabled={isImagesLoading || !story.scenes || story.scenes.length === 0}
          className="flex flex-col items-center justify-center p-6 card hover:ring-2 hover:ring-light-primary dark:hover:ring-dark-primary transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isImagesLoading ? (
             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-light-primary dark:border-dark-primary mb-3"></div>
          ) : (
            <svg className="h-8 w-8 mb-3 text-gray-500 group-hover:text-light-primary dark:group-hover:text-dark-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
          <span className="font-semibold text-sm">All Images (ZIP)</span>
        </button>

        {/* Video Download */}
        <button
          onClick={() => downloadMedia(story.video || '', `${getSafeTitle()}_video.mp4`)}
          disabled={!story.video}
          className="flex flex-col items-center justify-center p-6 card hover:ring-2 hover:ring-light-primary dark:hover:ring-dark-primary transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="h-8 w-8 mb-3 text-gray-500 group-hover:text-light-primary dark:group-hover:text-dark-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="font-semibold text-sm">Download Video</span>
        </button>

        {/* Audio Download */}
        <button
           onClick={() => downloadMedia(story.audio || '', `${getSafeTitle()}_audio.mp3`)}
           disabled={!story.audio}
          className="flex flex-col items-center justify-center p-6 card hover:ring-2 hover:ring-light-primary dark:hover:ring-dark-primary transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="h-8 w-8 mb-3 text-gray-500 group-hover:text-light-primary dark:group-hover:text-dark-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <span className="font-semibold text-sm">Download Audio</span>
        </button>

      </div>
    </div>
  );
};

export default DownloadStoryActions;
