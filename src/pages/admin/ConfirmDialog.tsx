/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Reusable Admin Confirmation Modal
 */

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
      role="alertdialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md bg-[#151517] border border-[rgba(241,238,230,0.15)] shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {isDestructive && (
              <div className="p-2 rounded-full bg-red-950/60 border border-red-800 text-red-400">
                <AlertTriangle size={18} />
              </div>
            )}
            <h3 className="font-sans font-semibold text-lg text-[#F1EEE6]">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            aria-label="Close dialog"
            className="text-[#8A877F] hover:text-[#F1EEE6]"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-[#8A877F] leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <button
            onClick={onConfirm}
            className={`
              px-4 py-2 text-xs font-mono uppercase tracking-wider font-semibold min-h-[44px]
              transition-colors
              ${
                isDestructive
                  ? 'bg-red-600 text-white hover:bg-red-500'
                  : 'bg-[#C9A24D] text-[#0B0B0C] hover:bg-[#E3B95F]'
              }
            `}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
