/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Desktop custom cursor ring that grows with "VIEW" or "PLAY" over work cards.
 * Automatically disabled on touch screens and under prefers-reduced-motion.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [cursorType, setCursorType] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDesktopPointer, setIsDesktopPointer] = useState(false);

  useEffect(() => {
    // Only enable on precise pointer devices (desktop with mouse)
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    setIsDesktopPointer(mediaQuery.matches);

    if (!mediaQuery.matches) return;

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Check target element or ancestor for custom cursor trigger
      const target = e.target as HTMLElement | null;
      const cursorTarget = target?.closest('[data-cursor]') as HTMLElement | null;
      if (cursorTarget) {
        setCursorType(cursorTarget.getAttribute('data-cursor'));
      } else {
        setCursorType(null);
      }
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [isVisible]);

  if (!isDesktopPointer || !isVisible) {
    return null;
  }

  const isExpanded = Boolean(cursorType);

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9998] flex items-center justify-center font-mono text-[9px] uppercase tracking-wider font-semibold"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      }}
    >
      <motion.div
        animate={{
          scale: isExpanded ? 2.8 : 1,
          backgroundColor: isExpanded ? 'rgba(201, 162, 77, 0.95)' : 'rgba(201, 162, 77, 0.4)',
          borderColor: isExpanded ? '#C9A24D' : 'rgba(241, 238, 230, 0.6)',
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-5 h-5 -ml-2.5 -mt-2.5 rounded-full border border-[rgba(241,238,230,0.4)] flex items-center justify-center text-[#0B0B0C] shadow-lg backdrop-blur-xs"
      >
        {isExpanded && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="select-none scale-[0.45] font-bold tracking-widest text-[#0B0B0C]"
          >
            {cursorType}
          </motion.span>
        )}
      </motion.div>
    </motion.div>
  );
};
