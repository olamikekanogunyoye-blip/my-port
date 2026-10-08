/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Cinematic title card intro loader (First visit per session only).
 * Key glyph draws itself with SVG stroke animation, wordmark fades in, curtain lifts.
 * Skippable on click, disabled for prefers-reduced-motion users.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const IntroLoader: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    // Check session storage
    const hasSeenIntro = sessionStorage.getItem('kod_intro_seen');
    if (!hasSeenIntro) {
      setVisible(true);
      sessionStorage.setItem('kod_intro_seen', 'true');

      // Auto dismiss curtain in 1.7s
      const timer = setTimeout(() => {
        setVisible(false);
      }, 1700);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleSkip = () => {
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro-loader"
          initial={{ opacity: 1 }}
          exit={{ y: '-100%', opacity: 0.95 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          onClick={handleSkip}
          className="fixed inset-0 z-[9999] bg-[#0B0B0C] flex flex-col items-center justify-center cursor-pointer select-none"
          role="dialog"
          aria-label="Cinematic Title Card"
        >
          <div className="flex flex-col items-center gap-6">
            {/* Geometric Key Glyph with Stroke Draw Animation */}
            <svg
              width="64"
              height="64"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#C9A24D]"
            >
              <motion.circle
                cx="10"
                cy="16"
                r="6.5"
                stroke="currentColor"
                strokeWidth="1.75"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.circle
                cx="10"
                cy="16"
                r="2.5"
                fill="currentColor"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              />
              <motion.path
                d="M16.5 16H27"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="square"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.path
                d="M22.5 16V21.5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="square"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              />
              <motion.path
                d="M26 16V20"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="square"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
              />
            </svg>

            {/* Wordmark Fade-In */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-center"
            >
              <h1 className="font-sans font-bold text-lg sm:text-xl tracking-[0.35em] uppercase text-[#F1EEE6]">
                KEY OF DAVID
              </h1>
              <p className="font-mono text-[10px] text-[#8A877F] uppercase tracking-[0.25em] mt-2">
                Olamilekan Ogunyoye David
              </p>
            </motion.div>
          </div>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1 }}
            className="absolute bottom-10 font-mono text-[10px] tracking-widest text-[#8A877F] uppercase"
          >
            Click to Skip
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
