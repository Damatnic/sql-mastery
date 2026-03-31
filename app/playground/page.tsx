'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Database, ArrowLeft, Key, Hash, Type, Sparkles } from 'lucide-react';
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
  company: { name: 'Company', description: 'Employees, Projects, Departments' },
  store: { name: 'Store', description: 'Products, Orders, Customers' },
  school: { name: 'School', description: 'Students, Courses, Teachers' },
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

  const getTypeIcon = (type: string, isPk?: boolean) => {
    if (isPk) return <Key className="w-3 h-3 text-amber-400" />;
    const upperType = type.toUpperCase();
    if (upperType.includes('INT')) return <Hash className="w-3 h-3 text-blue-400" />;
    if (upperType.includes('TEXT') || upperType.includes('VARCHAR')) return <Type className="w-3 h-3 text-green-400" />;
    if (upperType.includes('REAL') || upperType.includes('FLOAT')) return <Hash className="w-3 h-3 text-amber-400" />;
    return <Type className="w-3 h-3 text-slate-400" />;
  };

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

          <div className="flex items-center gap-3">
            {(Object.entries(databaseLabels) as [DatabaseName, { name: string; description: string }][]).map(([key, { name }]) => (
              <button
                key={key}
                onClick={() => setSelectedDb(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedDb === key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
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
                <ResultsTable result={result} executionTime={executionTime} />
              </>
            )}
          </div>

          {/* Schema Reference */}
          <div className="lg:sticky lg:top-8 lg:self-start space-y-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
                <Database className="w-4 h-4 text-indigo-400" />
                <h2 className="font-semibold text-white text-sm">
                  {databaseLabels[selectedDb].name} Database
                </h2>
              </div>
              <p className="px-4 py-2 text-xs text-slate-400 border-b border-slate-700/50">
                {databaseLabels[selectedDb].description}
              </p>

              <div className="p-3 space-y-3 max-h-[55vh] overflow-y-auto">
                {Object.entries(schema).map(([tableName, columns]) => (
                  <div key={tableName} className="bg-slate-900/50 rounded-lg p-3">
                    <h3 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
                      <span className="w-5 h-5 bg-amber-500/20 rounded flex items-center justify-center text-xs">T</span>
                      {tableName}
                    </h3>
                    <ul className="space-y-1">
                      {columns.map((col) => (
                        <li key={col.name} className="text-xs flex items-center gap-2 py-0.5">
                          {getTypeIcon(col.type, col.pk)}
                          <span className={col.pk ? 'text-amber-300 font-medium' : 'text-slate-200'}>{col.name}</span>
                          <span className="ml-auto text-slate-600 font-mono text-[10px]">{col.type}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-indigo-900/20 border border-indigo-700/30 rounded-lg">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-400">
                  <p className="font-medium text-indigo-300 mb-1">Pro Tip</p>
                  <p>Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">Enter</kbd> to run your query. All queries run locally in your browser using SQLite.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
