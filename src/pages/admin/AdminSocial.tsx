/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Social Links Admin (Section 7)
 * Full CRUD, reorder, platform selector (YouTube, Instagram, TikTok, LinkedIn, Twitter/X, GitHub, Substack, Medium, custom),
 * url, label, handle, and published toggle.
 */

import React, { useState } from 'react';
import { SocialLinkItem } from '../../types';
import {
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  reorderSocialLinks,
} from '../../lib/db';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from './ConfirmDialog';
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Check,
  X,
  ExternalLink,
  Share2,
} from 'lucide-react';

interface AdminSocialProps {
  socialLinks: SocialLinkItem[];
}

const PLATFORM_OPTIONS = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'github', label: 'GitHub' },
  { value: 'substack', label: 'Substack' },
  { value: 'medium', label: 'Medium' },
  { value: 'custom', label: 'Custom Network' },
];

export const AdminSocial: React.FC<AdminSocialProps> = ({ socialLinks }) => {
  const { showToast } = useToast();
  const sorted = [...socialLinks].sort((a, b) => a.order - b.order);

  const [isCreating, setIsCreating] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLinkItem | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [formState, setFormState] = useState<{
    platform: string;
    label: string;
    url: string;
    handle: string;
    published: boolean;
  }>({
    platform: 'youtube',
    label: 'YouTube',
    url: '',
    handle: '',
    published: true,
  });

  const handleOpenCreate = () => {
    setFormState({
      platform: 'youtube',
      label: 'YouTube',
      url: '',
      handle: '',
      published: true,
    });
    setIsCreating(true);
    setEditingLink(null);
  };

  const handleOpenEdit = (link: SocialLinkItem) => {
    setFormState({
      platform: link.platform,
      label: link.label,
      url: link.url,
      handle: link.handle || '',
      published: link.published,
    });
    setEditingLink(link);
    setIsCreating(false);
  };

  const handleCloseModal = () => {
    setIsCreating(false);
    setEditingLink(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.url.trim()) {
      showToast('Profile URL is required.', 'error');
      return;
    }

    try {
      if (isCreating) {
        await createSocialLink({
          platform: formState.platform,
          label: formState.label.trim() || formState.platform,
          url: formState.url.trim(),
          handle: formState.handle.trim(),
          order: sorted.length + 1,
          published: formState.published,
        });
        showToast('Social link created successfully.', 'success');
      } else if (editingLink) {
        await updateSocialLink(editingLink.id, {
          platform: formState.platform,
          label: formState.label.trim() || formState.platform,
          url: formState.url.trim(),
          handle: formState.handle.trim(),
          published: formState.published,
        });
        showToast('Social link updated.', 'success');
      }
      handleCloseModal();
    } catch {
      showToast('Failed to save social link.', 'error');
    }
  };

  const handleTogglePublish = async (link: SocialLinkItem) => {
    try {
      await updateSocialLink(link.id, { published: !link.published });
      showToast(`Link ${!link.published ? 'published' : 'hidden'}.`, 'success');
    } catch {
      showToast('Error updating link visibility.', 'error');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const newOrder = [...sorted];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    try {
      await reorderSocialLinks(newOrder);
      showToast('Order updated.', 'success');
    } catch {
      showToast('Failed to update order.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteSocialLink(deleteTargetId);
      showToast('Social link deleted.', 'info');
      setDeleteTargetId(null);
    } catch {
      showToast('Failed to delete social link.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(241,238,230,0.1)]">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#C9A24D] block mb-1">
            Section 07
          </span>
          <h2 className="font-sans font-bold text-2xl text-[#F1EEE6]">
            Social Channels & Outlets
          </h2>
          <p className="font-mono text-xs text-[#8A877F] mt-1">
            Manage public discovery channels, handle labels, and active connection links.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreate}
          icon={<Plus size={16} />}
        >
          New Channel
        </Button>
      </div>

      {/* Social Links List */}
      <div className="space-y-3">
        {sorted.length === 0 ? (
          <div className="p-12 text-center bg-[#151517] border border-[rgba(241,238,230,0.1)] space-y-3">
            <Share2 className="mx-auto text-[#8A877F]" size={32} />
            <p className="font-mono text-sm text-[#F1EEE6]">No channels registered.</p>
            <p className="font-mono text-xs text-[#8A877F]">
              Add your YouTube, TikTok, Instagram, or LinkedIn profiles.
            </p>
          </div>
        ) : (
          sorted.map((link, index) => (
            <div
              key={link.id}
              className={`p-4 bg-[#151517] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                link.published
                  ? 'border-[rgba(241,238,230,0.12)]'
                  : 'border-dashed border-[rgba(241,238,230,0.08)] opacity-60'
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                {/* Reorder Buttons */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(index, 'up')}
                    disabled={index === 0}
                    aria-label="Move Up"
                    className="p-1 text-[#8A877F] hover:text-[#C9A24D] disabled:opacity-20 transition-colors"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(index, 'down')}
                    disabled={index === sorted.length - 1}
                    aria-label="Move Down"
                    className="p-1 text-[#8A877F] hover:text-[#C9A24D] disabled:opacity-20 transition-colors"
                  >
                    <ArrowDown size={13} />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-sans font-semibold text-base text-[#F1EEE6]">
                      {link.label}
                    </h3>
                    <span className="font-mono text-[10px] text-[#C9A24D] uppercase tracking-wider bg-[rgba(201,162,77,0.1)] px-1.5 py-0.5 border border-[#C9A24D]/30">
                      {link.platform}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 uppercase tracking-wider border ${
                        link.published
                          ? 'border-emerald-800 text-emerald-400 bg-emerald-950/20'
                          : 'border-yellow-800 text-yellow-400 bg-yellow-950/20'
                      }`}
                    >
                      {link.published ? 'Live' : 'Hidden'}
                    </span>
                  </div>

                  <p className="font-mono text-xs text-[#8A877F] truncate mt-1">
                    {link.url || 'No URL configured'}
                  </p>
                  {link.handle && (
                    <p className="font-mono text-[11px] text-[#C9A24D] mt-0.5">
                      {link.handle}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {link.url && (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Open URL"
                    className="p-2.5 text-[#8A877F] hover:text-[#C9A24D] bg-[#0B0B0C] border border-[rgba(241,238,230,0.1)] min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                  >
                    <ExternalLink size={15} />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => handleTogglePublish(link)}
                  className={`px-3 py-2 text-xs font-mono uppercase tracking-wider border transition-colors min-h-[44px] ${
                    link.published
                      ? 'border-yellow-900/60 text-yellow-400 hover:bg-yellow-950/20'
                      : 'border-emerald-800 text-emerald-400 hover:bg-emerald-950/20'
                  }`}
                >
                  {link.published ? 'Hide' : 'Show'}
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(link)}
                  aria-label="Edit channel"
                  className="p-2.5 text-[#F1EEE6] hover:text-[#C9A24D] bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(link.id)}
                  aria-label="Delete channel"
                  className="p-2.5 text-red-400 hover:bg-red-950/40 bg-[#0B0B0C] border border-red-900/40 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {(isCreating || editingLink) && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#151517] border border-[rgba(241,238,230,0.15)] shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[rgba(241,238,230,0.1)] pb-4">
              <h3 className="font-sans font-bold text-lg text-[#F1EEE6]">
                {isCreating ? 'Add Social Outlet' : 'Edit Channel'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-[#8A877F] hover:text-[#F1EEE6] min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                  Platform
                </label>
                <select
                  value={formState.platform}
                  onChange={(e) => {
                    const chosen = PLATFORM_OPTIONS.find((p) => p.value === e.target.value);
                    setFormState({
                      ...formState,
                      platform: e.target.value,
                      label: chosen?.label || e.target.value,
                    });
                  }}
                  className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                >
                  {PLATFORM_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                  Display Label
                </label>
                <input
                  type="text"
                  required
                  value={formState.label}
                  onChange={(e) => setFormState({ ...formState, label: e.target.value })}
                  placeholder="e.g. YouTube"
                  className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                  Profile URL *
                </label>
                <input
                  type="url"
                  required
                  value={formState.url}
                  onChange={(e) => setFormState({ ...formState, url: e.target.value })}
                  placeholder="https://youtube.com/@keyofdavid"
                  className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                  Handle / Identifier (Optional)
                </label>
                <input
                  type="text"
                  value={formState.handle}
                  onChange={(e) => setFormState({ ...formState, handle: e.target.value })}
                  placeholder="@keyofdavid or /in/keyofdavid"
                  className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none font-mono"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={formState.published}
                  onChange={(e) => setFormState({ ...formState, published: e.target.checked })}
                  className="w-4 h-4 accent-[#C9A24D]"
                />
                <span className="font-mono text-xs text-[#F1EEE6]">
                  Render on public website Connect / Footer sections
                </span>
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-[rgba(241,238,230,0.1)]">
                <Button variant="ghost" size="md" type="button" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit" icon={<Check size={16} />}>
                  {isCreating ? 'Save Channel' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Social Channel"
        message="Are you sure you want to remove this profile link from your website?"
        confirmLabel="Delete Link"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
