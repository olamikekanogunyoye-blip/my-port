/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Thin Brass scroll-progress line anchored to the top of the viewport.
 */

import React, { useEffect, useState } from 'react';

export const ScrollProgress: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        setProgress((totalScroll / windowHeight) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[2px] z-[100] pointer-events-none bg-transparent"
      aria-hidden="true"
    >
      <div
        className="h-full bg-[#C9A24D] transition-[width] duration-75 ease-out shadow-[0_0_8px_rgba(201,162,77,0.6)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
