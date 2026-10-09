/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Cinematic Hero Section (#home)
 * - Full-bleed background video from YouTube (WXWKOF0NxN4)
 * - Muted, autoplaying, looping, no player controls, pointer-events-none
 * - Layered dark cinematic overlays & vignettes for pristine typography contrast
 * - Brand name, owner name and role kicker intentionally omitted from the hero
 * - Concise creative positioning statement
 * - Dual direct CTAs: "View My Work" & "Work With Me"
 * - No portrait in hero (repositioned into About section)
 * - No oversized slogans or unnecessary floating cards
 */

import React from 'react';
import { SiteSettings } from '../../types';
import { Button } from '../ui/Button';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { logAnalyticsEvent } from '../../lib/firebase';

interface HeroSectionProps {
  settings: SiteSettings;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ settings }) => {
  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const navOffset = 80;
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - navOffset,
        behavior: 'smooth',
      });
      try {
        window.history.pushState(null, '', `#${id}`);
      } catch {
        // Safe in constrained iframe environments
      }
    }
  };

  const heroIntro =
    settings.heroIntro ||
    'Crafting high-retention AI cinema and building autonomous workflows that give businesses their time back.';

  return (
    <section
      id="home"
      className="relative min-h-[100svh] flex flex-col justify-between overflow-hidden bg-[#0B0B0C]"
      aria-label="Introduction & Cinematic Showreel"
    >
      {/* ======================================================== */}
      {/* 1. CINEMATIC FULL-BLEED BACKGROUND VIDEO (YouTube Reel)   */}
      {/* ======================================================== */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        {/* Graceful Poster Fallback Image while video initializes */}
        <img
          src="https://img.youtube.com/vi/WXWKOF0NxN4/maxresdefault.jpg"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://img.youtube.com/vi/WXWKOF0NxN4/hqdefault.jpg';
          }}
          alt="Background showreel"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-50"
          loading="eager"
        />

        {/* 16:9 Aspect Cropped Iframe covering full viewport across all ratios */}
        <iframe
          src="https://www.youtube-nocookie.com/embed/WXWKOF0NxN4?autoplay=1&mute=1&controls=0&loop=1&playlist=WXWKOF0NxN4&playsinline=1&rel=0&modestbranding=1&disablekb=1&fs=0&iv_load_policy=3&showinfo=0"
          title="Background Reel"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          className="absolute top-1/2 left-1/2 w-[177.78vh] min-w-full h-[56.25vw] min-h-full -translate-x-1/2 -translate-y-1/2 pointer-events-none border-0"
          tabIndex={-1}
          aria-hidden="true"
        />

        {/* 2. Measured Dark Cinematic Scrims & Vignettes for WCAG Legibility without dimming footage */}
        <div
          className="absolute inset-0 bg-black/35"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-transparent h-40"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-[#0B0B0C]/30 to-transparent"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55)_100%)]"
          aria-hidden="true"
        />
      </div>

      {/* ======================================================== */}
      {/* 2. RESTRAINED EDITORIAL HERO CONTENT                      */}
      {/* ======================================================== */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-16 pt-32 sm:pt-40 pb-10 flex-1 flex flex-col justify-end">
        <div className="max-w-3xl space-y-6 sm:space-y-8">
          {/* Concise Positioning Statement */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg lg:text-xl text-[#F1EEE6]/85 font-light leading-relaxed max-w-2xl"
          >
            {heroIntro}
          </motion.p>

          {/* Focused Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <Button
              variant="primary"
              size="lg"
              href="#portfolio"
              onClick={(e) => {
                e.preventDefault();
                logAnalyticsEvent('cta_click', { cta: 'view_work', location: 'hero' });
                handleScrollTo('portfolio');
              }}
              icon={<ArrowUpRight size={17} />}
            >
              {settings.ctaPrimaryLabel || 'View My Work'}
            </Button>

            <Button
              variant="outline"
              size="lg"
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                logAnalyticsEvent('cta_click', { cta: 'work_with_me', location: 'hero' });
                handleScrollTo('contact');
              }}
            >
              {settings.ctaSecondaryLabel || 'Work With Me'}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. REFINED BOTTOM STATUS & SCROLL INDICATOR STRIP         */}
      {/* ======================================================== */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-16 py-6 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-[#8A877F]">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="tracking-wider">
            {settings.availabilityText || 'Available for Select Projects & Collaborations'}
          </span>
        </div>

        <a
          href="#about"
          onClick={(e) => {
            e.preventDefault();
            handleScrollTo('about');
          }}
          className="hidden sm:inline-flex items-center gap-2 hover:text-[#C9A24D] transition-colors uppercase tracking-[0.2em] text-[11px]"
        >
          <span>Scroll</span>
          <ArrowDown size={13} />
        </a>
      </div>
    </section>
  );
};
