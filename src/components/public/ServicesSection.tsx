/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Services Section (#services)
 * Numbered editorial list (01, 02, ...) with hairline dividers.
 * Desktop: Rows expand on hover with Brass line drawing across and description sliding in.
 * Mobile: Tap-to-expand accordion with single open active state.
 * Ordered by order property.
 */

import React, { useState } from 'react';
import { ServiceItem } from '../../types';
import { Reveal } from '../ui/Reveal';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ServicesSectionProps {
  services: ServiceItem[];
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ services }) => {
  const [activeMobileIndex, setActiveMobileIndex] = useState<number | null>(0);
  const [hoveredDesktopIndex, setHoveredDesktopIndex] = useState<number | null>(null);

  const isExcluded = (title: string) => {
    const t = (title || '').toLowerCase();
    return (
      t.includes('blog') ||
      t.includes('content writing') ||
      t.includes('social media')
    );
  };

  const sortedServices = services
    .filter((s) => !isExcluded(s.title))
    .sort((a, b) => a.order - b.order);

  const toggleMobile = (index: number) => {
    setActiveMobileIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section
      id="services"
      className="py-24 sm:py-36 px-5 sm:px-10 lg:px-16 border-t border-[rgba(241,238,230,0.1)] bg-[#0B0B0C] relative"
      aria-labelledby="services-chapter-title"
    >
      <div className="max-w-[1440px] mx-auto">
        {/* Chapter Header */}
        <Reveal direction="up">
          <div className="flex items-center justify-between mb-16 pb-4 border-b border-[rgba(241,238,230,0.1)]">
            <span
              id="services-chapter-title"
              className="font-mono text-xs uppercase tracking-[0.25em] text-[#C9A24D]"
            >
              03 · SERVICES & CAPABILITIES
            </span>
            <span className="font-mono text-xs text-[#8A877F] uppercase tracking-wider">
              {sortedServices.length} Specialized Practices
            </span>
          </div>
        </Reveal>

        {/* Section Headline */}
        <Reveal delay={0.1} direction="up">
          <div className="max-w-2xl mb-16">
            <h2 className="font-h1 font-bold text-[#F1EEE6] mb-4">
              Creative Direction & System Automation
            </h2>
            <p className="text-base sm:text-lg text-[#8A877F] leading-relaxed">
              Every deliverable is crafted for high retention, narrative depth, and strategic operational leverage.
            </p>
          </div>
        </Reveal>

        {/* Editorial Numbered Rows */}
        <div className="border-t border-[rgba(241,238,230,0.12)] divide-y divide-[rgba(241,238,230,0.12)]">
          {sortedServices.map((service, index) => {
            const formattedNum = String(index + 1).padStart(2, '0');
            const isHovered = hoveredDesktopIndex === index;
            const isMobileOpen = activeMobileIndex === index;

            return (
              <div
                key={service.id}
                onMouseEnter={() => setHoveredDesktopIndex(index)}
                onMouseLeave={() => setHoveredDesktopIndex(null)}
                className="group relative transition-colors duration-300"
              >
                {/* Desktop Animated Brass Draw Line */}
                <motion.div
                  initial={false}
                  animate={{
                    scaleX: isHovered ? 1 : 0,
                    opacity: isHovered ? 1 : 0,
                  }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{ originX: 0 }}
                  className="hidden lg:block absolute top-0 left-0 right-0 h-[1.5px] bg-[#C9A24D] z-10"
                />

                {/* DESKTOP ROW (Hidden on mobile) */}
                <div className="hidden lg:grid grid-cols-12 gap-8 py-8 items-center cursor-default">
                  {/* Index Number */}
                  <div className="col-span-1 font-mono text-xs text-[#8A877F] group-hover:text-[#C9A24D] transition-colors">
                    {formattedNum}
                  </div>

                  {/* Icon & Title */}
                  <div className="col-span-5 flex items-center gap-5">
                    <span
                      className="text-2xl transition-transform duration-300 group-hover:scale-110"
                      role="img"
                      aria-label={service.title}
                    >
                      {service.icon}
                    </span>
                    <h3 className="font-h3 font-semibold text-[#F1EEE6] group-hover:text-[#C9A24D] transition-colors">
                      {service.title}
                    </h3>
                  </div>

                  {/* Description Sliding In / Revealing */}
                  <div className="col-span-6">
                    <p className="text-sm sm:text-base text-[#8A877F] group-hover:text-[#F1EEE6] transition-colors leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* MOBILE ACCORDION (Hidden on desktop) */}
                <div className="lg:hidden">
                  <button
                    onClick={() => toggleMobile(index)}
                    className="w-full py-6 flex items-center justify-between text-left focus-visible:outline-none"
                    aria-expanded={isMobileOpen}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs text-[#C9A24D]">
                        {formattedNum}
                      </span>
                      <span className="text-xl" role="img" aria-label={service.title}>
                        {service.icon}
                      </span>
                      <h3 className="font-sans font-semibold text-base sm:text-lg text-[#F1EEE6]">
                        {service.title}
                      </h3>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`text-[#8A877F] transition-transform duration-300 ${
                        isMobileOpen ? 'rotate-180 text-[#C9A24D]' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isMobileOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden pb-6 pl-10"
                      >
                        <p className="text-sm text-[#8A877F] leading-relaxed">
                          {service.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
