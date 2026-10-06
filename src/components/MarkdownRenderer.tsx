import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  onTagClick?: (tag: string) => void;
  onToggleTask?: (taskIndex: number, currentStatus: boolean) => void;
  interactiveTasks?: boolean;
  className?: string;
  compact?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  onTagClick,
  onToggleTask,
  interactiveTasks = false,
  className = '',
  compact = false,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!content || content.trim() === '') {
    return <span className="text-stone-400 dark:text-zinc-500 italic text-sm">Nota vacía</span>;
  }

  // Parse markdown line by line or block by block
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLang = '';
  let codeBuffer: string[] = [];
  let codeBlockIndex = 0;

  let inTable = false;
  let tableRows: string[][] = [];

  const flushTable = () => {
    if (tableRows.length > 0) {
      const header = tableRows[0];
      const body = tableRows.slice(1).filter((r) => !r.every((c) => c.match(/^[:\s-]+$/)));
      elements.push(
        <div key={`table-${elements.length}`} className="my-3 overflow-x-auto rounded-lg border border-stone-200 dark:border-zinc-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-stone-100 dark:bg-zinc-800/80 font-semibold text-stone-700 dark:text-stone-200">
              <tr>
                {header.map((col, ci) => (
                  <th key={ci} className="px-3 py-2 border-b border-stone-200 dark:border-zinc-800">
                    {renderInline(col.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-zinc-800 text-stone-600 dark:text-stone-300">
              {body.map((row, ri) => (
                <tr key={ri} className="hover:bg-stone-50 dark:hover:bg-zinc-800/40">
                  {row.map((col, ci) => (
                    <td key={ci} className="px-3 py-2">
                      {renderInline(col.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  const renderInline = (text: string): React.ReactNode => {
    // 1. Highlight ==text==
    let processedText = text;

    // Split tokens for inline code, bold, italic, strikethrough, highlights, hashtags, and links
    // Regex for inline patterns
    const inlineRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~|==[^=]+==|\[([^\]]+)\]\(([^)]+)\)|#[\w\u00C0-\u017F]+)/g;
    const parts: React.ReactNode[] = [];
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = inlineRegex.exec(processedText)) !== null) {
      if (match.index > lastIdx) {
        parts.push(processedText.substring(lastIdx, match.index));
      }
      const token = match[0];

      if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code
            key={match.index}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-stone-200/80 dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 text-[0.85em] font-mono"
          >
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={match.index} className="font-bold text-stone-900 dark:text-stone-100">
            {renderInline(token.slice(2, -2))}
          </strong>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(
          <em key={match.index} className="italic text-stone-800 dark:text-stone-200">
            {renderInline(token.slice(1, -1))}
          </em>
        );
      } else if (token.startsWith('~~') && token.endsWith('~~')) {
        parts.push(
          <del key={match.index} className="line-through text-stone-400 dark:text-zinc-500">
            {renderInline(token.slice(2, -2))}
          </del>
        );
      } else if (token.startsWith('==') && token.endsWith('==')) {
        parts.push(
          <mark key={match.index} className="bg-amber-200/80 dark:bg-amber-500/30 text-stone-900 dark:text-amber-200 px-1 py-0.2 rounded">
            {renderInline(token.slice(2, -2))}
          </mark>
        );
      } else if (token.startsWith('[') && match[2] && match[3]) {
        parts.push(
          <a
            key={match.index}
            href={match[3]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            {match[2]}
          </a>
        );
      } else if (token.startsWith('#')) {
        const tag = token.slice(1);
        parts.push(
          <button
            key={match.index}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTagClick?.(tag);
            }}
            className="inline-flex items-center px-1.5 py-0.2 text-[0.85em] rounded-full font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 transition"
          >
            #{tag}
          </button>
        );
      }

      lastIdx = inlineRegex.lastIndex;
    }

    if (lastIdx < processedText.length) {
      parts.push(processedText.substring(lastIdx));
    }

    return parts.length > 0 ? parts : text;
  };

  let taskCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        const codeText = codeBuffer.join('\n');
        const currentIndex = codeBlockIndex++;
        elements.push(
          <div
            key={`code-${elements.length}`}
            className="my-3 rounded-lg overflow-hidden bg-stone-900 text-stone-100 dark:bg-zinc-950 border border-stone-800"
          >
            <div className="flex items-center justify-between px-3 py-1.5 bg-stone-800/80 dark:bg-zinc-900 text-xs text-stone-400">
              <span className="font-mono text-emerald-400">{codeLang || 'código'}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  copyCode(codeText, currentIndex);
                }}
                className="flex items-center gap-1 hover:text-stone-200 transition px-2 py-0.5 rounded hover:bg-stone-700/50"
              >
                {copiedIndex === currentIndex ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 text-xs overflow-x-auto font-mono leading-relaxed selection:bg-emerald-800 selection:text-white">
              <code>{codeText}</code>
            </pre>
          </div>
        );
        codeBuffer = [];
        inCodeBlock = false;
        codeLang = '';
      } else {
        flushTable();
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Table detection: line starting and ending with '|'
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const cells = line
        .trim()
        .slice(1, -1)
        .split('|');
      tableRows.push(cells);
      inTable = true;
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Empty line
    if (line.trim() === '') {
      elements.push(<div key={`empty-${i}`} className="h-2" />);
      continue;
    }

    // Horizontal rule
    if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
      elements.push(
        <hr key={`hr-${i}`} className="my-3 border-stone-200 dark:border-zinc-800" />
      );
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className={`font-bold text-stone-900 dark:text-white my-2 ${compact ? 'text-base' : 'text-xl'}`}>
          {renderInline(line.slice(2))}
        </h1>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className={`font-bold text-stone-900 dark:text-stone-100 my-1.5 ${compact ? 'text-sm' : 'text-lg'}`}>
          {renderInline(line.slice(3))}
        </h2>
      );
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className={`font-semibold text-stone-800 dark:text-stone-200 my-1 ${compact ? 'text-xs' : 'text-base'}`}>
          {renderInline(line.slice(4))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={`h4-${i}`} className="font-semibold text-stone-700 dark:text-stone-300 my-1 text-sm">
          {renderInline(line.slice(5))}
        </h4>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="border-l-4 border-emerald-500 pl-3 py-1 my-1.5 text-stone-600 dark:text-stone-400 italic text-sm bg-stone-50/50 dark:bg-zinc-800/30 rounded-r"
        >
          {renderInline(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Checklist item [ ] or [x]
    const todoMatch = line.match(/^(\s*)-\s*\[([ xX])\]\s*(.*)$/);
    if (todoMatch) {
      const isChecked = todoMatch[2].toLowerCase() === 'x';
      const text = todoMatch[3];
      const currentTaskIndex = taskCounter++;

      elements.push(
        <div key={`task-${i}`} className="flex items-start gap-2.5 my-1 text-sm group">
          <input
            type="checkbox"
            checked={isChecked}
            disabled={!interactiveTasks}
            onChange={(e) => {
              e.stopPropagation();
              onToggleTask?.(currentTaskIndex, isChecked);
            }}
            className="mt-1 h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer transition"
          />
          <span
            className={`flex-1 transition ${
              isChecked
                ? 'line-through text-stone-400 dark:text-zinc-500'
                : 'text-stone-800 dark:text-stone-200'
            }`}
          >
            {renderInline(text)}
          </span>
        </div>
      );
      continue;
    }

    // Unordered list bullet
    if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2 my-0.5 text-sm pl-2">
          <span className="text-emerald-500 select-none mt-1 text-xs">•</span>
          <div className="flex-1 text-stone-800 dark:text-stone-200">
            {renderInline(line.slice(2))}
          </div>
        </div>
      );
      continue;
    }

    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s*(.*)$/);
    if (numMatch) {
      elements.push(
        <div key={`num-${i}`} className="flex items-start gap-2 my-0.5 text-sm pl-2">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 select-none text-xs mt-0.5">
            {numMatch[1]}.
          </span>
          <div className="flex-1 text-stone-800 dark:text-stone-200">
            {renderInline(numMatch[2])}
          </div>
        </div>
      );
      continue;
    }

    // Standard paragraph
    elements.push(
      <p key={`p-${i}`} className={`my-1 text-stone-800 dark:text-stone-200 leading-relaxed ${compact ? 'text-xs' : 'text-sm'}`}>
        {renderInline(line)}
      </p>
    );
  }

  // Flush remaining table or code block if any
  if (inTable) flushTable();

  return <div className={`markdown-body space-y-0.5 ${className}`}>{elements}</div>;
};
