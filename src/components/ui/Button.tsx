/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  target?: string;
  rel?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  href,
  target,
  rel,
  icon,
  iconPosition = 'right',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-medium font-sans uppercase tracking-[0.14em]
    transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
    focus-visible:outline-2 focus-visible:outline-[#C9A24D] focus-visible:outline-offset-4
    disabled:opacity-40 disabled:cursor-not-allowed select-none
    ${fullWidth ? 'w-full' : ''}
  `;

  const sizeClasses = {
    sm: 'text-[11px] px-4 py-2 min-h-[44px] gap-2',
    md: 'text-xs px-6 py-3 min-h-[48px] gap-2.5',
    lg: 'text-sm px-8 py-4 min-h-[54px] gap-3',
  };

  const variantClasses = {
    primary:
      'bg-[#C9A24D] text-[#0B0B0C] font-semibold hover:bg-[#E3B95F] active:scale-[0.98] shadow-sm',
    secondary:
      'bg-[#151517] text-[#F1EEE6] border border-[rgba(241,238,230,0.12)] hover:border-[rgba(241,238,230,0.3)] hover:bg-[#1E1E22] active:scale-[0.98]',
    outline:
      'bg-transparent text-[#F1EEE6] border border-[rgba(241,238,230,0.2)] hover:border-[#C9A24D] hover:text-[#C9A24D] active:scale-[0.98]',
    ghost:
      'bg-transparent text-[#F1EEE6] hover:text-[#C9A24D] hover:bg-[rgba(241,238,230,0.04)]',
  };

  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`.trim();

  const content = (
    <>
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </>
  );

  if (href && !disabled) {
    const { onClick, ariaLabel, title, id, ...rest } = props as any;
    return (
      <a
        href={href}
        target={target}
        rel={target === '_blank' ? (rel || 'noopener noreferrer') : rel}
        onClick={onClick}
        aria-label={ariaLabel || props['aria-label']}
        title={title}
        id={id}
        className={combinedClasses}
        {...rest}
      >
        {content}
      </a>
    );
  }

  return (
    <button className={combinedClasses} disabled={disabled} {...props}>
      {content}
    </button>
  );
};
