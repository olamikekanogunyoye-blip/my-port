/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Core Data Models & Schema for KEY OF DAVID portfolio.
 * Strict adherence to Firestore schema requirements.
 */

export type ContentType = 'video' | 'image' | 'writing' | 'automation';
export type WritingKind = 'video-script' | 'story' | 'blog' | 'other';
export type MediaKind = 'image' | 'video' | 'audio' | 'other';

export interface SiteSettings {
  ownerName: string;
  brandName: string;
  title: string;
  heroHeadline: string;
  heroIntro: string;
  heroImageUrl: string;
  heroImagePath: string;
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
  email: string;
  phone?: string;
  location?: string;
  availabilityText: string;
  aboutHeading: string;
  aboutBody: string;
  aboutImageUrl: string;
  aboutImagePath: string;
  footerText: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  seoImageUrl: string;
  seoImagePath: string;
  updatedAt?: string;
  // Stage 3 enhancements
  aboutTagline?: string;
  aboutBio?: string;
  aboutProcess?: string;
  aboutStats?: { label: string; value: string }[];
  canonicalUrl?: string;
  ogType?: string;
  twitterHandle?: string;
  // Stage 4 WhatsApp & Hotline integration
  whatsappNumber?: string;
  whatsappMessage?: string;
  hotline?: string;
  showFloatingWhatsApp?: boolean;
}

export interface ServiceItem {
  id: string;
  icon: string; // lucide icon name or emoji
  title: string;
  description: string;
  order: number;
  published: boolean;
  slug?: string;
  shortDescription?: string;
  deliverables?: string[];
  techStack?: string[];
}

export interface CategoryItem {
  id: string;
  label: string;
  slug: string;
  contentType: ContentType;
  order: number;
  published: boolean;
}

export interface WorkItem {
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  thumbnailUrl: string;
  thumbnailPath: string;
  mediaUrl: string;
  mediaPath: string;
  externalUrl?: string;
  voiceUrl?: string;
  voicePath?: string;
  musicUrl?: string;
  musicPath?: string;
  writingKind?: WritingKind;
  content?: string; // markdown
  tools: string[];
  problem?: string;
  solution?: string;
  result?: string;
  allowDownload: boolean;
  featured: boolean;
  isSample: boolean;
  order: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  // Stage 3 enhancements
  client?: string;
  year?: number;
  tags?: string[];
  videoSource?: 'upload' | 'embed';
  videoEmbedUrl?: string;
  duration?: string;
  aspectRatio?: string;
  galleryImages?: { url: string; path?: string }[];
  prompt?: string;
  subtitle?: string;
  readingTime?: string;
  wordCount?: number;
  canonicalUrl?: string;
  problemSolved?: string;
  toolsUsed?: string[];
  metrics?: { label: string; value: string }[];
  workflowDiagramUrl?: string;
  workflowDiagramPath?: string;
}

export interface SocialLinkItem {
  id: string;
  platform: string;
  label: string;
  url: string;
  order: number;
  published: boolean;
  handle?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  archived: boolean;
  createdAt: string;
}

export interface Lead {
  id?: string;
  fullName: string;
  name: string;
  email: string;
  serviceInterest: string;
  subject: string;
  message: string;
  status: 'new' | 'contacted' | 'qualified' | 'archived' | string;
  createdAt: any;
  source: string;
  timeline?: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  path: string;
  contentType: string;
  size: number;
  kind: MediaKind;
  createdAt: string;
}

export interface AuthState {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
  } | null;
  isOwner: boolean;
  loading: boolean;
  error: string | null;
}
