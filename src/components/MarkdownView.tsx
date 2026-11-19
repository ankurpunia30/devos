'use client';

import React from 'react';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export function MarkdownView({ content, className = '' }: MarkdownViewProps) {
  if (!content) return null;

  // Split into lines and parse block-level structures
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockLines: string[] = [];
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (listItems.length === 0) return;
    const currentItems = [...listItems];
    const currentType = listType;
    listItems = [];
    listType = null;

    if (currentType === 'ul') {
      elements.push(
        <ul key={`ul-${elements.length}`} className="my-2 space-y-1.5 pl-4 list-disc marker:text-brand-400">
          {currentItems.map((item, idx) => (
            <li key={idx} className="text-xs text-surface-200 leading-relaxed">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      );
    } else {
      elements.push(
        <ol key={`ol-${elements.length}`} className="my-2 space-y-1.5 pl-4 list-decimal marker:text-surface-400">
          {currentItems.map((item, idx) => (
            <li key={idx} className="text-xs text-surface-200 leading-relaxed">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ol>
      );
    }
  };

  const flushCodeBlock = () => {
    if (codeBlockLines.length === 0 && !inCodeBlock) return;
    const code = codeBlockLines.join('\n');
    const lang = codeBlockLang;
    codeBlockLines = [];
    codeBlockLang = '';
    elements.push(
      <CodeBlock key={`code-${elements.length}`} code={code} language={lang} />
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle (```)
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        inCodeBlock = false;
        flushCodeBlock();
      } else {
        // Start of code block
        flushList();
        inCodeBlock = true;
        codeBlockLang = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Unordered list item (- or *)
    const ulMatch = line.match(/^[-*]\s+(.*)$/);
    if (ulMatch) {
      if (listType === 'ol') flushList();
      listType = 'ul';
      listItems.push(ulMatch[1]);
      continue;
    }

    // Ordered list item (1. 2.)
    const olMatch = line.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      if (listType === 'ul') flushList();
      listType = 'ol';
      listItems.push(olMatch[1]);
      continue;
    }

    // Line is not a list item -> flush any accumulated list
    flushList();

    // Empty line
    if (!line.trim()) {
      elements.push(<div key={`sp-${elements.length}`} className="h-2" />);
      continue;
    }

    // Horizontal Rule (---)
    if (line.trim().match(/^---+$/)) {
      elements.push(
        <hr key={`hr-${elements.length}`} className="my-3 border-white/[0.08]" />
      );
      continue;
    }

    // Headers
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${elements.length}`} className="text-base font-bold text-white tracking-tight mt-3 mb-1.5 flex items-center gap-1.5">
          {renderInlineMarkdown(line.slice(2))}
        </h1>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${elements.length}`} className="text-sm font-bold text-white tracking-tight mt-3 mb-1">
          {renderInlineMarkdown(line.slice(3))}
        </h2>
      );
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${elements.length}`} className="text-xs font-bold text-brand-300 tracking-tight mt-2.5 mb-1 flex items-center gap-1">
          {renderInlineMarkdown(line.slice(4))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={`h4-${elements.length}`} className="text-[11px] font-semibold text-surface-300 uppercase tracking-wider mt-2 mb-0.5">
          {renderInlineMarkdown(line.slice(5))}
        </h4>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('>')) {
      const bqText = line.replace(/^>\s*/, '');
      elements.push(
        <blockquote
          key={`bq-${elements.length}`}
          className="pl-3 py-1 my-1.5 border-l-2 border-brand-500/50 bg-white/[0.02] rounded-r-lg text-xs italic text-surface-300"
        >
          {renderInlineMarkdown(bqText)}
        </blockquote>
      );
      continue;
    }

    // Standard paragraph line
    elements.push(
      <p key={`p-${elements.length}`} className="text-xs text-surface-200 leading-relaxed my-0.5">
        {renderInlineMarkdown(line)}
      </p>
    );
  }

  // Final flushes
  flushList();
  if (inCodeBlock) flushCodeBlock();

  return <div className={`markdown-body space-y-1 ${className}`}>{elements}</div>;
}

/**
 * Render inline tokens: bold, italic, code spans, links, and status pills
 */
function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // Regex tokens: code span (`...`), bold (**...**), links ([...](...))
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    // 1. Inline code: `code`
    const codeMatch = remaining.match(/^(.*?)`([^`]+)`(.*)$/s);
    // 2. Bold: **text**
    const boldMatch = remaining.match(/^(.*?)\*\*([^*]+)\*\*(.*)$/s);
    // 3. Link: [text](url)
    const linkMatch = remaining.match(/^(.*?)\[([^\]]+)\]\(([^)]+)\)(.*)$/s);

    // Find earliest match
    let earliestType: 'code' | 'bold' | 'link' | null = null;
    let earliestIndex = Infinity;

    if (codeMatch && codeMatch[1].length < earliestIndex) {
      earliestIndex = codeMatch[1].length;
      earliestType = 'code';
    }
    if (boldMatch && boldMatch[1].length < earliestIndex) {
      earliestIndex = boldMatch[1].length;
      earliestType = 'bold';
    }
    if (linkMatch && linkMatch[1].length < earliestIndex) {
      earliestIndex = linkMatch[1].length;
      earliestType = 'link';
    }

    if (!earliestType) {
      parts.push(renderFormattingPills(remaining, keyIdx++));
      break;
    }

    if (earliestType === 'code' && codeMatch) {
      if (codeMatch[1]) parts.push(renderFormattingPills(codeMatch[1], keyIdx++));
      parts.push(
        <code
          key={`code-${keyIdx++}`}
          className="px-1.5 py-0.5 rounded bg-white/[0.08] text-brand-300 font-mono text-[11px] border border-white/[0.06]"
        >
          {codeMatch[2]}
        </code>
      );
      remaining = codeMatch[3];
    } else if (earliestType === 'bold' && boldMatch) {
      if (boldMatch[1]) parts.push(renderFormattingPills(boldMatch[1], keyIdx++));
      parts.push(
        <strong key={`bold-${keyIdx++}`} className="font-semibold text-white">
          {renderInlineMarkdown(boldMatch[2])}
        </strong>
      );
      remaining = boldMatch[3];
    } else if (earliestType === 'link' && linkMatch) {
      if (linkMatch[1]) parts.push(renderFormattingPills(linkMatch[1], keyIdx++));
      parts.push(
        <a
          key={`link-${keyIdx++}`}
          href={linkMatch[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-400 hover:text-brand-300 underline underline-offset-2 transition-colors font-medium"
        >
          {linkMatch[2]}
        </a>
      );
      remaining = linkMatch[4];
    }
  }

  return <>{parts}</>;
}

function renderFormattingPills(text: string, key: number): React.ReactNode {
  // Highlight common status badges like [BLOCKED], [CRITICAL], [TODO], [HIGH]
  const statusPattern = /\[(BLOCKED|CRITICAL|HIGH|MEDIUM|LOW|DONE|TODO|ACCEPTED|PROPOSED|IN PROGRESS)\]/gi;
  if (!statusPattern.test(text)) {
    return text;
  }

  const parts = text.split(/(\[(?:BLOCKED|CRITICAL|HIGH|MEDIUM|LOW|DONE|TODO|ACCEPTED|PROPOSED|IN PROGRESS)\])/gi);
  return (
    <span key={`pill-wrap-${key}`}>
      {parts.map((part, idx) => {
        const upper = part.toUpperCase();
        if (upper === '[BLOCKED]' || upper === '[CRITICAL]') {
          return (
            <span key={idx} className="inline-block px-1.5 py-0.2 mx-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold">
              {part}
            </span>
          );
        }
        if (upper === '[HIGH]') {
          return (
            <span key={idx} className="inline-block px-1.5 py-0.2 mx-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
              {part}
            </span>
          );
        }
        if (upper === '[DONE]' || upper === '[ACCEPTED]') {
          return (
            <span key={idx} className="inline-block px-1.5 py-0.2 mx-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
              {part}
            </span>
          );
        }
        return part;
      })}
    </span>
  );
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2.5 rounded-xl bg-[#090a0d] border border-white/[0.08] overflow-hidden text-xs font-mono">
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.03] border-b border-white/[0.06] text-[10px] text-surface-400">
        <span className="font-semibold uppercase tracking-wider text-surface-400">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition px-1.5 py-0.5 rounded hover:bg-white/[0.05]"
          title="Copy code"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto leading-relaxed text-surface-200">
        <pre className="font-mono text-[11px] whitespace-pre">{code}</pre>
      </div>
    </div>
  );
}
