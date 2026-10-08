/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SiteSettings } from '../types';
import { formatPhoneDisplay } from './contact';

export function updateSeo(settings?: Partial<SiteSettings>): void {
  if (!settings) return;

  const title =
    settings.seoTitle ||
    (settings.brandName && settings.ownerName
      ? `${settings.brandName} — ${settings.ownerName} | ${settings.title || 'Portfolio'}`
      : 'KEY OF DAVID — Olamilekan Ogunyoye David');

  const description =
    settings.seoDescription ||
    settings.heroIntro ||
    'Editorial portfolio of Olamilekan Ogunyoye David (KEY OF DAVID) — Creative AI Creator & AI Automation Agent.';

  const keywords = settings.seoKeywords?.length
    ? settings.seoKeywords.join(', ')
    : 'Creative AI, AI Videos, AI Images, AI Automation, AI Agents, Video Scripts, Storytelling, KEY OF DAVID, Olamilekan Ogunyoye David';

  document.title = title;

  const setMeta = (nameAttr: 'name' | 'property', attrValue: string, content: string) => {
    let el = document.querySelector(`meta[${nameAttr}="${attrValue}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(nameAttr, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMeta('name', 'description', description);
  setMeta('name', 'keywords', keywords);
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:type', settings.ogType || 'website');
  if (settings.seoImageUrl) {
    setMeta('property', 'og:image', settings.seoImageUrl);
  }

  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
  if (settings.twitterHandle) {
    setMeta('name', 'twitter:site', settings.twitterHandle);
    setMeta('name', 'twitter:creator', settings.twitterHandle);
  }
  if (settings.seoImageUrl) {
    setMeta('name', 'twitter:image', settings.seoImageUrl);
  }

  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute(
    'href',
    settings.canonicalUrl || window.location.origin + window.location.pathname
  );

  // JSON-LD Structured Data with Person, telephone & ContactPoint
  const phoneFormatted = settings.hotline
    ? formatPhoneDisplay(settings.hotline)
    : settings.phone
    ? formatPhoneDisplay(settings.phone)
    : undefined;

  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: settings.ownerName || 'Olamilekan Ogunyoye David',
    jobTitle: settings.title || 'Creative AI Creator & AI Automation Agent',
    brand: {
      '@type': 'Brand',
      name: settings.brandName || 'KEY OF DAVID',
    },
    email: settings.email,
    description: description,
    url: window.location.origin,
  };

  if (settings.heroImageUrl) {
    jsonLd.image = settings.heroImageUrl;
  }

  if (settings.hotline || settings.phone) {
    const rawDigits = settings.hotline || settings.phone;
    jsonLd.telephone = `+${rawDigits?.replace(/[^\d]/g, '')}`;
    jsonLd.contactPoint = {
      '@type': 'ContactPoint',
      telephone: `+${rawDigits?.replace(/[^\d]/g, '')}`,
      contactType: 'direct inquiry',
      availableLanguage: ['English'],
    };
  }

  let scriptEl = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement | null;
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.setAttribute('type', 'application/ld+json');
    document.head.appendChild(scriptEl);
  }
  scriptEl.textContent = JSON.stringify(jsonLd, null, 2);
}
