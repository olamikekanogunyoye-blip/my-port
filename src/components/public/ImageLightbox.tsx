/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Image Lightbox for Gallery inspection.
 * - Full-screen viewer
 * - Swipe gesture support on touch
 * - Arrow key navigation & Esc to close
 * - Zoom toggle
 * - Counter "03 / 12"
 * - Download button ONLY when work.allowDownload === true
 */

import React, { useState, useEffect, useCallback } from 'react';
import { WorkItem } from '../../types';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageLightboxProps {
  images: WorkItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const currentWork = images[currentIndex];

  const handleNext = useCallback(() => {
    setIsZoomed(false);
    onNavigate((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, onNavigate]);

  const handlePrev = useCallback(() => {
    setIsZoomed(false);
    onNavigate((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images.length, onNavigate]);

  useEffect(() => {
    if (!isOpen) {
      setIsZoomed(false);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (diff > 50) {
      handleNext(); // swipe left -> next
    } else if (diff < -50) {
      handlePrev(); // swipe right -> prev
    }
    setTouchStart(null);
  };

  const handleDownload = () => {
    if (!currentWork || !currentWork.allowDownload) return;
    const url = currentWork.mediaUrl || currentWork.thumbnailUrl;
    if (!url) return;

    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentWork.slug || 'artwork'}.webp`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen || !currentWork) return null;

  const counter = `${String(currentIndex + 1).padStart(2, '0')} / ${String(images.length).padStart(2, '0')}`;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[1000] bg-[#0B0B0C]/95 backdrop-blur-md flex flex-col justify-between"
        role="dialog"
        aria-modal="true"
        aria-label="Image Lightbox"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(241,238,230,0.1)] z-20">
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C9A24D]">
              {counter}
            </span>
            <span className="text-[#8A877F] hidden sm:inline">•</span>
            <span className="font-mono text-xs text-[#F1EEE6] hidden sm:inline uppercase tracking-wider">
              {currentWork.title}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Zoom Toggle */}
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              aria-label={isZoomed ? 'Zoom Out' : 'Zoom In'}
              className="p-2 text-[#8A877F] hover:text-[#C9A24D] transition-colors"
            >
              {isZoomed ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
            </button>

            {/* Download Button (Only when allowDownload === true) */}
            {currentWork.allowDownload && (
              <button
                onClick={handleDownload}
                aria-label="Download image"
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[rgba(241,238,230,0.15)] bg-[#151517] text-xs font-mono uppercase tracking-wider text-[#F1EEE6] hover:border-[#C9A24D] hover:text-[#C9A24D] transition-colors"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close Lightbox"
              className="p-2 text-[#8A877F] hover:text-[#F1EEE6] transition-colors ml-2"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Center Viewer Canvas with Prev/Next Controls */}
        <div className="flex-1 relative flex items-center justify-center p-4 sm:p-8 overflow-hidden">
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                aria-label="Previous Image"
                className="absolute left-4 sm:left-8 z-20 p-3 bg-[#151517]/80 border border-[rgba(241,238,230,0.1)] text-[#F1EEE6] hover:text-[#C9A24D] hover:border-[#C9A24D] transition-colors"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next Image"
                className="absolute right-4 sm:right-8 z-20 p-3 bg-[#151517]/80 border border-[rgba(241,238,230,0.1)] text-[#F1EEE6] hover:text-[#C9A24D] hover:border-[#C9A24D] transition-colors"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          {/* Active Image */}
          <div
            className={`max-w-full max-h-[75vh] transition-transform duration-300 ease-out ${
              isZoomed ? 'scale-150 cursor-zoom-out overflow-auto' : 'cursor-zoom-in'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <img
              src={currentWork.mediaUrl || currentWork.thumbnailUrl}
              alt={currentWork.title}
              className="max-h-[75vh] w-auto max-w-full object-contain mx-auto shadow-2xl border border-[rgba(241,238,230,0.1)] select-none"
            />
          </div>
        </div>

        {/* Bottom Caption Bar */}
        <div className="px-6 py-4 border-t border-[rgba(241,238,230,0.1)] bg-[#0B0B0C]/80 z-20">
          <div className="max-w-3xl mx-auto text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-sans font-semibold text-sm text-[#F1EEE6]">
                {currentWork.title}
              </h3>
              {currentWork.description && (
                <p className="text-xs text-[#8A877F] mt-0.5 line-clamp-1">
                  {currentWork.description}
                </p>
              )}
            </div>
            {currentWork.tools && currentWork.tools.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
                {currentWork.tools.map((tool) => (
                  <span
                    key={tool}
                    className="font-mono text-[10px] uppercase tracking-wider text-[#8A877F] px-2 py-0.5 border border-[rgba(241,238,230,0.08)] bg-[#151517]"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};
