/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface KeyLogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const KeyGlyph: React.FC<{ size?: number; className?: string }> = ({ size = 28, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block shrink-0 ${className}`}
    aria-hidden="true"
  >
    <circle cx="10" cy="16" r="6.5" stroke="currentColor" strokeWidth="1.75" />
    <circle cx="10" cy="16" r="2.5" fill="currentColor" />
    <path d="M16.5 16H27" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" />
    <path d="M22.5 16V21.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" />
    <path d="M26 16V20" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" />
  </svg>
);

export const KeyLogo: React.FC<KeyLogoProps> = ({
  className = '',
  showWordmark = true,
  size = 'md',
}) => {
  const glyphSizes = {
    sm: 20,
    md: 26,
    lg: 34,
  };

  const textSizes = {
    sm: 'text-xs tracking-[0.25em]',
    md: 'text-sm tracking-[0.28em]',
    lg: 'text-base tracking-[0.32em]',
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none text-[#F1EEE6] group ${className}`}>
      <span className="text-[#C9A24D] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-45">
        <KeyGlyph size={glyphSizes[size]} />
      </span>
      {showWordmark && (
        <span className={`font-semibold uppercase font-sans ${textSizes[size]}`}>
          KEY OF DAVID
        </span>
      )}
    </div>
  );
};
