/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface ChipProps {
  label: string;
  active?: boolean;
  count?: number;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  active = false,
  count,
  onClick,
  className = '',
  disabled = false,
}) => {
  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 px-3.5 py-1.5 min-h-[36px]
        font-mono text-[11px] uppercase tracking-[0.12em] select-none
        border transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
        focus-visible:outline-2 focus-visible:outline-[#C9A24D] focus-visible:outline-offset-2
        ${onClick ? 'cursor-pointer active:scale-95' : 'cursor-default'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
        ${
          active
            ? 'bg-[#C9A24D] text-[#0B0B0C] border-[#C9A24D] font-semibold shadow-sm'
            : 'bg-[#151517] text-[#8A877F] border-[rgba(241,238,230,0.12)] hover:text-[#F1EEE6] hover:border-[rgba(241,238,230,0.25)]'
        }
        ${className}
      `.trim()}
    >
      <span>{label}</span>
      {typeof count === 'number' && (
        <span
          className={`
            text-[10px] px-1.5 py-0.2 rounded-full
            ${active ? 'bg-[#0B0B0C]/20 text-[#0B0B0C]' : 'bg-[rgba(241,238,230,0.08)] text-[#8A877F]'}
          `}
        >
          {count}
        </span>
      )}
    </Component>
  );
};
