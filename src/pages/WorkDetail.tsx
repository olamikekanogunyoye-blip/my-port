/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Work Detail Page (/work/:slug)
 * Editorial reading & case-study view.
 * Features:
 * - Reading progress bar at top of viewport
 * - Large Instrument Serif title
 * - 68ch measure for comfortable typography
 * - Markdown rendering
 * - "Back to work" link
 * - Share / Copy-Link button with feedback
 * - Download .txt button ONLY when allowDownload === true
 * - Automation case study Problem -> Solution -> Result breakdown
 * - Audio tracks (Voiceover, Soundtrack)
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWorks } from '../hooks/useWorks';
import { useSettings } from '../hooks/useSettings';
import { KeyLogo } from '../components/ui/KeyLogo';
import { Button } from '../components/ui/Button';
import { MarkdownRenderer } from '../lib/markdown';
import { useToast } from '../components/ui/Toast';
import { formatDate } from '../lib/format';
import { buildWhatsAppLink } from '../lib/contact';
import { WhatsAppSolidIcon } from '../components/ui/WhatsAppIcon';
import { SocialLinksCluster } from '../components/ui/SocialLinksCluster';
import {
  ArrowLeft,
  Share2,
  Download,
  Calendar,
  Clock,
  Wrench,
  ExternalLink,
  Mic,
  Music,
  ArrowUpRight,
} from 'lucide-react';

export default function WorkDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { works, loading } = useWorks();
  const { settings } = useSettings();
  const { showToast } = useToast();

  const [readingProgress, setReadingProgress] = useState(0);

  const work = works.find((w) => w.slug === slug);

  // Track scroll progress for reading view
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        setReadingProgress((totalScroll / windowHeight) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Set document title
  useEffect(() => {
    if (work) {
      document.title = `${work.title} — KEY OF DAVID`;
    }
  }, [work]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied to clipboard.', 'success');
  };

  const handleDownloadTxt = () => {
    if (!work || !work.allowDownload) return;
    const textContent = `${work.title}\n\n${work.description || ''}\n\n${work.content || ''}`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${work.slug || 'work'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Document downloaded.', 'info');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] text-[#F1EEE6] flex items-center justify-center font-mono text-xs uppercase tracking-widest text-[#8A877F]">
        Loading Narrative...
      </div>
    );
  }

  if (!work) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] text-[#F1EEE6] flex flex-col justify-between p-6 sm:p-12">
        <header>
          <Link to="/">
            <KeyLogo size="md" />
          </Link>
        </header>
        <div className="my-auto max-w-xl py-12">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#C9A24D] mb-3">
            Item Notice
          </p>
          <h1 className="font-h2 font-bold mb-4">Work Not Found</h1>
          <p className="text-sm text-[#8A877F] mb-6">
            The requested portfolio piece does not exist or has not been published yet.
          </p>
          <Button variant="outline" size="md" href="/#portfolio" icon={<ArrowLeft size={16} />} iconPosition="left">
            Back to Portfolio
          </Button>
        </div>
        <footer className="border-t border-[rgba(241,238,230,0.08)] pt-4 font-mono text-[11px] text-[#8A877F]">
          KEY OF DAVID
        </footer>
      </div>
    );
  }

  const readingTime = work.content
    ? `${Math.ceil(work.content.trim().split(/\s+/).length / 200)} min read`
    : '2 min read';

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F1EEE6] pb-32">
      {/* Reading Progress Line */}
      <div
        className="fixed top-0 left-0 right-0 h-[2px] z-[100] pointer-events-none bg-transparent"
        aria-hidden="true"
      >
        <div
          className="h-full bg-[#C9A24D] shadow-[0_0_8px_rgba(201,162,77,0.7)]"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0B0B0C]/90 backdrop-blur-md border-b border-[rgba(241,238,230,0.1)] px-6 sm:px-12 py-4 flex items-center justify-between">
        <Link to="/" aria-label="Home">
          <KeyLogo size="md" />
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <SocialLinksCluster variant="dock" iconSize={15.5} className="hidden sm:inline-flex" />
          <Link
            to="/#portfolio"
            className="font-mono text-xs uppercase tracking-widest text-[#8A877F] hover:text-[#C9A24D] flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Work
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1440px] mx-auto px-6 sm:px-12 pt-12 sm:pt-20">
        <article className="max-w-[68ch] mx-auto space-y-10">
          {/* Metadata Top Bar */}
          <div className="border-b border-[rgba(241,238,230,0.12)] pb-8 space-y-4">
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#8A877F] uppercase tracking-wider">
              <span className="text-[#C9A24D] font-semibold">{work.type}</span>
              {work.writingKind && (
                <>
                  <span>•</span>
                  <span>{work.writingKind.replace('-', ' ')}</span>
                </>
              )}
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} /> {formatDate(work.createdAt)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} /> {readingTime}
              </span>
            </div>

            {/* Giant Instrument Serif Title */}
            <h1 className="font-serif-accent text-4xl sm:text-6xl lg:text-7xl text-[#F1EEE6] leading-[1.05] tracking-tight">
              {work.title}
            </h1>

            {work.description && (
              <p className="text-lg sm:text-xl text-[#8A877F] leading-relaxed pt-2">
                {work.description}
              </p>
            )}

            {/* Actions Bar: Share & Optional Download */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#151517] border border-[rgba(241,238,230,0.15)] text-xs font-mono uppercase tracking-wider text-[#F1EEE6] hover:text-[#C9A24D] hover:border-[#C9A24D] transition-colors"
              >
                <Share2 size={13} />
                <span>Share Link</span>
              </button>

              {work.allowDownload && (
                <button
                  onClick={handleDownloadTxt}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#151517] border border-[rgba(241,238,230,0.15)] text-xs font-mono uppercase tracking-wider text-[#C9A24D] hover:bg-[#C9A24D] hover:text-[#0B0B0C] transition-colors"
                >
                  <Download size={13} />
                  <span>Download .txt</span>
                </button>
              )}

              {/* Compact Discuss on WhatsApp Link */}
              {settings.whatsappNumber && (
                <a
                  href={buildWhatsAppLink(
                    settings.whatsappNumber,
                    `Hello KEY OF DAVID, I saw "${work.title}" on your portfolio and I'd like to work with you.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#25D366]/10 border border-[#25D366]/40 text-xs font-mono uppercase tracking-wider text-[#25D366] hover:bg-[#25D366] hover:text-[#0B0B0C] transition-all"
                >
                  <WhatsAppSolidIcon size={14} />
                  <span>Discuss this project on WhatsApp</span>
                  <ArrowUpRight size={13} />
                </a>
              )}
            </div>
          </div>

          {/* Media Header (If thumbnail or banner exists) */}
          {work.thumbnailUrl && (
            <div className="relative aspect-[16/9] bg-[#151517] border border-[rgba(241,238,230,0.12)] overflow-hidden shadow-2xl">
              <img
                src={work.thumbnailUrl}
                alt={work.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Automation Case Study Mini-Layout */}
          {work.type === 'automation' && (work.problem || work.solution || work.result) && (
            <div className="p-6 sm:p-8 bg-[#151517] border border-[rgba(241,238,230,0.12)] space-y-6">
              <span className="font-mono text-xs uppercase tracking-widest text-[#C9A24D] block">
                Executive Case Study Breakdown
              </span>
              <div className="grid grid-cols-1 gap-4 font-mono text-sm">
                {work.problem && (
                  <div className="p-4 bg-[#0B0B0C] border border-[rgba(241,238,230,0.06)]">
                    <span className="text-red-400 font-semibold uppercase text-xs tracking-wider block mb-1">
                      01 / Problem Statement
                    </span>
                    <p className="text-[#8A877F] leading-relaxed">{work.problem}</p>
                  </div>
                )}
                {work.solution && (
                  <div className="p-4 bg-[#0B0B0C] border border-[rgba(241,238,230,0.06)]">
                    <span className="text-[#C9A24D] font-semibold uppercase text-xs tracking-wider block mb-1">
                      02 / Applied Architecture & Solution
                    </span>
                    <p className="text-[#8A877F] leading-relaxed">{work.solution}</p>
                  </div>
                )}
                {work.result && (
                  <div className="p-4 bg-[#0B0B0C] border border-[rgba(241,238,230,0.06)]">
                    <span className="text-emerald-400 font-semibold uppercase text-xs tracking-wider block mb-1">
                      03 / Measured Result & Impact
                    </span>
                    <p className="text-[#8A877F] leading-relaxed">{work.result}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Optional Audio Tracks */}
          {(work.voiceUrl || work.musicUrl) && (
            <div className="p-6 bg-[#151517] border border-[rgba(241,238,230,0.1)] space-y-4">
              <span className="font-mono text-xs uppercase tracking-widest text-[#C9A24D] block">
                Production Audio Tracks
              </span>
              {work.voiceUrl && (
                <div className="space-y-1">
                  <span className="font-mono text-xs text-[#8A877F] flex items-center gap-1.5">
                    <Mic size={14} className="text-[#C9A24D]" /> Voiceover
                  </span>
                  <audio controls src={work.voiceUrl} className="w-full h-8" />
                </div>
              )}
              {work.musicUrl && (
                <div className="space-y-1">
                  <span className="font-mono text-xs text-[#8A877F] flex items-center gap-1.5">
                    <Music size={14} className="text-[#C9A24D]" /> Soundtrack
                  </span>
                  <audio controls src={work.musicUrl} className="w-full h-8" />
                </div>
              )}
            </div>
          )}

          {/* Main Prose / Markdown Content (68ch measure) */}
          {work.content && (
            <div className="pt-4 text-base sm:text-lg text-[#F1EEE6] leading-[1.8]">
              <MarkdownRenderer content={work.content} />
            </div>
          )}

          {/* Stack & Tools */}
          {work.tools && work.tools.length > 0 && (
            <div className="pt-10 border-t border-[rgba(241,238,230,0.12)]">
              <h2 className="font-mono text-xs uppercase tracking-widest text-[#8A877F] mb-4 flex items-center gap-2">
                <Wrench size={14} /> Technology & Tooling
              </h2>
              <div className="flex flex-wrap gap-2">
                {work.tools.map((tool) => (
                  <span
                    key={tool}
                    className="px-3 py-1.5 bg-[#151517] border border-[rgba(241,238,230,0.1)] text-xs font-mono text-[#F1EEE6]"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* External Project Link */}
          {work.externalUrl && (
            <div className="pt-6">
              <Button
                variant="primary"
                size="md"
                href={work.externalUrl}
                target="_blank"
                icon={<ExternalLink size={16} />}
              >
                Launch External Resource
              </Button>
            </div>
          )}

          {/* Bottom Back Navigation & Social Links */}
          <div className="pt-16 border-t border-[rgba(241,238,230,0.12)] flex flex-col sm:flex-row justify-between items-center gap-6">
            <Link
              to="/#portfolio"
              className="font-mono text-xs uppercase tracking-widest text-[#C9A24D] hover:underline flex items-center gap-2"
            >
              <ArrowLeft size={14} /> Back to Selected Work
            </Link>
            <SocialLinksCluster variant="inline" iconSize={15.5} />
          </div>
        </article>
      </main>
    </div>
  );
}
