/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Cinematic Editorial Footer.
 * Giant wordmark "KEY OF DAVID" across full width in display type (clipped at bottom).
 * Columns: Identity & Direct Contact, Navigation links, Social channels, Copyright.
 * Includes direct WhatsApp and Hotline links alongside email and location.
 * NO Admin or Login link anywhere.
 */

import React from 'react';
import { SiteSettings, SocialLinkItem } from '../../types';
import { KeyLogo } from '../ui/KeyLogo';
import {
  buildWhatsAppLink,
  buildTelLink,
  formatPhoneDisplay,
} from '../../lib/contact';
import { WhatsAppSolidIcon } from '../ui/WhatsAppIcon';
import { ArrowUpRight, Phone, Mail, MapPin } from 'lucide-react';
import { SocialLinksCluster } from '../ui/SocialLinksCluster';
import { logAnalyticsEvent } from '../../lib/firebase';

interface FooterProps {
  settings: SiteSettings;
  socialLinks?: SocialLinkItem[];
}

export const Footer: React.FC<FooterProps> = ({ settings, socialLinks = [] }) => {
  const currentYear = new Date().getFullYear();

  const validSocialLinks = socialLinks.filter(
    (l) => l.published && l.url && l.url.trim().length > 0
  );

  const handleScrollTo = (id: string) => {
    logAnalyticsEvent('navigate_section', { section: id, source: 'footer' });
    const el = document.getElementById(id);

    if (el) {
      const navOffset = 80;
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - navOffset,
        behavior: 'smooth',
      });
      try {
        window.history.pushState(null, '', `#${id}`);
      } catch {
        // Safe in constrained environments
      }
    }
  };

  const whatsappHref = settings.whatsappNumber
    ? buildWhatsAppLink(
        settings.whatsappNumber,
        settings.whatsappMessage || "Hello KEY OF DAVID, I found your portfolio and I'd like to work with you."
      )
    : '';

  const hotlineHref = settings.hotline ? buildTelLink(settings.hotline) : '';

  return (
    <footer className="bg-[#0B0B0C] border-t border-[rgba(241,238,230,0.12)] pt-20 pb-12 px-5 sm:px-10 lg:px-16 overflow-hidden relative">
      <div className="max-w-[1440px] mx-auto">
        {/* Editorial Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-20 border-b border-[rgba(241,238,230,0.1)]">
          {/* Col 1: Brand & Identity & Direct Contact (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <KeyLogo size="md" />
            <div className="font-mono text-xs text-[#8A877F] space-y-2 pt-2">
              <p className="text-[#F1EEE6] font-medium text-sm">{settings.ownerName}</p>
              <p>{settings.title}</p>

              {/* Direct Contact links in Footer */}
              <div className="pt-3 space-y-2 border-t border-[rgba(241,238,230,0.08)]">
                {settings.whatsappNumber && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      logAnalyticsEvent('contact_channel_click', { channel: 'whatsapp', location: 'footer' });
                    }}
                    className="flex items-center gap-2 text-[#25D366] hover:text-[#C9A24D] transition-colors"
                  >
                    <WhatsAppSolidIcon size={14} />
                    <span>WhatsApp: {formatPhoneDisplay(settings.whatsappNumber)}</span>
                    <ArrowUpRight size={12} />
                  </a>
                )}

                {settings.hotline && (
                  <a
                    href={hotlineHref}
                    onClick={() => {
                      logAnalyticsEvent('contact_channel_click', { channel: 'hotline', location: 'footer' });
                    }}
                    className="flex items-center gap-2 text-[#F1EEE6] hover:text-[#C9A24D] transition-colors"
                  >
                    <Phone size={13} className="text-[#C9A24D]" />
                    <span>Hotline: {formatPhoneDisplay(settings.hotline)}</span>
                  </a>
                )}

                <a
                  href={`mailto:${settings.email}`}
                  onClick={() => {
                    logAnalyticsEvent('contact_channel_click', { channel: 'email', location: 'footer' });
                  }}
                  className="flex items-center gap-2 text-[#8A877F] hover:text-[#F1EEE6] transition-colors"
                >
                  <Mail size={13} className="text-[#C9A24D]" />
                  <span>{settings.email}</span>
                </a>

                {settings.location && (
                  <p className="flex items-center gap-2 text-[#8A877F]">
                    <MapPin size={13} className="text-[#C9A24D]" />
                    <span>{settings.location}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Col 2: Navigation Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3 font-mono text-xs uppercase tracking-wider">
            <span className="text-[#C9A24D] block mb-4">Navigation</span>
            <div className="flex flex-col gap-2.5 text-[#8A877F]">
              {[
                { id: 'home', label: 'Home' },
                { id: 'portfolio', label: 'Portfolio' },
                { id: 'services', label: 'Services' },
                { id: 'about', label: 'About' },
                { id: 'contact', label: 'Contact' },
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollTo(item.id);
                  }}
                  className="hover:text-[#F1EEE6] transition-colors w-fit"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* Col 3: Social Channels (4 cols) */}
          <div className="lg:col-span-4 space-y-4 font-mono text-xs uppercase tracking-wider">
            <span className="text-[#C9A24D] block">Connect</span>
            <p className="text-[#8A877F] normal-case text-xs leading-relaxed max-w-xs">
              Follow behind-the-scenes workflows, AI cinema productions, and engineering breakdowns across official platforms.
            </p>
            <div className="pt-2">
              <SocialLinksCluster variant="dock" iconSize={12} />
            </div>
          </div>
        </div>

        {/* Copyright, Status Indicator, Social Media Cluster & Legal Line */}
        <div className="pt-8 pb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 font-mono text-xs text-[#8A877F]">
          <div className="flex flex-wrap items-center gap-4">
            <span>
              © {currentYear} {settings.ownerName}. All rights reserved.
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-zinc-400 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <span>Studio Pipeline Online</span>
            </span>
          </div>

          {/* Centered / Inline Official Social Media Row */}
          <div className="flex items-center">
            <SocialLinksCluster variant="inline" iconSize={15.5} />
          </div>

          <span className="text-[11px] text-zinc-500">
            {settings.brandName} • AI PRODUCTION & AUTOMATION
          </span>
        </div>

        {/* Giant Clipped Wordmark Across Full Width */}
        <div
          className="relative select-none pointer-events-none -mb-8 overflow-hidden"
          aria-hidden="true"
        >
          <div className="font-display text-[15vw] leading-[0.8] tracking-tighter uppercase text-[#F1EEE6]/[0.04] text-center whitespace-nowrap">
            KEY OF DAVID
          </div>
        </div>
      </div>
    </footer>
  );
};
