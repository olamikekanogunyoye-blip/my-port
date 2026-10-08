/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * About Section Admin (Section 3)
 * Edits aboutTagline, aboutHeading, aboutBio, aboutProcess, aboutStats, and rich Markdown aboutBody.
 * Upload, replace, and remove aboutImage (deletes from storage).
 * Live side-by-side preview on desktop.
 */

import React, { useState } from 'react';
import { SiteSettings } from '../../types';
import { updateSiteSettings } from '../../lib/db';
import { uploadFile, deleteFile } from '../../lib/storage';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { AdminMarkdownEditor } from './AdminMarkdownEditor';
import { ConfirmDialog } from './ConfirmDialog';
import { Save, Upload, Trash2, Plus, X, Eye } from 'lucide-react';
import { MarkdownRenderer } from '../../lib/markdown';

interface AdminAboutProps {
  settings: SiteSettings;
}

export const AdminAbout: React.FC<AdminAboutProps> = ({ settings }) => {
  const { showToast } = useToast();
  const [heading, setHeading] = useState(settings.aboutHeading || 'Who I am');
  const [tagline, setTagline] = useState(settings.aboutTagline || '');
  const [bio, setBio] = useState(settings.aboutBio || '');
  const [process, setProcess] = useState(settings.aboutProcess || '');
  const [stats, setStats] = useState<{ label: string; value: string }[]>(
    settings.aboutStats || []
  );
  const [body, setBody] = useState(settings.aboutBody || '');
  const [imageUrl, setImageUrl] = useState(settings.aboutImageUrl || '');
  const [imagePath, setImagePath] = useState(settings.aboutImagePath || '');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [confirmDeleteImage, setConfirmDeleteImage] = useState(false);

  // New stat input state
  const [newStatLabel, setNewStatLabel] = useState('');
  const [newStatValue, setNewStatValue] = useState('');

  const handleAddStat = () => {
    if (!newStatLabel.trim() || !newStatValue.trim()) return;
    setStats([...stats, { label: newStatLabel.trim(), value: newStatValue.trim() }]);
    setNewStatLabel('');
    setNewStatValue('');
  };

  const handleRemoveStat = (index: number) => {
    setStats(stats.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSiteSettings({
        aboutHeading: heading,
        aboutTagline: tagline,
        aboutBio: bio,
        aboutProcess: process,
        aboutStats: stats,
        aboutBody: body,
        aboutImageUrl: imageUrl,
        aboutImagePath: imagePath,
      });
      showToast('About section saved successfully.', 'success');
    } catch {
      showToast('Failed to save about section.', 'error');
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

      const result = await uploadFile(file, 'about', (p) => setUploadProgress(p));
      setImageUrl(result.url);
      setImagePath(result.path);

      await updateSiteSettings({
        aboutImageUrl: result.url,
        aboutImagePath: result.path,
      });

      setUploadProgress(null);
      showToast('About image uploaded and saved.', 'success');
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
        aboutImageUrl: '',
        aboutImagePath: '',
      });
      showToast('About section image removed.', 'info');
    } catch {
      showToast('Failed to remove image.', 'error');
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(241,238,230,0.1)]">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#C9A24D] block mb-1">
            Section 03
          </span>
          <h2 className="font-sans font-bold text-2xl text-[#F1EEE6]">
            About Page & Bio
          </h2>
          <p className="font-mono text-xs text-[#8A877F] mt-1">
            Configure narrative background, artistic process, and live editorial preview.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          disabled={isSaving}
          icon={<Save size={16} />}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Narrative Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 bg-[#151517] border border-[rgba(241,238,230,0.1)] space-y-5">
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                Section Heading
              </label>
              <input
                type="text"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="Who I am"
                className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                Short Tagline / Hook
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Bridging cinema, computational intelligence, and high-velocity workflow automation."
                className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                Concise Bio Statement
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A short 2-3 sentence overview for quick previews..."
                className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                Creative Process / Methodology
              </label>
              <textarea
                rows={3}
                value={process}
                onChange={(e) => setProcess(e.target.value)}
                placeholder="How you work: Concept Architecture -> Prompt Synthesis -> Post-production Pipeline -> Automation Deployment..."
                className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
              />
            </div>

            {/* Custom Stats / Key Figures */}
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-2">
                Key Metrics / Stats (Optional)
              </label>
              <div className="space-y-2 mb-3">
                {stats.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-[#0B0B0C] border border-[rgba(241,238,230,0.1)] text-xs"
                  >
                    <div>
                      <span className="font-mono text-[#C9A24D] font-bold mr-3">{s.value}</span>
                      <span className="text-[#F1EEE6]">{s.label}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveStat(idx)}
                      className="text-[#8A877F] hover:text-red-400 p-1"
                      aria-label="Remove stat"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Value (e.g. 100+)"
                  value={newStatValue}
                  onChange={(e) => setNewStatValue(e.target.value)}
                  className="w-1/3 bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3 py-2 text-xs text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none font-mono"
                />
                <input
                  type="text"
                  placeholder="Label (e.g. AI Scenes Directed)"
                  value={newStatLabel}
                  onChange={(e) => setNewStatLabel(e.target.value)}
                  className="flex-1 bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3 py-2 text-xs text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddStat}
                  className="px-3 py-2 bg-[#151517] hover:bg-[#1F1F24] text-[#C9A24D] border border-[#C9A24D]/40 font-mono text-xs flex items-center gap-1"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>

            <AdminMarkdownEditor
              label="In-Depth Narrative (Markdown)"
              value={body}
              onChange={setBody}
              rows={12}
              placeholder="Detail your creative AI craft, automation workflows, and artistic perspective..."
            />
          </div>
        </div>

        {/* Right 5 Cols: Portrait Image & Desktop Live Preview */}
        <div className="lg:col-span-5 space-y-6">
          {/* Portrait Image */}
          <div className="p-6 bg-[#151517] border border-[rgba(241,238,230,0.1)] space-y-4">
            <span className="font-mono text-xs uppercase tracking-wider text-[#C9A24D] block">
              About Portrait / Media
            </span>

            <div className="relative aspect-[4/5] bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] overflow-hidden flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="About section visual"
                  className="w-full h-full object-cover"
                />
              ) : (
                <p className="font-mono text-xs text-[#8A877F] text-center p-4">
                  No image attached. Public section displays clean typographic layout.
                </p>
              )}

              {uploadProgress !== null && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2">
                  <span className="font-mono text-xs text-[#C9A24D]">
                    Uploading {uploadProgress}%
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C9A24D] text-[#0B0B0C] font-mono text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-[#E3B95F] transition-colors min-h-[44px]">
                <Upload size={14} />
                <span>{imageUrl ? 'Replace Image' : 'Upload Image'}</span>
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
                  aria-label="Remove image"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Desktop Live Mini Preview */}
          <div className="p-6 bg-[#151517] border border-[rgba(241,238,230,0.1)] space-y-3">
            <div className="flex items-center gap-2 text-[#C9A24D] font-mono text-xs uppercase tracking-wider">
              <Eye size={14} /> Live Editorial Preview
            </div>
            <div className="p-4 bg-[#F1EEE6] text-[#0B0B0C] rounded-none max-h-96 overflow-y-auto space-y-4">
              <span className="font-mono text-[10px] tracking-widest uppercase text-[#8A877F] block">
                01 / ABOUT
              </span>
              <h3 className="font-serif italic text-2xl text-[#0B0B0C]">
                "{heading}"
              </h3>
              {tagline && (
                <p className="font-sans font-medium text-xs text-[#151517] leading-relaxed border-l-2 border-[#C9A24D] pl-2.5">
                  {tagline}
                </p>
              )}
              {body ? (
                <div className="text-xs text-[#151517] leading-relaxed prose prose-sm max-w-none">
                  <MarkdownRenderer content={body} />
                </div>
              ) : (
                <p className="text-xs text-[#8A877F] italic">No narrative body entered yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDeleteImage}
        title="Remove About Image"
        message="This also deletes the file from storage. This cannot be undone."
        confirmLabel="Remove File"
        onConfirm={handleRemoveImage}
        onCancel={() => setConfirmDeleteImage(false)}
      />
    </div>
  );
};
