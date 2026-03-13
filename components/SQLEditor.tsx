'use client';

import { useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Play, RotateCcw, Loader2 } from 'lucide-react';

// Dynamic import Monaco to prevent SSR issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then(mod => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-[200px] bg-slate-900 rounded-lg flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
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

      <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border-t border-slate-700">
        <button
          onClick={onRun}
          disabled={isRunning || readOnly}
          className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run
            </>
          )}
        </button>

        {(onReset || initialValue !== undefined) && (
          <button
            onClick={handleReset}
            disabled={readOnly}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-slate-300 text-sm font-medium rounded-md transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        )}

        <span className="ml-auto text-xs text-slate-500">
          Ctrl+Enter to run
        </span>
      </div>
    </div>
  );
}
