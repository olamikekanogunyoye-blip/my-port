/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SEO & Social Sharing Admin (Section 10)
 * Controls siteTitle, siteDescription, keywords (tags), canonicalUrl, ogType, twitterHandle.
 * Uploads 1200x630 social share image.
 * Live Open Graph card previews (Twitter/X, LinkedIn, Facebook).
 * Live Google Search snippet preview.
 */

import React, { useState } from 'react';
import { SiteSettings } from '../../types';
import { updateSiteSettings } from '../../lib/db';
import { uploadFile, deleteFile } from '../../lib/storage';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from './ConfirmDialog';
import {
  Save,
  Upload,
  Trash2,
  Share2,
  Search,
  Globe,
  Twitter,
  Linkedin,
  Facebook,
  X,
  Plus,
} from 'lucide-react';

interface AdminSeoProps {
  settings: SiteSettings;
}

export const AdminSeo: React.FC<AdminSeoProps> = ({ settings }) => {
  const { showToast } = useToast();

  const [seoTitle, setSeoTitle] = useState(settings.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(settings.seoDescription || '');
  const [keywords, setKeywords] = useState<string[]>(settings.seoKeywords || []);
  const [keywordInput, setKeywordInput] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState(settings.canonicalUrl || 'https://keyofdavid.ai');
  const [ogType, setOgType] = useState(settings.ogType || 'website');
  const [twitterHandle, setTwitterHandle] = useState(settings.twitterHandle || '@keyofdavid');
  const [imageUrl, setImageUrl] = useState(settings.seoImageUrl || '');
  const [imagePath, setImagePath] = useState(settings.seoImagePath || '');

  const [previewTab, setPreviewTab] = useState<'twitter' | 'linkedin' | 'facebook'>('twitter');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [confirmDeleteImage, setConfirmDeleteImage] = useState(false);

  const handleAddKeyword = () => {
    if (!keywordInput.trim()) return;
    if (!keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
    }
    setKeywordInput('');
  };

  const handleRemoveKeyword = (tag: string) => {
    setKeywords(keywords.filter((k) => k !== tag));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await updateSiteSettings({
        seoTitle,
        seoDescription,
        seoKeywords: keywords,
        canonicalUrl,
        ogType,
        twitterHandle,
        seoImageUrl: imageUrl,
        seoImagePath: imagePath,
      });
      showToast('SEO & Social Sharing configuration saved.', 'success');
    } catch {
      showToast('Failed to save SEO configuration.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadProgress(10);
      if (imagePath) await deleteFile(imagePath);

      const res = await uploadFile(file, 'seo', (p) => setUploadProgress(p));
      setImageUrl(res.url);
      setImagePath(res.path);

      await updateSiteSettings({
        seoImageUrl: res.url,
        seoImagePath: res.path,
      });
      setUploadProgress(null);
      showToast('1200x630 share card uploaded successfully.', 'success');
    } catch (err) {
      setUploadProgress(null);
      showToast(err instanceof Error ? err.message : 'Upload failed', 'error');
    }
  };

  const handleRemoveImage = async () => {
    setConfirmDeleteImage(false);
    try {
      if (imagePath) await deleteFile(imagePath);
      setImageUrl('');
      setImagePath('');
      await updateSiteSettings({
        seoImageUrl: '',
        seoImagePath: '',
      });
      showToast('Social banner image removed.', 'info');
    } catch {
      showToast('Failed to remove social banner.', 'error');
    }
  };

  const domain = canonicalUrl
    ? canonicalUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
    : 'keyofdavid.ai';

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(241,238,230,0.1)]">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#C9A24D] block mb-1">
            Section 10
          </span>
          <h2 className="font-sans font-bold text-2xl text-[#F1EEE6]">
            SEO & Social Card Distribution
          </h2>
          <p className="font-mono text-xs text-[#8A877F] mt-1">
            OpenGraph meta tags, Twitter card summaries, and search engine SERP snippets.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          disabled={isSaving}
          icon={<Save size={16} />}
        >
          {isSaving ? 'Saving...' : 'Save Meta Configuration'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: SEO Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 bg-[#151517] border border-[rgba(241,238,230,0.1)] space-y-5">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-mono text-xs uppercase tracking-wider text-[#8A877F]">
                  Site Title (Title Tag)
                </label>
                <span className="font-mono text-[10px] text-[#8A877F]">
                  {seoTitle.length} / 60 recommended
                </span>
              </div>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="KEY OF DAVID — Olamilekan Ogunyoye David | Creative AI Creator"
                className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-mono text-xs uppercase tracking-wider text-[#8A877F]">
                  Meta Description
                </label>
                <span className="font-mono text-[10px] text-[#8A877F]">
                  {seoDescription.length} / 160 recommended
                </span>
              </div>
              <textarea
                rows={3}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Editorial portfolio of Olamilekan Ogunyoye David (KEY OF DAVID) — Creative AI Creator & AI Automation Agent."
                className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                  Canonical URL
                </label>
                <input
                  type="url"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://keyofdavid.ai"
                  className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                  Twitter / X Creator Handle
                </label>
                <input
                  type="text"
                  value={twitterHandle}
                  onChange={(e) => setTwitterHandle(e.target.value)}
                  placeholder="@keyofdavid"
                  className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                OpenGraph Content Type
              </label>
              <select
                value={ogType}
                onChange={(e) => setOgType(e.target.value)}
                className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
              >
                <option value="website">website</option>
                <option value="profile">profile</option>
                <option value="article">article</option>
              </select>
            </div>

            {/* Keyword Tags */}
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                Meta Keywords
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {keywords.map((k) => (
                  <span
                    key={k}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0B0B0C] text-[#C9A24D] border border-[#C9A24D]/30 text-xs font-mono"
                  >
                    {k}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(k)}
                      className="text-[#8A877F] hover:text-red-400"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                  placeholder="e.g. AI Video, AI Automation, Storytelling (Press Enter)"
                  className="flex-1 bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3 py-2 text-xs text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="px-3 py-2 bg-[#0B0B0C] text-[#C9A24D] border border-[#C9A24D]/40 text-xs font-mono"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Social Image & Previews */}
        <div className="lg:col-span-5 space-y-6">
          {/* Social Share Image Upload */}
          <div className="p-6 bg-[#151517] border border-[rgba(241,238,230,0.1)] space-y-4">
            <span className="font-mono text-xs uppercase tracking-wider text-[#C9A24D] block">
              OpenGraph Card Visual (1200x630)
            </span>

            <div className="relative aspect-[1200/630] bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] overflow-hidden flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="OpenGraph banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4 space-y-1">
                  <Share2 className="mx-auto text-[#8A877F]" size={24} />
                  <p className="font-mono text-xs text-[#8A877F]">
                    No 1200x630 share card uploaded.
                  </p>
                </div>
              )}

              {uploadProgress !== null && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <span className="font-mono text-xs text-[#C9A24D]">
                    Uploading {uploadProgress}%
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C9A24D] text-[#0B0B0C] font-mono text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-[#E3B95F] transition-colors min-h-[44px]">
                <Upload size={14} />
                <span>{imageUrl ? 'Replace Card' : 'Upload 1200x630 Card'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteImage(true)}
                  className="p-2.5 text-red-400 hover:bg-red-950/40 border border-red-900/60 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Live OpenGraph Social Preview */}
          <div className="p-6 bg-[#151517] border border-[rgba(241,238,230,0.1)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-[#C9A24D]">
                Social Card Simulation
              </span>

              <div className="flex items-center gap-1 border border-[rgba(241,238,230,0.1)] p-0.5 bg-[#0B0B0C]">
                <button
                  type="button"
                  onClick={() => setPreviewTab('twitter')}
                  aria-label="Twitter preview"
                  className={`p-1.5 transition-colors ${
                    previewTab === 'twitter'
                      ? 'bg-[#151517] text-[#C9A24D]'
                      : 'text-[#8A877F] hover:text-[#F1EEE6]'
                  }`}
                >
                  <Twitter size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('linkedin')}
                  aria-label="LinkedIn preview"
                  className={`p-1.5 transition-colors ${
                    previewTab === 'linkedin'
                      ? 'bg-[#151517] text-[#C9A24D]'
                      : 'text-[#8A877F] hover:text-[#F1EEE6]'
                  }`}
                >
                  <Linkedin size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('facebook')}
                  aria-label="Facebook preview"
                  className={`p-1.5 transition-colors ${
                    previewTab === 'facebook'
                      ? 'bg-[#151517] text-[#C9A24D]'
                      : 'text-[#8A877F] hover:text-[#F1EEE6]'
                  }`}
                >
                  <Facebook size={14} />
                </button>
              </div>
            </div>

            {/* Social Card Preview Render */}
            <div className="rounded-lg border border-[#333] overflow-hidden bg-black text-white text-xs">
              <div className="aspect-[1200/630] bg-[#111] overflow-hidden flex items-center justify-center">
                {imageUrl ? (
                  <img src={imageUrl} alt="Card Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-mono text-[10px] text-[#666]">1200 × 630 Card Graphic</span>
                )}
              </div>
              <div className="p-3 bg-[#16181c] border-t border-[#2f3336] space-y-1">
                <span className="text-[10px] text-neutral-400 font-mono block uppercase">
                  {domain}
                </span>
                <h4 className="font-semibold text-neutral-100 truncate text-xs">
                  {seoTitle || 'Portfolio Title'}
                </h4>
                <p className="text-[11px] text-neutral-400 line-clamp-2">
                  {seoDescription || 'Editorial portfolio description will be displayed here.'}
                </p>
              </div>
            </div>

            {/* Google SERP Snippet Preview */}
            <div className="pt-4 border-t border-[rgba(241,238,230,0.1)] space-y-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#8A877F] block">
                Google SERP Snippet Preview
              </span>
              <div className="p-3 bg-[#202124] rounded border border-[#3c4043] space-y-1 text-xs">
                <div className="flex items-center gap-1 text-[11px] text-[#bdc1c6] font-mono truncate">
                  <Globe size={11} className="text-[#8ab4f8]" />
                  <span>https://{domain}</span>
                </div>
                <h4 className="text-[#8ab4f8] hover:underline font-normal text-sm cursor-pointer truncate">
                  {seoTitle || 'Page Title in Google Results'}
                </h4>
                <p className="text-[#bdc1c6] text-[11px] line-clamp-2 leading-relaxed">
                  {seoDescription || 'Meta description as it appears in Google web search listings.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDeleteImage}
        title="Remove OpenGraph Share Image"
        message="This also deletes the file from storage. This cannot be undone."
        confirmLabel="Remove Card"
        onConfirm={handleRemoveImage}
        onCancel={() => setConfirmDeleteImage(false)}
      />
    </div>
  );
};
