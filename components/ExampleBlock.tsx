'use client';

import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import SQLEditor from './SQLEditor';
import ResultsTable from './ResultsTable';
import { runQuery, type QueryResponse } from '@/lib/db';
import type { Database as SqlJsDatabase } from 'sql.js';

interface Example {
  title: string;
  explanation: string;
  sql: string;
}

interface ExampleBlockProps {
  example: Example;
  database: SqlJsDatabase;
  index: number;
  onQueryChange?: (query: string) => void;
}

export default function ExampleBlock({ example, database, index, onQueryChange }: ExampleBlockProps) {
  const [query, setQuery] = useState(example.sql);
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [executionTime, setExecutionTime] = useState<number | undefined>();
  const [copied, setCopied] = useState(false);

  const handleChange = useCallback((val: string) => {
    setQuery(val);
    onQueryChange?.(val);
  }, [onQueryChange]);

  const handleRun = useCallback(() => {
    if (!query.trim()) return;
    const startTime = performance.now();
    const res = runQuery(database, query);
    const endTime = performance.now();
    setExecutionTime(Math.round(endTime - startTime));
    setResult(res);
    onQueryChange?.(query);
  }, [query, database, onQueryChange]);

  const handleReset = useCallback(() => {
    setQuery(example.sql);
    setResult(null);
    setExecutionTime(undefined);
    onQueryChange?.(example.sql);
  }, [example.sql, onQueryChange]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(query);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [query]);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600/80 transition-colors">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Example {index + 1}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded transition-colors"
          title="Copy SQL"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <h3 className="font-semibold text-white mb-1">{example.title}</h3>
      <p className="text-slate-400 text-sm mb-4">{example.explanation}</p>
      <SQLEditor
        value={query}
        onChange={handleChange}
        onRun={handleRun}
        onReset={handleReset}
        initialValue={example.sql}
        height="120px"
      />
      {result && <ResultsTable result={result} executionTime={executionTime} className="mt-4" />}
    </div>
  );
}
