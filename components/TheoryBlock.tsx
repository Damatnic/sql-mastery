'use client';

import { useMemo } from 'react';

interface TheoryBlockProps {
  content: string;
  className?: string;
}

export default function TheoryBlock({ content, className = '' }: TheoryBlockProps) {
  const renderedContent = useMemo(() => {
    return parseMarkdown(content);
  }, [content]);

  return (
    <div className={`prose prose-invert prose-slate max-w-none ${className}`}>
      {/* Content is from controlled lesson data, not user input */}
      <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
    </div>
  );
}

function parseMarkdown(markdown: string): string {
  let html = markdown;

  // Code blocks with language
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const language = lang || 'sql';
    const escapedCode = escapeHtml(code.trim());
    return `<pre class="bg-slate-900 rounded-lg p-4 overflow-x-auto border border-slate-700"><code class="language-${language} text-sm text-slate-200 font-mono">${escapedCode}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 text-sm font-mono">$1</code>');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-white mt-6 mb-3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mt-8 mb-4">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white mt-8 mb-4">$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-slate-300">$1</em>');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="text-slate-300 ml-4">$1</li>');
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="list-disc list-inside space-y-1 my-4">$&</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="text-slate-300 ml-4">$1</li>');

  // Tables — must run before paragraph conversion
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
        .map((h: string) => `<th class="px-4 py-2 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-700">${h}</th>`)
        .join('');

      const tbody = rows
        .map((cells: string[]) => {
          const tds = cells
            .map((c: string) => `<td class="px-4 py-2 text-slate-400 text-sm border-b border-slate-800">${c}</td>`)
            .join('');
          return `<tr class="hover:bg-slate-800/30">${tds}</tr>`;
        })
        .join('');

      return `<div class="overflow-x-auto my-6 rounded-lg border border-slate-700"><table class="w-full"><thead class="bg-slate-800/70"><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table></div>`;
    }
  );

  // Paragraphs
  html = html.replace(/^(?!<[hupltd]|<code|<pre|<div)(.+)$/gm, '<p class="text-slate-300 leading-relaxed my-4">$1</p>');

  // Clean up empty paragraphs
  html = html.replace(/<p[^>]*>\s*<\/p>/g, '');

  return html;
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
