'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Database, ArrowLeft, Info } from 'lucide-react';
import SQLEditor from '@/components/SQLEditor';
import ResultsTable from '@/components/ResultsTable';
import { createDatabase, runQuery, getDatabaseSchema, type QueryResponse } from '@/lib/db';
import { COMPANY_DB, STORE_DB, SCHOOL_DB, type DatabaseName } from '@/lib/databases';
import type { Database as SqlJsDatabase } from 'sql.js';

const databases: Record<DatabaseName, string> = {
  company: COMPANY_DB,
  store: STORE_DB,
  school: SCHOOL_DB,
};

const databaseLabels: Record<DatabaseName, string> = {
  company: 'Company (Employees, Projects)',
  store: 'Store (E-commerce)',
  school: 'School (Students, Courses)',
};

export default function PlaygroundPage() {
  const [selectedDb, setSelectedDb] = useState<DatabaseName>('company');
  const [database, setDatabase] = useState<SqlJsDatabase | null>(null);
  const [schema, setSchema] = useState<Record<string, Array<{ name: string; type: string }>>>({});
  const [query, setQuery] = useState('SELECT * FROM employees LIMIT 10;');
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  // Initialize database
  useEffect(() => {
    let mounted = true;

    async function initDb() {
      setIsLoading(true);
      try {
        const db = await createDatabase(databases[selectedDb]);
        if (mounted) {
          setDatabase(db);
          setSchema(getDatabaseSchema(db));
          setResult(null);
        }
      } catch (error) {
        console.error('Failed to initialize database:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initDb();

    return () => {
      mounted = false;
    };
  }, [selectedDb]);

  const handleRun = useCallback(() => {
    if (!database || !query.trim()) return;

    setIsRunning(true);
    setTimeout(() => {
      const queryResult = runQuery(database, query);
      setResult(queryResult);
      setIsRunning(false);
    }, 50);
  }, [database, query]);

  const defaultQueries: Record<DatabaseName, string> = {
    company: 'SELECT * FROM employees LIMIT 10;',
    store: 'SELECT * FROM products LIMIT 10;',
    school: 'SELECT * FROM students LIMIT 10;',
  };

  const handleReset = useCallback(() => {
    setQuery(defaultQueries[selectedDb]);
    setResult(null);
  }, [selectedDb]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/learn"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <Database className="w-6 h-6 text-indigo-500" />
            <span className="font-bold text-white text-lg">SQL Playground</span>
          </Link>

          <select
            value={selectedDb}
            onChange={(e) => setSelectedDb(e.target.value as DatabaseName)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {Object.entries(databaseLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[1fr,300px] gap-8">
          {/* Main Editor Area */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="h-[300px] bg-slate-900 rounded-lg flex items-center justify-center">
                <div className="text-slate-400">Loading database...</div>
              </div>
            ) : (
              <>
                <SQLEditor
                  value={query}
                  onChange={setQuery}
                  onRun={handleRun}
                  onReset={handleReset}
                  isRunning={isRunning}
                  height="200px"
                />
                <ResultsTable result={result} />
              </>
            )}
          </div>

          {/* Schema Reference */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-indigo-400" />
                <h2 className="font-semibold text-white">Schema Reference</h2>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {Object.entries(schema).map(([tableName, columns]) => (
                  <div key={tableName}>
                    <h3 className="text-sm font-semibold text-indigo-400 mb-2">{tableName}</h3>
                    <ul className="space-y-1">
                      {columns.map((col) => (
                        <li key={col.name} className="text-xs text-slate-400 flex items-center gap-2">
                          <span className="text-slate-200">{col.name}</span>
                          <span className="text-slate-600">{col.type}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
              <p className="text-xs text-slate-500">
                <strong className="text-slate-400">Tip:</strong> Press Ctrl+Enter to run your query.
                All queries run locally in your browser using SQLite.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
