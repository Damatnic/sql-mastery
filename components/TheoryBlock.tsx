'use client';

import { useMemo } from 'react';

interface TheoryBlockProps {
  content: string;
  className?: string;
}

// SQL keywords for syntax highlighting
const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'OFFSET',
  'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN', 'ON',
  'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'IS', 'NULL', 'AS', 'DISTINCT',
  'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'TABLE', 'INDEX',
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
  'UNION', 'INTERSECT', 'EXCEPT', 'EXISTS', 'ANY', 'ALL', 'WITH', 'RECURSIVE',
  'ASC', 'DESC', 'NULLS', 'FIRST', 'LAST', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES'
];

export default function TheoryBlock({ content, className = '' }: TheoryBlockProps) {
  const renderedContent = useMemo(() => {
    return parseMarkdown(content);
  }, [content]);

  // Content is from controlled lesson data (not user input), sanitization not required
  return (
    <div className={`theory-block space-y-6 ${className}`}>
      <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
    </div>
  );
}

function parseMarkdown(markdown: string): string {
  let html = markdown;

  // First, handle special callout blocks before other processing
  // Key Concept callouts
  html = html.replace(
    /(?:^|\n)>\s*💡\s*\*\*Key Concept[:\s]*\*\*\s*(.+?)(?=\n[^>]|\n\n|$)/gi,
    (_, content) => `
    <div class="callout callout-key-concept">
      <div class="callout-icon"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg></div>
      <div class="callout-content"><span class="callout-title">Key Concept</span>${escapeHtml(content.trim())}</div>
    </div>`
  );

  // Why This Matters callouts
  html = html.replace(
    /(?:^|\n)>\s*🎯\s*\*\*Why This Matters[:\s]*\*\*\s*(.+?)(?=\n[^>]|\n\n|$)/gi,
    (_, content) => `
    <div class="callout callout-why-matters">
      <div class="callout-icon"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg></div>
      <div class="callout-content"><span class="callout-title">Why This Matters</span>${escapeHtml(content.trim())}</div>
    </div>`
  );

  // Common Mistake callouts
  html = html.replace(
    /(?:^|\n)>\s*⚠️\s*\*\*Common Mistake[:\s]*\*\*\s*(.+?)(?=\n[^>]|\n\n|$)/gi,
    (_, content) => `
    <div class="callout callout-warning">
      <div class="callout-icon"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg></div>
      <div class="callout-content"><span class="callout-title">Common Mistake</span>${escapeHtml(content.trim())}</div>
    </div>`
  );

  // Pro Tip callouts
  html = html.replace(
    /(?:^|\n)>\s*⚡\s*\*\*Pro Tip[:\s]*\*\*\s*(.+?)(?=\n[^>]|\n\n|$)/gi,
    (_, content) => `
    <div class="callout callout-pro-tip">
      <div class="callout-icon"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></div>
      <div class="callout-content"><span class="callout-title">Pro Tip</span>${escapeHtml(content.trim())}</div>
    </div>`
  );

  // Code blocks with language — apply syntax highlighting for SQL
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const language = lang || 'sql';
    const trimmedCode = code.trim();
    const highlightedCode = language === 'sql' ? highlightSQL(trimmedCode) : escapeHtml(trimmedCode);
    return `
    <div class="code-block-wrapper">
      <div class="code-block-header">
        <span class="code-block-lang">${language.toUpperCase()}</span>
        <span class="code-block-label">Syntax</span>
      </div>
      <pre class="code-block"><code class="language-${language}">${highlightedCode}</code></pre>
    </div>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Section headers with special styling based on content
  html = html.replace(/^## (Mental Model|How It Works|When To Use This|Syntax|Operators|Key Rules|Key Points|Overview)$/gm, (_, title) => {
    const icons: Record<string, string> = {
      'Mental Model': '<svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>',
      'How It Works': '<svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>',
      'When To Use This': '<svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>',
      'Syntax': '<svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>',
      'Operators': '<svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>',
      'Key Rules': '<svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>',
      'Key Points': '<svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
      'Overview': '<svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>'
    };
    const icon = icons[title] || '';
    return `<h2 class="section-header section-header-special">${icon}<span>${title}</span></h2>`;
  });

  // Regular headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="section-header section-header-h3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="section-header section-header-h2">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="section-header section-header-h1">$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em class="text-slate-300 italic">$1</em>');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="theory-list-item">$1</li>');
  html = html.replace(/(<li class="theory-list-item">.*<\/li>\n?)+/g, '<ul class="theory-list">$&</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="theory-list-item theory-list-ordered">$1</li>');

  // Tables — enhanced styling with zebra stripes
  html = html.replace(
    /^\|(.+)\|\s*\n\|[-| :]+\|\s*\n((?:\|.+\|\s*\n?)*)/gm,
    (_, headerRow, bodyRows) => {
      const headers = headerRow.split('|').map((h: string) => h.trim()).filter(Boolean);
      const rows = bodyRows
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((row: string) =>
          row.split('|').map((c: string) => c.trim()).filter(Boolean)
        );

      const thead = headers
        .map((h: string) => `<th class="theory-table-header">${h}</th>`)
        .join('');

      const tbody = rows
        .map((cells: string[], idx: number) => {
          const tds = cells
            .map((c: string) => `<td class="theory-table-cell">${c}</td>`)
            .join('');
          return `<tr class="theory-table-row ${idx % 2 === 1 ? 'theory-table-row-alt' : ''}">${tds}</tr>`;
        })
        .join('');

      return `<div class="theory-table-wrapper"><table class="theory-table"><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table></div>`;
    }
  );

  // Paragraphs — exclude already-processed elements
  html = html.replace(/^(?!<[hupltd]|<code|<pre|<div|<ul|<ol|<li)(.+)$/gm, '<p class="theory-paragraph">$1</p>');

  // Clean up empty paragraphs
  html = html.replace(/<p[^>]*>\s*<\/p>/g, '');

  return html;
}

function highlightSQL(sql: string): string {
  let highlighted = escapeHtml(sql);

  // Highlight SQL keywords (case-insensitive, word boundaries)
  SQL_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
    highlighted = highlighted.replace(regex, '<span class="sql-keyword">$1</span>');
  });

  // Highlight strings (single quotes)
  highlighted = highlighted.replace(/'([^']*)'/g, '<span class="sql-string">\'$1\'</span>');

  // Highlight numbers
  highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="sql-number">$1</span>');

  // Highlight comments
  highlighted = highlighted.replace(/(--.*$)/gm, '<span class="sql-comment">$1</span>');

  // Highlight placeholders like column1, table_name, etc.
  highlighted = highlighted.replace(/\b(column\d*|table_name|columns|table|condition|value\d*|expression)\b/gi, '<span class="sql-placeholder">$1</span>');

  return highlighted;
}

function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
}
