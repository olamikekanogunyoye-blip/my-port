/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Cinematic Video Modal Player.
 * - Uploaded videos: Custom HTML5 player with play/pause, scrubber, timecode, mute/volume,
 *   fullscreen, and keyboard shortcuts (Space, Arrows, F, M).
 * - YouTube / Vimeo: Embedded iframe player.
 * - TikTok / Instagram: Thumbnail card with external direct viewer button.
 * - Multi-track audio: Voiceover and Soundtrack minimal players when URLs exist.
 */

import React, { useRef, useState, useEffect } from 'react';
import { WorkItem } from '../../types';
import { parseVideoUrl } from '../../lib/media';
import { buildWhatsAppLink } from '../../lib/contact';
import { WhatsAppSolidIcon } from '../ui/WhatsAppIcon';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  ExternalLink,
  Mic,
  Music,
  ArrowUpRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VideoModalProps {
  work: WorkItem | null;
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber?: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({ work, isOpen, onClose, whatsappNumber }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Audio track states
  const [playingAudio, setPlayingAudio] = useState<'voice' | 'music' | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);

  const videoInfo = work ? parseVideoUrl(work.mediaUrl || work.externalUrl) : null;

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setCurrentTime(0);
      setPlayingAudio(null);
      if (videoRef.current) {
        videoRef.current.pause();
      }
      if (voiceAudioRef.current) voiceAudioRef.current.pause();
      if (musicAudioRef.current) musicAudioRef.current.pause();
    }
  }, [isOpen]);

  // Keyboard shortcut listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Don't interfere if an iframe or input is focused
      if (document.activeElement?.tagName === 'INPUT') return;

      const video = videoRef.current;
      if (!video) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        video.currentTime = Math.min(video.currentTime + 5, video.duration || 0);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        video.currentTime = Math.max(video.currentTime - 5, 0);
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const toggleAudioTrack = (track: 'voice' | 'music') => {
    if (track === 'voice' && voiceAudioRef.current) {
      if (playingAudio === 'voice') {
        voiceAudioRef.current.pause();
        setPlayingAudio(null);
      } else {
        if (musicAudioRef.current) musicAudioRef.current.pause();
        voiceAudioRef.current.play();
        setPlayingAudio('voice');
      }
    } else if (track === 'music' && musicAudioRef.current) {
      if (playingAudio === 'music') {
        musicAudioRef.current.pause();
        setPlayingAudio(null);
      } else {
        if (voiceAudioRef.current) voiceAudioRef.current.pause();
        musicAudioRef.current.play();
        setPlayingAudio('music');
      }
    }
  };

  if (!work) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0B0B0C]/95 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.35 }}
            className="relative z-10 w-full max-w-5xl bg-[#151517] border border-[rgba(241,238,230,0.15)] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(241,238,230,0.1)] bg-[#0B0B0C]/70">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#C9A24D]" />
                <span className="font-mono text-xs uppercase tracking-widest text-[#F1EEE6]">
                  {work.title}
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="p-1.5 text-[#8A877F] hover:text-[#F1EEE6] transition-colors focus-visible:outline-2 focus-visible:outline-[#C9A24D]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Canvas */}
            <div className="relative aspect-video bg-[#0B0B0C] flex items-center justify-center overflow-hidden">
              {/* Case 1: External TikTok or Instagram Link */}
              {videoInfo?.openInNewTab ? (
                <div className="text-center p-8 space-y-4 max-w-md mx-auto">
                  {work.thumbnailUrl && (
                    <img
                      src={work.thumbnailUrl}
                      alt={work.title}
                      className="w-32 h-32 object-cover mx-auto rounded-md border border-[rgba(241,238,230,0.15)] mb-4"
                    />
                  )}
                  <p className="font-mono text-xs uppercase tracking-widest text-[#C9A24D]">
                    {videoInfo.providerLabel}
                  </p>
                  <p className="text-sm text-[#8A877F]">
                    This video is hosted on an external social platform that requires native view.
                  </p>
                  <a
                    href={videoInfo.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#C9A24D] text-[#0B0B0C] font-semibold font-sans uppercase text-xs tracking-wider hover:bg-[#E3B95F] transition-colors"
                  >
                    <span>{videoInfo.providerLabel || 'Open Video'}</span>
                    <ExternalLink size={16} />
                  </a>
                </div>
              ) : videoInfo?.provider === 'youtube' || videoInfo?.provider === 'vimeo' ? (
                /* Case 2: YouTube / Vimeo Embedded iframe */
                <iframe
                  src={
                    videoInfo.embedUrl
                      ? `${videoInfo.embedUrl}${videoInfo.embedUrl.includes('?') ? '&' : '?'}autoplay=1`
                      : ''
                  }
                  title={work.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                /* Case 3: Direct HTML5 Video Player */
                <>
                  <video
                    ref={videoRef}
                    src={work.mediaUrl || work.externalUrl}
                    poster={work.thumbnailUrl}
                    playsInline
                    onClick={togglePlay}
                    onTimeUpdate={() => {
                      if (videoRef.current) {
                        setCurrentTime(videoRef.current.currentTime);
                      }
                    }}
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        setDuration(videoRef.current.duration);
                      }
                    }}
                    onEnded={() => setIsPlaying(false)}
                    className="w-full h-full object-contain cursor-pointer"
                  />

                  {/* Play Overlay if paused */}
                  {!isPlaying && (
                    <button
                      onClick={togglePlay}
                      aria-label="Play video"
                      className="absolute w-16 h-16 rounded-full bg-[#0B0B0C]/80 border border-[#C9A24D] text-[#C9A24D] flex items-center justify-center hover:scale-110 transition-transform shadow-2xl"
                    >
                      <Play size={28} className="ml-1" />
                    </button>
                  )}

                  {/* Custom Player Controls Bar */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0B0B0C] via-[#0B0B0C]/70 to-transparent flex flex-col gap-2">
                    {/* Scrubber */}
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      step={0.1}
                      value={currentTime}
                      onChange={handleSeek}
                      aria-label="Video scrubber"
                      className="w-full accent-[#C9A24D] cursor-pointer h-1.5 bg-white/20 rounded-lg appearance-none"
                    />

                    {/* Controls Row */}
                    <div className="flex items-center justify-between text-[#F1EEE6] font-mono text-xs">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={togglePlay}
                          aria-label={isPlaying ? 'Pause' : 'Play'}
                          className="hover:text-[#C9A24D] transition-colors"
                        >
                          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                        </button>
                        <button
                          onClick={toggleMute}
                          aria-label={isMuted ? 'Unmute' : 'Mute'}
                          className="hover:text-[#C9A24D] transition-colors"
                        >
                          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                        <span className="text-[#8A877F]">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={toggleFullscreen}
                          aria-label="Toggle Fullscreen"
                          className="hover:text-[#C9A24D] transition-colors"
                        >
                          <Maximize size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Optional Audio Tracks Section (Voiceover & Soundtrack) */}
            {(work.voiceUrl || work.musicUrl) && (
              <div className="p-4 sm:p-6 border-t border-[rgba(241,238,230,0.1)] bg-[#0B0B0C] grid grid-cols-1 sm:grid-cols-2 gap-4">
                {work.voiceUrl && (
                  <div className="flex items-center justify-between p-3 border border-[rgba(241,238,230,0.1)] bg-[#151517]">
                    <div className="flex items-center gap-3">
                      <Mic size={16} className="text-[#C9A24D]" />
                      <span className="font-mono text-xs uppercase tracking-wider text-[#F1EEE6]">
                        Voiceover Track
                      </span>
                    </div>
                    <button
                      onClick={() => toggleAudioTrack('voice')}
                      className="font-mono text-[11px] uppercase tracking-wider text-[#C9A24D] hover:underline"
                    >
                      {playingAudio === 'voice' ? 'Pause' : 'Play Track'}
                    </button>
                    <audio
                      ref={voiceAudioRef}
                      src={work.voiceUrl}
                      onEnded={() => setPlayingAudio(null)}
                      className="hidden"
                    />
                  </div>
                )}

                {work.musicUrl && (
                  <div className="flex items-center justify-between p-3 border border-[rgba(241,238,230,0.1)] bg-[#151517]">
                    <div className="flex items-center gap-3">
                      <Music size={16} className="text-[#C9A24D]" />
                      <span className="font-mono text-xs uppercase tracking-wider text-[#F1EEE6]">
                        Soundtrack
                      </span>
                    </div>
                    <button
                      onClick={() => toggleAudioTrack('music')}
                      className="font-mono text-[11px] uppercase tracking-wider text-[#C9A24D] hover:underline"
                    >
                      {playingAudio === 'music' ? 'Pause' : 'Play Track'}
                    </button>
                    <audio
                      ref={musicAudioRef}
                      src={work.musicUrl}
                      onEnded={() => setPlayingAudio(null)}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Compact Discuss on WhatsApp Footer */}
            {whatsappNumber && (
              <div className="px-6 py-3 bg-[#0B0B0C] border-t border-[rgba(241,238,230,0.1)] flex items-center justify-between">
                <span className="font-mono text-xs text-[#8A877F]">
                  Inquire about a video project like this:
                </span>
                <a
                  href={buildWhatsAppLink(
                    whatsappNumber,
                    `Hello KEY OF DAVID, I saw "${work.title}" on your portfolio and I'd like to work with you.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#25D366] hover:text-[#C9A24D] transition-colors"
                >
                  <WhatsAppSolidIcon size={14} />
                  <span>Discuss this project on WhatsApp</span>
                  <ArrowUpRight size={13} />
                </a>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
