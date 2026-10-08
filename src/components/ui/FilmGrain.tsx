/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Cinematic 35mm Film Grain & Volumetric Anamorphic Vignette Overlay
 * - Real SVG fractal noise grain at exact 0.03 opacity
 * - Volumetric dark vignette around viewport perimeter
 * - Deep carbon noir / obsidian canvas integration
 */

import React from 'react';

export const FilmGrain: React.FC = () => {
  return (
    <>
      {/* 35mm Analog Film Grain Layer */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none z-[997] opacity-[0.03] mix-blend-screen"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <filter id="film-grain-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#film-grain-filter)" />
      </svg>

      {/* Volumetric Dark Vignette Borders */}
      <div
        className="fixed inset-0 pointer-events-none z-[996] bg-[radial-gradient(ellipse_at_50%_50%,transparent_50%,rgba(6,6,8,0.4)_80%,rgba(4,4,6,0.85)_100%)]"
        aria-hidden="true"
      />
    </>
  );
};
