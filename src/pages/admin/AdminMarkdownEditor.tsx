/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Markdown Editor with Formatting Toolbar & Live Preview
 */

import React, { useState } from 'react';
import { Bold, Italic, Heading2, Link2, List, Quote, Eye, Edit3 } from 'lucide-react';
import { MarkdownRenderer } from '../../lib/markdown';

interface AdminMarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  rows?: number;
  placeholder?: string;
  label?: string;
}

export const AdminMarkdownEditor: React.FC<AdminMarkdownEditorProps> = ({
  value,
  onChange,
  rows = 10,
  placeholder = 'Write narrative content in Markdown...',
  label,
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const insertSyntax = (before: string, after = '') => {
    const textarea = document.getElementById('admin-markdown-input') as HTMLTextAreaElement | null;
    if (!textarea) {
      onChange(value + before + after);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = value.substring(start, end);
    const replacement = before + (selection || 'text') + after;
    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + replacement.length - after.length);
    }, 10);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between pb-1">
        {label && (
          <label className="font-mono text-xs uppercase tracking-wider text-[#8A877F]">
            {label}
          </label>
        )}
        <div className="flex items-center gap-1 border border-[rgba(241,238,230,0.1)] p-0.5 bg-[#151517]">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`px-3 py-1 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
              activeTab === 'edit'
                ? 'bg-[#0B0B0C] text-[#C9A24D] font-semibold'
                : 'text-[#8A877F] hover:text-[#F1EEE6]'
            }`}
          >
            <Edit3 size={12} />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
              activeTab === 'preview'
                ? 'bg-[#0B0B0C] text-[#C9A24D] font-semibold'
                : 'text-[#8A877F] hover:text-[#F1EEE6]'
            }`}
          >
            <Eye size={12} />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {activeTab === 'edit' ? (
        <div className="border border-[rgba(241,238,230,0.15)] bg-[#0B0B0C]">
          {/* Formatting Toolbar */}
          <div className="flex flex-wrap items-center gap-1 p-2 border-b border-[rgba(241,238,230,0.08)] bg-[#151517]/60">
            <button
              type="button"
              onClick={() => insertSyntax('**', '**')}
              title="Bold"
              className="p-1.5 text-[#8A877F] hover:text-[#F1EEE6] hover:bg-white/5 rounded"
            >
              <Bold size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertSyntax('*', '*')}
              title="Italic"
              className="p-1.5 text-[#8A877F] hover:text-[#F1EEE6] hover:bg-white/5 rounded"
            >
              <Italic size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertSyntax('## ')}
              title="Heading 2"
              className="p-1.5 text-[#8A877F] hover:text-[#F1EEE6] hover:bg-white/5 rounded"
            >
              <Heading2 size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertSyntax('[', '](https://)')}
              title="Link"
              className="p-1.5 text-[#8A877F] hover:text-[#F1EEE6] hover:bg-white/5 rounded"
            >
              <Link2 size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertSyntax('- ')}
              title="List item"
              className="p-1.5 text-[#8A877F] hover:text-[#F1EEE6] hover:bg-white/5 rounded"
            >
              <List size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertSyntax('> ')}
              title="Blockquote"
              className="p-1.5 text-[#8A877F] hover:text-[#F1EEE6] hover:bg-white/5 rounded"
            >
              <Quote size={15} />
            </button>
          </div>

          <textarea
            id="admin-markdown-input"
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent p-4 text-sm font-mono text-[#F1EEE6] placeholder-[#8A877F]/50 focus:outline-none resize-y leading-relaxed"
          />
        </div>
      ) : (
        <div className="border border-[rgba(241,238,230,0.15)] bg-[#151517] p-6 min-h-[200px] text-sm text-[#F1EEE6]">
          {value.trim() ? (
            <MarkdownRenderer content={value} />
          ) : (
            <p className="text-xs text-[#8A877F] font-mono italic">
              Nothing to preview yet. Switch back to Edit to compose.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
