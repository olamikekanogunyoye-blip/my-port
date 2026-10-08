/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * About Section (#about) — Director Profile & Creative Architecture
 * - Sophisticated editorial layout integrating Olamilekan Ogunyoye David's portrait
 * - Restrained, luxury art-directed aesthetic (deep obsidian canvas, warm ivory typography, subtle brass)
 * - Four clear professional pillars:
 *   1. WHO I AM
 *   2. WHAT I DO
 *   3. MY CREATIVE APPROACH
 *   4. WHY WORK WITH ME
 * - Natural portrait integration with clean hairline framing and editorial caption
 * - Direct CTAs: "Work With Me" and "View Selected Works"
 */

import React from 'react';
import { SiteSettings, ServiceItem } from '../../types';
import { Reveal } from '../ui/Reveal';
import { ArrowUpRight } from 'lucide-react';
import { logAnalyticsEvent } from '../../lib/firebase';

interface AboutSectionProps {
  settings: SiteSettings;
  services: ServiceItem[];
}

export const AboutSection: React.FC<AboutSectionProps> = ({ settings, services }) => {
  const portraitImage = settings.aboutImageUrl || settings.heroImageUrl || 'https://i.imgur.com/89FAjD6.png';
  const ownerName = settings.ownerName || 'Olamilekan Ogunyoye David';
  const brandName = settings.brandName || 'KEY OF DAVID';
  const roleTitle = settings.title || 'Creative AI Creator & AI Automation Agent';

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

  return (
    <section
      id="about"
      className="bg-[#0B0B0C] text-[#F1EEE6] py-28 sm:py-36 px-5 sm:px-10 lg:px-16 relative overflow-hidden border-t border-white/[0.08]"
      aria-labelledby="about-heading"
    >
      <div className="max-w-[1440px] mx-auto relative z-10">
        {/* Editorial Chapter Header */}
        <Reveal direction="up">
          <div className="flex items-center justify-between gap-4 mb-16 pb-4 border-b border-white/[0.08]">
            <span className="font-mono text-xs uppercase tracking-[0.25em] font-semibold text-[#C9A24D]">
              04 · ABOUT THE DIRECTOR
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-[#8A877F]">
              DIRECTOR & ARCHITECT PROFILE
            </span>
          </div>
        </Reveal>

        {/* Asymmetric Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* ======================================================== */}
          {/* LEFT COLUMN (5 cols): Integrated Editorial Portrait       */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 space-y-4">
            <Reveal delay={0.1} direction="up">
              <div className="relative group max-w-md mx-auto lg:max-w-none">
                {/* Ambient Subtle Warmth */}
                <div
                  className="absolute -inset-2 bg-gradient-to-tr from-[#C9A24D]/[0.06] to-transparent rounded-2xl blur-xl pointer-events-none -z-10"
                  aria-hidden="true"
                />

                {/* Editorial Still Frame */}
                <div className="relative overflow-hidden border border-white/10 bg-[#0c0d12]">
                  <div className="aspect-[4/5] w-full overflow-hidden bg-[#151517]">
                    <img
                      src={portraitImage}
                      onError={(e) => {
                        // High-contrast clean dark editorial fallback
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
                      }}
                      alt={ownerName}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.01]"
                    />
                  </div>
                </div>

                {/* Editorial Caption */}
                <div className="pt-3.5 flex flex-col gap-1 font-mono text-xs text-[#8A877F]">
                  <div className="flex items-center justify-between text-[#F1EEE6] font-medium tracking-wide">
                    <span>{ownerName}</span>
                    <span className="text-[#C9A24D] text-[11px] uppercase tracking-wider">{brandName}</span>
                  </div>
                  <span className="text-[11px] text-[#8A877F] uppercase tracking-wider">
                    {roleTitle} · Lagos, Nigeria
                  </span>
                </div>
              </div>
            </Reveal>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN (7 cols): Four-Part Editorial Structure      */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 space-y-10">
            {/* Main Section Heading */}
            <Reveal delay={0.15} direction="up">
              <div className="space-y-3">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#C9A24D] block font-medium">
                  Creative Direction & Intelligent Systems
                </span>
                <h2
                  id="about-heading"
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#F1EEE6] font-sans leading-[1.15]"
                >
                  Stories crafted with cinematic intent, systems engineered for leverage.
                </h2>
              </div>
            </Reveal>

            {/* 4 Professional Pillars */}
            <div className="space-y-8 border-t border-white/[0.08] pt-8">
              {/* 1. WHO I AM */}
              <Reveal delay={0.2} direction="up">
                <div className="space-y-2">
                  <h3 className="font-mono text-xs uppercase tracking-[0.22em] text-[#C9A24D] font-semibold">
                    Who I Am
                  </h3>
                  <p className="text-base sm:text-lg text-[#F1EEE6]/90 font-light leading-relaxed">
                    I am <strong className="font-medium text-[#F1EEE6]">{ownerName}</strong>, operating under the creative identity <strong className="font-medium text-[#F1EEE6]">{brandName}</strong>. I am a Nigerian creative director, AI filmmaker, and automation architect working with forward-thinking businesses, productions, and brands worldwide.
                  </p>
                </div>
              </Reveal>

              {/* 2. WHAT I DO */}
              <Reveal delay={0.25} direction="up">
                <div className="space-y-2">
                  <h3 className="font-mono text-xs uppercase tracking-[0.22em] text-[#C9A24D] font-semibold">
                    What I Do
                  </h3>
                  <p className="text-base sm:text-lg text-[#F1EEE6]/90 font-light leading-relaxed">
                    My work spans two interconnected disciplines: <strong className="font-medium text-[#F1EEE6]">Creative AI Cinema & Visuals</strong> (AI commercial videos, cinematic imagery, scriptwriting, and high-retention brand storytelling) and <strong className="font-medium text-[#F1EEE6]">AI Workflow Automations</strong> (autonomous agents and triage pipelines that eliminate operational bottlenecks).
                  </p>
                </div>
              </Reveal>

              {/* 3. MY CREATIVE APPROACH */}
              <Reveal delay={0.3} direction="up">
                <div className="space-y-2">
                  <h3 className="font-mono text-xs uppercase tracking-[0.22em] text-[#C9A24D] font-semibold">
                    My Creative Approach
                  </h3>
                  <p className="text-base sm:text-lg text-[#F1EEE6]/90 font-light leading-relaxed">
                    I treat artificial intelligence not as a shortcut, but as a high-precision camera and production studio. Every project begins with human narrative structure, camera blocking, lighting theory, and pacing. Technology executes with speed; creative judgment and taste dictate the outcome.
                  </p>
                </div>
              </Reveal>

              {/* 4. WHY CLIENTS WORK WITH ME */}
              <Reveal delay={0.35} direction="up">
                <div className="space-y-2">
                  <h3 className="font-mono text-xs uppercase tracking-[0.22em] text-[#C9A24D] font-semibold">
                    Why Work With Me
                  </h3>
                  <p className="text-base sm:text-lg text-[#F1EEE6]/90 font-light leading-relaxed">
                    You gain the visual fidelity of a high-end production house paired with modern automation speed. Instead of weeks of manual coordination or bloated overhead, you receive polished, commercial-ready assets and systems designed to drive measurable business impact.
                  </p>
                </div>
              </Reveal>
            </div>

            {/* Published Core Capabilities */}
            {services.length > 0 && (
              <Reveal delay={0.4} direction="up">
                <div className="pt-6 border-t border-white/[0.08] space-y-3">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] font-medium text-[#8A877F]">
                    Capabilities & Disciplines
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {services.map((service) => (
                      <span
                        key={service.id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-white/[0.03] border border-white/10 text-xs font-mono text-[#F1EEE6]/80 hover:border-[#C9A24D]/50 hover:text-white transition-colors"
                      >
                        <span role="img" aria-label={service.title} className="text-xs">
                          {service.icon}
                        </span>
                        <span>{service.title}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

            {/* Direct Action Anchors */}
            <Reveal delay={0.45} direction="up">
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => {
                    logAnalyticsEvent('cta_click', { cta: 'work_with_me', location: 'about' });
                    handleScrollTo('contact');
                  }}
                  className="px-6 py-3 rounded bg-[#C9A24D] text-[#0B0B0C] hover:bg-[#E3B95F] font-mono text-xs uppercase tracking-wider font-semibold inline-flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Work With Me</span>
                  <ArrowUpRight size={15} />
                </button>
                <button
                  onClick={() => {
                    logAnalyticsEvent('cta_click', { cta: 'view_works', location: 'about' });
                    handleScrollTo('portfolio');
                  }}
                  className="px-6 py-3 rounded bg-transparent hover:bg-white/[0.04] text-[#F1EEE6] hover:text-white border border-white/15 font-mono text-xs uppercase tracking-wider font-medium inline-flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>View Selected Works</span>
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

