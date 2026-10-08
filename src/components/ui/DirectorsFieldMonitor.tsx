/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Clean Editorial Portrait Presentation
 * Stripped of all artificial HUDs, timers, camera overlays, crosshairs, and REC dots.
 * - Elegant container with subtle rounded corners (rounded-2xl)
 * - Clean hairline border (border border-white/10)
 * - Ultra-subtle ambient drop shadow
 * - Golden-ratio composition: aspect-[4/5], object-cover object-top
 */

import React from 'react';

export interface PortraitCardProps {
  imageUrl?: string;
  ownerName?: string;
  roleTitle?: string;
  className?: string;
  showDirectorTag?: boolean;
}

export const PortraitCard: React.FC<PortraitCardProps> = ({
  imageUrl = 'https://i.imgur.com/89FAjD6.png',
  ownerName = 'Olamilekan Ogunyoye David',
  roleTitle = 'AI Director & Commercial Cinematographer',
  className = '',
  showDirectorTag = false,
}) => {
  const displayImage = imageUrl || 'https://i.imgur.com/89FAjD6.png';

  return (
    <div className={`relative group select-none ${className}`}>
      {/* 1. Ultra-subtle ambient background glow */}
      <div
        className="absolute -inset-3 sm:-inset-4 bg-gradient-to-tr from-white/[0.04] via-[#C9A24D]/[0.05] to-transparent rounded-3xl blur-2xl opacity-60 pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* 2. Editorial Container with Clean Hairline Border & Subtle Shadow */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#09090b] shadow-2xl shadow-black/80">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#0c0d12]">
          <img
            src={displayImage}
            alt={ownerName}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
          />
        </div>
      </div>

      {/* 3. Understated Editorial Caption (only if explicitly enabled) */}
      {showDirectorTag && (
        <div className="pt-3 px-1.5 flex items-center justify-between font-mono text-xs text-zinc-400">
          <span className="text-zinc-200 font-medium tracking-wide">{ownerName}</span>
          <span className="text-zinc-500 text-[10px] uppercase tracking-wider">{roleTitle}</span>
        </div>
      )}
    </div>
  );
};

// Backwards compatibility alias
export const DirectorsFieldMonitor = PortraitCard;
