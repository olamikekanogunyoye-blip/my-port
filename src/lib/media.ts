/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Media URL parser for YouTube, Vimeo, TikTok, Instagram, and Direct Video.
 */

export interface ParsedVideoInfo {
  provider: 'youtube' | 'vimeo' | 'tiktok' | 'instagram' | 'direct' | 'unknown';
  embedUrl?: string;
  openInNewTab: boolean;
  originalUrl: string;
  providerLabel?: string;
}

export function parseVideoUrl(url: string | undefined | null): ParsedVideoInfo | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const ytMatch =
    trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);

  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      provider: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`,
      openInNewTab: false,
      originalUrl: trimmed,
      providerLabel: 'YouTube',
    };
  }

  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      provider: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${videoId}?dnt=1&title=0&byline=0&portrait=0`,
      openInNewTab: false,
      originalUrl: trimmed,
      providerLabel: 'Vimeo',
    };
  }

  if (/tiktok\.com/i.test(trimmed)) {
    return {
      provider: 'tiktok',
      openInNewTab: true,
      originalUrl: trimmed,
      providerLabel: 'Watch on TikTok',
    };
  }

  if (/instagram\.com\/(?:p|reel|tv)\//i.test(trimmed)) {
    return {
      provider: 'instagram',
      openInNewTab: true,
      originalUrl: trimmed,
      providerLabel: 'Watch on Instagram',
    };
  }

  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed)) {
    return {
      provider: 'direct',
      embedUrl: trimmed,
      openInNewTab: false,
      originalUrl: trimmed,
      providerLabel: 'Video',
    };
  }

  return {
    provider: 'unknown',
    openInNewTab: true,
    originalUrl: trimmed,
    providerLabel: 'External Link',
  };
}
