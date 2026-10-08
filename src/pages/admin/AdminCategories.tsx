/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Portfolio Categories Admin (Section 5)
 * Add, rename, delete, publish/unpublish, and reorder taxonomy categories.
 * Blocks deleting categories that contain active works (offers reassignment).
 */

import React, { useState } from 'react';
import { CategoryItem, WorkItem, ContentType } from '../../types';
import { createCategory, updateCategory, deleteCategory, reorderCategories } from '../../lib/db';
import { slugify } from '../../lib/format';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from './ConfirmDialog';
import { Plus, ArrowUp, ArrowDown, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';

interface AdminCategoriesProps {
  categories: CategoryItem[];
  works: WorkItem[];
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({ categories, works }) => {
  const { showToast } = useToast();
  const sorted = [...categories].sort((a, b) => a.order - b.order);

  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Deletion & Reassignment state
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);
  const [reassignCategoryTargetId, setReassignCategoryTargetId] = useState<string>('');

  const [formState, setFormState] = useState<{
    label: string;
    slug: string;
    contentType: ContentType;
    published: boolean;
  }>({
    label: '',
    slug: '',
    contentType: 'video',
    published: true,
  });

  const handleOpenCreate = () => {
    setFormState({
      label: '',
      slug: '',
      contentType: 'video',
      published: true,
    });
    setIsCreating(true);
    setEditingCategory(null);
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setFormState({
      label: cat.label,
      slug: cat.slug,
      contentType: cat.contentType,
      published: cat.published,
    });
    setEditingCategory(cat);
    setIsCreating(false);
  };

  const handleLabelChange = (val: string) => {
    setFormState((prev) => ({
      ...prev,
      label: val,
      slug: isCreating ? slugify(val) : prev.slug,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.label.trim()) {
      showToast('Category name is required.', 'error');
      return;
    }

    const cleanSlug = formState.slug.trim() || slugify(formState.label);

    try {
      if (isCreating) {
        await createCategory({
          label: formState.label.trim(),
          slug: cleanSlug,
          contentType: formState.contentType,
          order: sorted.length + 1,
          published: formState.published,
        });
        showToast('New category added.', 'success');
      } else if (editingCategory) {
        await updateCategory(editingCategory.id, {
          label: formState.label.trim(),
          slug: cleanSlug,
          contentType: formState.contentType,
          published: formState.published,
        });
        showToast('Category updated.', 'success');
      }

      setIsCreating(false);
      setEditingCategory(null);
    } catch {
      showToast('Failed to save category.', 'error');
    }
  };

  const handleTogglePublish = async (cat: CategoryItem) => {
    try {
      await updateCategory(cat.id, { published: !cat.published });
      showToast(`Category ${!cat.published ? 'published' : 'hidden'}.`, 'info');
    } catch {
      showToast('Could not update status.', 'error');
    }
  };

  const handlePromptDelete = (cat: CategoryItem) => {
    const attachedWorks = works.filter((w) => w.categoryId === cat.id);
    setDeleteTarget(cat);
    // Find an alternative category for reassignment if attached works exist
    const otherCats = categories.filter((c) => c.id !== cat.id);
    setReassignCategoryTargetId(otherCats[0]?.id || '');
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    const attachedWorks = works.filter((w) => w.categoryId === deleteTarget.id);
    if (attachedWorks.length > 0 && !reassignCategoryTargetId) {
      showToast('Please select a target category to reassign active works to.', 'error');
      return;
    }

    try {
      await deleteCategory(deleteTarget.id, reassignCategoryTargetId || undefined);
      showToast('Category removed successfully.', 'info');
      setDeleteTarget(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Deletion failed', 'error');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const reordered = [...sorted];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    try {
      await reorderCategories(reordered);
      showToast('Category order updated.', 'success');
    } catch {
      showToast('Failed to reorder categories.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(241,238,230,0.1)]">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#C9A24D] block mb-1">
            Section 05
          </span>
          <h2 className="font-sans font-bold text-2xl text-[#F1EEE6]">
            Portfolio Categories & Filtering
          </h2>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreate}
          icon={<Plus size={16} />}
        >
          New Category
        </Button>
      </div>

      {/* Category Editor Drawer / Form */}
      {(isCreating || editingCategory) && (
        <form
          onSubmit={handleSave}
          className="p-6 bg-[#151517] border border-[#C9A24D] space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-[rgba(241,238,230,0.1)] pb-3">
            <h3 className="font-sans font-bold text-base text-[#F1EEE6]">
              {isCreating ? 'Create Category' : 'Edit Category'}
            </h3>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setEditingCategory(null);
              }}
              className="text-[#8A877F] hover:text-[#F1EEE6] p-1"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                Category Label *
              </label>
              <input
                type="text"
                required
                value={formState.label}
                onChange={(e) => handleLabelChange(e.target.value)}
                placeholder="e.g. AI Cinema"
                className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                URL Slug
              </label>
              <input
                type="text"
                required
                value={formState.slug}
                onChange={(e) => setFormState({ ...formState, slug: slugify(e.target.value) })}
                className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#8A877F] mb-1.5">
                Content Format Type
              </label>
              <select
                value={formState.contentType}
                onChange={(e) =>
                  setFormState({ ...formState, contentType: e.target.value as ContentType })
                }
                className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
              >
                <option value="video">Video (16:9 Cinema)</option>
                <option value="image">Image (Visual Masonry)</option>
                <option value="writing">Writing (Editorial Rows)</option>
                <option value="automation">Automation (Case Studies)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-[#F1EEE6]">
              <input
                type="checkbox"
                checked={formState.published}
                onChange={(e) => setFormState({ ...formState, published: e.target.checked })}
                className="accent-[#C9A24D]"
              />
              <span>Published in Portfolio Filter Bar</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[rgba(241,238,230,0.1)]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsCreating(false);
                setEditingCategory(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Category
            </Button>
          </div>
        </form>
      )}

      {/* Category List */}
      <div className="bg-[#151517] border border-[rgba(241,238,230,0.1)] divide-y divide-[rgba(241,238,230,0.1)]">
        {sorted.map((cat, index) => {
          const attachedWorksCount = works.filter((w) => w.categoryId === cat.id).length;

          return (
            <div
              key={cat.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#1E1E22] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                    aria-label="Move category up"
                    className="p-1 text-[#8A877F] hover:text-[#C9A24D] disabled:opacity-20 min-h-[28px] min-w-[28px] flex items-center justify-center"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={index === sorted.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    aria-label="Move category down"
                    className="p-1 text-[#8A877F] hover:text-[#C9A24D] disabled:opacity-20 min-h-[28px] min-w-[28px] flex items-center justify-center"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-sans font-semibold text-base text-[#F1EEE6]">
                      {cat.label}
                    </h4>
                    <span className="font-mono text-xs text-[#C9A24D]">
                      /{cat.slug}
                    </span>
                    <span
                      className={`font-mono text-[10px] uppercase px-2 py-0.5 border ${
                        cat.published
                          ? 'border-emerald-800 text-emerald-400 bg-emerald-950/20'
                          : 'border-yellow-800 text-yellow-400 bg-yellow-950/20'
                      }`}
                    >
                      {cat.published ? 'Live' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs text-[#8A877F]">
                    <span className="uppercase">{cat.contentType}</span>
                    <span>•</span>
                    <span>{attachedWorksCount} works attached</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleTogglePublish(cat)}
                  className="px-3 py-1.5 border border-[rgba(241,238,230,0.15)] bg-[#0B0B0C] text-xs font-mono uppercase tracking-wider text-[#8A877F] hover:text-[#F1EEE6] min-h-[36px]"
                >
                  {cat.published ? 'Unpublish' : 'Publish'}
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(cat)}
                  className="p-2 border border-[rgba(241,238,230,0.15)] bg-[#0B0B0C] text-[#8A877F] hover:text-[#C9A24D] min-h-[36px] min-w-[36px] flex items-center justify-center"
                  aria-label="Edit category"
                >
                  <Edit2 size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => handlePromptDelete(cat)}
                  className="p-2 border border-red-950/60 bg-[#0B0B0C] text-red-400 hover:bg-red-950/40 min-h-[36px] min-w-[36px] flex items-center justify-center"
                  aria-label="Delete category"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete / Reassign Category Dialog */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-[#151517] border border-[rgba(241,238,230,0.15)] shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle size={24} />
              <h3 className="font-sans font-bold text-lg text-[#F1EEE6]">
                Delete Category: {deleteTarget.label}
              </h3>
            </div>

            {works.filter((w) => w.categoryId === deleteTarget.id).length > 0 ? (
              <div className="space-y-4 text-sm text-[#8A877F]">
                <p>
                  This category contains{' '}
                  <strong className="text-[#F1EEE6]">
                    {works.filter((w) => w.categoryId === deleteTarget.id).length}
                  </strong>{' '}
                  portfolio items. You must reassign them to another category before deleting.
                </p>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#C9A24D] mb-1.5">
                    Reassign Works To:
                  </label>
                  <select
                    value={reassignCategoryTargetId}
                    onChange={(e) => setReassignCategoryTargetId(e.target.value)}
                    className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] px-3.5 py-2.5 text-sm text-[#F1EEE6] focus:border-[#C9A24D] focus:outline-none"
                  >
                    {categories
                      .filter((c) => c.id !== deleteTarget.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label} ({c.contentType})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#8A877F]">
                Are you sure you want to delete this category? No works are currently attached.
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white font-mono text-xs uppercase tracking-wider hover:bg-red-500 font-semibold min-h-[44px]"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
