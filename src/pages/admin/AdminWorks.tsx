/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Works Admin (Section 5)
 * Full CRUD for selected works.
 * Filters: Type (all/video/image/writing/automation), Status (all/published/drafts).
 * Search by title.
 * Work Editor with common fields + specialized tabs for video, image, writing, and automation.
 * Auto-deletes associated files from Firebase Storage on deletion.
 */

import React, { useState } from 'react';
import { WorkItem, CategoryItem, ContentType } from '../../types';
import {
  createWork,
  updateWork,
  deleteWork,
  duplicateWork,
  reorderWorks,
} from '../../lib/db';
import { uploadFile, deleteFile } from '../../lib/storage';
import { parseVideoUrl } from '../../lib/media';
import { slugify, formatDate } from '../../lib/format';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from './ConfirmDialog';
import { AdminMarkdownEditor } from './AdminMarkdownEditor';
import {
  Plus,
  Search,
  Filter,
  Film,
  Image as ImageIcon,
  FileText,
  Cpu,
  Edit2,
  Trash2,
  Copy,
  Eye,
  ArrowUp,
  ArrowDown,
  Upload,
  X,
  ExternalLink,
  Check,
  Star,
  Sparkles,
} from 'lucide-react';

interface AdminWorksProps {
  works: WorkItem[];
  categories: CategoryItem[];
}

export const AdminWorks: React.FC<AdminWorksProps> = ({ works, categories }) => {
  const { showToast } = useToast();
  const sortedWorks = [...works].sort((a, b) => a.order - b.order);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ContentType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingWork, setEditingWork] = useState<WorkItem | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form Fields
  const [formState, setFormState] = useState<Partial<WorkItem>>({
    title: '',
    slug: '',
    type: 'video',
    categoryId: categories[0]?.id || '',
    description: '',
    client: '',
    year: new Date().getFullYear(),
    featured: false,
    published: true,
    allowDownload: false,
    tools: [],
    tags: [],
    // Video
    videoSource: 'embed',
    videoEmbedUrl: '',
    mediaUrl: '',
    mediaPath: '',
    thumbnailUrl: '',
    thumbnailPath: '',
    duration: '',
    aspectRatio: '16:9',
    // Image
    galleryImages: [],
    prompt: '',
    // Writing
    subtitle: '',
    content: '',
    canonicalUrl: '',
    wordCount: 0,
    readingTime: '1 min',
    // Automation
    problemSolved: '',
    problem: '',
    solution: '',
    result: '',
    toolsUsed: [],
    metrics: [],
    workflowDiagramUrl: '',
    workflowDiagramPath: '',
    externalUrl: '',
  });

  const [tagInput, setTagInput] = useState('');
  const [toolsInput, setToolsInput] = useState('');
  const [newMetricLabel, setNewMetricLabel] = useState('');
  const [newMetricValue, setNewMetricValue] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [videoUploadWarning, setVideoUploadWarning] = useState<string | null>(null);

  // Filtered List
  const filteredWorks = sortedWorks.filter((w) => {
    const matchesSearch =
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || w.type === typeFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && w.published) ||
      (statusFilter === 'draft' && !w.published);

    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate word count & reading time
  const handleContentChange = (content: string) => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    setFormState((prev) => ({
      ...prev,
      content,
      wordCount: words,
      readingTime: `${minutes} min read`,
    }));
  };

  const handleOpenCreate = (preselectedType?: ContentType) => {
    const initialType = preselectedType || 'video';
    const matchingCat = categories.find((c) => c.contentType === initialType) || categories[0];

    setFormState({
      title: '',
      slug: '',
      type: initialType,
      categoryId: matchingCat?.id || '',
      description: '',
      client: '',
      year: new Date().getFullYear(),
      featured: false,
      published: true,
      allowDownload: false,
      tools: [],
      tags: [],
      videoSource: 'embed',
      videoEmbedUrl: '',
      mediaUrl: '',
      mediaPath: '',
      thumbnailUrl: '',
      thumbnailPath: '',
      duration: '',
      aspectRatio: initialType === 'image' ? '1:1' : '16:9',
      galleryImages: [],
      prompt: '',
      subtitle: '',
      content: '',
      canonicalUrl: '',
      wordCount: 0,
      readingTime: '1 min',
      problemSolved: '',
      problem: '',
      solution: '',
      result: '',
      toolsUsed: [],
      metrics: [],
      workflowDiagramUrl: '',
      workflowDiagramPath: '',
      externalUrl: '',
    });
    setTagInput('');
    setToolsInput('');
    setNewMetricLabel('');
    setNewMetricValue('');
    setVideoUploadWarning(null);
    setIsCreating(true);
    setEditingWork(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (work: WorkItem) => {
    setFormState({ ...work });
    setTagInput('');
    setToolsInput('');
    setNewMetricLabel('');
    setNewMetricValue('');
    setVideoUploadWarning(null);
    setIsCreating(false);
    setEditingWork(work);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsCreating(false);
    setEditingWork(null);
  };

  // Tag helper
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const current = formState.tags || [];
    if (!current.includes(tagInput.trim())) {
      setFormState((prev) => ({ ...prev, tags: [...current, tagInput.trim()] }));
    }
    setTagInput('');
  };

  const handleRemoveTag = (t: string) => {
    setFormState((prev) => ({ ...prev, tags: (prev.tags || []).filter((tag) => tag !== t) }));
  };

  // Tool helper
  const handleAddTool = () => {
    if (!toolsInput.trim()) return;
    const current = formState.tools || [];
    if (!current.includes(toolsInput.trim())) {
      setFormState((prev) => ({
        ...prev,
        tools: [...current, toolsInput.trim()],
        toolsUsed: [...(prev.toolsUsed || []), toolsInput.trim()],
      }));
    }
    setToolsInput('');
  };

  const handleRemoveTool = (tool: string) => {
    setFormState((prev) => ({
      ...prev,
      tools: (prev.tools || []).filter((t) => t !== tool),
      toolsUsed: (prev.toolsUsed || []).filter((t) => t !== tool),
    }));
  };

  // Metrics helper
  const handleAddMetric = () => {
    if (!newMetricLabel.trim() || !newMetricValue.trim()) return;
    const current = formState.metrics || [];
    setFormState((prev) => ({
      ...prev,
      metrics: [...current, { label: newMetricLabel.trim(), value: newMetricValue.trim() }],
    }));
    setNewMetricLabel('');
    setNewMetricValue('');
  };

  const handleRemoveMetric = (idx: number) => {
    setFormState((prev) => ({
      ...prev,
      metrics: (prev.metrics || []).filter((_, i) => i !== idx),
    }));
  };

  // Thumbnail upload
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadProgress(10);
      if (formState.thumbnailPath) await deleteFile(formState.thumbnailPath);

      const res = await uploadFile(file, 'thumbnails', (p) => setUploadProgress(p));
      setFormState((prev) => ({
        ...prev,
        thumbnailUrl: res.url,
        thumbnailPath: res.path,
      }));
      setUploadProgress(null);
      showToast('Thumbnail uploaded.', 'success');
    } catch (err) {
      setUploadProgress(null);
      showToast(err instanceof Error ? err.message : 'Thumbnail upload failed', 'error');
    }
  };

  // Primary Media Upload (video/image/diagram)
  const handleMediaUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetField: 'media' | 'diagram'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      setVideoUploadWarning('Warning: File exceeds 100MB. Cloud upload may take several minutes.');
    } else {
      setVideoUploadWarning(null);
    }

    try {
      setUploadProgress(10);
      const res = await uploadFile(file, 'works', (p) => setUploadProgress(p));
      if (targetField === 'media') {
        if (formState.mediaPath) await deleteFile(formState.mediaPath);
        setFormState((prev) => ({
          ...prev,
          mediaUrl: res.url,
          mediaPath: res.path,
          // If image and no thumbnail yet, use as thumbnail
          thumbnailUrl: prev.thumbnailUrl || (prev.type === 'image' ? res.url : ''),
          thumbnailPath: prev.thumbnailPath || (prev.type === 'image' ? res.path : ''),
        }));
      } else {
        if (formState.workflowDiagramPath) await deleteFile(formState.workflowDiagramPath);
        setFormState((prev) => ({
          ...prev,
          workflowDiagramUrl: res.url,
          workflowDiagramPath: res.path,
        }));
      }
      setUploadProgress(null);
      showToast('Media uploaded successfully.', 'success');
    } catch (err) {
      setUploadProgress(null);
      showToast(err instanceof Error ? err.message : 'Upload failed', 'error');
    }
  };

  // Multi Gallery Upload
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadProgress(10);
      const newItems: { url: string; path?: string }[] = [];
      for (let i = 0; i < files.length; i++) {
        const res = await uploadFile(files[i], 'gallery', (p) => setUploadProgress(p));
        newItems.push({ url: res.url, path: res.path });
      }

      setFormState((prev) => ({
        ...prev,
        galleryImages: [...(prev.galleryImages || []), ...newItems],
      }));
      setUploadProgress(null);
      showToast(`${files.length} gallery image(s) uploaded.`, 'success');
    } catch (err) {
      setUploadProgress(null);
      showToast(err instanceof Error ? err.message : 'Gallery upload failed', 'error');
    }
  };

  const handleRemoveGalleryImage = async (index: number) => {
    const target = formState.galleryImages?.[index];
    if (target?.path) {
      await deleteFile(target.path);
    }
    setFormState((prev) => ({
      ...prev,
      galleryImages: (prev.galleryImages || []).filter((_, i) => i !== index),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title?.trim()) {
      showToast('Title is required.', 'error');
      return;
    }

    const calculatedSlug = formState.slug?.trim() || slugify(formState.title);
    const workData: any = {
      ...formState,
      title: formState.title.trim(),
      slug: calculatedSlug,
      type: formState.type || 'video',
      categoryId: formState.categoryId || categories[0]?.id || '',
      description: formState.description?.trim() || '',
      client: formState.client?.trim() || '',
      year: Number(formState.year) || new Date().getFullYear(),
      featured: Boolean(formState.featured),
      published: Boolean(formState.published),
      order: formState.order || sortedWorks.length + 1,
      tools: formState.tools || [],
      tags: formState.tags || [],
      thumbnailUrl: formState.thumbnailUrl || formState.mediaUrl || '',
      thumbnailPath: formState.thumbnailPath || '',
      mediaUrl: formState.mediaUrl || '',
      mediaPath: formState.mediaPath || '',
      videoSource: formState.videoSource || 'embed',
      videoEmbedUrl: formState.videoEmbedUrl || '',
      duration: formState.duration || '',
      aspectRatio: formState.aspectRatio || '16:9',
      galleryImages: formState.galleryImages || [],
      prompt: formState.prompt || '',
      subtitle: formState.subtitle || '',
      content: formState.content || '',
      canonicalUrl: formState.canonicalUrl || '',
      wordCount: formState.wordCount || 0,
      readingTime: formState.readingTime || '1 min',
      problemSolved: formState.problemSolved || '',
      problem: formState.problem || '',
      solution: formState.solution || '',
      result: formState.result || '',
      toolsUsed: formState.toolsUsed || [],
      metrics: formState.metrics || [],
      workflowDiagramUrl: formState.workflowDiagramUrl || '',
      workflowDiagramPath: formState.workflowDiagramPath || '',
      externalUrl: formState.externalUrl || '',
      allowDownload: Boolean(formState.allowDownload),
      isSample: Boolean(formState.isSample),
    };

    try {
      if (isCreating) {
        await createWork(workData);
        showToast('Work item created successfully.', 'success');
      } else if (editingWork) {
        await updateWork(editingWork.id, workData);
        showToast('Work item updated successfully.', 'success');
      }
      handleCloseModal();
    } catch {
      showToast('Failed to save work item.', 'error');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateWork(id);
      showToast('Work item duplicated as draft.', 'success');
    } catch {
      showToast('Failed to duplicate work.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteWork(deleteTargetId);
      showToast('Work item and stored media files removed.', 'info');
      setDeleteTargetId(null);
    } catch {
      showToast('Failed to delete work.', 'error');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedWorks.length) return;

    const newOrder = [...sortedWorks];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    try {
      await reorderWorks(newOrder);
      showToast('Work order updated.', 'success');
    } catch {
      showToast('Failed to update work order.', 'error');
    }
  };

  const getTypeIcon = (type: ContentType) => {
    switch (type) {
      case 'video':
        return <Film size={14} className="text-[#C9A24D]" />;
      case 'image':
        return <ImageIcon size={14} className="text-[#C9A24D]" />;
      case 'writing':
        return <FileText size={14} className="text-[#C9A24D]" />;
      case 'automation':
        return <Cpu size={14} className="text-[#C9A24D]" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(241,238,230,0.1)]">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#C9A24D] block mb-1">
            Section 05
          </span>
          <h2 className="font-sans font-bold text-2xl text-[#F1EEE6]">
            Selected Works Portfolio
          </h2>
          <p className="font-mono text-xs text-[#8A877F] mt-1">
            Manage videos, high-resolution imagery, editorial scripts, and business automations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => handleOpenCreate('video')}
            icon={<Plus size={16} />}
          >
            New Video
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => handleOpenCreate('image')}
            icon={<ImageIcon size={16} />}
          >
            New Image
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => handleOpenCreate('writing')}
            icon={<FileText size={16} />}
          >
            New Script
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => handleOpenCreate('automation')}
            icon={<Cpu size={16} />}
          >
            New Automation
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#151517] p-4 border border-[rgba(241,238,230,0.1)]">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A877F]"
          />
          <input
            type="text"
            placeholder="Search works by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] pl-10 pr-4 py-2 text-xs text-[#F1EEE6] placeholder:text-[#8A877F] focus:border-[#C9A24D] focus:outline-none"
          />
        </div>

        {/* Content Type Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {(['all', 'video', 'image', 'writing', 'automation'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider border transition-colors ${
                typeFilter === t
                  ? 'border-[#C9A24D] bg-[rgba(201,162,77,0.15)] text-[#C9A24D]'
                  : 'border-[rgba(241,238,230,0.1)] text-[#8A877F] hover:text-[#F1EEE6]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 w-full md:w-auto">
          {(['all', 'published', 'draft'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border transition-colors ${
                statusFilter === s
                  ? 'border-[#F1EEE6] text-[#F1EEE6] bg-[#1F1F24]'
                  : 'border-transparent text-[#8A877F] hover:text-[#F1EEE6]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Works List */}
      <div className="space-y-3">
        {filteredWorks.length === 0 ? (
          <div className="p-12 text-center bg-[#151517] border border-[rgba(241,238,230,0.1)] space-y-3">
            <Film className="mx-auto text-[#8A877F]" size={36} />
            <p className="font-mono text-sm text-[#F1EEE6]">No works found.</p>
            <p className="font-mono text-xs text-[#8A877F]">
              Click one of the "New Work" buttons above to publish your first piece.
            </p>
          </div>
        ) : (
          filteredWorks.map((work, index) => {
            const cat = categories.find((c) => c.id === work.categoryId);
            return (
              <div
                key={work.id}
                className={`p-4 bg-[#151517] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                  work.published
                    ? 'border-[rgba(241,238,230,0.12)]'
                    : 'border-dashed border-[rgba(241,238,230,0.08)] opacity-60'
                }`}
              >
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                  {/* Reorder Up/Down */}
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
                      disabled={index === sortedWorks.length - 1}
                      aria-label="Move Down"
                      className="p-1 text-[#8A877F] hover:text-[#C9A24D] disabled:opacity-20 transition-colors"
                    >
                      <ArrowDown size={13} />
                    </button>
                  </div>

                  {/* Thumbnail / Media Icon */}
                  <div className="w-16 h-12 bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] overflow-hidden shrink-0 flex items-center justify-center relative">
                    {work.thumbnailUrl || work.mediaUrl ? (
                      <img
                        src={work.thumbnailUrl || work.mediaUrl}
                        alt={work.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getTypeIcon(work.type)
                    )}
                    {work.featured && (
                      <div className="absolute top-0.5 right-0.5 text-[#C9A24D] p-0.5 bg-black/60">
                        <Star size={10} fill="#C9A24D" />
                      </div>
                    )}
                  </div>

                  {/* Work Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase text-[#C9A24D] bg-[rgba(201,162,77,0.1)] px-1.5 py-0.5 border border-[#C9A24D]/30">
                        {getTypeIcon(work.type)}
                        {work.type}
                      </span>
                      {cat && (
                        <span className="font-mono text-[10px] text-[#8A877F]">
                          / {cat.label}
                        </span>
                      )}
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 uppercase tracking-wider border ${
                          work.published
                            ? 'border-emerald-800 text-emerald-400 bg-emerald-950/20'
                            : 'border-yellow-800 text-yellow-400 bg-yellow-950/20'
                        }`}
                      >
                        {work.published ? 'Live' : 'Draft'}
                      </span>
                      {work.year && (
                        <span className="font-mono text-[10px] text-[#8A877F]">
                          ({work.year})
                        </span>
                      )}
                    </div>

                    <h3 className="font-sans font-semibold text-sm text-[#F1EEE6] truncate mt-1">
                      {work.title}
                    </h3>
                    <p className="font-mono text-[11px] text-[#8A877F] truncate">
                      /{work.slug}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <a
                    href={`/work/${work.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="View on site"
                    className="p-2.5 text-[#8A877F] hover:text-[#C9A24D] bg-[#0B0B0C] border border-[rgba(241,238,230,0.1)] min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                  >
                    <ExternalLink size={15} />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDuplicate(work.id)}
                    aria-label="Duplicate work"
                    className="p-2.5 text-[#8A877F] hover:text-[#F1EEE6] bg-[#0B0B0C] border border-[rgba(241,238,230,0.1)] min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                  >
                    <Copy size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(work)}
                    aria-label="Edit work"
                    className="p-2.5 text-[#F1EEE6] hover:text-[#C9A24D] bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(work.id)}
                    aria-label="Delete work"
                    className="p-2.5 text-red-400 hover:bg-red-950/40 bg-[#0B0B0C] border border-red-900/40 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Work Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-4xl bg-[#151517] border border-[rgba(241,238,230,0.15)] shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[rgba(241,238,230,0.1)] pb-4 sticky top-0 bg-[#151517] z-10">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#C9A24D] block">
                  {isCreating ? 'Create Portfolio Piece' : 'Edit Piece'}
                </span>
                <h3 className="font-sans font-bold text-xl text-[#F1EEE6]">
                  {formState.title || 'Untitled Work'}
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-[#8A877F] hover:text-[#F1EEE6] min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Type Switcher */}
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-2">
                  Work Classification Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['video', 'image', 'writing', 'automation'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormState({ ...formState, type: t })}
                      className={`p-3 font-mono text-xs uppercase tracking-wider border flex items-center justify-center gap-2 transition-colors ${
                        formState.type === t
                          ? 'border-[#C9A24D] bg-[rgba(201,162,77,0.15)] text-[#C9A24D]'
                          : 'border-[rgba(241,238,230,0.1)] bg-[#0B0B0C] text-[#8A877F]'
                      }`}
                    >
                      {getTypeIcon(t)}
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* COMMON FIELDS: Title, Slug, Category, Year, Client */}
              <div className="p-4 bg-[#0B0B0C] border border-[rgba(241,238,230,0.1)] space-y-4">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#C9A24D] block">
                  1. Common Metadata
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.title}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          title: e.target.value,
                          slug: isCreating && !formState.slug ? slugify(e.target.value) : formState.slug,
                        })
                      }
                      placeholder="e.g. Chronicle of Eden"
                      className="w-full bg-[#151517] border border-[rgba(241,238,230,0.15)] px-3 py-2 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.slug}
                      onChange={(e) =>
                        setFormState({ ...formState, slug: slugify(e.target.value) })
                      }
                      placeholder="chronicle-of-eden"
                      className="w-full bg-[#151517] border border-[rgba(241,238,230,0.15)] px-3 py-2 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1">
                      Category
                    </label>
                    <select
                      value={formState.categoryId}
                      onChange={(e) => setFormState({ ...formState, categoryId: e.target.value })}
                      className="w-full bg-[#151517] border border-[rgba(241,238,230,0.15)] px-3 py-2 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label} ({c.contentType})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1">
                      Production Year
                    </label>
                    <input
                      type="number"
                      value={formState.year}
                      onChange={(e) =>
                        setFormState({ ...formState, year: parseInt(e.target.value) || undefined })
                      }
                      className="w-full bg-[#151517] border border-[rgba(241,238,230,0.15)] px-3 py-2 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1">
                      Client / Collaboration (Optional)
                    </label>
                    <input
                      type="text"
                      value={formState.client || ''}
                      onChange={(e) => setFormState({ ...formState, client: e.target.value })}
                      placeholder="Leave empty if personal or self-commissioned"
                      className="w-full bg-[#151517] border border-[rgba(241,238,230,0.15)] px-3 py-2 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1">
                    Editorial Summary / Description
                  </label>
                  <textarea
                    rows={3}
                    value={formState.description || ''}
                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                    placeholder="Short narrative synopsis of this piece..."
                    className="w-full bg-[#151517] border border-[rgba(241,238,230,0.15)] px-3 py-2 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                  />
                </div>

                {/* Tags and Tools */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1">
                      Genre / Style Tags
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {formState.tags?.map((t) => (
                        <span
                          key={t}
                          className="font-mono text-[10px] px-2 py-0.5 bg-[#151517] text-[#F1EEE6] border border-[rgba(241,238,230,0.15)] inline-flex items-center gap-1"
                        >
                          {t}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(t)}
                            className="text-[#8A877F] hover:text-red-400"
                          >
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        placeholder="e.g. Cyberpunk, Neoclassical (Press Enter)"
                        className="flex-1 bg-[#151517] border border-[rgba(241,238,230,0.15)] px-3 py-1.5 text-xs text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-3 py-1.5 bg-[#151517] text-[#C9A24D] border border-[#C9A24D]/40 text-xs font-mono"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1">
                      AI Tools Utilized
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {formState.tools?.map((tool) => (
                        <span
                          key={tool}
                          className="font-mono text-[10px] px-2 py-0.5 bg-[#151517] text-[#C9A24D] border border-[#C9A24D]/30 inline-flex items-center gap-1"
                        >
                          {tool}
                          <button
                            type="button"
                            onClick={() => handleRemoveTool(tool)}
                            className="text-[#8A877F] hover:text-red-400"
                          >
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={toolsInput}
                        onChange={(e) => setToolsInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTool();
                          }
                        }}
                        placeholder="e.g. Midjourney, Runway, Claude 3.7 (Press Enter)"
                        className="flex-1 bg-[#151517] border border-[rgba(241,238,230,0.15)] px-3 py-1.5 text-xs text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddTool}
                        className="px-3 py-1.5 bg-[#151517] text-[#C9A24D] border border-[#C9A24D]/40 text-xs font-mono"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Flags */}
                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.published}
                      onChange={(e) => setFormState({ ...formState, published: e.target.checked })}
                      className="accent-[#C9A24D]"
                    />
                    <span className="font-mono text-xs text-[#F1EEE6]">Published (Public)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.featured}
                      onChange={(e) => setFormState({ ...formState, featured: e.target.checked })}
                      className="accent-[#C9A24D]"
                    />
                    <span className="font-mono text-xs text-[#C9A24D]">
                      Featured (Large 2.39:1 Hero Frame)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.allowDownload}
                      onChange={(e) =>
                        setFormState({ ...formState, allowDownload: e.target.checked })
                      }
                      className="accent-[#C9A24D]"
                    />
                    <span className="font-mono text-xs text-[#8A877F]">
                      Allow Direct Download Button
                    </span>
                  </label>
                </div>
              </div>

              {/* Thumbnail / Cover Image */}
              <div className="p-4 bg-[#0B0B0C] border border-[rgba(241,238,230,0.1)] space-y-3">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#C9A24D] block">
                  Cover Card Thumbnail
                </span>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="w-36 h-24 bg-[#151517] border border-[rgba(241,238,230,0.15)] flex items-center justify-center overflow-hidden shrink-0">
                    {formState.thumbnailUrl ? (
                      <img
                        src={formState.thumbnailUrl}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-mono text-[10px] text-[#8A877F]">No Cover</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    <label className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#C9A24D] text-[#0B0B0C] font-mono text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-[#E3B95F] transition-colors">
                      <Upload size={14} />
                      <span>Upload Card Cover</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="url"
                      placeholder="Or enter direct thumbnail image URL"
                      value={formState.thumbnailUrl || ''}
                      onChange={(e) =>
                        setFormState({ ...formState, thumbnailUrl: e.target.value })
                      }
                      className="w-full bg-[#151517] border border-[rgba(241,238,230,0.15)] px-3 py-1.5 text-xs text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* TYPE-SPECIFIC SECTION */}

              {/* 1. VIDEO FIELDS */}
              {formState.type === 'video' && (
                <div className="p-4 bg-[#0B0B0C] border border-[rgba(241,238,230,0.1)] space-y-4">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#C9A24D] block">
                    2. Video Stream & Player Controls
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1">
                        Video Source Method
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setFormState({ ...formState, videoSource: 'embed' })}
                          className={`flex-1 py-2 font-mono text-xs uppercase tracking-wider border ${
                            formState.videoSource === 'embed'
                              ? 'border-[#C9A24D] bg-[rgba(201,162,77,0.15)] text-[#C9A24D]'
                              : 'border-[rgba(241,238,230,0.1)] bg-[#151517] text-[#8A877F]'
                          }`}
                        >
                          Embed (YouTube/Vimeo)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormState({ ...formState, videoSource: 'upload' })}
                          className={`flex-1 py-2 font-mono text-xs uppercase tracking-wider border ${
                            formState.videoSource === 'upload'
                              ? 'border-[#C9A24D] bg-[rgba(201,162,77,0.15)] text-[#C9A24D]'
                              : 'border-[rgba(241,238,230,0.1)] bg-[#151517] text-[#8A877F]'
                          }`}
                        >
                          Direct MP4 / Upload
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1">
                        Display Aspect Ratio
                      </label>
                      <select
                        value={formState.aspectRatio || '16:9'}
                        onChange={(e) =>
                          setFormState({ ...formState, aspectRatio: e.target.value })
                        }
                        className="w-full bg-[#151517] border border-[rgba(241,238,230,0.15)] px-3 py-2 text-xs text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                      >
                        <option value="16:9">16:9 (Standard Widescreen)</option>
                        <option value="2.39:1">2.39:1 (Cinematic Anamorphic)</option>
                        <option value="9:16">9:16 (Vertical Short/Reel)</option>
                      </select>
                    </div>
                  </div>

                  {formState.videoSource === 'embed' ? (
                    <div>
                      <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1">
                        Video Embed URL (YouTube, Vimeo, Shorts, TikTok)
                      </label>
                      <input
                        type="url"
                        value={formState.videoEmbedUrl || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormState({
                            ...formState,
                            videoEmbedUrl: val,
                            mediaUrl: val,
                          });
                        }}
                        placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                        className="w-full bg-[#151517] border border-[rgba(241,238,230,0.15)] px-3 py-2 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                      />
                      {formState.videoEmbedUrl && (
                        <div className="mt-2 text-[11px] font-mono text-[#8A877F]">
                          Auto-detected provider:{' '}
                          <span className="text-[#C9A24D]">
                            {parseVideoUrl(formState.videoEmbedUrl)?.provider || 'unknown'}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F]">
                        Upload Video File (MP4, WebM)
                      </label>
                      <div className="flex gap-4 items-center">
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A24D] text-[#0B0B0C] font-mono text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-[#E3B95F] transition-colors">
                          <Upload size={14} />
                          <span>Select Video File</span>
                          <input
                            type="file"
                            accept="video/mp4,video/webm"
                            onChange={(e) => handleMediaUpload(e, 'media')}
                            className="hidden"
                          />
                        </label>
                        {formState.mediaUrl && (
                          <span className="font-mono text-xs text-emerald-400">
                            Video file attached
                          </span>
                        )}
                      </div>
                      {videoUploadWarning && (
                        <p className="font-mono text-xs text-yellow-400">{videoUploadWarning}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1">
                      Duration String (e.g. 02:45)
                    </label>
                    <input
                      type="text"
                      value={formState.duration || ''}
                      onChange={(e) => setFormState({ ...formState, duration: e.target.value })}
                      placeholder="01:30"
                      className="w-full sm:w-48 bg-[#151517] border border-[rgba(241,238,230,0.15)] px-3 py-2 text-xs text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none font-mono"
                    />
                  </div>
                </div>
              )}

              {/* 2. IMAGE FIELDS */}
              {formState.type === 'image' && (
                <div className="p-4 bg-[#0B0B0C] border border-[rgba(241,238,230,0.1)] space-y-4">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#C9A24D] block">
                    2. Primary Image Asset & Gallery
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1">
                        Primary Image (Upload with client WebP compression)
                      </label>
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A24D] text-[#0B0B0C] font-mono text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-[#E3B95F] transition-colors">
                        <Upload size={14} />
                        <span>Upload Primary Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleMediaUpload(e, 'media')}
                          className="hidden"
                        />
                      </label>
                      {formState.mediaUrl && (
                        <p className="font-mono text-xs text-[#8A877F] mt-2 truncate">
                          URL: {formState.mediaUrl}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1">
                        Image Aspect Ratio
                      </label>
                      <select
                        value={formState.aspectRatio || '1:1'}
                        onChange={(e) =>
                          setFormState({ ...formState, aspectRatio: e.target.value })
                        }
                        className="w-full bg-[#151517] border border-[rgba(241,238,230,0.15)] px-3 py-2 text-xs text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                      >
                        <option value="1:1">1:1 (Square)</option>
                        <option value="4:5">4:5 (Portrait Editorial)</option>
                        <option value="16:9">16:9 (Landscape)</option>
                        <option value="9:16">9:16 (Vertical)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1">
                      Prompt Engineering Blueprint (Optional, hidden on public if empty)
                    </label>
                    <textarea
                      rows={3}
                      value={formState.prompt || ''}
                      onChange={(e) => setFormState({ ...formState, prompt: e.target.value })}
                      placeholder="Raw generative prompt, lighting parameters, camera optics..."
                      className="w-full bg-[#151517] border border-[rgba(241,238,230,0.15)] px-3 py-2 text-xs text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none font-mono"
                    />
                  </div>

                  {/* Multi-image gallery */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F]">
                        Multi-Image Gallery Carousel (Optional)
                      </label>
                      <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#151517] text-[#C9A24D] border border-[#C9A24D]/40 font-mono text-[11px] cursor-pointer hover:bg-[#1F1F24]">
                        <Plus size={12} />
                        <span>Add Gallery Images</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleGalleryUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {formState.galleryImages?.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square bg-[#151517] border border-[rgba(241,238,230,0.1)] group overflow-hidden"
                        >
                          <img
                            src={img.url}
                            alt={`Gallery ${idx}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(idx)}
                            className="absolute top-1 right-1 p-1 bg-black/80 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. WRITING FIELDS */}
              {formState.type === 'writing' && (
                <div className="p-4 bg-[#0B0B0C] border border-[rgba(241,238,230,0.1)] space-y-4">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#C9A24D] block">
                    2. Editorial Article / Script Body
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1">
                        Subtitle / Chapter Heading
                      </label>
                      <input
                        type="text"
                        value={formState.subtitle || ''}
                        onChange={(e) => setFormState({ ...formState, subtitle: e.target.value })}
                        placeholder="e.g. Act I: The Awakening Sequence"
                        className="w-full bg-[#151517] border border-[rgba(241,238,230,0.15)] px-3 py-2 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1">
                        Canonical External URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={formState.canonicalUrl || ''}
                        onChange={(e) =>
                          setFormState({ ...formState, canonicalUrl: e.target.value })
                        }
                        placeholder="https://substack.com/... or https://medium.com/..."
                        className="w-full bg-[#151517] border border-[rgba(241,238,230,0.15)] px-3 py-2 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-[#8A877F]">
                    <span>Word Count: <strong className="text-[#F1EEE6]">{formState.wordCount || 0}</strong></span>
                    <span>Reading Time: <strong className="text-[#C9A24D]">{formState.readingTime || '1 min read'}</strong></span>
                  </div>

                  <AdminMarkdownEditor
                    label="Script / Story Body (Markdown)"
                    value={formState.content || ''}
                    onChange={handleContentChange}
                    rows={12}
                    placeholder="Write scene directions, dialogues, cinematic scripts or editorial articles..."
                  />
                </div>
              )}

              {/* 4. AUTOMATION FIELDS */}
              {formState.type === 'automation' && (
                <div className="p-4 bg-[#0B0B0C] border border-[rgba(241,238,230,0.1)] space-y-4">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#C9A24D] block">
                    2. AI Workflow & Case Study Metrics
                  </span>

                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1">
                      Problem Solved / Business Bottleneck
                    </label>
                    <textarea
                      rows={2}
                      value={formState.problemSolved || formState.problem || ''}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          problemSolved: e.target.value,
                          problem: e.target.value,
                        })
                      }
                      placeholder="e.g. Sales operations losing 15 hours per week manually categorizing inbound leads..."
                      className="w-full bg-[#151517] border border-[rgba(241,238,230,0.15)] px-3 py-2 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1">
                        Engineered Solution Architecture
                      </label>
                      <textarea
                        rows={2}
                        value={formState.solution || ''}
                        onChange={(e) => setFormState({ ...formState, solution: e.target.value })}
                        placeholder="Autonomous agent trigger on webhooks, Claude synthesis, CRM auto-sync..."
                        className="w-full bg-[#151517] border border-[rgba(241,238,230,0.15)] px-3 py-2 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1">
                        Impact & Measurable Outcome
                      </label>
                      <textarea
                        rows={2}
                        value={formState.result || ''}
                        onChange={(e) => setFormState({ ...formState, result: e.target.value })}
                        placeholder="99.4% triage accuracy, instantaneous dispatch, zero manual intervention..."
                        className="w-full bg-[#151517] border border-[rgba(241,238,230,0.15)] px-3 py-2 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Quantitative Key Metrics */}
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                      Key Metrics (Name + Value Pairs)
                    </label>
                    <div className="space-y-2 mb-2">
                      {formState.metrics?.map((m, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-[#151517] border border-[rgba(241,238,230,0.1)] text-xs font-mono"
                        >
                          <div>
                            <span className="text-[#C9A24D] font-bold mr-2">{m.value}</span>
                            <span className="text-[#F1EEE6]">{m.label}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveMetric(idx)}
                            className="text-[#8A877F] hover:text-red-400"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Metric Value (e.g. 15h/week)"
                        value={newMetricValue}
                        onChange={(e) => setNewMetricValue(e.target.value)}
                        className="w-1/3 bg-[#151517] border border-[rgba(241,238,230,0.15)] px-3 py-1.5 text-xs text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Metric Name (e.g. Time Saved)"
                        value={newMetricLabel}
                        onChange={(e) => setNewMetricLabel(e.target.value)}
                        className="flex-1 bg-[#151517] border border-[rgba(241,238,230,0.15)] px-3 py-1.5 text-xs text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddMetric}
                        className="px-3 py-1.5 bg-[#151517] text-[#C9A24D] border border-[#C9A24D]/40 text-xs font-mono"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Workflow Diagram */}
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1">
                      Architecture / Workflow Diagram (Optional)
                    </label>
                    <div className="flex gap-4 items-center">
                      <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#151517] text-[#C9A24D] border border-[#C9A24D]/40 font-mono text-xs cursor-pointer hover:bg-[#1F1F24]">
                        <Upload size={12} />
                        <span>Upload Diagram Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleMediaUpload(e, 'diagram')}
                          className="hidden"
                        />
                      </label>
                      {formState.workflowDiagramUrl && (
                        <span className="font-mono text-xs text-emerald-400">
                          Diagram attached
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Indicator */}
              {uploadProgress !== null && (
                <div className="p-3 bg-[rgba(201,162,77,0.1)] border border-[#C9A24D] font-mono text-xs text-[#C9A24D] flex items-center justify-between">
                  <span>Uploading asset to storage...</span>
                  <span>{uploadProgress}%</span>
                </div>
              )}

              {/* Sticky Action Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[rgba(241,238,230,0.1)] sticky bottom-0 bg-[#151517] p-2 z-10">
                <Button variant="ghost" size="md" type="button" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit" icon={<Check size={16} />}>
                  {isCreating ? 'Publish Piece' : 'Save Work'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Work Item"
        message="This also deletes all associated media files and cover images from storage. This cannot be undone."
        confirmLabel="Delete Item & Media"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
