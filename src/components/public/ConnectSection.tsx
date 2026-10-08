/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Find Me Online (#connect)
 * Giant typographic links, one per published social link with non-empty URL.
 * Row inverts to Brass on hover with rotating 45° arrow.
 * Opens in new tab with rel="noopener noreferrer".
 * Hides gracefully if no social links have URLs set.
 */

import React from 'react';
import { SocialLinkItem } from '../../types';
import { Reveal } from '../ui/Reveal';
import { ArrowUpRight, Globe } from 'lucide-react';
import {
  YouTubeBrandIcon,
  InstagramBrandIcon,
  TikTokBrandIcon,
  LinkedInBrandIcon,
} from '../ui/SocialLinksCluster';

interface ConnectSectionProps {
  socialLinks: SocialLinkItem[];
}

export const ConnectSection: React.FC<ConnectSectionProps> = ({ socialLinks }) => {
  // Only render social links that are published and have a non-empty URL
  const validLinks = socialLinks
    .filter((l) => l.published && l.url && l.url.trim().length > 0)
    .sort((a, b) => a.order - b.order);

  if (validLinks.length === 0) {
    return null; // Gracefully hidden per Honesty Rules
  }

  const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('youtube')) return <YouTubeBrandIcon size={18} />;
    if (p.includes('instagram')) return <InstagramBrandIcon size={18} />;
    if (p.includes('tiktok')) return <TikTokBrandIcon size={18} />;
    if (p.includes('linkedin')) return <LinkedInBrandIcon size={18} />;
    return <Globe size={18} />;
  };

  return (
    <section
      id="connect"
      className="py-24 sm:py-36 px-5 sm:px-10 lg:px-16 border-t border-[rgba(241,238,230,0.1)] bg-[#0B0B0C] relative"
      aria-labelledby="connect-chapter-title"
    >
      <div className="max-w-[1440px] mx-auto">
        {/* Chapter Header */}
        <Reveal direction="up">
          <div className="flex items-center justify-between mb-16 pb-4 border-b border-[rgba(241,238,230,0.1)]">
            <span
              id="connect-chapter-title"
              className="font-mono text-xs uppercase tracking-[0.25em] text-[#C9A24D]"
            >
              05 · CHANNELS & DISTRIBUTION
            </span>
            <span className="font-mono text-xs text-[#8A877F] uppercase tracking-wider">
              Network & Distribution
            </span>
          </div>
        </Reveal>

        {/* Giant Typographic Link Rows */}
        <div className="border-t border-[rgba(241,238,230,0.15)] divide-y divide-[rgba(241,238,230,0.15)]">
          {validLinks.map((link, idx) => (
            <Reveal key={link.id} delay={idx * 0.08} direction="up">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group py-8 sm:py-12 px-4 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-500 hover:bg-[#C9A24D] hover:text-[#0B0B0C]"
              >
                <div className="flex items-center gap-6">
                  <span className="text-[#8A877F] group-hover:text-[#0B0B0C] transition-colors">
                    {getPlatformIcon(link.platform)}
                  </span>
                  <div>
                    <h3 className="font-display uppercase text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-[#F1EEE6] group-hover:text-[#0B0B0C] transition-colors">
                      {link.platform}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 sm:gap-10">
                  <span className="font-mono text-xs sm:text-sm uppercase tracking-widest text-[#8A877F] group-hover:text-[#0B0B0C] transition-colors">
                    {link.label || 'Visit Channel'}
                  </span>
                  <div className="w-12 h-12 rounded-full border border-[rgba(241,238,230,0.2)] group-hover:border-[#0B0B0C] flex items-center justify-center transition-transform duration-500 group-hover:rotate-45">
                    <ArrowUpRight
                      size={24}
                      className="text-[#F1EEE6] group-hover:text-[#0B0B0C] transition-colors"
                    />
                  </div>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
