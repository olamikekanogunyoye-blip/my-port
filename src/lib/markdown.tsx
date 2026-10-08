/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Lightweight, safe editorial Markdown renderer.
 * Formats headings, bold, italics, links, blockquotes, lists, and paragraphs with cinema typography.
 */

import React from 'react';

interface MarkdownProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split into blocks by double line-breaks
  const rawBlocks = content.split(/\n\s*\n/);

  const renderInline = (text: string): React.ReactNode[] => {
    // Matches bold, italic, links, and code
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\)|`[^`]+`)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-inherit">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index} className="italic text-inherit">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="font-mono text-xs px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[#C9A24D]">
            {part.slice(1, -1)}
          </code>
        );
      }
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <a
            key={index}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 decoration-[#C9A24D] hover:text-[#C9A24D] transition-colors"
          >
            {linkMatch[1]}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className={`space-y-5 leading-[1.75] ${className}`}>
      {rawBlocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Headings
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={i} className="font-sans font-semibold text-lg pt-2 text-inherit tracking-tight">
              {renderInline(trimmed.slice(4))}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={i} className="font-sans font-semibold text-xl pt-3 text-inherit tracking-tight">
              {renderInline(trimmed.slice(3))}
            </h3>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={i} className="font-sans font-bold text-2xl pt-4 text-inherit tracking-tight">
              {renderInline(trimmed.slice(2))}
            </h2>
          );
        }

        // Blockquotes
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote
              key={i}
              className="border-l-2 border-[#C9A24D] pl-5 py-1 italic font-serif text-lg opacity-90 my-4"
            >
              {renderInline(trimmed.slice(2).replace(/\n>\s*/g, ' '))}
            </blockquote>
          );
        }

        // Unordered Lists
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const items = trimmed.split(/\n[-*]\s+/).map((item) => item.replace(/^[-*]\s+/, ''));
          return (
            <ul key={i} className="space-y-2 list-disc list-inside opacity-90">
              {items.map((item, itemIdx) => (
                <li key={itemIdx}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }

        // Ordered Lists
        if (/^\d+\.\s/.test(trimmed)) {
          const items = trimmed.split(/\n\d+\.\s+/).map((item) => item.replace(/^\d+\.\s+/, ''));
          return (
            <ol key={i} className="space-y-2 list-decimal list-inside opacity-90">
              {items.map((item, itemIdx) => (
                <li key={itemIdx}>{renderInline(item)}</li>
              ))}
            </ol>
          );
        }

        // Paragraph
        return (
          <p key={i} className="text-inherit opacity-90">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
};
