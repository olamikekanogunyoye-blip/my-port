/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Floating WhatsApp Button
 * - 56px circular floating action button at bottom-right.
 * - Ink background (#0B0B0C) with thin Brass border and inline WhatsApp glyph.
 * - Subtle pulse ring animation every 6 seconds (disabled for reduced motion).
 * - Desktop hover tooltip: "Chat on WhatsApp".
 * - Respects safe-area insets with 16px bottom/right margin.
 * - Automatically hidden on /admin, when showFloatingWhatsApp is false,
 *   when whatsappNumber is empty, or when any modal/lightbox/mobile overlay is active.
 * - Context-aware message: detects /work/:slug and formats work title,
 *   otherwise defaults to settings.whatsappMessage.
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SiteSettings, WorkItem } from '../../types';
import { buildWhatsAppLink } from '../../lib/contact';
import { WhatsAppSolidIcon } from '../ui/WhatsAppIcon';
import { motion, AnimatePresence } from 'motion/react';
import { logAnalyticsEvent } from '../../lib/firebase';

interface FloatingWhatsAppProps {
  settings: SiteSettings;
  works?: WorkItem[];
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ settings, works = [] }) => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Check if current route is admin
  const isAdmin = location.pathname.startsWith('/admin');

  // Context-aware message resolution
  let message = settings.whatsappMessage || "Hello KEY OF DAVID, I found your portfolio and I'd like to work with you.";
  if (location.pathname.startsWith('/work/')) {
    const slug = location.pathname.replace('/work/', '').split('/')[0];
    const currentWork = works.find((w) => w.slug === slug);
    if (currentWork?.title) {
      message = `Hello KEY OF DAVID, I saw "${currentWork.title}" on your portfolio and I'd like to work with you.`;
    }
  }

  // Detect open dialogs, lightboxes, or mobile overlays via MutationObserver
  useEffect(() => {
    const checkModalState = () => {
      const hasDialog = Boolean(document.querySelector('[role="dialog"]'));
      const hasMobileMenu = Boolean(document.querySelector('[data-mobile-menu="open"]'));
      const hasLightbox = Boolean(document.querySelector('.kod-lightbox-open'));
      const isBodyLocked = document.body.classList.contains('overflow-hidden');
      setIsModalOpen(hasDialog || hasMobileMenu || hasLightbox || isBodyLocked);
    };

    checkModalState();

    const observer = new MutationObserver(checkModalState);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'data-mobile-menu', 'role'],
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  // Don't render on admin, if disabled, if number is missing, or while modals are open
  if (isAdmin || settings.showFloatingWhatsApp === false || !settings.whatsappNumber) {
    return null;
  }

  if (isModalOpen) {
    return null;
  }

  const href = buildWhatsAppLink(settings.whatsappNumber, message);

  return (
    <div
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] flex items-center justify-end select-none pointer-events-auto"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      <div className="relative flex items-center">
        {/* Desktop Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.15 }}
              className="hidden lg:block absolute right-[68px] whitespace-nowrap px-3 py-1.5 bg-[#151517] border border-[#C9A24D]/30 text-[#F1EEE6] font-mono text-xs uppercase tracking-wider rounded shadow-xl pointer-events-none"
            >
              Chat on WhatsApp
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Button with Pulse Effect */}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          onClick={() => {
            logAnalyticsEvent('contact_channel_click', {
              channel: 'whatsapp',
              location: 'floating_button',
            });
          }}
          aria-label="Chat on WhatsApp"
          className="relative w-14 h-14 rounded-full bg-[#0B0B0C] text-[#25D366] hover:text-[#C9A24D] border border-[#C9A24D]/40 flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.6)] hover:border-[#C9A24D] hover:scale-105 active:scale-95 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-[#C9A24D] focus-visible:outline-offset-2 group"
        >
          {/* Subtle pulse ring animation every 6 seconds (disabled on reduced motion) */}
          <span
            className="absolute inset-0 rounded-full border border-[#25D366]/40 motion-safe:animate-[ping_6s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none group-hover:border-[#C9A24D]/60"
            aria-hidden="true"
          />

          {/* SVG WhatsApp Glyph */}
          <WhatsAppSolidIcon size={26} className="transition-transform duration-300 group-hover:scale-110" />
        </a>
      </div>
    </div>
  );
};
