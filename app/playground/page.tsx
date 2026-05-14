'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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

const databaseLabels: Record<DatabaseName, { name: string; description: string }> = {
  company: { name: 'company', description: 'Employees, Projects, Departments' },
  store: { name: 'store', description: 'Products, Orders, Customers' },
  school: { name: 'school', description: 'Students, Courses, Teachers' },
};

export default function PlaygroundPage() {
  const [selectedDb, setSelectedDb] = useState<DatabaseName>('company');
  const [database, setDatabase] = useState<SqlJsDatabase | null>(null);
  const [schema, setSchema] = useState<Record<string, Array<{ name: string; type: string; pk?: boolean }>>>({});
  const [query, setQuery] = useState('SELECT * FROM employees LIMIT 10;');
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [executionTime, setExecutionTime] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

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
      } catch {
        // db unavailable; handled by the schema panel showing nothing
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
      const startTime = performance.now();
      const queryResult = runQuery(database, query);
      const endTime = performance.now();
      setExecutionTime(Math.round(endTime - startTime));
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
    setExecutionTime(undefined);
  }, [selectedDb]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between text-xs font-mono">
          <Link
            href="/"
            className="text-slate-400 hover:text-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
          >
            <span className="text-indigo-400">$</span> cd ~
          </Link>
          <div className="flex items-center gap-5">
            <Link
              href="/learn"
              className="text-slate-400 hover:text-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
            >
              lessons
            </Link>
            <Link
              href="/projects"
              className="text-slate-400 hover:text-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
            >
              projects
            </Link>
            <span className="text-slate-100">&gt; playground</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <section className="font-mono text-sm mb-6">
          <p>
            <span className="text-indigo-400">damato@sql</span>
            <span className="text-slate-500">:</span>
            <span className="text-slate-500">~/playground$</span>{' '}
            <span>sqlite3 {selectedDb}.db</span>
            <span className="ml-1 inline-block w-2 h-4 align-text-bottom bg-slate-100 terminal-cursor" aria-hidden="true" />
          </p>
        </section>

        <section className="mb-6 font-mono text-xs">
          <p className="text-slate-500 mb-2"># database</p>
          <div className="flex flex-wrap items-center gap-2">
            {(Object.entries(databaseLabels) as [DatabaseName, { name: string; description: string }][]).map(([key, { name }]) => (
              <button
                key={key}
                onClick={() => setSelectedDb(key)}
                className={`px-2 py-1 rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                  selectedDb === key
                    ? 'border-indigo-400 text-indigo-400 bg-indigo-400/10'
                    : 'border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-600'
                }`}
                aria-pressed={selectedDb === key}
              >
                {selectedDb === key && '> '}{name}
              </button>
            ))}
            <span className="text-slate-500 ml-2">{databaseLabels[selectedDb].description}</span>
          </div>
        </section>

        <div className="grid lg:grid-cols-[1fr,300px] gap-6">
          <div className="space-y-4">
            {isLoading ? (
              <div className="h-[300px] bg-slate-900 rounded border border-slate-800 flex items-center justify-center font-mono text-xs text-slate-500">
                loading {selectedDb}.db…
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
                <ResultsTable result={result} executionTime={executionTime} />
              </>
            )}
          </div>

          <aside className="lg:sticky lg:top-8 lg:self-start space-y-4 font-mono">
            <div className="rounded border border-slate-800 bg-slate-900/40">
              <div className="px-3 py-2 border-b border-slate-800 text-xs text-slate-400">
                # schema · {databaseLabels[selectedDb].name}.db
              </div>
              <div className="p-3 space-y-3 max-h-[55vh] overflow-y-auto text-xs">
                {Object.entries(schema).map(([tableName, columns]) => (
                  <div key={tableName}>
                    <p className="text-indigo-400 mb-1">.tables: {tableName}</p>
                    <ul className="space-y-0.5 pl-3 border-l border-slate-800">
                      {columns.map((col) => (
                        <li key={col.name} className="grid grid-cols-[1fr_auto] gap-2 items-baseline">
                          <span className={col.pk ? 'text-amber-300' : 'text-slate-200'}>
                            {col.pk && <span aria-label="primary key" className="text-amber-400">*</span>}
                            {col.name}
                          </span>
                          <span className="text-[10px] text-slate-600">{col.type.toLowerCase()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-500">
              # <kbd className="text-slate-400">⌘↵</kbd> to run · queries run locally via sql.js
            </p>
          </aside>
        </div>
      </main>

      <footer className="border-t border-slate-800/60 py-5 font-mono text-xs">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3 text-slate-500">
          <span><span className="text-emerald-400">exit 0</span> · personal use · next.js + sql.js</span>
          <Link
            href="/"
            className="hover:text-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
          >
            ~ home
          </Link>
        </div>
      </footer>
    </div>
  );
}
