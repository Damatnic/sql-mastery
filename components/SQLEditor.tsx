'use client';

import { useCallback } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import Monaco to prevent SSR issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then(mod => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-[200px] bg-slate-900 rounded flex items-center justify-center font-mono text-xs text-slate-500">
        loading editor…
      </div>
    ),
  }
);

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onReset?: () => void;
  readOnly?: boolean;
  height?: string;
  initialValue?: string;
  isRunning?: boolean;
}

export default function SQLEditor({
  value,
  onChange,
  onRun,
  onReset,
  readOnly = false,
  height = '200px',
  initialValue,
  isRunning = false,
}: SQLEditorProps) {
  const handleEditorChange = useCallback(
    (newValue: string | undefined) => {
      onChange(newValue ?? '');
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Ctrl/Cmd + Enter to run query
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        onRun();
      }
    },
    [onRun]
  );

  const handleReset = useCallback(() => {
    if (onReset) {
      onReset();
    } else if (initialValue !== undefined) {
      onChange(initialValue);
    }
  }, [onReset, initialValue, onChange]);

  return (
    <div className="rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
      <div onKeyDown={handleKeyDown}>
        <MonacoEditor
          height={height}
          language="sql"
          theme="vs-dark"
          value={value}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            readOnly,
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: 'line',
            cursorBlinking: 'smooth',
            folding: false,
            lineDecorationsWidth: 8,
            lineNumbersMinChars: 3,
            overviewRulerBorder: false,
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
          }}
        />
      </div>

      <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border-t border-slate-800 font-mono text-xs">
        <button
          onClick={onRun}
          disabled={isRunning || readOnly}
          className="px-2 py-1 rounded border border-indigo-400 text-indigo-400 hover:bg-indigo-400/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          {isRunning ? 'running…' : 'run'}
        </button>

        {(onReset || initialValue !== undefined) && (
          <button
            onClick={handleReset}
            disabled={readOnly}
            className="px-2 py-1 rounded border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            reset
          </button>
        )}

        <span className="ml-auto text-slate-500">
          <kbd className="opacity-70">⌘↵</kbd> to run
        </span>
      </div>
    </div>
  );
}
