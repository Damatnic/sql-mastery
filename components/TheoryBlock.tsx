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

  // Paragraphs
  html = html.replace(/^(?!<[huplo]|<code|<pre)(.+)$/gm, '<p class="text-slate-300 leading-relaxed my-4">$1</p>');

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
