/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Admin Overview (Section 1)
 * Metrics, published vs draft breakdown by type, unread message alerts,
 * quick actions, and setup gap checklist.
 */

import React from 'react';
import { SiteSettings, WorkItem, ContactMessage, SocialLinkItem } from '../../types';
import { Button } from '../../components/ui/Button';
import {
  Film,
  Image,
  FileText,
  Cpu,
  Mail,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Plus,
  Clock,
} from 'lucide-react';
import { formatDate } from '../../lib/format';

interface AdminOverviewProps {
  settings: SiteSettings;
  works: WorkItem[];
  messages: ContactMessage[];
  socialLinks: SocialLinkItem[];
  onNavigateTab: (tab: string, subAction?: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  settings,
  works,
  messages,
  socialLinks,
  onNavigateTab,
}) => {
  const unreadMessagesCount = messages.filter((m) => !m.read && !m.archived).length;

  const countsByType = {
    video: {
      published: works.filter((w) => w.type === 'video' && w.published).length,
      draft: works.filter((w) => w.type === 'video' && !w.published).length,
    },
    image: {
      published: works.filter((w) => w.type === 'image' && w.published).length,
      draft: works.filter((w) => w.type === 'image' && !w.published).length,
    },
    writing: {
      published: works.filter((w) => w.type === 'writing' && w.published).length,
      draft: works.filter((w) => w.type === 'writing' && !w.published).length,
    },
    automation: {
      published: works.filter((w) => w.type === 'automation' && w.published).length,
      draft: works.filter((w) => w.type === 'automation' && !w.published).length,
    },
  };

  // Setup gaps checklist
  const setupGaps = [
    {
      title: 'Hero Portrait Frame',
      done: Boolean(settings.heroImageUrl && settings.heroImageUrl.trim().length > 0),
      actionTab: 'settings',
      hint: 'Add a 4:5 portrait frame for the homepage hero.',
    },
    {
      title: 'About Body Narrative',
      done: Boolean(settings.aboutBody && settings.aboutBody.trim().length > 30),
      actionTab: 'about',
      hint: 'Compose the background story in Markdown.',
    },
    {
      title: 'Social Channel Links',
      done: socialLinks.some((l) => l.published && l.url && l.url.trim().length > 0),
      actionTab: 'social',
      hint: 'Link at least one public profile (YouTube, TikTok, Instagram, LinkedIn).',
    },
    {
      title: 'OpenGraph SEO Banner',
      done: Boolean(settings.seoImageUrl && settings.seoImageUrl.trim().length > 0),
      actionTab: 'seo',
      hint: 'Upload a 1200x630 share card for social link previews.',
    },
  ];

  return (
    <div className="space-y-10">
      {/* Top Banner Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[#151517] border border-[rgba(241,238,230,0.1)]">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#C9A24D] block mb-1">
            Site Control Deck
          </span>
          <h2 className="font-sans font-bold text-xl text-[#F1EEE6]">
            Welcome back, {settings.ownerName}
          </h2>
          <p className="text-xs text-[#8A877F] mt-1 font-mono flex items-center gap-1.5">
            <Clock size={13} />
            Last updated:{' '}
            {settings.updatedAt ? formatDate(settings.updatedAt) : 'Recently'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] text-xs font-mono uppercase tracking-wider text-[#F1EEE6] hover:text-[#C9A24D] hover:border-[#C9A24D] transition-colors"
          >
            <span>Live Site</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Quick Work Creation Actions */}
      <div>
        <span className="font-mono text-xs uppercase tracking-wider text-[#8A877F] block mb-4">
          Quick Production Actions
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={() => onNavigateTab('works', 'new-video')}
            className="p-4 bg-[#151517] border border-[rgba(241,238,230,0.1)] hover:border-[#C9A24D] text-left transition-colors group flex flex-col justify-between h-28"
          >
            <div className="flex justify-between items-center text-[#8A877F] group-hover:text-[#C9A24D]">
              <Film size={20} />
              <Plus size={16} />
            </div>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#F1EEE6]">
              New Video
            </span>
          </button>

          <button
            onClick={() => onNavigateTab('works', 'new-image')}
            className="p-4 bg-[#151517] border border-[rgba(241,238,230,0.1)] hover:border-[#C9A24D] text-left transition-colors group flex flex-col justify-between h-28"
          >
            <div className="flex justify-between items-center text-[#8A877F] group-hover:text-[#C9A24D]">
              <Image size={20} />
              <Plus size={16} />
            </div>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#F1EEE6]">
              New Image
            </span>
          </button>

          <button
            onClick={() => onNavigateTab('works', 'new-writing')}
            className="p-4 bg-[#151517] border border-[rgba(241,238,230,0.1)] hover:border-[#C9A24D] text-left transition-colors group flex flex-col justify-between h-28"
          >
            <div className="flex justify-between items-center text-[#8A877F] group-hover:text-[#C9A24D]">
              <FileText size={20} />
              <Plus size={16} />
            </div>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#F1EEE6]">
              New Script / Story
            </span>
          </button>

          <button
            onClick={() => onNavigateTab('works', 'new-automation')}
            className="p-4 bg-[#151517] border border-[rgba(241,238,230,0.1)] hover:border-[#C9A24D] text-left transition-colors group flex flex-col justify-between h-28"
          >
            <div className="flex justify-between items-center text-[#8A877F] group-hover:text-[#C9A24D]">
              <Cpu size={20} />
              <Plus size={16} />
            </div>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#F1EEE6]">
              New Automation
            </span>
          </button>
        </div>
      </div>

      {/* Production Metrics Breakdown */}
      <div>
        <span className="font-mono text-xs uppercase tracking-wider text-[#8A877F] block mb-4">
          Published vs Draft Inventory
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Videos */}
          <div className="bg-[#151517] border border-[rgba(241,238,230,0.1)] p-5 space-y-3">
            <div className="flex items-center justify-between text-[#8A877F]">
              <span className="font-mono text-xs uppercase tracking-wider">AI Videos</span>
              <Film size={16} className="text-[#C9A24D]" />
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold font-sans text-[#F1EEE6]">
                {countsByType.video.published}
              </span>
              <span className="font-mono text-xs text-emerald-400">Live</span>
              <span className="text-xs font-mono text-[#8A877F]">
                ({countsByType.video.draft} draft)
              </span>
            </div>
          </div>

          {/* Images */}
          <div className="bg-[#151517] border border-[rgba(241,238,230,0.1)] p-5 space-y-3">
            <div className="flex items-center justify-between text-[#8A877F]">
              <span className="font-mono text-xs uppercase tracking-wider">AI Images</span>
              <Image size={16} className="text-[#C9A24D]" />
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold font-sans text-[#F1EEE6]">
                {countsByType.image.published}
              </span>
              <span className="font-mono text-xs text-emerald-400">Live</span>
              <span className="text-xs font-mono text-[#8A877F]">
                ({countsByType.image.draft} draft)
              </span>
            </div>
          </div>

          {/* Writing */}
          <div className="bg-[#151517] border border-[rgba(241,238,230,0.1)] p-5 space-y-3">
            <div className="flex items-center justify-between text-[#8A877F]">
              <span className="font-mono text-xs uppercase tracking-wider">Scripts & Prose</span>
              <FileText size={16} className="text-[#C9A24D]" />
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold font-sans text-[#F1EEE6]">
                {countsByType.writing.published}
              </span>
              <span className="font-mono text-xs text-emerald-400">Live</span>
              <span className="text-xs font-mono text-[#8A877F]">
                ({countsByType.writing.draft} draft)
              </span>
            </div>
          </div>

          {/* Automations */}
          <div className="bg-[#151517] border border-[rgba(241,238,230,0.1)] p-5 space-y-3">
            <div className="flex items-center justify-between text-[#8A877F]">
              <span className="font-mono text-xs uppercase tracking-wider">AI Automations</span>
              <Cpu size={16} className="text-[#C9A24D]" />
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold font-sans text-[#F1EEE6]">
                {countsByType.automation.published}
              </span>
              <span className="font-mono text-xs text-emerald-400">Live</span>
              <span className="text-xs font-mono text-[#8A877F]">
                ({countsByType.automation.draft} draft)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Inbox Alert & Setup Gaps Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inbox Inquiries Card */}
        <div className="bg-[#151517] border border-[rgba(241,238,230,0.1)] p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-[#C9A24D]">
                Client Inquiries
              </span>
              <Mail size={18} className="text-[#8A877F]" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold font-sans text-[#F1EEE6]">
                {unreadMessagesCount}
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-[#8A877F]">
                Unread Messages
              </span>
            </div>
            <p className="text-xs text-[#8A877F] leading-relaxed">
              Inbound project briefs transmitted through the public contact terminal.
            </p>
          </div>

          <div className="pt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('inbox')}
            >
              Open Inbox Drawer
            </Button>
          </div>
        </div>

        {/* Setup Gaps Checklist */}
        <div className="bg-[#151517] border border-[rgba(241,238,230,0.1)] p-6 space-y-4">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C9A24D] block">
            Setup Completion Radar
          </span>
          <div className="space-y-3">
            {setupGaps.map((gap, i) => (
              <div
                key={i}
                className="flex items-start justify-between p-3 bg-[#0B0B0C] border border-[rgba(241,238,230,0.06)]"
              >
                <div className="flex items-start gap-3">
                  {gap.done ? (
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={16} className="text-[#C9A24D] shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span
                      className={`font-sans text-xs font-semibold ${
                        gap.done ? 'text-[#F1EEE6]' : 'text-[#C9A24D]'
                      }`}
                    >
                      {gap.title}
                    </span>
                    <p className="text-[11px] text-[#8A877F] mt-0.5">{gap.hint}</p>
                  </div>
                </div>

                {!gap.done && (
                  <button
                    onClick={() => onNavigateTab(gap.actionTab)}
                    className="font-mono text-[10px] uppercase tracking-wider text-[#C9A24D] hover:underline shrink-0 ml-2"
                  >
                    Configure
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
