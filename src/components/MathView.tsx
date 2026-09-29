import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math?: string;
  text?: string;
  block?: boolean;
  className?: string;
}

/**
 * MathView renders mathematical expressions using KaTeX.
 * If 'math' is provided, it renders that raw LaTeX equation directly.
 * If 'text' is provided, it parses inline $...$ and block $$...$$ expressions.
 */
export const MathView: React.FC<MathViewProps> = ({
  math,
  text,
  block = false,
  className = '',
}) => {
  const renderedHtml = useMemo(() => {
    // 1. Direct LaTeX equation mode
    if (math !== undefined) {
      try {
        return katex.renderToString(math, {
          displayMode: block,
          throwOnError: false,
        });
      } catch (err) {
        return `<span class="text-rose-400 font-mono text-xs">[Math Render Error: ${escapeHtml(math)}]</span>`;
      }
    }

    // 2. Mixed text with embedded $...$ and $$...$$
    if (text !== undefined) {
      // Replace $$...$$ first (block math)
      let parsed = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, equation) => {
        try {
          return katex.renderToString(equation.trim(), {
            displayMode: true,
            throwOnError: false,
          });
        } catch {
          return `<span class="text-rose-400 font-mono text-xs">[LaTeX: ${escapeHtml(equation)}]</span>`;
        }
      });

      // Then replace $...$ (inline math)
      parsed = parsed.replace(/\$([^\$\n]+?)\$/g, (_, equation) => {
        try {
          return katex.renderToString(equation.trim(), {
            displayMode: false,
            throwOnError: false,
          });
        } catch {
          return `<span class="text-rose-400 font-mono text-xs">[LaTeX: ${escapeHtml(equation)}]</span>`;
        }
      });

      return parsed;
    }

    return '';
  }, [math, text, block]);

  if (math !== undefined) {
    return (
      <span
        className={`inline-block ${block ? 'w-full text-center my-2' : ''} ${className}`}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    );
  }

  return (
    <span
      className={`leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default MathView;
