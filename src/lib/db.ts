/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Typed Firestore Database Operations & Fallback Store
 * Includes real-time listeners (onSnapshot), standardized error handling, initial seeding,
 * full CRUD mutators, sample data generators, backup exporter, and media integrity checks.
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth, isFirebaseConfigured } from '../config/firebase';
import {
  SiteSettings,
  ServiceItem,
  CategoryItem,
  WorkItem,
  SocialLinkItem,
  ContactMessage,
  Lead,
  MediaAsset,
} from '../types';
import { OWNER_NAME, BRAND_NAME, OWNER_TITLE, OWNER_EMAIL } from '../config/owner';
import { deleteFile } from './storage';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const currentUser = auth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid || null,
      email: currentUser?.email || null,
      emailVerified: currentUser?.emailVerified || null,
      isAnonymous: currentUser?.isAnonymous || null,
      tenantId: currentUser?.tenantId || null,
      providerInfo:
        currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const STORAGE_KEYS = {
  SETTINGS: 'kod_db_settings',
  SERVICES: 'kod_db_services',
  CATEGORIES: 'kod_db_categories',
  WORKS: 'kod_db_works',
  SOCIAL_LINKS: 'kod_db_social_links',
  MESSAGES: 'kod_db_messages',
  LEADS: 'kod_db_leads',
  MEDIA: 'kod_db_media',
  SEEDED: 'kod_db_seeded_v1',
};

const listeners = new Set<() => void>();
function notifyLocalListeners() {
  listeners.forEach((fn) => fn());
}

export const DEFAULT_SETTINGS: SiteSettings = {
  ownerName: OWNER_NAME,
  brandName: BRAND_NAME,
  title: OWNER_TITLE,
  heroHeadline: 'Ideas, turned into cinema.',
  heroIntro:
    'I create AI videos, images and stories, and build AI automations that give businesses their time back.',
  heroImageUrl: 'https://i.imgur.com/89FAjD6.png',
  heroImagePath: '',
  ctaPrimaryLabel: 'View My Work',
  ctaSecondaryLabel: 'Work With Me',
  email: OWNER_EMAIL,
  phone: '0904 272 5844',
  location: '',
  availabilityText: 'Available for Select Projects & Collaborations',
  aboutHeading: 'Who I am',
  aboutBody:
    'I make AI videos, AI images, video scripts, storytelling content, and AI automations/agents for businesses.',
  aboutImageUrl: 'https://i.imgur.com/89FAjD6.png',
  aboutImagePath: '',
  footerText: `© ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.`,
  seoTitle: `${BRAND_NAME} — ${OWNER_NAME} | ${OWNER_TITLE}`,
  seoDescription:
    'Editorial portfolio of Olamilekan Ogunyoye David (KEY OF DAVID) — Creative AI Creator & AI Automation Agent.',
  seoKeywords: [
    'Creative AI',
    'AI Videos',
    'AI Images',
    'AI Automation',
    'AI Agents',
    'Video Scripts',
    'Storytelling Content',
    'KEY OF DAVID',
  ],
  seoImageUrl: 'https://i.imgur.com/89FAjD6.png',
  seoImagePath: '',
  updatedAt: new Date().toISOString(),
  // Stage 4 WhatsApp & Hotline
  whatsappNumber: '2349042725844',
  whatsappMessage: "Hello KEY OF DAVID, I found your portfolio and I'd like to work with you.",
  hotline: '2349042725844',
  showFloatingWhatsApp: true,
};

export function mergeSettingsWithDefaults(data?: Partial<SiteSettings> | null): SiteSettings {
  if (!data) return DEFAULT_SETTINGS;
  return {
    ...DEFAULT_SETTINGS,
    ...data,
    // Fill in Stage 4 seed values ONLY if undefined / uninitialized (never overwrite user edits or cleared fields)
    whatsappNumber: data.whatsappNumber !== undefined ? data.whatsappNumber : DEFAULT_SETTINGS.whatsappNumber,
    whatsappMessage: data.whatsappMessage !== undefined ? data.whatsappMessage : DEFAULT_SETTINGS.whatsappMessage,
    hotline: data.hotline !== undefined ? data.hotline : DEFAULT_SETTINGS.hotline,
    showFloatingWhatsApp: data.showFloatingWhatsApp !== undefined ? data.showFloatingWhatsApp : DEFAULT_SETTINGS.showFloatingWhatsApp,
    heroImageUrl: data.heroImageUrl || 'https://i.imgur.com/89FAjD6.png',
    aboutImageUrl: data.aboutImageUrl || 'https://i.imgur.com/89FAjD6.png',
  };
}

export const DEFAULT_SERVICES: Omit<ServiceItem, 'id'>[] = [
  {
    icon: '🤖',
    title: 'AI Video Creation',
    description: 'Cinematic visual direction, motion generation, and high-fidelity video production powered by state-of-the-art AI.',
    order: 1,
    published: true,
  },
  {
    icon: '🎨',
    title: 'AI Image Generation',
    description: 'Photorealistic and stylized visual assets crafted with precision prompting and art direction.',
    order: 2,
    published: true,
  },
  {
    icon: '✍️',
    title: 'Video Scripts',
    description: 'Compelling cinematic scripts and storyboards engineered for high audience retention.',
    order: 3,
    published: true,
  },
  {
    icon: '📖',
    title: 'Storytelling Content',
    description: 'Narrative architectures and brand stories that resonate deeply and convert.',
    order: 4,
    published: true,
  },
  {
    icon: '⚙️',
    title: 'AI Automation & Agents',
    description: 'Custom AI workflows and autonomous agents designed to eliminate manual bottlenecks and reclaim time.',
    order: 5,
    published: true,
  },
];

export const DEFAULT_CATEGORIES: Omit<CategoryItem, 'id'>[] = [
  { label: 'AI Videos', slug: 'ai-videos', contentType: 'video', order: 1, published: true },
  { label: 'AI Images', slug: 'ai-images', contentType: 'image', order: 2, published: true },
  { label: 'Scripts', slug: 'scripts', contentType: 'writing', order: 3, published: true },
  { label: 'AI Automation', slug: 'ai-automation', contentType: 'automation', order: 4, published: true },
];

export const DEFAULT_SOCIAL_LINKS: Omit<SocialLinkItem, 'id'>[] = [
  { platform: 'youtube', label: 'YouTube Shorts', url: 'https://www.youtube.com/@Keyofdavild/shorts', order: 1, published: true },
  { platform: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/olamilekantechi/', order: 2, published: true },
  { platform: 'tiktok', label: 'TikTok', url: 'https://www.tiktok.com/@keyofdavid0', order: 3, published: true },
  { platform: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/lekan-ogunyoye-a01888398', order: 4, published: true },
];

export const DEFAULT_WORKS: WorkItem[] = [
  {
    id: 'work_1',
    type: 'video',
    title: 'KEY OF DAVID — Director Showcase Reel',
    slug: 'key-of-david-director-reel',
    description: 'Master creative direction reel showcasing high-retention generative motion, 4K camera blocking, and bespoke audio pacing.',
    categoryId: 'cat_1',
    thumbnailUrl: 'https://img.youtube.com/vi/WXWKOF0NxN4/maxresdefault.jpg',
    thumbnailPath: '',
    mediaUrl: 'https://www.youtube.com/watch?v=WXWKOF0NxN4',
    mediaPath: '',
    tools: ['Runway Gen-3', 'Midjourney v6.1', 'Premiere Pro', 'DaVinci Resolve'],
    allowDownload: false,
    featured: true,
    isSample: false,
    order: 1,
    published: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'work_2',
    type: 'video',
    title: 'Kinetic Spec Reel — High Pacing Edit',
    slug: 'kinetic-spec-reel',
    description: 'Dynamic commercial cut engineered for maximum visual retention, motion transfer, and brand engagement.',
    categoryId: 'cat_1',
    thumbnailUrl: 'https://img.youtube.com/vi/lS8FYD2X5aI/hqdefault.jpg',
    thumbnailPath: '',
    mediaUrl: 'https://www.youtube.com/watch?v=lS8FYD2X5aI',
    mediaPath: '',
    tools: ['AI Video Pipeline', 'Neural VFX', 'Sound Design'],
    allowDownload: false,
    featured: false,
    isSample: false,
    order: 2,
    published: true,
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'work_3',
    type: 'video',
    title: 'Atmospheric Brand Film — 35mm Aesthetic',
    slug: 'atmospheric-brand-film',
    description: '35mm anamorphic aesthetic film exploring volumetric lighting, narrative depth, and synthetic motion transfer.',
    categoryId: 'cat_1',
    thumbnailUrl: 'https://img.youtube.com/vi/WScgvqkZa4o/hqdefault.jpg',
    thumbnailPath: '',
    mediaUrl: 'https://www.youtube.com/watch?v=WScgvqkZa4o',
    mediaPath: '',
    tools: ['Flux.1', 'Runway Gen-3', 'Log-C Color Grade'],
    allowDownload: false,
    featured: false,
    isSample: false,
    order: 3,
    published: true,
    createdAt: '2026-01-03T00:00:00.000Z',
    updatedAt: '2026-01-03T00:00:00.000Z',
  },
  {
    id: 'work_4',
    type: 'video',
    title: 'Commercial Spec — Neural Visual Effects',
    slug: 'commercial-spec-vfx',
    description: 'Spec commercial highlighting composite neural visual effects, macro framing, and architectural pacing.',
    categoryId: 'cat_1',
    thumbnailUrl: 'https://img.youtube.com/vi/kvKtVSD5pUw/hqdefault.jpg',
    thumbnailPath: '',
    mediaUrl: 'https://www.youtube.com/watch?v=kvKtVSD5pUw',
    mediaPath: '',
    tools: ['Generative 3D', 'Compositing', 'Sound Design'],
    allowDownload: false,
    featured: false,
    isSample: false,
    order: 4,
    published: true,
    createdAt: '2026-01-04T00:00:00.000Z',
    updatedAt: '2026-01-04T00:00:00.000Z',
  },
  {
    id: 'work_5',
    type: 'video',
    title: 'Creative Tech Campaign — Brand Lore',
    slug: 'creative-tech-campaign',
    description: 'Enterprise AI commercial cut featuring macro product rendering, synthetic cinematography, and color grade.',
    categoryId: 'cat_1',
    thumbnailUrl: 'https://img.youtube.com/vi/2igkafjDcJs/hqdefault.jpg',
    thumbnailPath: '',
    mediaUrl: 'https://www.youtube.com/watch?v=2igkafjDcJs',
    mediaPath: '',
    tools: ['Midjourney v6.1', 'Luma Dream Machine', 'After Effects'],
    allowDownload: false,
    featured: false,
    isSample: false,
    order: 5,
    published: true,
    createdAt: '2026-01-05T00:00:00.000Z',
    updatedAt: '2026-01-05T00:00:00.000Z',
  },
  {
    id: 'work_v6',
    type: 'video',
    title: 'Dynamic Generative Cut — Pacing Architecture',
    slug: 'dynamic-generative-cut',
    description: 'Fast-cut kinetic generative film engineered for maximum visual engagement, rhythm synchronization, and brand impact.',
    categoryId: 'cat_1',
    thumbnailUrl: 'https://img.youtube.com/vi/mHe3dMjZu_s/hqdefault.jpg',
    thumbnailPath: '',
    mediaUrl: 'https://www.youtube.com/watch?v=mHe3dMjZu_s',
    mediaPath: '',
    tools: ['Runway Gen-3', 'AI Motion Pipeline', 'DaVinci Resolve'],
    allowDownload: false,
    featured: false,
    isSample: false,
    order: 6,
    published: true,
    createdAt: '2026-01-06T00:00:00.000Z',
    updatedAt: '2026-01-06T00:00:00.000Z',
  },
  {
    id: 'work_v7',
    type: 'video',
    title: 'Cinematic Motion Transfer — Spatial Depth',
    slug: 'cinematic-motion-transfer',
    description: 'Spatial depth and volumetric camera motion research combining neural texture pipelines and 4K film mastering.',
    categoryId: 'cat_1',
    thumbnailUrl: 'https://img.youtube.com/vi/UpFyTDc-JRY/hqdefault.jpg',
    thumbnailPath: '',
    mediaUrl: 'https://www.youtube.com/watch?v=UpFyTDc-JRY',
    mediaPath: '',
    tools: ['Spatial AI', 'Neural Compositing', '4K Master'],
    allowDownload: false,
    featured: false,
    isSample: false,
    order: 7,
    published: true,
    createdAt: '2026-01-07T00:00:00.000Z',
    updatedAt: '2026-01-07T00:00:00.000Z',
  },
  {
    id: 'work_v8',
    type: 'video',
    title: 'Product Narrative Spec — Macro Lighting Simulation',
    slug: 'product-narrative-spec',
    description: 'Macro product rendering spec showcasing photorealistic light transport, material dispersion, and sound-matched edits.',
    categoryId: 'cat_1',
    thumbnailUrl: 'https://img.youtube.com/vi/yK9lJ6yfRs4/hqdefault.jpg',
    thumbnailPath: '',
    mediaUrl: 'https://www.youtube.com/watch?v=yK9lJ6yfRs4',
    mediaPath: '',
    tools: ['Macro Product', 'Lighting Simulation', 'Sound Design'],
    allowDownload: false,
    featured: false,
    isSample: false,
    order: 8,
    published: true,
    createdAt: '2026-01-08T00:00:00.000Z',
    updatedAt: '2026-01-08T00:00:00.000Z',
  },
  {
    id: 'work_6',
    type: 'image',
    title: 'Architectural Vision — Volumetric Masonry',
    slug: 'architectural-vision-volumetric',
    description: 'Precision prompting architecture exploring organic travertine textures, diffused side-lighting, and luxury geometry.',
    categoryId: 'cat_2',
    thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    thumbnailPath: '',
    mediaUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    mediaPath: '',
    tools: ['Midjourney v6.1', 'Photoshop'],
    allowDownload: true,
    featured: false,
    isSample: false,
    order: 9,
    published: true,
    createdAt: '2026-01-09T00:00:00.000Z',
    updatedAt: '2026-01-09T00:00:00.000Z',
  },
  {
    id: 'work_7',
    type: 'writing',
    title: 'Cinematic Script: The Key Protocol',
    slug: 'cinematic-script-key-protocol',
    description: 'Director screenplay blueprint featuring scene breakdowns, camera timecodes, and auditory cues for AI synthesis.',
    categoryId: 'cat_3',
    writingKind: 'video-script',
    thumbnailUrl: '',
    thumbnailPath: '',
    mediaUrl: '',
    mediaPath: '',
    content: `# THE KEY PROTOCOL\n\n**INT. RESEARCH OBSERVATORY - NIGHT**\n\nThe ambient hum of cryogenic server racks vibrates through the concrete chamber.\n\n**NARRATOR (V.O.)**\n> "Every breakthrough begins when someone refuses to accept manual friction as a natural law."\n\n*Camera pushes past amber terminal monitors into the central core.*`,
    tools: ['Claude 3.5 Sonnet', 'Final Draft'],
    allowDownload: true,
    featured: false,
    isSample: false,
    order: 10,
    published: true,
    createdAt: '2026-01-07T00:00:00.000Z',
    updatedAt: '2026-01-07T00:00:00.000Z',
  },
  {
    id: 'work_8',
    type: 'automation',
    title: 'Autonomous Client Triage & Lead Pipeline',
    slug: 'autonomous-client-triage-pipeline',
    description: 'Production case study detailing webhook enrichment, natural language inquiry classification, and automated briefing generation.',
    categoryId: 'cat_5',
    thumbnailUrl: '',
    thumbnailPath: '',
    mediaUrl: '',
    mediaPath: '',
    problem: 'Client incoming requests took 14 hours on average to qualify, classify, and route to creative production.',
    solution: 'Engineered an intelligent agent that parses incoming project briefs, extracts deliverables and timelines, and prepares contextual briefings.',
    result: 'Reduced initial client turnaround to under 2 minutes with 80% automated qualification accuracy.',
    tools: ['Make', 'OpenAI API', 'Airtable', 'Slack'],
    allowDownload: false,
    featured: false,
    isSample: false,
    order: 11,
    published: true,
    createdAt: '2026-01-08T00:00:00.000Z',
    updatedAt: '2026-01-08T00:00:00.000Z',
  },
];

// Initial Seeding
export async function seedInitialDataIfNeeded(): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const siteDocRef = doc(db, 'settings', 'site');
      const docSnap = await getDoc(siteDocRef);

      if (!docSnap.exists()) {
        await setDoc(siteDocRef, DEFAULT_SETTINGS);

        for (const service of DEFAULT_SERVICES) {
          const serviceRef = doc(collection(db, 'services'));
          await setDoc(serviceRef, { ...service, id: serviceRef.id });
        }

        for (const cat of DEFAULT_CATEGORIES) {
          const catRef = doc(collection(db, 'categories'));
          await setDoc(catRef, { ...cat, id: catRef.id });
        }

        for (const link of DEFAULT_SOCIAL_LINKS) {
          const linkRef = doc(collection(db, 'socialLinks'));
          await setDoc(linkRef, { ...link, id: linkRef.id });
        }
      }
      return;
    } catch (err) {
      console.warn('Firebase seeding note:', err);
    }
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    if (!localStorage.getItem(STORAGE_KEYS.SEEDED)) {
      if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
        const services = DEFAULT_SERVICES.map((s, idx) => ({ ...s, id: `service_${idx + 1}` }));
        localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
      }
      if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
        const categories = DEFAULT_CATEGORIES.map((c, idx) => ({ ...c, id: `cat_${idx + 1}` }));
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      }
      if (!localStorage.getItem(STORAGE_KEYS.SOCIAL_LINKS)) {
        const links = DEFAULT_SOCIAL_LINKS.map((l, idx) => ({ ...l, id: `social_${idx + 1}` }));
        localStorage.setItem(STORAGE_KEYS.SOCIAL_LINKS, JSON.stringify(links));
      }
      if (!localStorage.getItem(STORAGE_KEYS.WORKS) || JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKS) || '[]').length === 0) {
        localStorage.setItem(STORAGE_KEYS.WORKS, JSON.stringify(DEFAULT_WORKS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.MEDIA)) {
        localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify([]));
      }
      if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));
      }
      localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
      notifyLocalListeners();
    }
  }
}

// -------------------------------------------------------------
// SUBSCRIPTIONS (REAL-TIME LISTENERS)
// -------------------------------------------------------------

export function subscribeToSettings(
  callback: (settings: SiteSettings) => void
): () => void {
  if (isFirebaseConfigured && db) {
    const docRef = doc(db, 'settings', 'site');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(mergeSettingsWithDefaults(snapshot.data() as SiteSettings));
        } else {
          callback(DEFAULT_SETTINGS);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'settings/site');
      }
    );
  }

  const readLocal = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      callback(stored ? mergeSettingsWithDefaults(JSON.parse(stored)) : DEFAULT_SETTINGS);
    } catch {
      callback(DEFAULT_SETTINGS);
    }
  };

  readLocal();
  listeners.add(readLocal);
  return () => {
    listeners.delete(readLocal);
  };
}

export function subscribeToServices(
  callback: (services: ServiceItem[]) => void
): () => void {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, 'services'), orderBy('order', 'asc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id,
        })) as ServiceItem[];
        callback(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'services');
      }
    );
  }

  const readLocal = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SERVICES);
      let items: ServiceItem[] = stored ? JSON.parse(stored) : [];
      // Clean out removed services
      items = items.filter(
        (s) =>
          !s.title.toLowerCase().includes('blog') &&
          !s.title.toLowerCase().includes('content writing') &&
          !s.title.toLowerCase().includes('social media')
      );
      if (items.length === 0) {
        items = DEFAULT_SERVICES.map((s, idx) => ({ ...s, id: `service_${idx + 1}` }));
        localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(items));
      }
      callback(items.sort((a, b) => a.order - b.order));
    } catch {
      callback(DEFAULT_SERVICES.map((s, idx) => ({ ...s, id: `service_${idx + 1}` })));
    }
  };

  readLocal();
  listeners.add(readLocal);
  return () => {
    listeners.delete(readLocal);
  };
}

export function subscribeToCategories(
  callback: (categories: CategoryItem[]) => void
): () => void {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id,
        })) as CategoryItem[];
        callback(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'categories');
      }
    );
  }

  const readLocal = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      let items: CategoryItem[] = stored ? JSON.parse(stored) : [];
      items = items.filter((c) => !c.slug.includes('blog') && !c.label.toLowerCase().includes('blog'));
      if (items.length === 0) {
        items = DEFAULT_CATEGORIES.map((c, idx) => ({ ...c, id: `cat_${idx + 1}` }));
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(items));
      }
      callback(items.sort((a, b) => a.order - b.order));
    } catch {
      callback(DEFAULT_CATEGORIES.map((c, idx) => ({ ...c, id: `cat_${idx + 1}` })));
    }
  };

  readLocal();
  listeners.add(readLocal);
  return () => {
    listeners.delete(readLocal);
  };
}

export function subscribeToWorks(
  callback: (works: WorkItem[]) => void
): () => void {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, 'works'), orderBy('order', 'asc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id,
        })) as WorkItem[];
        callback(items.length > 0 ? items : DEFAULT_WORKS);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'works');
      }
    );
  }

  const readLocal = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WORKS);
      let items: WorkItem[] = stored ? JSON.parse(stored) : [];
      if (!items || items.length === 0) {
        items = DEFAULT_WORKS;
        localStorage.setItem(STORAGE_KEYS.WORKS, JSON.stringify(DEFAULT_WORKS));
      }
      callback(items.sort((a, b) => a.order - b.order));
    } catch {
      callback(DEFAULT_WORKS);
    }
  };

  readLocal();
  listeners.add(readLocal);
  return () => {
    listeners.delete(readLocal);
  };
}

export function subscribeToSocialLinks(
  callback: (links: SocialLinkItem[]) => void
): () => void {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, 'socialLinks'), orderBy('order', 'asc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id,
        })) as SocialLinkItem[];
        const hasActiveLinks = items.some((l) => l.published && l.url && l.url.trim().length > 0);
        if (items.length === 0 || !hasActiveLinks) {
          callback(DEFAULT_SOCIAL_LINKS.map((l, idx) => ({ ...l, id: `social_def_${idx + 1}` })));
        } else {
          callback(items);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'socialLinks');
      }
    );
  }

  const readLocal = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SOCIAL_LINKS);
      const items: SocialLinkItem[] = stored ? JSON.parse(stored) : [];
      const hasActiveLinks = items.some((l) => l.published && l.url && l.url.trim().length > 0);
      if (items.length === 0 || !hasActiveLinks) {
        callback(DEFAULT_SOCIAL_LINKS.map((l, idx) => ({ ...l, id: `social_def_${idx + 1}` })));
      } else {
        callback(items.sort((a, b) => a.order - b.order));
      }
    } catch {
      callback(DEFAULT_SOCIAL_LINKS.map((l, idx) => ({ ...l, id: `social_def_${idx + 1}` })));
    }
  };

  readLocal();
  listeners.add(readLocal);
  return () => {
    listeners.delete(readLocal);
  };
}

export function subscribeToMessages(
  callback: (messages: ContactMessage[]) => void
): () => void {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id,
        })) as ContactMessage[];
        callback(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'messages');
      }
    );
  }

  const readLocal = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      const items: ContactMessage[] = stored ? JSON.parse(stored) : [];
      callback(items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch {
      callback([]);
    }
  };

  readLocal();
  listeners.add(readLocal);
  return () => {
    listeners.delete(readLocal);
  };
}

export function subscribeToMedia(
  callback: (media: MediaAsset[]) => void
): () => void {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, 'media'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id,
        })) as MediaAsset[];
        callback(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'media');
      }
    );
  }

  const readLocal = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MEDIA);
      const items: MediaAsset[] = stored ? JSON.parse(stored) : [];
      callback(items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch {
      callback([]);
    }
  };

  readLocal();
  listeners.add(readLocal);
  return () => {
    listeners.delete(readLocal);
  };
}

// -------------------------------------------------------------
// CRUD MUTATIONS
// -------------------------------------------------------------

export async function updateSiteSettings(data: Partial<SiteSettings>): Promise<void> {
  const updated = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'settings', 'site');
      await updateDoc(docRef, updated);
      return;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/site');
    }
  }

  const current = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  const parsed = current ? JSON.parse(current) : DEFAULT_SETTINGS;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...parsed, ...updated }));
  notifyLocalListeners();
}

// Services CRUD
export async function createService(serviceData: Omit<ServiceItem, 'id'>): Promise<string> {
  const id = `srv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const fullService: ServiceItem = { ...serviceData, id };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'services', id);
      await setDoc(docRef, fullService);
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `services/${id}`);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.SERVICES);
  const items: ServiceItem[] = stored ? JSON.parse(stored) : [];
  items.push(fullService);
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(items));
  notifyLocalListeners();
  return id;
}

export async function updateService(id: string, updates: Partial<ServiceItem>): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'services', id);
      await updateDoc(docRef, updates);
      return;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `services/${id}`);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.SERVICES);
  const items: ServiceItem[] = stored ? JSON.parse(stored) : [];
  const idx = items.findIndex((i) => i.id === id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...updates };
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(items));
    notifyLocalListeners();
  }
}

export async function deleteService(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'services', id);
      await deleteDoc(docRef);
      return;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `services/${id}`);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.SERVICES);
  const items: ServiceItem[] = stored ? JSON.parse(stored) : [];
  const filtered = items.filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(filtered));
  notifyLocalListeners();
}

export async function reorderServices(orderedItems: ServiceItem[]): Promise<void> {
  for (let i = 0; i < orderedItems.length; i++) {
    await updateService(orderedItems[i].id, { order: i + 1 });
  }
}

// Categories CRUD
export async function createCategory(catData: Omit<CategoryItem, 'id'>): Promise<string> {
  const id = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const fullCat: CategoryItem = { ...catData, id };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'categories', id);
      await setDoc(docRef, fullCat);
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `categories/${id}`);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  const items: CategoryItem[] = stored ? JSON.parse(stored) : [];
  items.push(fullCat);
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(items));
  notifyLocalListeners();
  return id;
}

export async function updateCategory(id: string, updates: Partial<CategoryItem>): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'categories', id);
      await updateDoc(docRef, updates);
      return;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `categories/${id}`);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  const items: CategoryItem[] = stored ? JSON.parse(stored) : [];
  const idx = items.findIndex((i) => i.id === id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...updates };
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(items));
    notifyLocalListeners();
  }
}

export async function deleteCategory(id: string, reassignToCategoryId?: string): Promise<void> {
  // If reassignment is specified, reassign all works under this category
  const works = getLocalWorks();
  const linkedWorks = works.filter((w) => w.categoryId === id);

  if (linkedWorks.length > 0 && !reassignToCategoryId) {
    throw new Error(`Cannot delete category with ${linkedWorks.length} attached works without reassigning them.`);
  }

  if (reassignToCategoryId) {
    for (const w of linkedWorks) {
      await updateWork(w.id, { categoryId: reassignToCategoryId });
    }
  }

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'categories', id);
      await deleteDoc(docRef);
      return;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `categories/${id}`);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  const items: CategoryItem[] = stored ? JSON.parse(stored) : [];
  const filtered = items.filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filtered));
  notifyLocalListeners();
}

export async function reorderCategories(orderedItems: CategoryItem[]): Promise<void> {
  for (let i = 0; i < orderedItems.length; i++) {
    await updateCategory(orderedItems[i].id, { order: i + 1 });
  }
}

// Works CRUD
export async function createWork(workData: Omit<WorkItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const id = `work_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  const fullWork: WorkItem = {
    ...workData,
    id,
    createdAt: now,
    updatedAt: now,
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'works', id);
      await setDoc(docRef, fullWork);
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `works/${id}`);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.WORKS);
  const items: WorkItem[] = stored ? JSON.parse(stored) : [];
  items.push(fullWork);
  localStorage.setItem(STORAGE_KEYS.WORKS, JSON.stringify(items));
  notifyLocalListeners();
  return id;
}

export async function updateWork(id: string, updates: Partial<WorkItem>): Promise<void> {
  const finalUpdates = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'works', id);
      await updateDoc(docRef, finalUpdates);
      return;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `works/${id}`);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.WORKS);
  const items: WorkItem[] = stored ? JSON.parse(stored) : [];
  const idx = items.findIndex((i) => i.id === id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...finalUpdates };
    localStorage.setItem(STORAGE_KEYS.WORKS, JSON.stringify(items));
    notifyLocalListeners();
  }
}

export async function deleteWork(id: string): Promise<void> {
  // Find work to delete associated files from Storage
  const works = getLocalWorks();
  const target = works.find((w) => w.id === id);

  if (target) {
    if (target.thumbnailPath) await deleteFile(target.thumbnailPath);
    if (target.mediaPath) await deleteFile(target.mediaPath);
    if (target.voicePath) await deleteFile(target.voicePath);
    if (target.musicPath) await deleteFile(target.musicPath);
  }

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'works', id);
      await deleteDoc(docRef);
      return;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `works/${id}`);
    }
  }

  const filtered = works.filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEYS.WORKS, JSON.stringify(filtered));
  notifyLocalListeners();
}

export async function duplicateWork(id: string): Promise<string> {
  const works = getLocalWorks();
  const source = works.find((w) => w.id === id);
  if (!source) throw new Error('Work not found');

  const newTitle = `${source.title} (Copy)`;
  const newSlug = `${source.slug}-copy-${Math.random().toString(36).substring(2, 5)}`;

  return createWork({
    ...source,
    title: newTitle,
    slug: newSlug,
    published: false, // duplicates start as draft
    featured: false,
    order: works.length + 1,
  });
}

export async function reorderWorks(orderedItems: WorkItem[]): Promise<void> {
  for (let i = 0; i < orderedItems.length; i++) {
    await updateWork(orderedItems[i].id, { order: i + 1 });
  }
}

// Media CRUD
export async function createMediaRecord(mediaData: Omit<MediaAsset, 'id' | 'createdAt'>): Promise<string> {
  const id = `med_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const fullMedia: MediaAsset = {
    ...mediaData,
    id,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'media', id);
      await setDoc(docRef, fullMedia);
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `media/${id}`);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.MEDIA);
  const items: MediaAsset[] = stored ? JSON.parse(stored) : [];
  items.unshift(fullMedia);
  localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(items));
  notifyLocalListeners();
  return id;
}

export async function updateMediaRecord(id: string, updates: Partial<MediaAsset>): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'media', id);
      await updateDoc(docRef, updates);
      return;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `media/${id}`);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.MEDIA);
  const items: MediaAsset[] = stored ? JSON.parse(stored) : [];
  const idx = items.findIndex((i) => i.id === id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...updates };
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(items));
    notifyLocalListeners();
  }
}

export async function deleteMediaRecord(id: string, force = false): Promise<void> {
  const stored = localStorage.getItem(STORAGE_KEYS.MEDIA);
  const items: MediaAsset[] = stored ? JSON.parse(stored) : [];
  const target = items.find((i) => i.id === id);

  if (target) {
    const usage = getMediaUsage(target.url, target.path);
    if (usage.length > 0 && !force) {
      throw new Error(`Media is currently used by: ${usage.join(', ')}. Delete or replace usage first.`);
    }
    if (target.path) {
      await deleteFile(target.path);
    }
  }

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'media', id);
      await deleteDoc(docRef);
      return;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `media/${id}`);
    }
  }

  const filtered = items.filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(filtered));
  notifyLocalListeners();
}

// Social Links CRUD
export async function createSocialLink(linkData: Omit<SocialLinkItem, 'id'>): Promise<string> {
  const id = `soc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const fullLink: SocialLinkItem = { ...linkData, id };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'socialLinks', id);
      await setDoc(docRef, fullLink);
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `socialLinks/${id}`);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.SOCIAL_LINKS);
  const items: SocialLinkItem[] = stored ? JSON.parse(stored) : [];
  items.push(fullLink);
  localStorage.setItem(STORAGE_KEYS.SOCIAL_LINKS, JSON.stringify(items));
  notifyLocalListeners();
  return id;
}

export async function updateSocialLink(id: string, updates: Partial<SocialLinkItem>): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'socialLinks', id);
      await updateDoc(docRef, updates);
      return;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `socialLinks/${id}`);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.SOCIAL_LINKS);
  const items: SocialLinkItem[] = stored ? JSON.parse(stored) : [];
  const idx = items.findIndex((i) => i.id === id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...updates };
    localStorage.setItem(STORAGE_KEYS.SOCIAL_LINKS, JSON.stringify(items));
    notifyLocalListeners();
  }
}

export async function deleteSocialLink(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'socialLinks', id);
      await deleteDoc(docRef);
      return;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `socialLinks/${id}`);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.SOCIAL_LINKS);
  const items: SocialLinkItem[] = stored ? JSON.parse(stored) : [];
  const filtered = items.filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEYS.SOCIAL_LINKS, JSON.stringify(filtered));
  notifyLocalListeners();
}

export async function reorderSocialLinks(orderedItems: SocialLinkItem[]): Promise<void> {
  for (let i = 0; i < orderedItems.length; i++) {
    await updateSocialLink(orderedItems[i].id, { order: i + 1 });
  }
}

// Lead Capture & Message Mutations
export interface SubmitLeadParams {
  fullName?: string;
  name?: string;
  email: string;
  serviceInterest?: string;
  subject?: string;
  message: string;
  status?: string;
  source?: string;
  timeline?: string;
}

/**
 * Submits an inbound inquiry directly to the dedicated Firestore `leads` collection.
 * Conforms strictly to the CRM lead schema:
 * - fullName / name (trimmed, sanitized)
 * - email (trimmed, lowercase)
 * - serviceInterest / subject (trimmed)
 * - message (trimmed)
 * - status ("new" by default)
 * - createdAt (serverTimestamp())
 * - source ("key-of-david-portfolio")
 */
export async function submitLead(params: SubmitLeadParams): Promise<string> {
  const sanitizedName = (params.fullName || params.name || '').trim();
  const sanitizedEmail = (params.email || '').trim().toLowerCase();
  const sanitizedInterest = (params.serviceInterest || params.subject || 'Creative Consultation').trim();
  const sanitizedMessage = (params.message || '').trim();
  const status = params.status || 'new';
  const source = params.source || 'key-of-david-portfolio';
  const timeline = params.timeline || 'Flexible';

  let leadId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (isFirebaseConfigured && db) {
    try {
      const leadsCol = collection(db, 'leads');
      const docRef = await addDoc(leadsCol, {
        fullName: sanitizedName,
        name: sanitizedName,
        email: sanitizedEmail,
        serviceInterest: sanitizedInterest,
        subject: sanitizedInterest,
        message: sanitizedMessage,
        status,
        createdAt: serverTimestamp(),
        source,
        timeline,
      });
      leadId = docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'leads');
    }
  }

  // Dual-sync to messages inbox and local cache so admin dashboard remains 100% operational
  try {
    const fullMsg: ContactMessage = {
      id: leadId,
      name: sanitizedName,
      email: sanitizedEmail,
      subject: sanitizedInterest,
      message: timeline && timeline !== 'Flexible' ? `[Timeline: ${timeline}]\n\n${sanitizedMessage}` : sanitizedMessage,
      read: false,
      archived: false,
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      try {
        const msgDocRef = doc(db, 'messages', leadId);
        await setDoc(msgDocRef, fullMsg);
      } catch {
        // Non-blocking fallback
      }
    }

    const storedMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const msgList: ContactMessage[] = storedMessages ? JSON.parse(storedMessages) : [];
    msgList.unshift(fullMsg);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(msgList));

    const storedLeads = localStorage.getItem(STORAGE_KEYS.LEADS);
    const leadList = storedLeads ? JSON.parse(storedLeads) : [];
    leadList.unshift({
      id: leadId,
      fullName: sanitizedName,
      name: sanitizedName,
      email: sanitizedEmail,
      serviceInterest: sanitizedInterest,
      subject: sanitizedInterest,
      message: sanitizedMessage,
      status,
      source,
      timeline,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leadList));

    notifyLocalListeners();
  } catch {
    // Non-blocking fallback
  }

  return leadId;
}

export async function submitContactMessage(
  messageData: Omit<ContactMessage, 'id' | 'read' | 'archived' | 'createdAt'>
): Promise<string> {
  return submitLead({
    fullName: messageData.name,
    name: messageData.name,
    email: messageData.email,
    serviceInterest: messageData.subject,
    subject: messageData.subject,
    message: messageData.message,
    source: 'key-of-david-portfolio',
  });
}

export async function updateMessage(id: string, updates: Partial<ContactMessage>): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'messages', id);
      await updateDoc(docRef, updates);
      return;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `messages/${id}`);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.MESSAGES);
  const list: ContactMessage[] = stored ? JSON.parse(stored) : [];
  const idx = list.findIndex((m) => m.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates };
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(list));
    notifyLocalListeners();
  }
}

export async function deleteMessage(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'messages', id);
      await deleteDoc(docRef);
      return;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `messages/${id}`);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.MESSAGES);
  const list: ContactMessage[] = stored ? JSON.parse(stored) : [];
  const filtered = list.filter((m) => m.id !== id);
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(filtered));
  notifyLocalListeners();
}

// -------------------------------------------------------------
// HELPER QUERY FUNCTIONS & DATA INTEGRITY
// -------------------------------------------------------------

export function getLocalWorks(): WorkItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getLocalCategories(): CategoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getLocalServices(): ServiceItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SERVICES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getLocalSocialLinks(): SocialLinkItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SOCIAL_LINKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getLocalSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function getMediaUsage(url?: string, path?: string): string[] {
  const usages: string[] = [];
  if (!url && !path) return usages;

  const settings = getLocalSettings();
  if (settings.heroImageUrl === url || settings.heroImagePath === path) {
    usages.push('Site Hero Image');
  }
  if (settings.aboutImageUrl === url || settings.aboutImagePath === path) {
    usages.push('About Section Image');
  }
  if (settings.seoImageUrl === url || settings.seoImagePath === path) {
    usages.push('SEO Share Image');
  }

  const works = getLocalWorks();
  for (const w of works) {
    if (w.thumbnailUrl === url || w.thumbnailPath === path) {
      usages.push(`Work: "${w.title}" (Thumbnail)`);
    }
    if (w.mediaUrl === url || w.mediaPath === path) {
      usages.push(`Work: "${w.title}" (Media file)`);
    }
    if (w.voiceUrl === url || w.voicePath === path) {
      usages.push(`Work: "${w.title}" (Voiceover)`);
    }
    if (w.musicUrl === url || w.musicPath === path) {
      usages.push(`Work: "${w.title}" (Soundtrack)`);
    }
  }

  return usages;
}

// -------------------------------------------------------------
// DATA TOOLS (EXPORT, SAMPLE LOADER, CLEANER)
// -------------------------------------------------------------

export function exportAllDataAsBackup() {
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    settings: getLocalSettings(),
    services: getLocalServices(),
    categories: getLocalCategories(),
    works: getLocalWorks(),
    socialLinks: getLocalSocialLinks(),
  };
}

export async function loadSampleWorks(): Promise<void> {
  const categories = getLocalCategories();
  const videoCat = categories.find((c) => c.contentType === 'video')?.id || categories[0]?.id || 'cat_video';
  const imageCat = categories.find((c) => c.contentType === 'image')?.id || categories[0]?.id || 'cat_image';
  const writeCat = categories.find((c) => c.contentType === 'writing')?.id || categories[0]?.id || 'cat_writing';
  const autoCat = categories.find((c) => c.contentType === 'automation')?.id || categories[0]?.id || 'cat_auto';

  // 6 clearly marked sample works (isSample: true) with obvious placeholder texts and SVG/gradient visuals
  const sampleItems: Omit<WorkItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      type: 'video',
      title: 'Sample AI Cinematic Reel [Sample]',
      slug: 'sample-ai-cinematic-reel',
      description: 'Demonstration placeholder showcasing 2.39:1 widescreen video playback and camera direction.',
      categoryId: videoCat,
      thumbnailUrl: '',
      thumbnailPath: '',
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      mediaPath: '',
      tools: ['Runway Gen-3', 'Midjourney v6', 'Premiere Pro'],
      allowDownload: false,
      featured: true,
      isSample: true,
      order: 1,
      published: true,
    },
    {
      type: 'image',
      title: 'Sample Architectural Vision [Sample]',
      slug: 'sample-architectural-vision',
      description: 'Demonstration visual asset showcasing lighting, prompt architecture, and masonry rendering.',
      categoryId: imageCat,
      thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      thumbnailPath: '',
      mediaUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      mediaPath: '',
      tools: ['Midjourney v6.1', 'Photoshop'],
      allowDownload: true,
      featured: false,
      isSample: true,
      order: 2,
      published: true,
    },
    {
      type: 'image',
      title: 'Sample Cybernetic Portrait [Sample]',
      slug: 'sample-cybernetic-portrait',
      description: 'Demonstration portrait showcasing depth of field and color grading in AI generation.',
      categoryId: imageCat,
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      thumbnailPath: '',
      mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      mediaPath: '',
      tools: ['Flux.1', 'Magnific AI'],
      allowDownload: false,
      featured: false,
      isSample: true,
      order: 3,
      published: true,
    },
    {
      type: 'writing',
      title: 'Sample Cinematic Video Script: The Key Protocol [Sample]',
      slug: 'sample-video-script-key-protocol',
      description: 'Demonstration script blueprint with scene breakdowns, timecodes, and director cues.',
      categoryId: writeCat,
      writingKind: 'video-script',
      content: `# SCENE 1: THE DISCOVERY\n\n**FADE IN:**\n\n**INT. RESEARCH OBSERVATORY - NIGHT**\n\nThe hum of cryogenic server racks vibrates through the concrete chamber.\n\n**NARRATOR (V.O.)**\n> "Every breakthrough begins when someone refuses to accept manual friction as a natural law."\n\n*Camera pushes past amber terminal monitors into the central core.*`,
      thumbnailUrl: '',
      thumbnailPath: '',
      mediaUrl: '',
      mediaPath: '',
      tools: ['Claude 3.5 Sonnet', 'Notion'],
      allowDownload: true,
      featured: false,
      isSample: true,
      order: 4,
      published: true,
    },
    {
      type: 'writing',
      title: 'Sample Editorial: Scaling Creative Leverage with AI [Sample]',
      slug: 'sample-scaling-creative-leverage',
      description: 'Demonstration editorial thought leadership essay exploring human taste in automated workflows.',
      categoryId: writeCat,
      writingKind: 'blog',
      content: `## The Myth of Effort as Value\n\nFor generations, creative output was measured by hours consumed rather than density of taste.\n\nWhen autonomous agents manage repetitive synthesis, the human operator transforms from a laborer into a film director.\n\n### Core Pillars:\n- Precision Prompt Architecture\n- Autonomous Triage Workflows\n- High-Aesthetic Curation`,
      thumbnailUrl: '',
      thumbnailPath: '',
      mediaUrl: '',
      mediaPath: '',
      tools: ['Markdown', 'Editorial Stack'],
      allowDownload: true,
      featured: false,
      isSample: true,
      order: 5,
      published: true,
    },
    {
      type: 'automation',
      title: 'Sample Autonomous Lead Triage Pipeline [Sample]',
      slug: 'sample-autonomous-lead-pipeline',
      description: 'Demonstration case study illustrating multi-step AI webhook enrichment and automated classification.',
      categoryId: autoCat,
      problem: 'Client incoming requests took 14 hours on average to qualify and route.',
      solution: 'Engineered an intelligent webhook agent that analyzes inquiries, tags intent, and drafts contextual response briefings.',
      result: 'Automated 80% of initial qualification with sub-minute turnaround.',
      tools: ['Make / Zapier', 'OpenAI API', 'Airtable', 'Slack'],
      thumbnailUrl: '',
      thumbnailPath: '',
      mediaUrl: '',
      mediaPath: '',
      allowDownload: false,
      featured: false,
      isSample: true,
      order: 6,
      published: true,
    },
  ];

  for (const item of sampleItems) {
    await createWork(item);
  }
}

export async function removeAllSampleWorks(): Promise<void> {
  const works = getLocalWorks();
  const sampleWorks = works.filter((w) => w.isSample);
  for (const s of sampleWorks) {
    await deleteWork(s.id);
  }
}
