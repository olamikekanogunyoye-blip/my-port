/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Cinematic editorial top navigation.
 * Transparent at top, blur + Ink 80% on scroll.
 * Active section detection, smooth anchor scrolling, mobile full-screen overlay.
 * NO Admin or Login link anywhere.
 */

import React, { useState, useEffect } from 'react';
import { KeyLogo } from '../ui/KeyLogo';
import { Button } from '../ui/Button';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SocialLinkItem } from '../../types';
import { WhatsAppSolidIcon } from '../ui/WhatsAppIcon';
import { buildWhatsAppLink } from '../../lib/contact';
import { SocialLinksCluster } from '../ui/SocialLinksCluster';
import { logAnalyticsEvent } from '../../lib/firebase';

interface NavbarProps {
  socialLinks?: SocialLinkItem[];
  ctaLabel?: string;
  whatsappNumber?: string;
  whatsappMessage?: string;
}

const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'commercials', label: 'Commercials' },
  { id: 'services', label: 'Services' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

export const Navbar: React.FC<NavbarProps> = ({
  socialLinks = [],
  ctaLabel = 'Work With Me',
  whatsappNumber,
  whatsappMessage,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      // Detect active section based on scroll position
      const sections = NAV_ITEMS.map((item) => {
        return (
          document.getElementById(item.id) ||
          (item.id === 'commercials' ? document.getElementById('commercial-works') : null)
        );
      });
      const scrollPos = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (sec && sec.offsetTop <= scrollPos) {
          setActiveSection(NAV_ITEMS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLElement> | undefined, id: string) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    logAnalyticsEvent('navigate_section', { section: id });

    const element =
      document.getElementById(id) ||
      (id === 'commercials' ? document.getElementById('commercial-works') : null) ||
      (id === 'commercial-works' ? document.getElementById('commercials') : null);

    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - navOffset,
        behavior: 'smooth',
      });
      try {
        window.history.pushState(null, '', `#${id}`);
      } catch {
        // Safe in constrained iframe environments
      }
    }
  };

  return (
    <>
      <nav
        aria-label="Site Navigation"
        className={`
          fixed top-0 left-0 right-0 z-50 px-5 sm:px-10 lg:px-16 transition-all duration-500
          ${
            isScrolled
              ? 'bg-[#0B0B0C]/85 backdrop-blur-md border-b border-[rgba(241,238,230,0.1)] py-4'
              : 'bg-transparent py-6 border-b border-transparent'
          }
        `}
      >
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, 'home')}
            className="focus-visible:outline-2 focus-visible:outline-[#C9A24D]"
            aria-label="KEY OF DAVID Home"
          >
            <KeyLogo size="md" />
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-[0.14em]">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleNavClick(e, item.id)}
                  className={`
                    transition-colors duration-300 relative py-1
                    ${isActive ? 'text-[#F1EEE6]' : 'text-[#8A877F] hover:text-[#F1EEE6]'}
                  `}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#C9A24D]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              );
            })}
          </div>

          {/* Right Action: Clean Primary CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="primary"
              size="sm"
              href="#contact"
              onClick={(e) => handleNavClick(e, 'contact')}
            >
              {ctaLabel}
            </Button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#F1EEE6] hover:text-[#C9A24D] transition-colors focus-visible:outline-2 focus-visible:outline-[#C9A24D]"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Full-Screen Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-[#0B0B0C] flex flex-col justify-between px-6 pt-28 pb-10 md:hidden"
            role="dialog"
            aria-modal="true"
            data-mobile-menu="open"
          >
            {/* Staggered Navigation Items */}
            <div className="flex flex-col gap-6">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#C9A24D]">
                Navigation
              </span>
              <div className="flex flex-col gap-5">
                {NAV_ITEMS.map((item, idx) => (
                  <motion.a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => handleNavClick(e, item.id)}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * idx, duration: 0.3 }}
                    className="font-h2 font-bold uppercase tracking-tight text-[#F1EEE6] hover:text-[#C9A24D] transition-colors flex items-center justify-between border-b border-[rgba(241,238,230,0.06)] pb-3"
                  >
                    <span>{item.label}</span>
                    <span className="font-mono text-xs text-[#8A877F] font-normal">
                      0{idx + 1}
                    </span>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Mobile Footer CTAs and Social Links */}
            <div className="space-y-4 pt-6 border-t border-[rgba(241,238,230,0.1)]">
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  href="#contact"
                  onClick={(e) => handleNavClick(e, 'contact')}
                  className="flex-1"
                >
                  {ctaLabel}
                </Button>

                {whatsappNumber && (
                  <a
                    href={buildWhatsAppLink(
                      whatsappNumber,
                      whatsappMessage || "Hello KEY OF DAVID, I found your portfolio and I'd like to work with you."
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-[#151517] hover:bg-[#1a1a1d] text-[#25D366] border border-[#25D366]/40 hover:border-[#25D366] font-mono text-xs uppercase tracking-wider font-semibold inline-flex items-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-[#25D366] shrink-0"
                    aria-label="Chat on WhatsApp"
                  >
                    <WhatsAppSolidIcon size={16} />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>

              {/* Official Social Links in Mobile Drawer */}
              <div className="pt-3 border-t border-[rgba(241,238,230,0.08)] flex flex-col gap-2.5">
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 block">
                  Official Channels
                </span>
                <SocialLinksCluster variant="dock" iconSize={12} className="w-fit" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
