/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

export const Lightbox: React.FC<LightboxProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0B0B0C]/90 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4 }}
            className="relative z-10 w-full max-w-5xl max-h-[90vh] bg-[#151517] border border-[rgba(241,238,230,0.15)] flex flex-col shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(241,238,230,0.1)] bg-[#0B0B0C]/60">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#C9A24D]" />
                <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#8A877F]">
                  {title || 'Media Preview'}
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close lightbox"
                className="p-2 text-[#8A877F] hover:text-[#F1EEE6] transition-colors focus-visible:outline-2 focus-visible:outline-[#C9A24D]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center min-h-[300px]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
