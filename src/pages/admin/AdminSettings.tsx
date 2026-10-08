/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Site Settings Admin (Section 2)
 * Edits ownerName, brandName, title, heroHeadline, heroIntro, ctaPrimaryLabel,
 * ctaSecondaryLabel, availabilityText, email, phone, location, footerText.
 * 
 * Stage 4 Integration additions:
 * - Direct Contact (WhatsApp & Hotline) Card:
 *   - whatsappNumber input with live validation against normalizePhone and preview of formatPhoneDisplay
 *   - whatsappMessage textarea with character count and "Reset to default" button
 *   - hotline input with live validation and preview
 *   - showFloatingWhatsApp toggle switch
 *   - "Test WhatsApp Link" button that opens wa.me link in a new tab
 *   - Inline descriptive error messages for invalid formats
 * 
 * Hero portrait image uploader, replacer, and remover.
 * Live mini-preview of hero text.
 */

import React, { useState, useEffect } from 'react';
import { SiteSettings } from '../../types';
import { updateSiteSettings } from '../../lib/db';
import { uploadFile, deleteFile } from '../../lib/storage';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import {
  Upload,
  Trash2,
  Save,
  Eye,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Phone,
  Check,
  AlertCircle,
  Copy,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import {
  validatePhone,
  formatPhoneDisplay,
  buildWhatsAppLink,
  normalizePhone,
} from '../../lib/contact';
import { WhatsAppSolidIcon } from '../../components/ui/WhatsAppIcon';

interface AdminSettingsProps {
  settings: SiteSettings;
}

const DEFAULT_WA_MESSAGE = "Hello KEY OF DAVID, I found your portfolio and I'd like to work with you.";

export const AdminSettings: React.FC<AdminSettingsProps> = ({ settings }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<SiteSettings>({
    ...settings,
    whatsappNumber: settings.whatsappNumber ?? '2349042725844',
    whatsappMessage: settings.whatsappMessage ?? DEFAULT_WA_MESSAGE,
    hotline: settings.hotline ?? '2349042725844',
    showFloatingWhatsApp: settings.showFloatingWhatsApp !== false,
    heroImageUrl: settings.heroImageUrl || '',
    aboutImageUrl: settings.aboutImageUrl || '',
    aboutHeading: settings.aboutHeading || 'Who I am',
    aboutBody:
      settings.aboutBody ||
      'I make AI videos, AI images, video scripts, storytelling content, blog/content writing, social media content, and AI automations/agents for businesses.',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [confirmDeleteImage, setConfirmDeleteImage] = useState(false);

  const [aboutUploadProgress, setAboutUploadProgress] = useState<number | null>(null);
  const [confirmDeleteAboutImage, setConfirmDeleteAboutImage] = useState(false);

  const [heroUrlInput, setHeroUrlInput] = useState(settings.heroImageUrl || '');
  const [aboutUrlInput, setAboutUrlInput] = useState(settings.aboutImageUrl || '');
  const [isDraggingHero, setIsDraggingHero] = useState(false);
  const [isDraggingAbout, setIsDraggingAbout] = useState(false);

  // Live Phone Validations
  const waValidation = formData.whatsappNumber
    ? validatePhone(formData.whatsappNumber)
    : { valid: true, normalized: '' };

  const hotlineValidation = formData.hotline
    ? validatePhone(formData.hotline)
    : { valid: true, normalized: '' };

  const processHeroFile = async (file: File) => {
    try {
      setUploadProgress(10);
      if (formData.heroImagePath) {
        await deleteFile(formData.heroImagePath);
      }

      const result = await uploadFile(file, 'hero', (progress) => {
        setUploadProgress(progress);
      });

      const updated = {
        ...formData,
        heroImageUrl: result.url,
        heroImagePath: result.path,
      };
      setFormData(updated);
      setHeroUrlInput(result.url);
      await updateSiteSettings(updated);
      setUploadProgress(null);
      showToast('Hero portrait image uploaded and saved successfully!', 'success');
    } catch (err) {
      setUploadProgress(null);
      showToast(err instanceof Error ? err.message : 'Upload failed', 'error');
    }
  };

  const processAboutFile = async (file: File) => {
    try {
      setAboutUploadProgress(10);
      if (formData.aboutImagePath) {
        await deleteFile(formData.aboutImagePath);
      }

      const result = await uploadFile(file, 'about', (progress) => {
        setAboutUploadProgress(progress);
      });

      const updated = {
        ...formData,
        aboutImageUrl: result.url,
        aboutImagePath: result.path,
      };
      setFormData(updated);
      setAboutUrlInput(result.url);
      await updateSiteSettings(updated);
      setAboutUploadProgress(null);
      showToast('About portrait image uploaded and saved successfully!', 'success');
    } catch (err) {
      setAboutUploadProgress(null);
      showToast(err instanceof Error ? err.message : 'Upload failed', 'error');
    }
  };

  // Clipboard paste listener (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            showToast('Pasted image detected! Uploading as Hero Portrait...', 'info');
            processHeroFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validate phone fields before saving if filled
    if (formData.whatsappNumber && !waValidation.valid) {
      showToast(`Invalid WhatsApp Number: ${waValidation.error}`, 'error');
      return;
    }

    if (formData.hotline && !hotlineValidation.valid) {
      showToast(`Invalid Hotline: ${hotlineValidation.error}`, 'error');
      return;
    }

    setIsSaving(true);
    try {
      // Store numbers normalized as pure digits
      const cleanedData: Partial<SiteSettings> = {
        ...formData,
        whatsappNumber: formData.whatsappNumber ? normalizePhone(formData.whatsappNumber) : '',
        hotline: formData.hotline ? normalizePhone(formData.hotline) : '',
      };

      await updateSiteSettings(cleanedData);
      showToast('Site settings updated successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestWhatsApp = () => {
    if (!formData.whatsappNumber) {
      showToast('Please enter a WhatsApp number first.', 'error');
      return;
    }
    if (!waValidation.valid) {
      showToast(waValidation.error || 'Invalid WhatsApp number format.', 'error');
      return;
    }

    try {
      const link = buildWhatsAppLink(
        formData.whatsappNumber,
        formData.whatsappMessage || DEFAULT_WA_MESSAGE
      );
      window.open(link, '_blank', 'noopener,noreferrer');
      showToast('Opened test WhatsApp chat in a new tab.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Cannot build WhatsApp link', 'error');
    }
  };

  const handleResetMessage = () => {
    setFormData((prev) => ({ ...prev, whatsappMessage: DEFAULT_WA_MESSAGE }));
    showToast('WhatsApp message reset to default.', 'info');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processHeroFile(file);
  };

  const handleApplyHeroUrl = async () => {
    const trimmed = heroUrlInput.trim();
    const updated = {
      ...formData,
      heroImageUrl: trimmed,
      heroImagePath: '',
    };
    setFormData(updated);
    try {
      await updateSiteSettings(updated);
      showToast(trimmed ? 'Hero photo URL saved.' : 'Hero photo cleared.', 'success');
    } catch {
      showToast('Failed to save photo URL.', 'error');
    }
  };

  const handleRemoveImage = async () => {
    setConfirmDeleteImage(false);
    try {
      if (formData.heroImagePath) {
        await deleteFile(formData.heroImagePath);
      }
      const updated = {
        ...formData,
        heroImageUrl: '',
        heroImagePath: '',
      };
      setFormData(updated);
      setHeroUrlInput('');
      await updateSiteSettings(updated);
      showToast('Hero image removed. Public site falls back to key glyph.', 'info');
    } catch {
      showToast('Could not remove image.', 'error');
    }
  };

  const handleAboutImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processAboutFile(file);
  };

  const handleApplyAboutUrl = async () => {
    const trimmed = aboutUrlInput.trim();
    const updated = {
      ...formData,
      aboutImageUrl: trimmed,
      aboutImagePath: '',
    };
    setFormData(updated);
    try {
      await updateSiteSettings(updated);
      showToast(trimmed ? 'About photo URL saved.' : 'About photo cleared.', 'success');
    } catch {
      showToast('Failed to save photo URL.', 'error');
    }
  };

  const handleRemoveAboutImage = async () => {
    setConfirmDeleteAboutImage(false);
    try {
      if (formData.aboutImagePath) {
        await deleteFile(formData.aboutImagePath);
      }
      const updated = {
        ...formData,
        aboutImageUrl: '',
        aboutImagePath: '',
      };
      setFormData(updated);
      setAboutUrlInput('');
      await updateSiteSettings(updated);
      showToast('About photo removed.', 'info');
    } catch {
      showToast('Could not remove photo.', 'error');
    }
  };

  const handleSyncHeroToAbout = async () => {
    if (!formData.heroImageUrl) {
      showToast('Upload or set your Hero photo first.', 'error');
      return;
    }
    const updated = {
      ...formData,
      aboutImageUrl: formData.heroImageUrl,
      aboutImagePath: formData.heroImagePath || '',
    };
    setFormData(updated);
    setAboutUrlInput(formData.heroImageUrl);
    try {
      await updateSiteSettings(updated);
      showToast('Copied photo to About section as well!', 'success');
    } catch {
      showToast('Failed to sync photo.', 'error');
    }
  };

  return (
    <div className="space-y-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(241,238,230,0.1)]">
        <div>
          <h2 className="font-display text-2xl uppercase tracking-tight text-[#F1EEE6]">
            Site Settings
          </h2>
          <p className="font-mono text-xs text-[#8A877F] mt-1">
            Configure identity, direct contact (WhatsApp & Hotline), hero copy, and portrait.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => handleSave()}
          disabled={isSaving}
          icon={<Save size={16} />}
        >
          {isSaving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Form Fields */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-8">
          {/* Identity Card */}
          <div className="p-6 bg-[#151517] border border-[rgba(241,238,230,0.1)] space-y-4">
            <span className="font-mono text-xs uppercase tracking-wider text-[#C9A24D] block">
              Identity & Wordmark
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                  Owner Full Name
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                  Brand Name
                </label>
                <input
                  type="text"
                  name="brandName"
                  value={formData.brandName}
                  onChange={handleChange}
                  className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                Professional Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
              />
            </div>
          </div>

          {/* NEW: Direct Contact (WhatsApp & Hotline) Card */}
          <div className="p-6 bg-[#151517] border border-[rgba(201,162,77,0.3)] shadow-[0_8px_24px_rgba(0,0,0,0.4)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(241,238,230,0.1)]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded bg-[#0B0B0C] text-[#25D366]">
                  <WhatsAppSolidIcon size={18} />
                </div>
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-[#C9A24D] font-bold block">
                    Direct Contact (WhatsApp & Hotline)
                  </span>
                  <p className="text-[11px] text-[#8A877F]">
                    Click-to-chat integration opens WhatsApp with your pre-written message.
                  </p>
                </div>
              </div>

              {/* Test WhatsApp Link Button */}
              <button
                type="button"
                onClick={handleTestWhatsApp}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0B0B0C] border border-[#25D366]/40 text-[#25D366] hover:border-[#25D366] text-xs font-mono uppercase tracking-wider rounded transition-colors"
              >
                <span>Test Link</span>
                <ExternalLink size={12} />
              </button>
            </div>

            {/* WhatsApp Number Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-mono text-xs uppercase tracking-wider text-[#8A877F]">
                  WhatsApp Number
                </label>
                {formData.whatsappNumber && waValidation.valid && (
                  <span className="font-mono text-[11px] text-[#25D366] flex items-center gap-1">
                    <Check size={12} />
                    Display: {formatPhoneDisplay(waValidation.normalized)}
                  </span>
                )}
              </div>
              <input
                type="text"
                name="whatsappNumber"
                value={formData.whatsappNumber || ''}
                onChange={handleChange}
                placeholder="e.g. 09042725844 or 2349042725844"
                className={`w-full bg-[#0B0B0C] border px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:outline-none transition-colors ${
                  formData.whatsappNumber && !waValidation.valid
                    ? 'border-red-500 focus:border-red-400'
                    : 'border-[rgba(241,238,230,0.15)] focus:border-[#C9A24D]'
                }`}
              />
              {formData.whatsappNumber && !waValidation.valid && (
                <p className="font-mono text-xs text-red-400 mt-1.5 flex items-center gap-1.5">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{waValidation.error}</span>
                </p>
              )}
              <p className="font-mono text-[11px] text-[#8A877F]/70 mt-1">
                Enter 11 digits (Nigerian format e.g. 09042725844) or full international format with country code.
              </p>
            </div>

            {/* Default WhatsApp Message */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-mono text-xs uppercase tracking-wider text-[#8A877F]">
                  Default Pre-filled WhatsApp Message
                </label>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-[#8A877F]">
                    {(formData.whatsappMessage || '').length} characters
                  </span>
                  <button
                    type="button"
                    onClick={handleResetMessage}
                    className="font-mono text-[11px] text-[#C9A24D] hover:underline inline-flex items-center gap-1"
                  >
                    <RotateCcw size={11} />
                    Reset
                  </button>
                </div>
              </div>
              <textarea
                rows={2}
                name="whatsappMessage"
                value={formData.whatsappMessage || ''}
                onChange={handleChange}
                placeholder="Default message that will appear in visitor's WhatsApp composer..."
                className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none resize-none leading-relaxed"
              />
              <p className="font-mono text-[10px] text-[#8A877F]/60 mt-1">
                Note: On /work/:slug pages, this automatically adapts to "Hello KEY OF DAVID, I saw &#123;work title&#125; on your portfolio..."
              </p>
            </div>

            {/* Hotline Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-mono text-xs uppercase tracking-wider text-[#8A877F] flex items-center gap-1.5">
                  <Phone size={13} className="text-[#C9A24D]" />
                  <span>Direct Hotline Number (tel: link)</span>
                </label>
                {formData.hotline && hotlineValidation.valid && (
                  <span className="font-mono text-[11px] text-[#C9A24D] flex items-center gap-1">
                    <Check size={12} />
                    Display: {formatPhoneDisplay(hotlineValidation.normalized)}
                  </span>
                )}
              </div>
              <input
                type="text"
                name="hotline"
                value={formData.hotline || ''}
                onChange={handleChange}
                placeholder="e.g. 09042725844 or 2349042725844"
                className={`w-full bg-[#0B0B0C] border px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:outline-none transition-colors ${
                  formData.hotline && !hotlineValidation.valid
                    ? 'border-red-500 focus:border-red-400'
                    : 'border-[rgba(241,238,230,0.15)] focus:border-[#C9A24D]'
                }`}
              />
              {formData.hotline && !hotlineValidation.valid && (
                <p className="font-mono text-xs text-red-400 mt-1.5 flex items-center gap-1.5">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{hotlineValidation.error}</span>
                </p>
              )}
            </div>

            {/* Show Floating WhatsApp Button Toggle */}
            <div className="pt-3 border-t border-[rgba(241,238,230,0.1)] flex items-center justify-between">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-[#F1EEE6] block">
                  Show Floating WhatsApp Button
                </span>
                <p className="text-xs text-[#8A877F] mt-0.5">
                  Display the 56px circular floating action button at the bottom right of public pages.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    showFloatingWhatsApp: prev.showFloatingWhatsApp === false ? true : false,
                  }))
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.showFloatingWhatsApp !== false
                    ? 'bg-[#25D366]'
                    : 'bg-[#0B0B0C] border-[rgba(241,238,230,0.2)]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#0B0B0C] shadow-lg ring-0 transition duration-200 ease-in-out ${
                    formData.showFloatingWhatsApp !== false ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Hero Section Copy Card */}
          <div className="p-6 bg-[#151517] border border-[rgba(241,238,230,0.1)] space-y-4">
            <span className="font-mono text-xs uppercase tracking-wider text-[#C9A24D] block">
              Hero Section Copy
            </span>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                Display Headline
              </label>
              <input
                type="text"
                name="heroHeadline"
                value={formData.heroHeadline}
                onChange={handleChange}
                className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
              />
              <p className="font-mono text-[10px] text-[#8A877F] mt-1">
                Tip: The word "cinema" or the last word renders automatically in Instrument Serif italic Brass.
              </p>
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                Hero Intro Description
              </label>
              <textarea
                rows={3}
                name="heroIntro"
                value={formData.heroIntro}
                onChange={handleChange}
                className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                  CTA Primary Button Label
                </label>
                <input
                  type="text"
                  name="ctaPrimaryLabel"
                  value={formData.ctaPrimaryLabel}
                  onChange={handleChange}
                  className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                  CTA Secondary Button Label
                </label>
                <input
                  type="text"
                  name="ctaSecondaryLabel"
                  value={formData.ctaSecondaryLabel}
                  onChange={handleChange}
                  className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                Availability Badge Text
              </label>
              <input
                type="text"
                name="availabilityText"
                value={formData.availabilityText}
                onChange={handleChange}
                className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
              />
            </div>
          </div>

          {/* About Section Narrative Card */}
          <div className="p-6 bg-[#151517] border border-[rgba(241,238,230,0.1)] space-y-4">
            <span className="font-mono text-xs uppercase tracking-wider text-[#C9A24D] block">
              About Section (Narrative)
            </span>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                About Heading
              </label>
              <input
                type="text"
                name="aboutHeading"
                value={formData.aboutHeading}
                onChange={handleChange}
                className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                About Body Prose (Markdown Supported)
              </label>
              <textarea
                rows={5}
                name="aboutBody"
                value={formData.aboutBody}
                onChange={handleChange}
                className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Contact & Footnotes Card */}
          <div className="p-6 bg-[#151517] border border-[rgba(241,238,230,0.1)] space-y-4">
            <span className="font-mono text-xs uppercase tracking-wider text-[#C9A24D] block">
              Contact & Footnotes
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                  Public Contact Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                  Direct Phone (Display)
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  placeholder="e.g. 0904 272 5844"
                  className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                Location (Optional)
              </label>
              <input
                type="text"
                name="location"
                value={formData.location || ''}
                onChange={handleChange}
                placeholder="Leave empty to hide"
                className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                Footer Copyright Text
              </label>
              <input
                type="text"
                name="footerText"
                value={formData.footerText}
                onChange={handleChange}
                className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
              />
            </div>
          </div>
        </form>

        {/* Right 5 Columns: Hero Portrait & About Portrait Management */}
        <div className="lg:col-span-5 space-y-6">
          {/* Hero Portrait Uploader Card */}
          <div className="p-6 bg-[#151517] border border-[rgba(241,238,230,0.1)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-[#C9A24D] block">
                Hero Portrait (4:5 Ratio)
              </span>
              <span className="font-mono text-[10px] text-[#8A877F] uppercase tracking-wider">
                Homepage Hero
              </span>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingHero(true);
              }}
              onDragLeave={() => setIsDraggingHero(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingHero(false);
                const file = e.dataTransfer.files?.[0];
                if (file) processHeroFile(file);
              }}
              className={`relative aspect-[4/5] bg-[#0B0B0C] border transition-all overflow-hidden flex items-center justify-center ${
                isDraggingHero
                  ? 'border-2 border-dashed border-[#C9A24D] bg-[#C9A24D]/10'
                  : 'border-[rgba(241,238,230,0.15)]'
              }`}
            >
              {formData.heroImageUrl ? (
                <img
                  src={formData.heroImageUrl}
                  alt="Hero portrait preview"
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="text-center p-6 text-[#8A877F]">
                  <Sparkles size={32} className="mx-auto mb-2 text-[#C9A24D]" />
                  <p className="font-mono text-xs uppercase tracking-wider">No Hero Photo</p>
                  <p className="text-[11px] mt-1 text-[#8A877F]/60">
                    Drag & drop your photo file here or click below
                  </p>
                </div>
              )}

              {isDraggingHero && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-[#C9A24D] gap-2 pointer-events-none">
                  <Upload size={32} className="animate-bounce" />
                  <span className="font-mono text-xs uppercase tracking-widest font-bold">
                    Drop Photo to Set Hero
                  </span>
                </div>
              )}

              {uploadProgress !== null && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2">
                  <div className="w-16 h-1 bg-white/20 rounded overflow-hidden">
                    <div
                      className="h-full bg-[#C9A24D] transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-[#C9A24D]">
                    {uploadProgress}%
                  </span>
                </div>
              )}
            </div>

            <p className="text-[10px] font-mono text-[#8A877F] text-center">
              Drag file here, click Upload, or paste image with Ctrl+V
            </p>

            {/* Upload File & Remove */}
            <div className="flex gap-2 pt-1">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadProgress !== null}
                  className="hidden"
                />
                <span className="w-full py-2 px-3 bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] hover:border-[#C9A24D] text-xs font-mono uppercase tracking-wider text-[#F1EEE6] flex items-center justify-center gap-2 transition-colors">
                  <Upload size={14} />
                  <span>{formData.heroImageUrl ? 'Replace File' : 'Upload Your Photo'}</span>
                </span>
              </label>

              {formData.heroImageUrl && (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteImage(true)}
                  className="py-2 px-3 bg-red-950/30 border border-red-900/50 hover:bg-red-950/60 text-red-300 text-xs font-mono transition-colors"
                  aria-label="Remove hero photo"
                  title="Remove hero photo"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {/* Direct Image URL input */}
            <div className="pt-2 border-t border-[rgba(241,238,230,0.06)] space-y-1.5">
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#8A877F]">
                Or Paste Image Link
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://... (image URL)"
                  value={heroUrlInput}
                  onChange={(e) => setHeroUrlInput(e.target.value)}
                  className="flex-1 bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-2.5 py-1.5 text-xs text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyHeroUrl}
                  className="px-3 py-1.5 bg-[#C9A24D] text-[#0B0B0C] font-mono text-xs uppercase tracking-wider font-semibold hover:bg-[#d6af57] transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Copy to About Section quick action */}
            {formData.heroImageUrl && (
              <button
                type="button"
                onClick={handleSyncHeroToAbout}
                className="w-full py-2 px-3 bg-[#0B0B0C]/60 border border-[rgba(201,162,77,0.3)] hover:border-[#C9A24D] text-[#C9A24D] text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <Copy size={13} />
                <span>Use Same Photo for About Section</span>
              </button>
            )}
          </div>

          {/* About Section Portrait Card */}
          <div className="p-6 bg-[#151517] border border-[rgba(241,238,230,0.1)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-[#C9A24D] block">
                About Section Portrait (4:3 Ratio)
              </span>
              <span className="font-mono text-[10px] text-[#8A877F] uppercase tracking-wider">
                Section 01
              </span>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingAbout(true);
              }}
              onDragLeave={() => setIsDraggingAbout(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingAbout(false);
                const file = e.dataTransfer.files?.[0];
                if (file) processAboutFile(file);
              }}
              className={`relative aspect-[4/3] bg-[#0B0B0C] border transition-all overflow-hidden flex items-center justify-center ${
                isDraggingAbout
                  ? 'border-2 border-dashed border-[#C9A24D] bg-[#C9A24D]/10'
                  : 'border-[rgba(241,238,230,0.15)]'
              }`}
            >
              {formData.aboutImageUrl ? (
                <img
                  src={formData.aboutImageUrl}
                  alt="About portrait preview"
                  className="w-full h-full object-cover grayscale contrast-125"
                />
              ) : (
                <div className="text-center p-6 text-[#8A877F]">
                  <Sparkles size={28} className="mx-auto mb-2 text-[#C9A24D]" />
                  <p className="font-mono text-xs uppercase tracking-wider">No About Photo</p>
                  <p className="text-[11px] mt-1 text-[#8A877F]/60">
                    Drag & drop your photo file here or click below
                  </p>
                </div>
              )}

              {isDraggingAbout && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-[#C9A24D] gap-2 pointer-events-none">
                  <Upload size={32} className="animate-bounce" />
                  <span className="font-mono text-xs uppercase tracking-widest font-bold">
                    Drop Photo for About Section
                  </span>
                </div>
              )}

              {aboutUploadProgress !== null && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2">
                  <div className="w-16 h-1 bg-white/20 rounded overflow-hidden">
                    <div
                      className="h-full bg-[#C9A24D] transition-all"
                      style={{ width: `${aboutUploadProgress}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-[#C9A24D]">
                    {aboutUploadProgress}%
                  </span>
                </div>
              )}
            </div>

            <p className="text-[10px] font-mono text-[#8A877F] text-center">
              Drag file here or click Upload About Photo
            </p>

            {/* Upload File & Remove for About */}
            <div className="flex gap-2 pt-1">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAboutImageUpload}
                  disabled={aboutUploadProgress !== null}
                  className="hidden"
                />
                <span className="w-full py-2 px-3 bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] hover:border-[#C9A24D] text-xs font-mono uppercase tracking-wider text-[#F1EEE6] flex items-center justify-center gap-2 transition-colors">
                  <Upload size={14} />
                  <span>{formData.aboutImageUrl ? 'Replace File' : 'Upload About Photo'}</span>
                </span>
              </label>

              {formData.aboutImageUrl && (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteAboutImage(true)}
                  className="py-2 px-3 bg-red-950/30 border border-red-900/50 hover:bg-red-950/60 text-red-300 text-xs font-mono transition-colors"
                  aria-label="Remove about photo"
                  title="Remove about photo"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {/* Direct Image URL input for About */}
            <div className="pt-2 border-t border-[rgba(241,238,230,0.06)] space-y-1.5">
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#8A877F]">
                Or Paste Image Link
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://... (image URL)"
                  value={aboutUrlInput}
                  onChange={(e) => setAboutUrlInput(e.target.value)}
                  className="flex-1 bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-2.5 py-1.5 text-xs text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyAboutUrl}
                  className="px-3 py-1.5 bg-[#C9A24D] text-[#0B0B0C] font-mono text-xs uppercase tracking-wider font-semibold hover:bg-[#d6af57] transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Live Mini Preview */}
          <div className="p-6 bg-[#0B0B0C] border border-[rgba(241,238,230,0.1)] space-y-4">
            <div className="flex items-center gap-2 text-[#C9A24D]">
              <Eye size={14} />
              <span className="font-mono text-xs uppercase tracking-wider font-semibold">
                Live Text Preview
              </span>
            </div>

            <div className="p-4 bg-[#151517] border border-[rgba(241,238,230,0.06)] space-y-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C9A24D] block">
                {formData.title || 'Creative AI Creator'}
              </span>
              <p className="font-mono text-[11px] text-[#8A877F] uppercase tracking-wider">
                {formData.ownerName || 'Olamilekan Ogunyoye David'}
              </p>
              <h3 className="font-display uppercase text-lg sm:text-xl text-[#F1EEE6] leading-snug">
                {formData.heroHeadline || 'Ideas, turned into cinema.'}
              </h3>
              <p className="text-xs text-[#8A877F] line-clamp-3 leading-relaxed">
                {formData.heroIntro}
              </p>

              {/* Direct Contact Snapshot in Preview */}
              <div className="pt-3 border-t border-[rgba(241,238,230,0.06)] flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#25D366]">
                  WA: {formData.whatsappNumber ? formatPhoneDisplay(formData.whatsappNumber) : 'Not configured'}
                </span>
                <span className="text-[#C9A24D]">
                  Hotline: {formData.hotline ? formatPhoneDisplay(formData.hotline) : 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDeleteImage}
        title="Remove Hero Portrait"
        message="This removes the current hero portrait. The public site will display the bespoke Key of David monogram glyph until a new photo is set."
        confirmLabel="Remove Image"
        onConfirm={handleRemoveImage}
        onCancel={() => setConfirmDeleteImage(false)}
      />

      <ConfirmDialog
        isOpen={confirmDeleteAboutImage}
        title="Remove About Portrait"
        message="This removes the photo from Section 01 / About. The section will display its clean typographic editorial layout."
        confirmLabel="Remove Image"
        onConfirm={handleRemoveAboutImage}
        onCancel={() => setConfirmDeleteAboutImage(false)}
      />
    </div>
  );
};
