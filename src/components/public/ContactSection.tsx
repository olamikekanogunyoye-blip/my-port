/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Contact & Inquiries Section (#contact)
 * Chapter 06 · INITIATE PRODUCTION & CONTACT
 * - Refined, distinctive executive studio layout
 * - Dark luxury concierge card with WhatsApp & Hotline integration
 * - Interactive Project Scope Selector & streamlined inquiry brief
 * - Reduced micro-scale social media icons (12px) for an uncluttered, high-end aesthetic
 * - Honeypot bot protection, client validation, and 30s rate limiting
 */

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { SiteSettings, SocialLinkItem } from '../../types';
import { Button } from '../ui/Button';
import { Reveal } from '../ui/Reveal';
import { useToast } from '../ui/Toast';
import { submitContactMessage, submitLead } from '../../lib/db';
import {
  buildWhatsAppLink,
  buildTelLink,
  formatPhoneDisplay,
} from '../../lib/contact';
import { WhatsAppSolidIcon } from '../ui/WhatsAppIcon';
import { SocialLinksCluster } from '../ui/SocialLinksCluster';
import { logAnalyticsEvent } from '../../lib/firebase';
import {
  Mail,
  MapPin,
  Phone,
  Send,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  ArrowUpRight,
  QrCode,
  Sparkles,
  Clock,
  Check,
} from 'lucide-react';

interface ContactSectionProps {
  settings: SiteSettings;
  socialLinks?: SocialLinkItem[];
}

const PROJECT_SCOPES = [
  { id: 'commercial-film', label: 'Commercial Film & AI Video', subject: 'Commercial Film Production Inquiry' },
  { id: 'visual-campaign', label: 'AI Visuals & Worldbuilding', subject: 'AI Imagery & Visual Campaign Inquiry' },
  { id: 'cinematic-script', label: 'Cinematic Scriptwriting', subject: 'Scriptwriting & Narrative Inquiry' },
  { id: 'ai-automation', label: 'AI Automation & Agents', subject: 'Business AI Automation & Agents Inquiry' },
  { id: 'creative-retainer', label: 'Creative Retainer / Other', subject: 'General Creative Direction Inquiry' },
];

const TIMELINE_OPTIONS = [
  'Urgent (< 2 weeks)',
  'Standard (2–4 weeks)',
  'Flexible / In Planning',
];

export const ContactSection: React.FC<ContactSectionProps> = ({
  settings,
  socialLinks = [],
}) => {
  const { showToast } = useToast();

  const [selectedScope, setSelectedScope] = useState<string>(PROJECT_SCOPES[0].id);
  const [selectedTimeline, setSelectedTimeline] = useState<string>(TIMELINE_OPTIONS[1]);

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: PROJECT_SCOPES[0].subject,
    message: '',
    honeypot: '', // invisible bot trap
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Handle selecting a project scope pill
  const handleScopeSelect = (scope: typeof PROJECT_SCOPES[0]) => {
    setSelectedScope(scope.id);
    setFormState((prev) => ({
      ...prev,
      subject: scope.subject,
    }));
    logAnalyticsEvent('select_content', {
      content_type: 'project_scope',
      item_id: scope.id,
    });
  };

  // Generate QR Code for WhatsApp link on desktop
  useEffect(() => {
    if (settings.whatsappNumber) {
      try {
        const waUrl = buildWhatsAppLink(
          settings.whatsappNumber,
          settings.whatsappMessage || "Hello KEY OF DAVID, I found your portfolio and I'd like to work with you."
        );
        QRCode.toDataURL(waUrl, {
          width: 140,
          margin: 1,
          color: {
            dark: '#0B0B0C',
            light: '#F1EEE6',
          },
        })
          .then((url) => setQrCodeDataUrl(url))
          .catch((err) => console.warn('QR Code generation error:', err));
      } catch (err) {
        console.warn('QR Code error:', err);
      }
    }
  }, [settings.whatsappNumber, settings.whatsappMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Bot trap check
    if (formState.honeypot.trim().length > 0) {
      setIsSuccess(true);
      return;
    }

    // Rate Limiting: 1 submission per 30 seconds
    const lastSubmitTime = localStorage.getItem('kod_last_contact_submit');
    const now = Date.now();
    if (lastSubmitTime && now - parseInt(lastSubmitTime, 10) < 30000) {
      const waitSeconds = Math.ceil((30000 - (now - parseInt(lastSubmitTime, 10))) / 1000);
      const msg = `Please wait ${waitSeconds}s before transmitting another message.`;
      setErrorMessage(msg);
      showToast(msg, 'error');
      return;
    }

    // Input Validation
    const name = formState.name.trim();
    const email = formState.email.trim();
    const subject = formState.subject.trim() || 'Portfolio Inquiry';
    const message = formState.message.trim();

    if (!name || name.length > 100) {
      setErrorMessage('Please provide your name (up to 100 characters).');
      return;
    }
    if (!email || email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (subject.length > 200) {
      setErrorMessage('Subject must not exceed 200 characters.');
      return;
    }
    if (!message || message.length > 5000) {
      setErrorMessage('Please provide a project brief (up to 5,000 characters).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const fullMessage = `[Timeline: ${selectedTimeline}]\n\n${message}`;

      await submitLead({
        fullName: name,
        name,
        email,
        serviceInterest: subject,
        subject,
        message: fullMessage,
        status: 'new',
        source: 'key-of-david-portfolio',
        timeline: selectedTimeline,
      });

      localStorage.setItem('kod_last_contact_submit', Date.now().toString());
      setIsSuccess(true);
      setErrorMessage(null);

      // Trigger custom lead_form_submitted Firebase Analytics event
      logAnalyticsEvent('lead_form_submitted', {
        fullName: name,
        email,
        serviceInterest: subject,
        scope: selectedScope,
        timeline: selectedTimeline,
        source: 'key-of-david-portfolio',
      });

      // Also track GA4 standard lead generation event
      logAnalyticsEvent('generate_lead', {
        form_name: 'contact_section',
        scope: selectedScope,
        timeline: selectedTimeline,
      });

      setFormState({
        name: '',
        email: '',
        subject: PROJECT_SCOPES[0].subject,
        message: '',
        honeypot: '',
      });
      showToast('Project brief received. I will review and be in touch promptly.', 'success');
    } catch (err: any) {
      const msg = err?.message || 'Failed to transmit message. Please contact directly via email or WhatsApp.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
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
    <section
      id="contact"
      className="relative py-28 sm:py-36 px-5 sm:px-10 lg:px-16 border-t border-[rgba(241,238,230,0.1)] bg-[#0B0B0C] overflow-hidden"
      aria-labelledby="contact-chapter-title"
    >
      {/* Subtle Ambient Glow behind contact */}
      <div
        className="absolute top-1/3 right-1/4 w-[700px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(201,162,77,0.03)_0%,transparent_70%)] rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-[1440px] mx-auto relative z-10">
        {/* Chapter Header */}
        <Reveal direction="up">
          <div className="flex items-center justify-between mb-16 pb-4 border-b border-[rgba(241,238,230,0.1)]">
            <span
              id="contact-chapter-title"
              className="font-mono text-xs uppercase tracking-[0.25em] text-[#C9A24D]"
            >
              05 · INITIATE PRODUCTION & CONTACT
            </span>
            <span className="font-mono text-xs text-[#8A877F] uppercase tracking-wider">
              Commissions · Collaborations · Retainers
            </span>
          </div>
        </Reveal>

        {/* Section Headline */}
        <Reveal delay={0.1} direction="up">
          <div className="mb-16 max-w-4xl">
            <h2 className="font-display uppercase tracking-tight text-[#F1EEE6] text-3xl sm:text-5xl lg:text-7xl font-bold leading-[1.05]">
              Let's make something{' '}
              <span className="font-serif-accent text-[#C9A24D] lowercase">unforgettable.</span>
            </h2>
            <p className="text-base sm:text-lg text-[#8A877F] leading-relaxed mt-4 max-w-2xl">
              Available for select commercial direction, generative visual campaigns, retaining film scripts, and bespoke AI automation infrastructure.
            </p>
          </div>
        </Reveal>

        {/* 12-Column Asymmetric Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* LEFT 5 Columns: Direct Executive Channels */}
          <div className="lg:col-span-5 space-y-5">
            {/* 1. Architectural WhatsApp Concierge Card */}
            {settings.whatsappNumber && (
              <Reveal delay={0.15} direction="up">
                <div className="relative p-6 sm:p-7 rounded-none bg-[#121215] border border-[#C9A24D]/30 hover:border-[#C9A24D] transition-all duration-300 shadow-xl group">
                  {/* Subtle Top Status Beacon */}
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#C9A24D] font-medium">
                        Direct Channel · Active
                      </span>
                    </div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#8A877F]">
                      Fastest Response
                    </span>
                  </div>

                  <div className="space-y-1 mb-5">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#8A877F] block">
                      Direct WhatsApp Line
                    </span>
                    <span className="font-mono text-lg sm:text-xl font-bold text-[#F1EEE6] tracking-wider block">
                      {formatPhoneDisplay(settings.whatsappNumber)}
                    </span>
                    <p className="text-xs text-[#8A877F] leading-relaxed pt-1">
                      Direct chat with Olamilekan for urgent commercial specs, project timelines, and rates.
                    </p>
                  </div>

                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      logAnalyticsEvent('contact_channel_click', {
                        channel: 'whatsapp',
                        location: 'contact_section',
                      });
                    }}
                    className="inline-flex items-center justify-between w-full px-5 py-3 rounded-none bg-[#C9A24D] text-[#0B0B0C] font-semibold text-xs font-mono uppercase tracking-wider hover:bg-[#E3B95F] transition-all group-hover:shadow-[0_8px_20px_rgba(201,162,77,0.25)]"
                  >
                    <span className="flex items-center gap-2">
                      <WhatsAppSolidIcon size={16} />
                      <span>Chat on WhatsApp</span>
                    </span>
                    <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              </Reveal>
            )}

            {/* 2. Hotline Card */}
            {settings.hotline && (
              <Reveal delay={0.2} direction="up">
                <a
                  href={hotlineHref}
                  onClick={() => {
                    logAnalyticsEvent('contact_channel_click', {
                      channel: 'hotline',
                      location: 'contact_section',
                    });
                  }}
                  className="group block p-5 bg-[#121215]/80 border border-white/[0.08] hover:border-[#C9A24D]/50 hover:bg-[#16161a] transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-full bg-[#0B0B0C] border border-white/10 flex items-center justify-center text-[#C9A24D] shrink-0">
                        <Phone size={14} />
                      </div>
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[#8A877F] block">
                          Voice Inquiries / Hotline
                        </span>
                        <span className="font-mono text-sm sm:text-base font-semibold text-[#F1EEE6] tracking-wider group-hover:text-[#C9A24D] transition-colors">
                          {formatPhoneDisplay(settings.hotline)}
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight
                      size={15}
                      className="text-[#8A877F] group-hover:text-[#C9A24D] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0"
                    />
                  </div>
                </a>
              </Reveal>
            )}

            {/* 3. Direct Email & Operating Base */}
            <Reveal delay={0.25} direction="up">
              <div className="p-5 bg-[#121215]/60 border border-white/[0.08] space-y-3.5">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#0B0B0C] border border-white/10 flex items-center justify-center text-[#C9A24D] shrink-0 mt-0.5">
                    <Mail size={13} />
                  </div>
                  <div className="min-w-0">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#8A877F] block">
                      Direct Email (24h SLA)
                    </span>
                    <a
                      href={`mailto:${settings.email}`}
                      onClick={() => {
                        logAnalyticsEvent('contact_channel_click', {
                          channel: 'email',
                          location: 'contact_section',
                        });
                      }}
                      className="font-sans font-medium text-sm sm:text-base text-[#F1EEE6] hover:text-[#C9A24D] transition-colors truncate block"
                    >
                      {settings.email}
                    </a>
                  </div>
                </div>

                {settings.location && settings.location.trim().length > 0 && (
                  <div className="flex items-start gap-3.5 pt-2.5 border-t border-white/[0.06]">
                    <div className="w-8 h-8 rounded-full bg-[#0B0B0C] border border-white/10 flex items-center justify-center text-[#C9A24D] shrink-0 mt-0.5">
                      <MapPin size={13} />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#8A877F] block">
                        Production Studio Base
                      </span>
                      <span className="font-mono text-xs text-[#F1EEE6]">
                        {settings.location}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Reveal>

            {/* 4. Desktop Mobile QR Code */}
            {settings.whatsappNumber && qrCodeDataUrl && (
              <Reveal delay={0.3} direction="up">
                <div className="hidden lg:flex items-center gap-4 p-4 bg-[#121215]/60 border border-white/[0.08]">
                  <div className="p-2 bg-[#F1EEE6] rounded-sm shrink-0 shadow-sm">
                    <img
                      src={qrCodeDataUrl}
                      alt="WhatsApp QR Code"
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-[#C9A24D] mb-1">
                      <QrCode size={12} />
                      <span className="font-mono text-[10px] uppercase tracking-widest font-semibold">
                        Instant Mobile Connect
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8A877F] leading-relaxed">
                      Scan with your smartphone camera to launch a direct WhatsApp discussion.
                    </p>
                  </div>
                </div>
              </Reveal>
            )}

            {/* 5. Production Status */}
            {settings.availabilityText && (
              <Reveal delay={0.35} direction="up">
                <div className="p-3.5 bg-[#121215]/40 border border-white/[0.08] flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#F1EEE6]/90">
                    {settings.availabilityText}
                  </span>
                </div>
              </Reveal>
            )}

            {/* 6. Refined Micro-Scale Social Links Dock */}
            <Reveal delay={0.4} direction="up">
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#8A877F]">
                    Official Distribution
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#8A877F]/60">
                    4 Channels
                  </span>
                </div>
                {/* Micro-sized social cluster (reduced icon size for premium minimal appearance) */}
                <div className="flex items-center">
                  <SocialLinksCluster variant="dock" iconSize={12} />
                </div>
              </div>
            </Reveal>
          </div>

          {/* RIGHT 7 Columns: Bespoke Project Brief & Inquiry Console */}
          <div className="lg:col-span-7 bg-[#121215] border border-white/[0.12] p-7 sm:p-10 shadow-2xl relative">
            {/* Top Console Accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A24D] to-transparent opacity-60" />

            {isSuccess ? (
              <div className="py-16 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-[#C9A24D]/10 border border-[#C9A24D] text-[#C9A24D] flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="font-h2 font-bold text-[#F1EEE6]">
                  Inquiry Transmitted.
                </h3>
                <p className="text-sm sm:text-base text-[#8A877F] max-w-md mx-auto leading-relaxed">
                  Thank you for presenting your project. Olamilekan reviews all incoming briefs directly and will follow up within 24 hours.
                </p>
                <div className="pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSuccess(false)}
                  >
                    Submit Another Brief
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Honeypot hidden input for bots */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formState.honeypot}
                  onChange={(e) => setFormState({ ...formState, honeypot: e.target.value })}
                  className="hidden"
                  aria-hidden="true"
                />

                {errorMessage && (
                  <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs font-mono flex items-center gap-2">
                    <ShieldAlert size={15} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* 1. Project Scope Interactive Selector */}
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#C9A24D] font-medium mb-2.5">
                    01 · Select Project Focus
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PROJECT_SCOPES.map((scope) => {
                      const isSelected = selectedScope === scope.id;
                      return (
                        <button
                          key={scope.id}
                          type="button"
                          onClick={() => handleScopeSelect(scope)}
                          className={`
                            px-3 py-1.5 font-mono text-xs transition-all duration-200 border cursor-pointer
                            ${
                              isSelected
                                ? 'bg-[#C9A24D]/15 border-[#C9A24D] text-[#F1EEE6] shadow-sm font-semibold'
                                : 'bg-white/[0.02] border-white/10 text-[#8A877F] hover:text-[#F1EEE6] hover:border-white/20'
                            }
                          `}
                        >
                          <span className="flex items-center gap-1.5">
                            {isSelected && <Check size={11} className="text-[#C9A24D]" />}
                            <span>{scope.label}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Client Details (Name & Email) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-2"
                    >
                      Your Name / Brand <span className="text-[#C9A24D]">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      maxLength={100}
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      placeholder="e.g. Sarah Jenkins (Acme Media)"
                      className="w-full bg-[#0B0B0C] border border-white/10 focus:border-[#C9A24D] px-4 py-3 text-sm text-[#F1EEE6] placeholder-[#8A877F]/40 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-2"
                    >
                      Email Address <span className="text-[#C9A24D]">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      maxLength={200}
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      placeholder="e.g. sarah@acme.com"
                      className="w-full bg-[#0B0B0C] border border-white/10 focus:border-[#C9A24D] px-4 py-3 text-sm text-[#F1EEE6] placeholder-[#8A877F]/40 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* 3. Timeline Selector */}
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-2">
                    Estimated Timeline
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TIMELINE_OPTIONS.map((time) => {
                      const isSelected = selectedTimeline === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTimeline(time)}
                          className={`
                            px-3 py-1 font-mono text-[11px] transition-colors border
                            ${
                              isSelected
                                ? 'bg-white/10 border-white/30 text-[#F1EEE6]'
                                : 'bg-transparent border-white/10 text-[#8A877F] hover:text-[#F1EEE6]'
                            }
                          `}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Subject */}
                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-2"
                  >
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    maxLength={200}
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    className="w-full bg-[#0B0B0C] border border-white/10 focus:border-[#C9A24D] px-4 py-2.5 text-sm text-[#F1EEE6] focus:outline-none transition-colors"
                  />
                </div>

                {/* 5. Project Brief Message */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-2"
                  >
                    Project Brief & Objectives <span className="text-[#C9A24D]">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    maxLength={5000}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    placeholder="Tell me about your creative brief, aesthetic direction, target audience, or automation bottlenecks..."
                    className="w-full bg-[#0B0B0C] border border-white/10 focus:border-[#C9A24D] px-4 py-3 text-sm text-[#F1EEE6] placeholder-[#8A877F]/40 focus:outline-none transition-colors resize-y min-h-[110px]"
                  />
                  <div className="flex justify-between items-center mt-1 text-[10px] font-mono text-[#8A877F]">
                    <span>Detailed briefs receive prioritized responses</span>
                    <span>{formState.message.length} / 5000</span>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                    icon={isSubmitting ? <Loader2 size={15} className="animate-spin text-[#0B0B0C]" /> : <Send size={15} />}
                  >
                    {isSubmitting ? 'Transmitting Brief...' : 'Transmit Project Brief'}
                  </Button>

                  <div className="flex items-center gap-2 text-xs font-mono text-[#8A877F]">
                    <Clock size={13} className="text-[#C9A24D]" />
                    <span>Direct reply within 24 hours</span>
                  </div>
                </div>
              </form>
            )}

            {/* Direct fallback note */}
            <div className="mt-8 pt-5 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#8A877F]">
              <span>Direct studio email:</span>
              <a
                href={`mailto:${settings.email}`}
                className="text-[#C9A24D] hover:underline"
              >
                {settings.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
