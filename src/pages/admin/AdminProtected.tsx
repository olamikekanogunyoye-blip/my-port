/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Admin Terminal & Content Management Deck
 * Private owner route protected by Google authentication and email verification.
 * Enforces OWNER_EMAIL (olamilekanogunyoye@gmail.com) gate.
 * Meta robots noindex,nofollow enforced.
 * Provides desktop sidebar & mobile bottom bar navigation across all 10 management sections.
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { OWNER_EMAIL, BRAND_NAME, OWNER_NAME } from '../../config/owner';
import { isFirebaseConfigured } from '../../config/firebase';
import { KeyLogo, KeyGlyph } from '../../components/ui/KeyLogo';
import { Button } from '../../components/ui/Button';

// Data Hooks
import { useSettings } from '../../hooks/useSettings';
import { useWorks } from '../../hooks/useWorks';
import { useServices } from '../../hooks/useServices';
import { useCategories } from '../../hooks/useCategories';
import { useSocialLinks } from '../../hooks/useSocialLinks';
import { useMessages } from '../../hooks/useMessages';
import { useMedia } from '../../hooks/useMedia';

// Admin Section Components
import { AdminOverview } from './AdminOverview';
import { AdminSettings } from './AdminSettings';
import { AdminAbout } from './AdminAbout';
import { AdminServices } from './AdminServices';
import { AdminWorks } from './AdminWorks';
import { AdminCategories } from './AdminCategories';
import { AdminSocial } from './AdminSocial';
import { AdminMessages } from './AdminMessages';
import { AdminMedia } from './AdminMedia';
import { AdminSeo } from './AdminSeo';

// Icons
import {
  LayoutDashboard,
  Settings,
  User,
  Layers,
  Film,
  Tag,
  Share2,
  Mail,
  Image as ImageIcon,
  Globe,
  LogOut,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Menu,
  X,
  MoreHorizontal,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export type AdminTab =
  | 'overview'
  | 'settings'
  | 'about'
  | 'services'
  | 'works'
  | 'categories'
  | 'social'
  | 'inbox'
  | 'media'
  | 'seo';

export default function AdminProtected() {
  const {
    user,
    isOwner,
    loading: authLoading,
    error: authError,
    signInWithGoogle,
    signOut,
    simulateOwnerAuthForTesting,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [testUnauthorizedAttempt, setTestUnauthorizedAttempt] = useState(false);

  // Subscribe to all site data
  const { settings, loading: settingsLoading } = useSettings();
  const { works } = useWorks(true); // include drafts
  const { services } = useServices(true);
  const { categories } = useCategories(true);
  const { socialLinks } = useSocialLinks(true);
  const { messages } = useMessages();
  const { media } = useMedia();

  // Enforce noindex, nofollow
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }
    meta.content = 'noindex,nofollow';

    return () => {
      if (meta) {
        meta.content = 'index,follow';
      }
    };
  }, []);

  const unreadMessagesCount = messages.filter((m) => !m.read && !m.archived).length;

  const handleNavigateTab = (tab: string, _subAction?: string) => {
    setActiveTab(tab as AdminTab);
    setMobileMoreOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // -------------------------------------------------------------
  // 1. AUTHENTICATION GATE (When not authenticated as owner)
  // -------------------------------------------------------------
  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] text-[#F1EEE6] flex flex-col items-center justify-center p-6 gap-4">
        <div className="w-8 h-8 border-2 border-[#C9A24D] border-t-transparent animate-spin rounded-full" />
        <p className="font-mono text-xs text-[#8A877F] uppercase tracking-widest">
          Authenticating Owner Security Gate...
        </p>
      </div>
    );
  }

  if (!isOwner || !user) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] text-[#F1EEE6] flex flex-col justify-center items-center px-4 py-16 relative">
        <div className="w-full max-w-md bg-[#151517] border border-[rgba(241,238,230,0.15)] p-8 sm:p-10 shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#C9A24D]" />

          <div className="text-center space-y-4 mb-8">
            <div className="w-14 h-14 rounded-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] flex items-center justify-center mx-auto text-[#C9A24D]">
              <KeyGlyph size={24} />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#C9A24D]">
                {BRAND_NAME}
              </p>
              <h1 className="font-sans font-bold text-xl text-[#F1EEE6] mt-1">
                Private Terminal Gate
              </h1>
              <p className="text-xs text-[#8A877F] mt-2 leading-relaxed">
                Management terminal strictly restricted to verified owner account{' '}
                <strong className="text-[#F1EEE6]">{OWNER_EMAIL}</strong>.
              </p>
            </div>
          </div>

          {authError && (
            <div className="p-3 mb-6 bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start gap-2 font-mono">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {testUnauthorizedAttempt && (
            <div className="p-3 mb-6 bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start gap-2 font-mono">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold uppercase">Unauthorized Account Rejected</p>
                <p className="text-[11px] mt-1 text-red-200">
                  Access denied. Non-owner Google sessions are terminated immediately.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => {
                setTestUnauthorizedAttempt(false);
                signInWithGoogle();
              }}
              icon={<Lock size={16} />}
            >
              Continue with Google
            </Button>

            {/* Stage 3 Test Simulation Controls */}
            <div className="pt-6 border-t border-[rgba(241,238,230,0.1)] space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#8A877F] text-center">
                Owner Access Verification Testing
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTestUnauthorizedAttempt(false);
                    if (simulateOwnerAuthForTesting) simulateOwnerAuthForTesting();
                  }}
                  className="px-3 py-2.5 text-[10px] font-mono uppercase tracking-wider bg-[#0B0B0C] border border-emerald-800 text-emerald-400 hover:bg-emerald-950/30 transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={13} />
                  Authorize ({OWNER_EMAIL})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTestUnauthorizedAttempt(true);
                    signOut();
                  }}
                  className="px-3 py-2.5 text-[10px] font-mono uppercase tracking-wider bg-[#0B0B0C] border border-red-900 text-red-400 hover:bg-red-950/30 transition-colors flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle size={13} />
                  Simulate Non-Owner
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
              <a
                href="/"
                className="font-mono text-xs text-[#8A877F] hover:text-[#C9A24D] transition-colors"
              >
                ← Return to Public Portfolio
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. AUTHENTICATED ADMIN DASHBOARD
  // -------------------------------------------------------------
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'works', label: 'Selected Works', icon: Film, count: works.length },
    { id: 'services', label: 'Services', icon: Layers, count: services.length },
    { id: 'about', label: 'About & Bio', icon: User },
    { id: 'categories', label: 'Categories', icon: Tag, count: categories.length },
    { id: 'media', label: 'Media Library', icon: ImageIcon, count: media.length },
    { id: 'inbox', label: 'Inbound Inbox', icon: Mail, badge: unreadMessagesCount },
    { id: 'social', label: 'Social Outlets', icon: Share2, count: socialLinks.length },
    { id: 'settings', label: 'Site Settings', icon: Settings },
    { id: 'seo', label: 'SEO & Sharing', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F1EEE6] flex flex-col lg:flex-row pb-20 lg:pb-0">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 bg-[#151517] border-r border-[rgba(241,238,230,0.1)] flex-col justify-between shrink-0 fixed top-0 bottom-0 left-0 z-30">
        <div>
          {/* Brand Logo Header */}
          <div className="p-6 border-b border-[rgba(241,238,230,0.1)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-[#C9A24D]">
                <KeyGlyph size={20} />
              </span>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C9A24D] block">
                  {BRAND_NAME}
                </span>
                <span className="font-sans font-bold text-sm text-[#F1EEE6]">
                  Control Deck
                </span>
              </div>
            </div>

            <span className="w-2 h-2 rounded-full bg-emerald-400" title="Connected" />
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigateTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors min-h-[44px] ${
                    isActive
                      ? 'bg-[rgba(201,162,77,0.15)] text-[#C9A24D] border-l-2 border-[#C9A24D]'
                      : 'text-[#8A877F] hover:text-[#F1EEE6] hover:bg-[#1A1A1E]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComp size={16} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 ? (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#C9A24D] text-[#0B0B0C] rounded-full">
                      {item.badge}
                    </span>
                  ) : item.count !== undefined ? (
                    <span className="text-[10px] text-[#8A877F]">{item.count}</span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Sign Out */}
        <div className="p-4 border-t border-[rgba(241,238,230,0.1)] space-y-3 bg-[#0E0E10]">
          <div className="flex items-center justify-between text-xs">
            <div className="min-w-0 pr-2">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#C9A24D] block">
                Owner Verified
              </span>
              <p className="font-mono text-[11px] text-[#F1EEE6] truncate">
                {user.email}
              </p>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="p-2 text-[#8A877F] hover:text-[#C9A24D] transition-colors"
              title="Open Public Site"
            >
              <ExternalLink size={15} />
            </a>
          </div>

          <button
            type="button"
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-mono uppercase tracking-wider text-[#8A877F] hover:text-red-400 bg-[#151517] border border-[rgba(241,238,230,0.1)] hover:border-red-900 transition-colors min-h-[44px]"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MOBILE STICKY TOP BAR */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#151517] border-b border-[rgba(241,238,230,0.1)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#C9A24D]">
            <KeyGlyph size={18} />
          </span>
          <div>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#C9A24D] block">
              {BRAND_NAME}
            </span>
            <span className="font-sans font-bold text-xs text-[#F1EEE6]">
              {navItems.find((n) => n.id === activeTab)?.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="p-2 text-[#8A877F] hover:text-[#C9A24D] min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ExternalLink size={16} />
          </a>
          <button
            type="button"
            onClick={signOut}
            className="p-2 text-[#8A877F] hover:text-red-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 lg:ml-64 p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto w-full">
        {activeTab === 'overview' && (
          <AdminOverview
            settings={settings}
            works={works}
            messages={messages}
            socialLinks={socialLinks}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {activeTab === 'settings' && <AdminSettings settings={settings} />}

        {activeTab === 'about' && <AdminAbout settings={settings} />}

        {activeTab === 'services' && <AdminServices services={services} />}

        {activeTab === 'works' && <AdminWorks works={works} categories={categories} />}

        {activeTab === 'categories' && (
          <AdminCategories categories={categories} works={works} />
        )}

        {activeTab === 'social' && <AdminSocial socialLinks={socialLinks} />}

        {activeTab === 'inbox' && <AdminMessages messages={messages} />}

        {activeTab === 'media' && <AdminMedia media={media} />}

        {activeTab === 'seo' && <AdminSeo settings={settings} />}
      </main>

      {/* MOBILE STICKY BOTTOM TAB BAR */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#151517] border-t border-[rgba(241,238,230,0.1)] flex items-center justify-around px-2 py-1">
        <button
          type="button"
          onClick={() => handleNavigateTab('overview')}
          className={`flex-1 py-2 flex flex-col items-center justify-center gap-1 font-mono text-[9px] uppercase tracking-wider min-h-[44px] ${
            activeTab === 'overview' ? 'text-[#C9A24D]' : 'text-[#8A877F]'
          }`}
        >
          <LayoutDashboard size={17} />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavigateTab('works')}
          className={`flex-1 py-2 flex flex-col items-center justify-center gap-1 font-mono text-[9px] uppercase tracking-wider min-h-[44px] ${
            activeTab === 'works' ? 'text-[#C9A24D]' : 'text-[#8A877F]'
          }`}
        >
          <Film size={17} />
          <span>Works</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavigateTab('media')}
          className={`flex-1 py-2 flex flex-col items-center justify-center gap-1 font-mono text-[9px] uppercase tracking-wider min-h-[44px] ${
            activeTab === 'media' ? 'text-[#C9A24D]' : 'text-[#8A877F]'
          }`}
        >
          <ImageIcon size={17} />
          <span>Media</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavigateTab('inbox')}
          className={`flex-1 py-2 flex flex-col items-center justify-center gap-1 font-mono text-[9px] uppercase tracking-wider min-h-[44px] relative ${
            activeTab === 'inbox' ? 'text-[#C9A24D]' : 'text-[#8A877F]'
          }`}
        >
          <Mail size={17} />
          <span>Inbox</span>
          {unreadMessagesCount > 0 && (
            <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-[#C9A24D]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setMobileMoreOpen(!mobileMoreOpen)}
          className={`flex-1 py-2 flex flex-col items-center justify-center gap-1 font-mono text-[9px] uppercase tracking-wider min-h-[44px] ${
            mobileMoreOpen ? 'text-[#C9A24D]' : 'text-[#8A877F]'
          }`}
        >
          <MoreHorizontal size={17} />
          <span>More</span>
        </button>
      </nav>

      {/* MOBILE MORE MENU DRAWER */}
      {mobileMoreOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-[#151517] border-t border-[rgba(241,238,230,0.15)] p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(241,238,230,0.1)]">
              <span className="font-mono text-xs uppercase tracking-wider text-[#C9A24D]">
                More Management Tools
              </span>
              <button
                onClick={() => setMobileMoreOpen(false)}
                className="p-2 text-[#8A877F] hover:text-[#F1EEE6]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleNavigateTab('services')}
                className="p-3 bg-[#0B0B0C] border border-[rgba(241,238,230,0.1)] text-left flex items-center justify-between text-xs font-mono text-[#F1EEE6] min-h-[44px]"
              >
                <span>Services</span>
                <Layers size={14} className="text-[#C9A24D]" />
              </button>

              <button
                type="button"
                onClick={() => handleNavigateTab('about')}
                className="p-3 bg-[#0B0B0C] border border-[rgba(241,238,230,0.1)] text-left flex items-center justify-between text-xs font-mono text-[#F1EEE6] min-h-[44px]"
              >
                <span>About & Bio</span>
                <User size={14} className="text-[#C9A24D]" />
              </button>

              <button
                type="button"
                onClick={() => handleNavigateTab('categories')}
                className="p-3 bg-[#0B0B0C] border border-[rgba(241,238,230,0.1)] text-left flex items-center justify-between text-xs font-mono text-[#F1EEE6] min-h-[44px]"
              >
                <span>Categories</span>
                <Tag size={14} className="text-[#C9A24D]" />
              </button>

              <button
                type="button"
                onClick={() => handleNavigateTab('social')}
                className="p-3 bg-[#0B0B0C] border border-[rgba(241,238,230,0.1)] text-left flex items-center justify-between text-xs font-mono text-[#F1EEE6] min-h-[44px]"
              >
                <span>Social Links</span>
                <Share2 size={14} className="text-[#C9A24D]" />
              </button>

              <button
                type="button"
                onClick={() => handleNavigateTab('settings')}
                className="p-3 bg-[#0B0B0C] border border-[rgba(241,238,230,0.1)] text-left flex items-center justify-between text-xs font-mono text-[#F1EEE6] min-h-[44px]"
              >
                <span>Site Settings</span>
                <Settings size={14} className="text-[#C9A24D]" />
              </button>

              <button
                type="button"
                onClick={() => handleNavigateTab('seo')}
                className="p-3 bg-[#0B0B0C] border border-[rgba(241,238,230,0.1)] text-left flex items-center justify-between text-xs font-mono text-[#F1EEE6] min-h-[44px]"
              >
                <span>SEO & Sharing</span>
                <Globe size={14} className="text-[#C9A24D]" />
              </button>
            </div>

            <div className="pt-2 border-t border-[rgba(241,238,230,0.1)] flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#8A877F] truncate">
                {user.email}
              </span>
              <button
                type="button"
                onClick={signOut}
                className="text-xs font-mono text-red-400 p-2 flex items-center gap-1 min-h-[44px]"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
