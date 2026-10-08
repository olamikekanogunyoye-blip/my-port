/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Services Admin (Section 4)
 * Full CRUD, reorder by order field (up/down buttons), publish/unpublish toggle,
 * title, slug, shortDescription, deliverables (tag list), techStack (tag list),
 * and icon picker from lucide list: Video, Sparkles, PenTool, Bot, Cpu, Camera, Terminal, Layers.
 */

import React, { useState } from 'react';
import { ServiceItem } from '../../types';
import { createService, updateService, deleteService, reorderServices } from '../../lib/db';
import { slugify } from '../../lib/format';
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
  Search,
  Video,
  Sparkles,
  PenTool,
  Bot,
  Cpu,
  Camera,
  Terminal,
  Layers,
} from 'lucide-react';

interface AdminServicesProps {
  services: ServiceItem[];
}

const AVAILABLE_ICONS = [
  { name: 'Video', icon: Video, label: 'Video' },
  { name: 'Sparkles', icon: Sparkles, label: 'Sparkles' },
  { name: 'PenTool', icon: PenTool, label: 'Pen Tool' },
  { name: 'Bot', icon: Bot, label: 'Bot' },
  { name: 'Cpu', icon: Cpu, label: 'CPU' },
  { name: 'Camera', icon: Camera, label: 'Camera' },
  { name: 'Terminal', icon: Terminal, label: 'Terminal' },
  { name: 'Layers', icon: Layers, label: 'Layers' },
];

export const AdminServices: React.FC<AdminServicesProps> = ({ services }) => {
  const { showToast } = useToast();
  const sorted = [...services].sort((a, b) => a.order - b.order);

  const [searchQuery, setSearchQuery] = useState('');
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form State
  const [formState, setFormState] = useState<{
    icon: string;
    title: string;
    slug: string;
    shortDescription: string;
    description: string;
    deliverables: string[];
    techStack: string[];
    published: boolean;
  }>({
    icon: 'Sparkles',
    title: '',
    slug: '',
    shortDescription: '',
    description: '',
    deliverables: [],
    techStack: [],
    published: true,
  });

  const [newDeliverable, setNewDeliverable] = useState('');
  const [newTech, setNewTech] = useState('');

  const handleOpenCreate = () => {
    setFormState({
      icon: 'Sparkles',
      title: '',
      slug: '',
      shortDescription: '',
      description: '',
      deliverables: [],
      techStack: [],
      published: true,
    });
    setNewDeliverable('');
    setNewTech('');
    setIsCreating(true);
    setEditingService(null);
  };

  const handleOpenEdit = (service: ServiceItem) => {
    setFormState({
      icon: service.icon || 'Sparkles',
      title: service.title,
      slug: service.slug || slugify(service.title),
      shortDescription: service.shortDescription || '',
      description: service.description || '',
      deliverables: service.deliverables || [],
      techStack: service.techStack || [],
      published: service.published,
    });
    setNewDeliverable('');
    setNewTech('');
    setEditingService(service);
    setIsCreating(false);
  };

  const handleCloseModal = () => {
    setIsCreating(false);
    setEditingService(null);
  };

  const handleAddDeliverable = () => {
    if (!newDeliverable.trim()) return;
    if (!formState.deliverables.includes(newDeliverable.trim())) {
      setFormState((prev) => ({
        ...prev,
        deliverables: [...prev.deliverables, newDeliverable.trim()],
      }));
    }
    setNewDeliverable('');
  };

  const handleRemoveDeliverable = (item: string) => {
    setFormState((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((d) => d !== item),
    }));
  };

  const handleAddTech = () => {
    if (!newTech.trim()) return;
    if (!formState.techStack.includes(newTech.trim())) {
      setFormState((prev) => ({
        ...prev,
        techStack: [...prev.techStack, newTech.trim()],
      }));
    }
    setNewTech('');
  };

  const handleRemoveTech = (item: string) => {
    setFormState((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((t) => t !== item),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title.trim()) {
      showToast('Title is required.', 'error');
      return;
    }

    const calculatedSlug = formState.slug.trim() || slugify(formState.title);

    try {
      if (isCreating) {
        await createService({
          icon: formState.icon,
          title: formState.title.trim(),
          slug: calculatedSlug,
          shortDescription: formState.shortDescription.trim(),
          description: formState.description.trim(),
          deliverables: formState.deliverables,
          techStack: formState.techStack,
          order: sorted.length + 1,
          published: formState.published,
        });
        showToast('Service created successfully.', 'success');
      } else if (editingService) {
        await updateService(editingService.id, {
          icon: formState.icon,
          title: formState.title.trim(),
          slug: calculatedSlug,
          shortDescription: formState.shortDescription.trim(),
          description: formState.description.trim(),
          deliverables: formState.deliverables,
          techStack: formState.techStack,
          published: formState.published,
        });
        showToast('Service updated successfully.', 'success');
      }
      handleCloseModal();
    } catch {
      showToast('Failed to save service.', 'error');
    }
  };

  const handleTogglePublish = async (service: ServiceItem) => {
    try {
      await updateService(service.id, { published: !service.published });
      showToast(
        `Service ${!service.published ? 'published' : 'unpublished'}.`,
        'success'
      );
    } catch {
      showToast('Error updating publish status.', 'error');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const newOrder = [...sorted];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    try {
      await reorderServices(newOrder);
      showToast('Order updated.', 'success');
    } catch {
      showToast('Failed to reorder services.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteService(deleteTargetId);
      showToast('Service deleted.', 'info');
      setDeleteTargetId(null);
    } catch {
      showToast('Failed to delete service.', 'error');
    }
  };

  const filteredServices = sorted.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderServiceIcon = (iconName: string) => {
    const found = AVAILABLE_ICONS.find((i) => i.name === iconName);
    if (found) {
      const IconComponent = found.icon;
      return <IconComponent size={20} className="text-[#C9A24D]" />;
    }
    return <span className="text-lg">{iconName || '✨'}</span>;
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(241,238,230,0.1)]">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#C9A24D] block mb-1">
            Section 04
          </span>
          <h2 className="font-sans font-bold text-2xl text-[#F1EEE6]">
            Services & Offerings
          </h2>
          <p className="font-mono text-xs text-[#8A877F] mt-1">
            Manage creative AI solutions, automation capabilities, deliverables, and tech stacks.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreate}
          icon={<Plus size={16} />}
        >
          New Service
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A877F]"
        />
        <input
          type="text"
          placeholder="Search services by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#151517] border border-[rgba(241,238,230,0.15)] pl-10 pr-4 py-2.5 text-sm text-[#F1EEE6] placeholder:text-[#8A877F] focus:border-[#C9A24D] focus:outline-none"
        />
      </div>

      {/* Services List */}
      <div className="space-y-3">
        {filteredServices.length === 0 ? (
          <div className="p-12 text-center bg-[#151517] border border-[rgba(241,238,230,0.1)] space-y-3">
            <Layers className="mx-auto text-[#8A877F]" size={32} />
            <p className="font-mono text-sm text-[#F1EEE6]">No services match your query.</p>
            <p className="font-mono text-xs text-[#8A877F]">
              Create a new service offering or clear the search filter.
            </p>
          </div>
        ) : (
          filteredServices.map((service, index) => (
            <div
              key={service.id}
              className={`p-4 sm:p-5 bg-[#151517] border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                service.published
                  ? 'border-[rgba(241,238,230,0.12)]'
                  : 'border-dashed border-[rgba(241,238,230,0.08)] opacity-60'
              }`}
            >
              <div className="flex items-start sm:items-center gap-4 flex-1">
                {/* Reorder Up/Down */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(index, 'up')}
                    disabled={index === 0}
                    aria-label="Move Up"
                    className="p-1 text-[#8A877F] hover:text-[#C9A24D] disabled:opacity-20 disabled:hover:text-[#8A877F] transition-colors"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(index, 'down')}
                    disabled={index === sorted.length - 1}
                    aria-label="Move Down"
                    className="p-1 text-[#8A877F] hover:text-[#C9A24D] disabled:opacity-20 disabled:hover:text-[#8A877F] transition-colors"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>

                {/* Icon */}
                <div className="w-10 h-10 bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] flex items-center justify-center shrink-0">
                  {renderServiceIcon(service.icon)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] text-[#C9A24D] uppercase tracking-wider">
                      0{index + 1}
                    </span>
                    <h3 className="font-sans font-semibold text-base text-[#F1EEE6] truncate">
                      {service.title}
                    </h3>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 uppercase tracking-wider border ${
                        service.published
                          ? 'border-emerald-800 text-emerald-400 bg-emerald-950/20'
                          : 'border-yellow-800 text-yellow-400 bg-yellow-950/20'
                      }`}
                    >
                      {service.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-xs text-[#8A877F] mt-1 line-clamp-2">
                    {service.shortDescription || service.description}
                  </p>

                  {/* Badges for deliverables / tech stack */}
                  {(service.deliverables?.length || service.techStack?.length) ? (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {service.deliverables?.slice(0, 3).map((d, i) => (
                        <span
                          key={i}
                          className="font-mono text-[10px] px-1.5 py-0.5 bg-[#0B0B0C] text-[#F1EEE6] border border-[rgba(241,238,230,0.1)]"
                        >
                          {d}
                        </span>
                      ))}
                      {service.techStack?.slice(0, 3).map((t, i) => (
                        <span
                          key={i}
                          className="font-mono text-[10px] px-1.5 py-0.5 bg-[#0B0B0C] text-[#C9A24D] border border-[#C9A24D]/30"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleTogglePublish(service)}
                  className={`px-3 py-2 text-xs font-mono uppercase tracking-wider border transition-colors min-h-[44px] flex items-center gap-1.5 ${
                    service.published
                      ? 'border-yellow-900/60 text-yellow-400 hover:bg-yellow-950/20'
                      : 'border-emerald-800 text-emerald-400 hover:bg-emerald-950/20'
                  }`}
                >
                  {service.published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(service)}
                  aria-label="Edit Service"
                  className="p-2.5 text-[#F1EEE6] hover:text-[#C9A24D] bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(service.id)}
                  aria-label="Delete Service"
                  className="p-2.5 text-red-400 hover:bg-red-950/30 bg-[#0B0B0C] border border-red-900/40 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {(isCreating || editingService) && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#151517] border border-[rgba(241,238,230,0.15)] shadow-2xl p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-[rgba(241,238,230,0.1)] pb-4">
              <h3 className="font-sans font-bold text-lg text-[#F1EEE6]">
                {isCreating ? 'Create Service Offering' : 'Edit Service Offering'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-[#8A877F] hover:text-[#F1EEE6] min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Icon Picker */}
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-2">
                  Select Visual Icon
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {AVAILABLE_ICONS.map((opt) => {
                    const IconComp = opt.icon;
                    const isSelected = formState.icon === opt.name;
                    return (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => setFormState({ ...formState, icon: opt.name })}
                        className={`p-3 flex flex-col items-center justify-center gap-1 border transition-all ${
                          isSelected
                            ? 'border-[#C9A24D] bg-[rgba(201,162,77,0.15)] text-[#C9A24D]'
                            : 'border-[rgba(241,238,230,0.1)] bg-[#0B0B0C] text-[#8A877F] hover:border-[rgba(241,238,230,0.3)]'
                        }`}
                      >
                        <IconComp size={18} />
                        <span className="font-mono text-[9px] uppercase tracking-wider truncate w-full text-center">
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                    Service Title *
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
                    placeholder="e.g. AI Video Creation"
                    className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formState.slug}
                    onChange={(e) => setFormState({ ...formState, slug: slugify(e.target.value) })}
                    placeholder="ai-video-creation"
                    className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                  Short Hook Description
                </label>
                <input
                  type="text"
                  value={formState.shortDescription}
                  onChange={(e) => setFormState({ ...formState, shortDescription: e.target.value })}
                  placeholder="One punchy line for ticker marquee and summary cards..."
                  className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                  Full Service Scope & Methodology
                </label>
                <textarea
                  rows={4}
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  placeholder="Detailed breakdown of how this service is planned and delivered..."
                  className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                />
              </div>

              {/* Deliverables Chip Input */}
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                  Key Deliverables
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formState.deliverables.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0B0B0C] text-[#F1EEE6] border border-[rgba(241,238,230,0.15)] text-xs font-mono"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(item)}
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
                    value={newDeliverable}
                    onChange={(e) => setNewDeliverable(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDeliverable();
                      }
                    }}
                    placeholder="e.g. 4K Master Video (Press Enter)"
                    className="flex-1 bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3 py-2 text-xs text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddDeliverable}
                    className="px-3 py-2 bg-[#0B0B0C] text-[#C9A24D] border border-[#C9A24D]/40 text-xs font-mono"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Tech Stack Chip Input */}
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                  Tech Stack & AI Tools
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formState.techStack.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0B0B0C] text-[#C9A24D] border border-[#C9A24D]/30 text-xs font-mono"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(item)}
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
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTech();
                      }
                    }}
                    placeholder="e.g. Midjourney, Runway Gen-3, n8n (Press Enter)"
                    className="flex-1 bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3 py-2 text-xs text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTech}
                    className="px-3 py-2 bg-[#0B0B0C] text-[#C9A24D] border border-[#C9A24D]/40 text-xs font-mono"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Published Toggle */}
              <label className="flex items-center gap-3 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={formState.published}
                  onChange={(e) => setFormState({ ...formState, published: e.target.checked })}
                  className="w-4 h-4 accent-[#C9A24D]"
                />
                <span className="font-mono text-xs text-[#F1EEE6]">
                  Publish on live portfolio website
                </span>
              </label>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[rgba(241,238,230,0.1)]">
                <Button variant="ghost" size="md" type="button" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit" icon={<Check size={16} />}>
                  {isCreating ? 'Create Service' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Service"
        message="Are you sure you want to remove this service from your website? This action cannot be undone."
        confirmLabel="Delete Service"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
