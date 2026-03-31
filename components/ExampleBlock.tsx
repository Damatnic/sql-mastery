'use client';

import { useState, useCallback } from 'react';
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

  const handleChange = useCallback((val: string) => {
    setQuery(val);
    onQueryChange?.(val);
  }, [onQueryChange]);

  const handleRun = useCallback(() => {
    if (!query.trim()) return;
    const res = runQuery(database, query);
    setResult(res);
    onQueryChange?.(query);
  }, [query, database, onQueryChange]);

  const handleReset = useCallback(() => {
    setQuery(example.sql);
    setResult(null);
    onQueryChange?.(example.sql);
  }, [example.sql, onQueryChange]);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Example {index + 1}
        </span>
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
      {result && <ResultsTable result={result} className="mt-4" />}
    </div>
  );
}
