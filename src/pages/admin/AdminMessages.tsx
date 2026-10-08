/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Contact Inbox Admin (Section 8)
 * Search and filters: all, unread, archived.
 * Detail modal/drawer: sender name, email, subject, message, date, reply-via-mailto button,
 * mark as read/unread toggle, archive toggle, delete button.
 */

import React, { useState } from 'react';
import { ContactMessage } from '../../types';
import { updateMessage, deleteMessage } from '../../lib/db';
import { formatDate } from '../../lib/format';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from './ConfirmDialog';
import {
  Mail,
  Search,
  Inbox,
  Archive,
  Trash2,
  Reply,
  CheckCircle2,
  Clock,
  X,
  Eye,
  MailCheck,
} from 'lucide-react';

interface AdminMessagesProps {
  messages: ContactMessage[];
}

export const AdminMessages: React.FC<AdminMessagesProps> = ({ messages }) => {
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filteredMessages = messages.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.message.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === 'unread') return matchesSearch && !m.read && !m.archived;
    if (filter === 'archived') return matchesSearch && m.archived;
    // 'all' includes active non-archived by default or everything
    return matchesSearch;
  });

  const handleOpenDetail = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      try {
        await updateMessage(msg.id, { read: true });
        showToast('Marked as read.', 'info');
      } catch {
        // silent
      }
    }
  };

  const handleToggleRead = async (msg: ContactMessage) => {
    try {
      await updateMessage(msg.id, { read: !msg.read });
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage({ ...msg, read: !msg.read });
      }
      showToast(`Marked as ${!msg.read ? 'read' : 'unread'}.`, 'success');
    } catch {
      showToast('Error updating read status.', 'error');
    }
  };

  const handleToggleArchive = async (msg: ContactMessage) => {
    try {
      await updateMessage(msg.id, { archived: !msg.archived });
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage({ ...msg, archived: !msg.archived });
      }
      showToast(`Message ${!msg.archived ? 'archived' : 'restored'}.`, 'success');
    } catch {
      showToast('Error updating archive status.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteMessage(deleteTargetId);
      showToast('Message deleted.', 'info');
      if (selectedMessage?.id === deleteTargetId) {
        setSelectedMessage(null);
      }
      setDeleteTargetId(null);
    } catch {
      showToast('Failed to delete message.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(241,238,230,0.1)]">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#C9A24D] block mb-1">
            Section 08
          </span>
          <h2 className="font-sans font-bold text-2xl text-[#F1EEE6]">
            Inbound Client Inquiries
          </h2>
          <p className="font-mono text-xs text-[#8A877F] mt-1">
            Direct commissions, collaboration requests, and consulting briefs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-[#8A877F]">
            Unread: <strong className="text-[#C9A24D]">{messages.filter((m) => !m.read && !m.archived).length}</strong>
          </span>
        </div>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#151517] p-4 border border-[rgba(241,238,230,0.1)]">
        <div className="relative w-full sm:w-80">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A877F]"
          />
          <input
            type="text"
            placeholder="Search inquiries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] pl-10 pr-4 py-2 text-xs text-[#F1EEE6] placeholder:text-[#8A877F] focus:border-[#C9A24D] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(['all', 'unread', 'archived'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider border transition-colors ${
                filter === t
                  ? 'border-[#C9A24D] bg-[rgba(201,162,77,0.15)] text-[#C9A24D]'
                  : 'border-[rgba(241,238,230,0.1)] text-[#8A877F] hover:text-[#F1EEE6]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="p-12 text-center bg-[#151517] border border-[rgba(241,238,230,0.1)] space-y-3">
            <Inbox className="mx-auto text-[#8A877F]" size={36} />
            <p className="font-mono text-sm text-[#F1EEE6]">Inbox empty.</p>
            <p className="font-mono text-xs text-[#8A877F]">
              No messages found in this category.
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => handleOpenDetail(msg)}
              className={`p-4 sm:p-5 bg-[#151517] border cursor-pointer hover:border-[rgba(241,238,230,0.25)] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                !msg.read
                  ? 'border-[#C9A24D]/50 bg-[#1A1A1E]'
                  : 'border-[rgba(241,238,230,0.1)] opacity-85'
              }`}
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] flex items-center justify-center shrink-0 mt-0.5">
                  <Mail
                    size={18}
                    className={!msg.read ? 'text-[#C9A24D]' : 'text-[#8A877F]'}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-sans font-bold text-sm text-[#F1EEE6]">
                      {msg.name}
                    </span>
                    <span className="font-mono text-xs text-[#8A877F]">
                      &lt;{msg.email}&gt;
                    </span>
                    {!msg.read && (
                      <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-[#C9A24D] text-[#0B0B0C] font-bold">
                        Unread
                      </span>
                    )}
                    {msg.archived && (
                      <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-[#1F1F24] text-[#8A877F] border border-[rgba(241,238,230,0.1)]">
                        Archived
                      </span>
                    )}
                  </div>

                  <h4 className="font-sans font-semibold text-xs text-[#F1EEE6] mt-1 truncate">
                    {msg.subject || '(No subject)'}
                  </h4>
                  <p className="text-xs text-[#8A877F] mt-0.5 line-clamp-1">
                    {msg.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <span className="font-mono text-[11px] text-[#8A877F]">
                  {formatDate(msg.createdAt)}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTargetId(msg.id);
                  }}
                  aria-label="Delete message"
                  className="p-2 text-red-400 hover:bg-red-950/40 bg-[#0B0B0C] border border-red-900/40 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Detail Drawer / Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-[#151517] border border-[rgba(241,238,230,0.15)] shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[rgba(241,238,230,0.1)] pb-4">
              <div>
                <span className="font-mono text-[10px] text-[#C9A24D] uppercase tracking-wider block mb-1">
                  Received {formatDate(selectedMessage.createdAt)}
                </span>
                <h3 className="font-sans font-bold text-xl text-[#F1EEE6]">
                  {selectedMessage.subject || '(No subject)'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-[#8A877F] hover:text-[#F1EEE6] min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-[#0B0B0C] border border-[rgba(241,238,230,0.1)] flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[#8A877F]">Sender: </span>
                  <strong className="text-[#F1EEE6]">{selectedMessage.name}</strong>
                  <span className="text-[#C9A24D] ml-2">&lt;{selectedMessage.email}&gt;</span>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#8A877F] mb-1.5">
                  Inquiry Content
                </label>
                <div className="p-4 bg-[#0B0B0C] border border-[rgba(241,238,230,0.1)] text-sm text-[#F1EEE6] leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedMessage.message}
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[rgba(241,238,230,0.1)]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleRead(selectedMessage)}
                  className="px-3 py-2 bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] text-xs font-mono uppercase tracking-wider text-[#F1EEE6] hover:text-[#C9A24D] min-h-[44px] flex items-center gap-1.5"
                >
                  <MailCheck size={14} />
                  <span>{selectedMessage.read ? 'Mark Unread' : 'Mark Read'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleArchive(selectedMessage)}
                  className="px-3 py-2 bg-[#0B0B0C] border border-[rgba(241,238,230,0.15)] text-xs font-mono uppercase tracking-wider text-[#8A877F] hover:text-[#F1EEE6] min-h-[44px] flex items-center gap-1.5"
                >
                  <Archive size={14} />
                  <span>{selectedMessage.archived ? 'Unarchive' : 'Archive'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="md"
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                    selectedMessage.subject || 'Portfolio Inquiry'
                  )}`}
                  icon={<Reply size={16} />}
                >
                  Reply via Mail
                </Button>
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(selectedMessage.id)}
                  aria-label="Delete"
                  className="p-2.5 text-red-400 hover:bg-red-950/40 bg-[#0B0B0C] border border-red-900/40 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Inbound Message"
        message="Are you sure you want to permanently delete this message record?"
        confirmLabel="Delete Message"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
