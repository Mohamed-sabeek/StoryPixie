import React, { useState } from 'react';
import { Story } from './StoryViewer';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface DownloadProps {
  story: Story;
}

const DownloadStoryActions: React.FC<DownloadProps> = ({ story }) => {
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isImagesLoading, setIsImagesLoading] = useState(false);

  const dataUrlToBlob = (dataUrl: string) => {
    const [header, data] = dataUrl.split(',');
    const mimeMatch = header.match(/data:(.*?)(;base64)?$/);
    const mimeType = mimeMatch?.[1] || 'image/png';
    const binary = header.includes(';base64') ? atob(data) : decodeURIComponent(data);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return new Blob([bytes], { type: mimeType });
  };

  const getSceneImageBlob = async (imageSource: string) => {
    if (imageSource.startsWith('data:')) {
      return dataUrlToBlob(imageSource);
    }

    if (imageSource.startsWith('http://') || imageSource.startsWith('https://')) {
      try {
        const proxiedResponse = await fetch(`/api/image-proxy?url=${encodeURIComponent(imageSource)}`);
        if (!proxiedResponse.ok) {
          return null;
        }

        return proxiedResponse.blob();
      } catch {
        return null;
      }
    }

    try {
      const response = await fetch(imageSource);
      if (!response.ok) {
        return null;
      }

      return response.blob();
    } catch {
      return null;
    }
  };

  const blobToDataUrl = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
          return;
        }

        reject(new Error('Failed to convert image blob to data URL'));
      };
      reader.onerror = () => reject(new Error('Failed to read image blob'));
      reader.readAsDataURL(blob);
    });

  const downloadPDF = async () => {
    setIsPdfLoading(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 16;
      const contentWidth = pageWidth - margin * 2;
      const sceneImageMaxHeight = 92;
      const bodyLineHeight = 6.5;

      if (!story.scenes || story.scenes.length === 0) {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(24);
        const titleLines = pdf.splitTextToSize(story.title, contentWidth);
        pdf.text(titleLines, pageWidth / 2, 30, { align: 'center' });
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(12);
        const storyLines = pdf.splitTextToSize(story.story_text || '', contentWidth);
        pdf.text(storyLines, margin, 50);
        pdf.save(`${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
        return;
      }

      for (let index = 0; index < story.scenes.length; index += 1) {
        const scene = story.scenes[index];
        if (index > 0) {
          pdf.addPage();
        }

        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');

        let cursorY = margin - 2;

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.text(story.title, margin, cursorY);
        cursorY += 9;

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.text(`Scene ${scene.scene_number}`, margin, cursorY);
        cursorY += 8;

        if (scene.image) {
          const sceneBlob = await getSceneImageBlob(scene.image);
          if (sceneBlob) {
            const sceneImageData = await blobToDataUrl(sceneBlob);
            const imageProps = pdf.getImageProperties(sceneImageData);
            const imageAspectRatio = imageProps.width / imageProps.height;
            let imageWidth = contentWidth;
            let imageHeight = imageWidth / imageAspectRatio;

            if (imageHeight > sceneImageMaxHeight) {
              imageHeight = sceneImageMaxHeight;
              imageWidth = imageHeight * imageAspectRatio;
            }

            const imageX = margin + (contentWidth - imageWidth) / 2;

            pdf.setDrawColor(226, 232, 240);
            pdf.setFillColor(248, 250, 252);
            pdf.roundedRect(imageX - 2, cursorY - 2, imageWidth + 4, imageHeight + 4, 3, 3, 'FD');

            pdf.addImage(
              sceneImageData,
              imageProps.fileType || 'PNG',
              imageX,
              cursorY,
              imageWidth,
              imageHeight,
              undefined,
              'FAST'
            );
            cursorY += imageHeight + 12;
          }
        }

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        const textLines = pdf.splitTextToSize(scene.narration || scene.text || '', contentWidth);
        const linesPerPage = Math.max(1, Math.floor((pageHeight - cursorY - margin) / bodyLineHeight));

        let lineIndex = 0;
        while (lineIndex < textLines.length) {
          const pageLines = textLines.slice(lineIndex, lineIndex + linesPerPage);
          pdf.text(pageLines, margin, cursorY);
          lineIndex += pageLines.length;

          if (lineIndex < textLines.length) {
            pdf.addPage();
            pdf.setFillColor(255, 255, 255);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(15);
            pdf.text(`Scene ${scene.scene_number} (cont.)`, margin, margin);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(11);
            cursorY = margin + 9;
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
      const scenesWithImages = (story.scenes || []).filter((scene) => Boolean(scene.image));

      if (scenesWithImages.length === 0) {
        alert('No scene images are available for this story.');
        return;
      }

      let successCount = 0;
      for (const scene of scenesWithImages) {
        try {
          const imageSource = scene.image as string;
          const blob = await getSceneImageBlob(imageSource);
          if (!blob) {
            continue;
          }

          zip.file(`scene-${scene.scene_number}.png`, blob);
          successCount += 1;
        } catch {}
      }

      if (successCount === 0) {
        alert(
          'StoryPixie could not download any scene images for this story. Older stories using Firebase image URLs may need to be regenerated.'
        );
        return;
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, 'storypixie-images.zip');

      if (successCount < scenesWithImages.length) {
        alert(`Downloaded ${successCount} of ${scenesWithImages.length} scene images.`);
      }
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
    <>
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
    </>
  );
};

export default DownloadStoryActions;
