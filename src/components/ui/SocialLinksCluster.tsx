/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Official Social Media Links Component
 * Ultra-refined & tasteful micro-dimensions (exactly 15px–16px).
 * - Compact, minimalist pill dock: px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 flex items-center gap-2.5
 * - Default tone: Muted slate/zinc (text-zinc-400)
 * - Hover state: Crisp bright white (text-white) with gentle 0.2s transition
 * - Zero bulky borders or oversized hitboxes
 * - Links:
 *   • YouTube Shorts: https://www.youtube.com/@Keyofdavild/shorts (aria-label="YouTube Shorts")
 *   • Instagram: https://www.instagram.com/olamilekantechi/ (aria-label="Instagram Profile")
 *   • TikTok: https://www.tiktok.com/@keyofdavid0 (aria-label="TikTok Profile")
 *   • LinkedIn: https://www.linkedin.com/in/lekan-ogunyoye-a01888398 (aria-label="LinkedIn Profile")
 */

import React from 'react';

// Official Brand SVGs (24x24 viewBox, scalable, calibrated for 15px-16px display)
export const YouTubeBrandIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 12.5,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export const InstagramBrandIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 12.5,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.13-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export const TikTokBrandIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 12.5,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.75 1.25-.03 2.4-0.74 2.87-1.87.21-.54.26-1.13.26-1.7V.02z" />
  </svg>
);

export const LinkedInBrandIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 12.5,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

export const WhatsAppBrandIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 12.5,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.507 14.307l-.009.075c-.301-.15-1.777-.876-2.052-.976-.276-.1-.476-.15-.676.15s-.777.976-.952 1.176-.35.226-.651.076c-.301-.15-1.27-.468-2.42-1.493-.894-.798-1.498-1.784-1.673-2.085s-.019-.464.132-.614c.135-.134.301-.35.451-.525.15-.175.2-.3.301-.5.1-.2.05-.375-.025-.525s-.676-1.63-0.927-2.233c-.244-.587-.492-.507-.676-.517-.175-.008-.375-.01-.576-.01s-.526.075-.801.375c-.276.3-1.052 1.028-1.052 2.507s1.077 2.908 1.228 3.109c.15.2 2.118 3.235 5.132 4.536.717.31 1.277.495 1.714.634.72.228 1.375.196 1.893.119.577-.086 1.777-.726 2.028-1.428.25-.702.25-1.303.175-1.428-.075-.126-.276-.201-.577-.351zm-5.467 7.693c-2.021 0-4.004-.543-5.736-1.571l-.411-.244-4.263 1.118 1.138-4.156-.268-.426c-1.129-1.796-1.726-3.87-1.726-6.001 0-6.223 5.064-11.28 11.289-11.28 3.015 0 5.85 1.174 7.982 3.308 2.132 2.134 3.306 4.972 3.306 7.989 0 6.226-5.066 11.263-11.311 11.263zm9.646-18.919c-2.576-2.577-6.002-3.996-9.649-3.996-7.513 0-13.628 6.115-13.628 13.629 0 2.401.626 4.745 1.815 6.81l-1.928 7.042 7.206-1.89c1.996 1.089 4.249 1.663 6.535 1.663 7.514 0 13.63-6.117 13.63-13.631 0-3.645-1.419-7.07-3.981-9.627z" />
  </svg>
);

export interface SocialLinkItemSpec {
  id: string;
  name: string;
  url: string;
  ariaLabel: string;
  icon: React.FC<{ size?: number; className?: string }>;
}

export const OFFICIAL_SOCIAL_ITEMS: SocialLinkItemSpec[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    url: 'https://www.youtube.com/@Keyofdavild/shorts',
    ariaLabel: 'YouTube Shorts',
    icon: YouTubeBrandIcon,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    url: 'https://www.instagram.com/olamilekantechi/',
    ariaLabel: 'Instagram Profile',
    icon: InstagramBrandIcon,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    url: 'https://www.tiktok.com/@keyofdavid0',
    ariaLabel: 'TikTok Profile',
    icon: TikTokBrandIcon,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/lekan-ogunyoye-a01888398',
    ariaLabel: 'LinkedIn Profile',
    icon: LinkedInBrandIcon,
  },
];

export interface SocialLinksClusterProps {
  className?: string;
  iconSize?: number;
  variant?: 'dock' | 'inline' | 'subtle';
  whatsappUrl?: string;
}

export const SocialLinksCluster: React.FC<SocialLinksClusterProps> = ({
  className = '',
  iconSize = 12.5,
  variant = 'dock',
  whatsappUrl,
}) => {
  // Ultra-refined micro-scale interactions:
  // clean muted tone, warm brass on hover, subtle scale-105, zero bulky borders
  const linkItemStyles = `
    text-[#8A877F] hover:text-[#C9A24D]
    transition-all duration-200 ease-out
    hover:scale-105
    focus-visible:outline-none focus-visible:text-[#C9A24D]
    p-1 inline-flex items-center justify-center
  `;

  const items = [...OFFICIAL_SOCIAL_ITEMS];
  if (whatsappUrl) {
    items.push({
      id: 'whatsapp',
      name: 'WhatsApp',
      url: whatsappUrl,
      ariaLabel: 'WhatsApp Chat',
      icon: WhatsAppBrandIcon,
    });
  }

  if (variant === 'dock') {
    return (
      <nav
        aria-label="Official Social Channels"
        className={`px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center gap-2 select-none ${className}`}
      >
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.ariaLabel}
              className={linkItemStyles}
            >
              <Icon size={iconSize} />
            </a>
          );
        })}
      </nav>
    );
  }

  // Inline variant (Footer, drawers, metadata rows)
  return (
    <nav
      aria-label="Official Social Channels"
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.ariaLabel}
            className={linkItemStyles}
          >
            <Icon size={iconSize} />
          </a>
        );
      })}
    </nav>
  );
};
