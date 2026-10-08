/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Public Home Page (Stage 2)
 * Orchestrates the full filmic public website:
 * - Fixed Navbar (transparent to blur on scroll, active section highlight, mobile overlay)
 * - HeroSection (#home, 100svh, masked line-by-line reveal, 4:5 portrait, pointer spotlight)
 * - Marquee (infinite ticker of published services separated by KeyGlyph)
 * - AboutSection (#about, inverted Bone background, markdown 62ch measure, what I do tags)
 * - ServicesSection (#services, numbered list, desktop hover expand, mobile accordion)
 * - PortfolioSection (#portfolio, tabs, 2.39:1 featured card, video modal, image lightbox, reading rows, automation cases, empty state)
 * - ConnectSection (#connect, giant typographic social links)
 * - ContactSection (#contact, rate-limited form with honeypot trap, Firestore messages write)
 * - Footer (giant clipped wordmark, metadata, navigation, copyright)
 * Skeleton loaders while initial data loads.
 */

import React, { useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useServices } from '../hooks/useServices';
import { useCategories } from '../hooks/useCategories';
import { useWorks } from '../hooks/useWorks';
import { useSocialLinks } from '../hooks/useSocialLinks';
import { seedInitialDataIfNeeded } from '../lib/db';

import {
  Navbar,
  HeroSection,
  Marquee,
  CommercialVideoShowcase,
  AboutSection,
  ServicesSection,
  PortfolioSection,
  ContactSection,
  Footer,
} from '../components/public';
import { Skeleton } from '../components/ui/Skeleton';

export default function Home() {
  const { settings, loading: settingsLoading } = useSettings();
  const { services, loading: servicesLoading } = useServices();
  const { categories } = useCategories();
  const { works } = useWorks();
  const { socialLinks } = useSocialLinks();

  useEffect(() => {
    // Ensure initial baseline seeds exist
    seedInitialDataIfNeeded();

    // Deep-link initial hash smooth scroll support with header offset
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const el =
          document.getElementById(id) ||
          (id === 'commercials' ? document.getElementById('commercial-works') : null) ||
          (id === 'commercial-works' ? document.getElementById('commercials') : null);
        if (el) {
          const navOffset = 80;
          const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: elementPosition - navOffset,
            behavior: 'smooth',
          });
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, []);

  if (settingsLoading && servicesLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] px-6 sm:px-12 py-24 max-w-[1440px] mx-auto space-y-12">
        <div className="flex justify-between items-center pb-8 border-b border-[rgba(241,238,230,0.1)]">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-8 w-32 hidden sm:block" />
        </div>
        <div className="space-y-6 pt-12">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-20 w-3/4" />
          <Skeleton className="h-12 w-1/2" />
          <div className="flex gap-4 pt-6">
            <Skeleton className="h-12 w-36" />
            <Skeleton className="h-12 w-36" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F1EEE6] selection:bg-[#C9A24D]/30 selection:text-[#F1EEE6]">
      {/* Fixed Top Navigation Bar */}
      <Navbar
        socialLinks={socialLinks}
        ctaLabel={settings.ctaSecondaryLabel || 'Work With Me'}
        whatsappNumber={settings.whatsappNumber}
        whatsappMessage={settings.whatsappMessage}
      />

      {/* Main Page Flow */}
      <main>
        {/* 1. Cinematic Hero Section (#home) */}
        <HeroSection settings={settings} />

        {/* 2. Featured Commercial Works & Video Showcase (#commercial-works) */}
        <CommercialVideoShowcase />

        {/* 3. Numbered Services Section (#services) */}
        <ServicesSection services={services} />

        {/* 4. Filtered Portfolio Section (#portfolio) — Includes full video work archive */}
        <PortfolioSection
          works={works}
          categories={categories}
          whatsappNumber={settings.whatsappNumber}
        />

        {/* 5. Director Profile & About Section (#about) — Moved towards the end */}
        <AboutSection settings={settings} services={services} />

        {/* 6. Contact / Work With Me Section (#contact) */}
        <ContactSection settings={settings} socialLinks={socialLinks} />
      </main>

      {/* 8. Editorial Clipped Footer */}
      <Footer settings={settings} socialLinks={socialLinks} />
    </div>
  );
}
