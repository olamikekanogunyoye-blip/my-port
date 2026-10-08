/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
}) => {
  const variantClasses = {
    rectangular: '',
    circular: 'rounded-full',
    text: 'h-4 w-full rounded-sm',
  };

  return (
    <div
      className={`
        bg-[#151517] relative overflow-hidden border border-[rgba(241,238,230,0.06)]
        before:absolute before:inset-0 before:-translate-x-full
        before:animate-[shimmer_2s_infinite]
        before:bg-gradient-to-r before:from-transparent before:via-[rgba(241,238,230,0.05)] before:to-transparent
        ${variantClasses[variant]}
        ${className}
      `.trim()}
    />
  );
};
