/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Media Library Admin (Section 9)
 * Grid of all uploaded assets across the site.
 * Filter by kind (all, images, videos), search by filename.
 * Click to copy download URL, view file size and details, check referencing usage,
 * and delete with warning if in use.
 */

import React, { useState } from 'react';
import { MediaAsset } from '../../types';
import {
  createMediaRecord,
  deleteMediaRecord,
  getMediaUsage,
} from '../../lib/db';
import { uploadFile, deleteFile } from '../../lib/storage';
import { formatBytes, formatDate } from '../../lib/format';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from './ConfirmDialog';
import {
  Upload,
  Search,
  Filter,
  Copy,
  Trash2,
  Image as ImageIcon,
  Film,
  File,
  Check,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

interface AdminMediaProps {
  media: MediaAsset[];
}

export const AdminMedia: React.FC<AdminMediaProps> = ({ media }) => {
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterKind, setFilterKind] = useState<'all' | 'image' | 'video'>('all');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [deleteTargetAsset, setDeleteTargetAsset] = useState<MediaAsset | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<string>('');

  const filteredMedia = media.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesKind = filterKind === 'all' || item.kind === filterKind;
    return matchesSearch && matchesKind;
  });

  const handleUploadNew = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadProgress(10);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await uploadFile(file, 'library', (p) => setUploadProgress(p));
        const kind = file.type.startsWith('video/')
          ? 'video'
          : file.type.startsWith('image/')
          ? 'image'
          : 'other';

        await createMediaRecord({
          name: file.name,
          url: res.url,
          path: res.path,
          contentType: file.type || 'application/octet-stream',
          size: file.size,
          kind: kind as any,
        });
      }
      setUploadProgress(null);
      showToast(`${files.length} asset(s) uploaded into library.`, 'success');
    } catch (err) {
      setUploadProgress(null);
      showToast(err instanceof Error ? err.message : 'Upload failed', 'error');
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast('Download URL copied to clipboard.', 'success');
  };

  const handleInitiateDelete = (asset: MediaAsset) => {
    const usage = getMediaUsage(asset.url, asset.path);
    if (usage.length > 0) {
      setDeleteWarning(
        `This file is currently referenced by: ${usage.join(', ')}. Deleting it will cause broken visuals on the live site.`
      );
    } else {
      setDeleteWarning(
        'This file will be permanently removed from Firebase Storage. This cannot be undone.'
      );
    }
    setDeleteTargetAsset(asset);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetAsset) return;
    try {
      await deleteMediaRecord(deleteTargetAsset.id, true);
      showToast('Media asset deleted.', 'info');
      setDeleteTargetAsset(null);
    } catch {
      showToast('Failed to delete asset.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(241,238,230,0.1)]">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#C9A24D] block mb-1">
            Section 09
          </span>
          <h2 className="font-sans font-bold text-2xl text-[#F1EEE6]">
            Media Asset Library
          </h2>
          <p className="font-mono text-xs text-[#8A877F] mt-1">
            Manage compressed WebP visuals, video masters, and assets in Cloud Storage.
          </p>
        </div>

        <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C9A24D] text-[#0B0B0C] font-mono text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-[#E3B95F] transition-colors min-h-[44px]">
          <Upload size={15} />
          <span>Upload Media</span>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleUploadNew}
            className="hidden"
          />
        </label>
      </div>

      {/* Upload Progress */}
      {uploadProgress !== null && (
        <div className="p-3 bg-[rgba(201,162,77,0.1)] border border-[#C9A24D] font-mono text-xs text-[#C9A24D] flex items-center justify-between">
          <span>Uploading asset(s) to storage...</span>
          <span>{uploadProgress}%</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#151517] p-4 border border-[rgba(241,238,230,0.1)]">
        <div className="relative w-full sm:w-80">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A877F]"
          />
          <input
            type="text"
            placeholder="Search by filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] pl-10 pr-4 py-2 text-xs text-[#F1EEE6] placeholder:text-[#8A877F] focus:border-[#C9A24D] focus:outline-none font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(['all', 'image', 'video'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilterKind(k)}
              className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider border transition-colors ${
                filterKind === k
                  ? 'border-[#C9A24D] bg-[rgba(201,162,77,0.15)] text-[#C9A24D]'
                  : 'border-[rgba(241,238,230,0.1)] text-[#8A877F] hover:text-[#F1EEE6]'
              }`}
            >
              {k}s
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredMedia.length === 0 ? (
        <div className="p-12 text-center bg-[#151517] border border-[rgba(241,238,230,0.1)] space-y-3">
          <ImageIcon className="mx-auto text-[#8A877F]" size={36} />
          <p className="font-mono text-sm text-[#F1EEE6]">No media assets found.</p>
          <p className="font-mono text-xs text-[#8A877F]">
            Upload portrait photographs, cinematic stills, or video clips above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((asset) => {
            const usage = getMediaUsage(asset.url, asset.path);
            const isVideo = asset.kind === 'video' || asset.contentType.startsWith('video/');

            return (
              <div
                key={asset.id}
                className="bg-[#151517] border border-[rgba(241,238,230,0.1)] group flex flex-col justify-between overflow-hidden transition-colors hover:border-[rgba(241,238,230,0.3)]"
              >
                <div className="relative aspect-video bg-[#0B0B0C] overflow-hidden flex items-center justify-center">
                  {isVideo ? (
                    <video
                      src={asset.url}
                      className="w-full h-full object-cover"
                      muted
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                  )}

                  <div className="absolute top-2 left-2 bg-black/75 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#C9A24D]">
                    {asset.kind}
                  </div>

                  {usage.length > 0 && (
                    <div className="absolute top-2 right-2 bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-1.5 py-0.5 font-mono text-[9px]">
                      In Use
                    </div>
                  )}
                </div>

                <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-mono text-xs text-[#F1EEE6] truncate" title={asset.name}>
                      {asset.name}
                    </h4>
                    <p className="font-mono text-[10px] text-[#8A877F]">
                      {formatBytes(asset.size)} • {formatDate(asset.createdAt)}
                    </p>
                    {usage.length > 0 && (
                      <p className="font-mono text-[10px] text-[#C9A24D] truncate mt-1">
                        Ref: {usage.join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 pt-2 border-t border-[rgba(241,238,230,0.08)]">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(asset.url)}
                      aria-label="Copy URL"
                      className="flex-1 py-1.5 bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] text-[#F1EEE6] hover:text-[#C9A24D] font-mono text-[10px] uppercase flex items-center justify-center gap-1 min-h-[44px]"
                    >
                      <Copy size={12} />
                      <span>Copy URL</span>
                    </button>
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Open in new tab"
                      className="p-2 text-[#8A877F] hover:text-[#F1EEE6] bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <ExternalLink size={13} />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleInitiateDelete(asset)}
                      aria-label="Delete asset"
                      className="p-2 text-red-400 hover:bg-red-950/40 bg-[#0B0B0C] border border-red-900/40 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetAsset)}
        title="Delete Media File"
        message={deleteWarning}
        confirmLabel="Delete Asset"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetAsset(null)}
      />
    </div>
  );
};
