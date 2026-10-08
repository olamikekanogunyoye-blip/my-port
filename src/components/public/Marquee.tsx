/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Infinite Ticker Marquee.
 * Lists published service titles separated by the Key of David glyph.
 * Smooth CSS animation, pause on hover, static under prefers-reduced-motion.
 */

import React from 'react';
import { ServiceItem } from '../../types';
import { KeyGlyph } from '../ui/KeyLogo';

interface MarqueeProps {
  services: ServiceItem[];
}

export const Marquee: React.FC<MarqueeProps> = ({ services }) => {
  if (!services || services.length === 0) return null;

  // Duplicate items 4 times to ensure seamless infinite loop
  const repeatedServices = [...services, ...services, ...services, ...services];

  return (
    <div
      className="w-full bg-[#151517] border-y border-[rgba(241,238,230,0.1)] py-4 overflow-hidden relative select-none"
      aria-label="Service Capabilities Ticker"
    >
      <div className="flex w-max animate-[marquee_45s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none">
        {repeatedServices.map((service, idx) => (
          <div key={`${service.id}-${idx}`} className="flex items-center gap-6 px-4">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#F1EEE6] font-medium whitespace-nowrap">
              {service.title}
            </span>
            <span className="text-[#C9A24D] shrink-0" aria-hidden="true">
              <KeyGlyph size={14} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
