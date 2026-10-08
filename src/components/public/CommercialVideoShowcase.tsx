/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Commercial Video Showcase Component
 * "SELECTED COMMERCIAL WORKS // AI SPEC ADS"
 * - Broadcast-quality 9:16 vertical card grid (aspect-[9/16])
 * - Responsive 3-column layout (collapsing to 2 cols on tablet, 1 on mobile)
 * - Frosted glass containers (bg-zinc-950/80 backdrop-blur-md border border-white/10 rounded-2xl)
 * - Interactive desktop lift: hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-cyan-500/10
 * - Inline responsive iframe activation + Theater Modal player
 * - 9 exact commercial productions with direct shorts links and metadata
 */

import React, { useState } from 'react';
import { Play, ArrowUpRight, X, Sparkles, Film, Maximize2, RotateCcw } from 'lucide-react';
import { Reveal } from '../ui/Reveal';
import { motion, AnimatePresence } from 'motion/react';
import { logAnalyticsEvent } from '../../lib/firebase';

export interface CommercialVideoItem {
  id: string;
  youtubeId: string;
  embedUrl: string;
  directUrl: string;
  category: string;
  title: string;
  specs: string;
  filterTag: 'all' | 'commercial' | 'cinema' | 'generative';
}

export const COMMERCIAL_VIDEOS: CommercialVideoItem[] = [
  {
    id: 'comm-1',
    youtubeId: 'lS8FYD2X5aI',
    embedUrl: 'https://www.youtube.com/embed/lS8FYD2X5aI',
    directUrl: 'https://youtube.com/shorts/lS8FYD2X5aI',
    category: 'Spec Commercial // Motion Design',
    title: 'Kinetic Spec Reel',
    specs: '4K DCI · 60 FPS · SYNTHETIC MOTION',
    filterTag: 'commercial',
  },
  {
    id: 'comm-2',
    youtubeId: 'WScgvqkZa4o',
    embedUrl: 'https://www.youtube.com/embed/WScgvqkZa4o',
    directUrl: 'https://youtube.com/shorts/WScgvqkZa4o',
    category: 'AI Cinematography // Brand Film',
    title: 'Atmospheric Brand Film',
    specs: '35mm ANAMORPHIC · LOG-C · GEN-VIDEO',
    filterTag: 'cinema',
  },
  {
    id: 'comm-3',
    youtubeId: 'kvKtVSD5pUw',
    embedUrl: 'https://www.youtube.com/embed/kvKtVSD5pUw',
    directUrl: 'https://youtube.com/shorts/kvKtVSD5pUw',
    category: 'Commercial Spec // Visual Effects',
    title: 'VFX Commercial Spec',
    specs: 'NEURAL VFX · COMPOSITING · SOUND DESIGN',
    filterTag: 'commercial',
  },
  {
    id: 'comm-4',
    youtubeId: 'mHe3dMjZu_s',
    embedUrl: 'https://www.youtube.com/embed/mHe3dMjZu_s',
    directUrl: 'https://youtube.com/shorts/mHe3dMjZu_s',
    category: 'Generative Direction // Dynamic Cut',
    title: 'Dynamic Generative Cut',
    specs: 'FAST CUT · PACING ARCHITECTURE · 24 FPS',
    filterTag: 'generative',
  },
  {
    id: 'comm-5',
    youtubeId: '2igkafjDcJs',
    embedUrl: 'https://www.youtube.com/embed/2igkafjDcJs',
    directUrl: 'https://youtube.com/shorts/2igkafjDcJs',
    category: 'Brand Campaign // Creative Tech',
    title: 'Creative Tech Campaign',
    specs: 'ENTERPRISE AI · BRAND LORE · COLOR GRADE',
    filterTag: 'commercial',
  },
  {
    id: 'comm-6',
    youtubeId: 'UpFyTDc-JRY',
    embedUrl: 'https://www.youtube.com/embed/UpFyTDc-JRY',
    directUrl: 'https://youtube.com/shorts/UpFyTDc-JRY',
    category: 'Cinematic Spec // Motion Transfer',
    title: 'Cinematic Motion Transfer',
    specs: 'SPATIAL DEPTH · TEXTURE PIPELINE · 4K',
    filterTag: 'cinema',
  },
  {
    id: 'comm-7',
    youtubeId: 'yK9lJ6yfRs4',
    embedUrl: 'https://www.youtube.com/embed/yK9lJ6yfRs4',
    directUrl: 'https://youtube.com/shorts/yK9lJ6yfRs4',
    category: 'Product Narrative // Visual AI',
    title: 'Product Narrative Spec',
    specs: 'MACRO PRODUCT · LIGHTING SIMULATION',
    filterTag: 'commercial',
  },
  {
    id: 'comm-8',
    youtubeId: 'CaqrXBcyBoI',
    embedUrl: 'https://www.youtube.com/embed/CaqrXBcyBoI',
    directUrl: 'https://youtube.com/shorts/CaqrXBcyBoI',
    category: 'Spec Commercial // High Pacing',
    title: 'High-Pacing Commercial Cut',
    specs: 'SOUND DRIVEN · RETENTION EDIT · HDR',
    filterTag: 'generative',
  },
  {
    id: 'comm-9',
    youtubeId: 'Bt1R_MaeMw8',
    embedUrl: 'https://www.youtube.com/embed/Bt1R_MaeMw8',
    directUrl: 'https://youtube.com/shorts/Bt1R_MaeMw8',
    category: 'Showcase Reel // 4K Generative Pipeline',
    title: 'Director Showcase Reel',
    specs: 'FULL PIPELINE · BESPOKE MODELS · MASTER REEL',
    filterTag: 'cinema',
  },
];

export const CommercialVideoShowcase: React.FC = () => {
  const [activeInlineVideoId, setActiveInlineVideoId] = useState<string | null>(null);
  const [modalVideo, setModalVideo] = useState<CommercialVideoItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'commercial' | 'cinema' | 'generative'>('all');

  const filteredReels = activeFilter === 'all'
    ? COMMERCIAL_VIDEOS
    : COMMERCIAL_VIDEOS.filter((v) => v.filterTag === activeFilter);

  const handlePlayInline = (id: string) => {
    setActiveInlineVideoId(id);
    const item = COMMERCIAL_VIDEOS.find((v) => v.id === id);
    if (item) {
      logAnalyticsEvent('play_reel', { reel_id: id, title: item.title, category: item.category });
    }
  };

  const handleStopInline = () => {
    setActiveInlineVideoId(null);
  };

  return (
    <section
      id="commercials"
      className="relative py-28 sm:py-36 px-5 sm:px-10 lg:px-16 bg-[#09090b] text-[#F1EEE6] overflow-hidden border-t border-white/[0.08]"
      aria-labelledby="commercial-showcase-title"
    >
      {/* Anchor alias supporting both #commercials and #commercial-works */}
      <span id="commercial-works" className="sr-only" aria-hidden="true" />
      {/* Ambient Subtle Lighting Accent */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(201,162,77,0.03)_0%,transparent_70%)] rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-[1440px] mx-auto relative z-10">
        {/* Section Header & Subtitle */}
        <Reveal direction="up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 mb-12 border-b border-white/[0.08]">
            <div>
              {/* Wide-Tracked Subtitle Kicker */}
              <div className="flex items-center gap-2 mb-3 font-mono text-xs text-[#C9A24D] uppercase tracking-[0.22em] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A24D]" />
                <span>01 · COMMERCIAL REELS · SPEC ADS</span>
              </div>

              {/* High-Contrast Main Heading */}
              <h2
                id="commercial-showcase-title"
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F1EEE6] tracking-tight uppercase font-sans"
              >
                Selected Commercial Works
              </h2>

              <p className="text-[#8A877F] text-sm sm:text-base mt-2 max-w-2xl font-light">
                High-concept brand films, synthetic camera direction, and dynamic generative motion.
              </p>
            </div>

            {/* Filter Tabs / Segmented Controls */}
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-white/[0.03] border border-white/10 backdrop-blur-md self-start md:self-auto font-mono text-xs">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3.5 py-1.5 rounded transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-[#C9A24D] text-[#0B0B0C] font-semibold shadow-sm'
                    : 'text-[#8A877F] hover:text-[#F1EEE6]'
                }`}
              >
                All Reels ({COMMERCIAL_VIDEOS.length})
              </button>
              <button
                onClick={() => setActiveFilter('commercial')}
                className={`px-3.5 py-1.5 rounded transition-all cursor-pointer ${
                  activeFilter === 'commercial'
                    ? 'bg-[#C9A24D] text-[#0B0B0C] font-semibold shadow-sm'
                    : 'text-[#8A877F] hover:text-[#F1EEE6]'
                }`}
              >
                Spec Ads
              </button>
              <button
                onClick={() => setActiveFilter('cinema')}
                className={`px-3.5 py-1.5 rounded transition-all cursor-pointer ${
                  activeFilter === 'cinema'
                    ? 'bg-[#C9A24D] text-[#0B0B0C] font-semibold shadow-sm'
                    : 'text-[#8A877F] hover:text-[#F1EEE6]'
                }`}
              >
                Cinema
              </button>
              <button
                onClick={() => setActiveFilter('generative')}
                className={`px-3.5 py-1.5 rounded transition-all cursor-pointer ${
                  activeFilter === 'generative'
                    ? 'bg-[#C9A24D] text-[#0B0B0C] font-semibold shadow-sm'
                    : 'text-[#8A877F] hover:text-[#F1EEE6]'
                }`}
              >
                Gen-Cuts
              </button>
            </div>
          </div>
        </Reveal>

        {/* ======================================================== */}
        {/* 9:16 VERTICAL COMMERCIAL VIDEO GRID (3 Columns)          */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredReels.map((reel, index) => {
            const isPlayingInline = activeInlineVideoId === reel.id;
            const posterUrl = `https://img.youtube.com/vi/${reel.youtubeId}/hqdefault.jpg`;

            return (
              <Reveal key={reel.id} delay={index * 0.05} direction="up">
                <div
                  className="group relative bg-[#0c0d12]/90 backdrop-blur-md border border-white/[0.08] rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/70 flex flex-col"
                  style={{ willChange: 'transform' }}
                >
                  {/* Top Bar inside Card */}
                  <div className="px-4 py-3 border-b border-white/[0.06] bg-black/40 flex items-center justify-between font-mono text-[11px] text-zinc-400">
                    <span className="text-zinc-300 font-semibold tracking-wider">
                      REEL 0{index + 1}
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                      9:16 VERTICAL
                    </span>
                  </div>

                  {/* 9:16 Vertical Container */}
                  <div className="relative aspect-[9/16] w-full bg-[#08080a] overflow-hidden">
                    {isPlayingInline ? (
                      /* Active Responsive YouTube Embed */
                      <div className="relative w-full h-full">
                        <iframe
                          src={`${reel.embedUrl}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                          title={reel.category}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          className="w-full h-full border-0"
                          loading="lazy"
                        />
                        {/* Stop/Reset Inline Player Button */}
                        <button
                          onClick={handleStopInline}
                          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/80 hover:bg-black text-white border border-white/20 transition-all cursor-pointer"
                          aria-label="Stop playback"
                          title="Reset reel"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      /* High-Performance Poster & Clean Play State */
                      <div className="relative w-full h-full cursor-pointer" onClick={() => handlePlayInline(reel.id)}>
                        {/* Video Thumbnail with Cinematic Grading */}
                        <img
                          src={posterUrl}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = `https://img.youtube.com/vi/${reel.youtubeId}/mqdefault.jpg`;
                          }}
                          alt={reel.category}
                          className="w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                          loading="lazy"
                        />

                        {/* Anamorphic Gradient Scrims for contrast */}
                        <div
                          className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/30 group-hover:via-black/20 transition-all pointer-events-none"
                          aria-hidden="true"
                        />

                        {/* Top Overlay Badge */}
                        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10 pointer-events-none font-mono text-[10px] text-[#F1EEE6]/80">
                          <span className="bg-black/60 px-2.5 py-1 rounded border border-white/10 backdrop-blur-sm tracking-wider uppercase">
                            4K DCI
                          </span>
                          <span className="bg-black/60 px-2.5 py-1 rounded border border-white/10 backdrop-blur-sm tracking-wider uppercase text-[#8A877F]">
                            CINEMA
                          </span>
                        </div>

                        {/* Center Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <div className="w-14 h-14 rounded-full bg-black/70 group-hover:bg-[#C9A24D] border border-white/20 group-hover:border-[#C9A24D] text-white group-hover:text-black flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-xl">
                            <Play size={20} className="ml-0.5 fill-current" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Project Metadata & "Watch Reel ↗" prompt */}
                  <div className="p-4 bg-[#0a0a0d]/95 border-t border-white/[0.06] flex flex-col justify-between gap-3">
                    <div>
                      {/* Project Category Label */}
                      <span className="font-mono text-[11px] uppercase tracking-widest text-[#C9A24D] font-medium block">
                        {reel.category}
                      </span>
                      {/* Title & Technical Specs */}
                      <h3 className="font-bold text-white text-base tracking-tight mt-0.5">
                        {reel.title}
                      </h3>
                      <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider mt-1">
                        {reel.specs}
                      </p>
                    </div>

                    {/* Action Prompts: Inline Play + Direct YouTube Shorts Link */}
                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                      <button
                        onClick={() => handlePlayInline(reel.id)}
                        className="font-mono text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Play size={12} className="fill-current text-[#C9A24D]" />
                        <span>{isPlayingInline ? 'Playing Reel' : 'Play In-Place'}</span>
                      </button>

                      <a
                        href={reel.directUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Watch ${reel.title} on YouTube Shorts`}
                        className="font-mono text-xs text-zinc-400 hover:text-[#C9A24D] flex items-center gap-1 transition-colors group/link"
                      >
                        <span>Watch Reel</span>
                        <ArrowUpRight size={13} className="transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Global Reel CTA Banner */}
        <Reveal delay={0.2} direction="up">
          <div className="mt-16 p-6 sm:p-8 rounded-xl bg-[#121318] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#C9A24D] shrink-0">
                <Film size={20} />
              </div>
              <div>
                <h4 className="font-bold text-[#F1EEE6] text-base tracking-tight font-sans">
                  Need a Bespoke Spec Commercial or AI Director Reel?
                </h4>
                <p className="text-[#8A877F] text-xs sm:text-sm font-light mt-0.5">
                  Full generative production from concept and prompt architecture to 4K color grade.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a
                href="https://www.youtube.com/@Keyofdavild/shorts"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded bg-transparent hover:bg-white/[0.04] text-[#F1EEE6] border border-white/15 font-mono text-xs uppercase tracking-wider text-center transition-all"
              >
                All Shorts ↗
              </a>
              <a
                href="#contact"
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded bg-[#C9A24D] text-[#0B0B0C] hover:bg-[#E3B95F] font-mono text-xs uppercase tracking-wider font-semibold text-center transition-all cursor-pointer"
              >
                Work With Me
              </a>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Theater Lightbox Modal */}
      <AnimatePresence>
        {modalVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
            onClick={() => setModalVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md aspect-[9/16] bg-black rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setModalVideo(null)}
                className="absolute top-4 right-4 z-40 p-2.5 rounded-full bg-black/80 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Close Theater View"
              >
                <X size={18} />
              </button>
              <iframe
                src={`${modalVideo.embedUrl}?autoplay=1&rel=0`}
                title={modalVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
