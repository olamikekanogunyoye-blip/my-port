/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Portfolio Section (#portfolio)
 * - Animated Brass-underline filter tabs (ordered by order)
 * - FEATURED 2.39:1 widescreen card at top of "All"
 * - Multi-format rendering:
 *   - VIDEOS: 16:9 cards with play button, opens VideoModal
 *   - IMAGES: Responsive masonry gallery, hover overlay, opens ImageLightbox
 *   - WRITING: Editorial list rows with reading time, links to /work/:slug
 *   - AUTOMATION: Problem -> Solution -> Result mini-layout case cards, links to /work/:slug
 * - Tasteful empty state when no works are published: 3 widescreen frames with "Selected work, coming soon"
 */

import React, { useState } from 'react';
import { WorkItem, CategoryItem } from '../../types';
import { VideoModal } from './VideoModal';
import { ImageLightbox } from './ImageLightbox';
import { Reveal } from '../ui/Reveal';
import { KeyGlyph } from '../ui/KeyLogo';
import { Play, ArrowUpRight, Clock, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { DEFAULT_WORKS, DEFAULT_CATEGORIES } from '../../lib/db';
import { logAnalyticsEvent } from '../../lib/firebase';

interface PortfolioSectionProps {
  works: WorkItem[];
  categories: CategoryItem[];
  whatsappNumber?: string;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  works,
  categories,
  whatsappNumber,
}) => {
  const [selectedTab, setSelectedTab] = useState<string>('all');

  // Modal & Lightbox states
  const [activeVideoWork, setActiveVideoWork] = useState<WorkItem | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Guarantee categories have items
  const allCategories = categories && categories.length > 0 ? categories : (DEFAULT_CATEGORIES as CategoryItem[]);

  // Filter categories by published and sort
  const sortedCategories = [...allCategories]
    .filter((c) => c.published && !c.slug.includes('blog') && !c.label.toLowerCase().includes('blog'))
    .sort((a, b) => a.order - b.order);

  // Guarantee works have items (always includes director's video works)
  const effectiveWorks = works && works.length > 0 ? works : DEFAULT_WORKS;

  // Filter works by published
  const publishedWorks = effectiveWorks.filter((w) => w.published);

  // Current tab filtered works
  const filteredWorks = publishedWorks.filter((work) => {
    if (selectedTab === 'all') return true;
    const cat = sortedCategories.find((c) => c.slug === selectedTab || c.id === selectedTab);
    if (!cat) return true;
    return work.categoryId === cat.id || work.type === cat.contentType;
  });

  // Featured Work (Only on "All" tab)
  const featuredWork =
    selectedTab === 'all' ? publishedWorks.find((w) => w.featured) : null;

  // Filter out featured work from standard list if on "All" to avoid duplication
  const standardWorks = featuredWork
    ? filteredWorks.filter((w) => w.id !== featuredWork.id)
    : filteredWorks;

  // All image works for lightbox navigation
  const imageWorks = publishedWorks.filter((w) => w.type === 'image');

  const handleOpenVideo = (work: WorkItem) => {
    setActiveVideoWork(work);
    setIsVideoModalOpen(true);
    logAnalyticsEvent('view_item', {
      item_id: work.id,
      item_name: work.title,
      content_type: 'video',
    });
  };

  const handleOpenImage = (work: WorkItem) => {
    const idx = imageWorks.findIndex((img) => img.id === work.id);
    setLightboxIndex(idx !== -1 ? idx : 0);
    setIsLightboxOpen(true);
    logAnalyticsEvent('view_item', {
      item_id: work.id,
      item_name: work.title,
      content_type: 'image',
    });
  };

  const handleSelectTab = (slug: string) => {
    setSelectedTab(slug);
    logAnalyticsEvent('select_content', {
      content_type: 'portfolio_tab',
      item_id: slug,
    });
  };

  // Estimate reading time for writing
  const calculateReadingTime = (content?: string) => {
    if (!content) return '2 min read';
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  return (
    <section
      id="portfolio"
      className="py-24 sm:py-36 px-5 sm:px-10 lg:px-16 border-t border-[rgba(241,238,230,0.1)] bg-[#0B0B0C] relative"
      aria-labelledby="portfolio-chapter-title"
    >
      <div className="max-w-[1440px] mx-auto">
        {/* Chapter Header */}
        <Reveal direction="up">
          <div className="flex items-center justify-between mb-12 pb-4 border-b border-[rgba(241,238,230,0.1)]">
            <span
              id="portfolio-chapter-title"
              className="font-mono text-xs uppercase tracking-[0.25em] text-[#C9A24D]"
            >
              03 · PORTFOLIO & WORK ARCHIVE
            </span>
            <span className="font-mono text-xs text-[#8A877F] uppercase tracking-wider">
              Film • Visuals • Automations
            </span>
          </div>
        </Reveal>

        {/* Section Title & Category Filter Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <Reveal delay={0.1} direction="up">
            <div>
              <h2 className="font-h1 font-bold text-[#F1EEE6]">
                Portfolio Reel & Case Studies
              </h2>
            </div>
          </Reveal>

          {/* Filter Bar with Animated Brass Underline */}
          <Reveal delay={0.2} direction="up">
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[rgba(241,238,230,0.1)] max-w-full">
              <button
                onClick={() => handleSelectTab('all')}
                className={`
                  relative px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] transition-colors whitespace-nowrap
                  ${selectedTab === 'all' ? 'text-[#F1EEE6] font-semibold' : 'text-[#8A877F] hover:text-[#F1EEE6]'}
                `}
              >
                <span>All Works</span>
                {selectedTab === 'all' && (
                  <motion.div
                    layoutId="portfolio-tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C9A24D]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>

              {sortedCategories.map((cat) => {
                const isActive = selectedTab === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectTab(cat.slug)}
                    className={`
                      relative px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] transition-colors whitespace-nowrap
                      ${isActive ? 'text-[#F1EEE6] font-semibold' : 'text-[#8A877F] hover:text-[#F1EEE6]'}
                    `}
                  >
                    <span>{cat.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="portfolio-tab-underline"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C9A24D]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </Reveal>
        </div>

        {/* ======================================================== */}
        {/* CASE 1: EMPTY STATE (When no published works exist yet) */}
        {/* ======================================================== */}
        {filteredWorks.length === 0 ? (
          <Reveal delay={0.25} direction="up">
            <div className="space-y-6">
              {/* Row of 3 empty widescreen frames with letterbox hairlines */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((frameNum) => (
                  <div
                    key={frameNum}
                    className="group relative aspect-[2.39/1] bg-[#151517] border border-[rgba(241,238,230,0.12)] p-6 flex flex-col justify-between overflow-hidden"
                  >
                    {/* Thin Letterbox Hairlines */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-[#0B0B0C] border-b border-[rgba(241,238,230,0.06)]" />
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#0B0B0C] border-t border-[rgba(241,238,230,0.06)]" />

                    <div className="pt-2 flex justify-between items-center text-[#8A877F]">
                      <span className="font-mono text-[10px] uppercase tracking-widest">
                        Reel Frame 0{frameNum}
                      </span>
                      <KeyGlyph size={14} className="opacity-40" />
                    </div>

                    <div className="text-center my-auto">
                      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#C9A24D]">
                        Selected work, coming soon
                      </p>
                      <p className="font-mono text-[10px] text-[#8A877F] mt-1">
                        High-fidelity case studies in production
                      </p>
                    </div>

                    <div className="pb-2 text-right">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-[#8A877F]/60">
                        2.39:1 Cinema Scope
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        ) : (
          /* ======================================================== */
          /* CASE 2: POPULATED WORKS                                  */
          /* ======================================================== */
          <div className="space-y-16">
            {/* FEATURED BLOCK (2.39:1 Widescreen) */}
            {featuredWork && (
              <Reveal direction="up">
                <div
                  onClick={() => {
                    if (featuredWork.type === 'video') handleOpenVideo(featuredWork);
                    else if (featuredWork.type === 'image') handleOpenImage(featuredWork);
                  }}
                  data-cursor={featuredWork.type === 'video' ? 'PLAY' : 'VIEW'}
                  className="relative aspect-[2.39/1] w-full bg-[#151517] border border-[rgba(241,238,230,0.15)] overflow-hidden cursor-pointer group shadow-2xl"
                >
                  {/* Letterbox hairlines */}
                  <div className="absolute top-0 left-0 right-0 h-3 bg-[#0B0B0C] z-20 border-b border-[rgba(241,238,230,0.08)]" />
                  <div className="absolute bottom-0 left-0 right-0 h-3 bg-[#0B0B0C] z-20 border-t border-[rgba(241,238,230,0.08)]" />

                  {featuredWork.thumbnailUrl ? (
                    <img
                      src={featuredWork.thumbnailUrl}
                      alt={featuredWork.title}
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80';
                      }}
                      className="w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#151517] to-[#0B0B0C] flex items-center justify-center">
                      <KeyGlyph size={48} className="text-[#C9A24D]" />
                    </div>
                  )}

                  {/* Contrast Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C]/90 via-[#0B0B0C]/30 to-transparent z-10" />

                  {/* Featured Content Overlay */}
                  <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="max-w-2xl space-y-2">
                      <span className="font-mono text-xs uppercase tracking-[0.2em] font-medium text-[#C9A24D] block">
                        Featured Production
                      </span>
                      <h3 className="font-h2 font-bold text-[#F1EEE6] group-hover:text-[#C9A24D] transition-colors">
                        {featuredWork.title}
                      </h3>
                      {featuredWork.description && (
                        <p className="text-sm text-[#F1EEE6]/80 line-clamp-2 max-w-xl">
                          {featuredWork.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {featuredWork.type === 'video' && (
                        <span className="w-12 h-12 rounded-full bg-[#C9A24D] text-[#0B0B0C] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                          <Play size={20} className="ml-0.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            )}

            {/* STANDARD WORKS GRID */}
            <div className="space-y-12">
              {/* 1. VIDEOS GRID (16:9 Cards with Play Button) */}
              {standardWorks.some((w) => w.type === 'video') && (
                <div className="space-y-6">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#C9A24D] block">
                    Film & Video Works
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {standardWorks
                      .filter((w) => w.type === 'video')
                      .map((work) => (
                        <div
                          key={work.id}
                          onClick={() => handleOpenVideo(work)}
                          data-cursor="PLAY"
                          className="bg-[#151517] border border-[rgba(241,238,230,0.12)] overflow-hidden cursor-pointer group flex flex-col justify-between hover:border-[rgba(201,162,77,0.4)] transition-all"
                        >
                          {/* 16:9 Thumbnail Frame */}
                          <div className="relative aspect-video bg-[#0B0B0C] overflow-hidden">
                            {work.thumbnailUrl ? (
                              <img
                                src={work.thumbnailUrl}
                                alt={work.title}
                                loading="lazy"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80';
                                }}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#8A877F]">
                                <KeyGlyph size={32} />
                              </div>
                            )}

                            {/* Play Button Indicator */}
                            <div className="absolute inset-0 bg-[#0B0B0C]/30 flex items-center justify-center group-hover:bg-[#0B0B0C]/10 transition-colors">
                              <span className="w-12 h-12 rounded-full bg-[#0B0B0C]/80 border border-[#C9A24D] text-[#C9A24D] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                                <Play size={18} className="ml-0.5" />
                              </span>
                            </div>

                            {/* Corner Cinema Badge */}
                            <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-[#0B0B0C]/75 backdrop-blur-sm border border-white/10 font-mono text-[9px] uppercase tracking-widest text-[#F1EEE6]">
                              AI Cinema · 4K
                            </div>
                          </div>

                          {/* Info */}
                          <div className="p-6">
                            <h4 className="font-sans font-semibold text-base text-[#F1EEE6] group-hover:text-[#C9A24D] transition-colors mb-2">
                              {work.title}
                            </h4>
                            {work.description && (
                              <p className="text-xs text-[#8A877F] line-clamp-2 leading-relaxed mb-3">
                                {work.description}
                              </p>
                            )}
                            {work.tools && work.tools.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[rgba(241,238,230,0.06)]">
                                {work.tools.slice(0, 3).map((tool, idx) => (
                                  <span
                                    key={idx}
                                    className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.04] text-[#8A877F] border border-white/[0.06]"
                                  >
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* 2. IMAGES MASONRY GALLERY */}
              {standardWorks.some((w) => w.type === 'image') && (
                <div className="space-y-6">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#C9A24D] block">
                    AI Visual Imagery
                  </span>
                  <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                    {standardWorks
                      .filter((w) => w.type === 'image')
                      .map((work) => (
                        <div
                          key={work.id}
                          onClick={() => handleOpenImage(work)}
                          data-cursor="VIEW"
                          className="relative break-inside-avoid bg-[#151517] border border-[rgba(241,238,230,0.12)] overflow-hidden cursor-pointer group shadow-lg"
                        >
                          <img
                            src={work.mediaUrl || work.thumbnailUrl}
                            alt={work.title}
                            loading="lazy"
                            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                          />
                          {/* Title Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end">
                            <h4 className="font-sans font-semibold text-sm text-[#F1EEE6]">
                              {work.title}
                            </h4>
                            {work.description && (
                              <p className="text-xs text-[#8A877F] line-clamp-1 mt-1">
                                {work.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* 3. WRITING LIST ROWS */}
              {standardWorks.some((w) => w.type === 'writing') && (
                <div className="space-y-6">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#C9A24D] block">
                    Scripts, Stories & Articles
                  </span>
                  <div className="border-t border-[rgba(241,238,230,0.12)] divide-y divide-[rgba(241,238,230,0.12)]">
                    {standardWorks
                      .filter((w) => w.type === 'writing')
                      .map((work) => (
                        <Link
                          key={work.id}
                          to={`/work/${work.slug}`}
                          data-cursor="VIEW"
                          className="py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-center group hover:bg-[#151517]/50 px-4 transition-colors"
                        >
                          <div className="md:col-span-2 font-mono text-[11px] uppercase tracking-wider text-[#C9A24D]">
                            {work.writingKind?.replace('-', ' ') || 'Writing'}
                          </div>
                          <div className="md:col-span-6">
                            <h4 className="font-sans font-semibold text-lg sm:text-xl text-[#F1EEE6] group-hover:text-[#C9A24D] transition-colors">
                              {work.title}
                            </h4>
                            {work.description && (
                              <p className="text-xs sm:text-sm text-[#8A877F] mt-1 line-clamp-1">
                                {work.description}
                              </p>
                            )}
                          </div>
                          <div className="md:col-span-3 font-mono text-xs text-[#8A877F] flex items-center gap-1.5">
                            <Clock size={13} />
                            <span>{calculateReadingTime(work.content)}</span>
                          </div>
                          <div className="md:col-span-1 text-right">
                            <ArrowUpRight
                              size={18}
                              className="text-[#8A877F] group-hover:text-[#C9A24D] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform inline-block"
                            />
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              )}

              {/* 4. AUTOMATION CASE STUDY CARDS */}
              {standardWorks.some((w) => w.type === 'automation') && (
                <div className="space-y-6">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#C9A24D] block">
                    AI Automations & Systems
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {standardWorks
                      .filter((w) => w.type === 'automation')
                      .map((work) => (
                        <div
                          key={work.id}
                          className="bg-[#151517] border border-[rgba(241,238,230,0.12)] p-8 flex flex-col justify-between hover:border-[rgba(201,162,77,0.4)] transition-all group"
                        >
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs uppercase tracking-widest text-[#C9A24D]">
                                Case Study
                              </span>
                              <Link
                                to={`/work/${work.slug}`}
                                className="font-mono text-xs uppercase tracking-wider text-[#8A877F] hover:text-[#C9A24D] flex items-center gap-1"
                              >
                                <span>Read Full Breakdown</span>
                                <ArrowUpRight size={14} />
                              </Link>
                            </div>

                            <h4 className="font-sans font-bold text-xl text-[#F1EEE6] group-hover:text-[#C9A24D] transition-colors">
                              {work.title}
                            </h4>

                            {/* Mini Problem -> Solution -> Result Layout */}
                            {(work.problem || work.solution || work.result) && (
                              <div className="space-y-3 pt-2 text-xs font-mono">
                                {work.problem && (
                                  <div className="p-3 bg-[#0B0B0C] border border-[rgba(241,238,230,0.06)]">
                                    <span className="text-red-400 font-semibold block mb-1">
                                      Problem:
                                    </span>
                                    <p className="text-[#8A877F]">{work.problem}</p>
                                  </div>
                                )}
                                {work.solution && (
                                  <div className="p-3 bg-[#0B0B0C] border border-[rgba(241,238,230,0.06)]">
                                    <span className="text-[#C9A24D] font-semibold block mb-1">
                                      Solution:
                                    </span>
                                    <p className="text-[#8A877F]">{work.solution}</p>
                                  </div>
                                )}
                                {work.result && (
                                  <div className="p-3 bg-[#0B0B0C] border border-[rgba(241,238,230,0.06)]">
                                    <span className="text-emerald-400 font-semibold block mb-1">
                                      Result:
                                    </span>
                                    <p className="text-[#8A877F]">{work.result}</p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Tools Chips */}
                            {work.tools && work.tools.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-2">
                                {work.tools.map((tool) => (
                                  <span
                                    key={tool}
                                    className="px-2.5 py-1 bg-[#0B0B0C] border border-[rgba(241,238,230,0.1)] text-[10px] font-mono text-[#8A877F]"
                                  >
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {work.externalUrl && (
                            <div className="pt-6 border-t border-[rgba(241,238,230,0.08)] mt-6">
                              <a
                                href={work.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[#C9A24D] hover:underline"
                              >
                                <span>External Project Demo</span>
                                <ExternalLink size={13} />
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Video Modal Player */}
      <VideoModal
        work={activeVideoWork}
        isOpen={isVideoModalOpen}
        onClose={() => {
          setIsVideoModalOpen(false);
          setActiveVideoWork(null);
        }}
        whatsappNumber={whatsappNumber}
      />

      {/* Image Lightbox */}
      <ImageLightbox
        images={imageWorks}
        currentIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onNavigate={(newIdx) => setLightboxIndex(newIdx)}
      />
    </section>
  );
};
