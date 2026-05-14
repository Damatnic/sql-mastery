'use client';

import { useState, useCallback } from 'react';
import SQLEditor from './SQLEditor';
import ResultsTable from './ResultsTable';
import type { QueryResponse } from '@/lib/db';
import type { Database as SqlJsDatabase } from 'sql.js';
import type { ProjectStep as ProjectStepType } from '@/lib/projects';

interface ProjectStepProps {
  step: ProjectStepType;
  stepIndex: number;
  totalSteps: number;
  database: SqlJsDatabase;
  runQuery: (db: SqlJsDatabase, sql: string) => QueryResponse;
  isCompleted: boolean;
  isLocked: boolean;
  onComplete: () => void;
  onQueryChange?: (query: string, error?: string) => void;
}

export default function ProjectStep({
  step,
  stepIndex,
  totalSteps,
  database,
  runQuery,
  isCompleted,
  isLocked,
  onComplete,
  onQueryChange,
}: ProjectStepProps) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState(isCompleted);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!isCompleted && !isLocked);

  const validateResult = useCallback(
    (queryResult: QueryResponse): boolean => {
      if (!queryResult.success) return false;
      if (queryResult.results.length === 0) return false;

      const resultSet = queryResult.results[0];

      // Check column names match
      const resultColumns = resultSet.columns.map((c) => c.toLowerCase());
      const expectedColumns = step.expectedColumns.map((c) => c.toLowerCase());
      const columnsMatch = expectedColumns.every((col) =>
        resultColumns.some((rc) => rc.includes(col) || col.includes(rc))
      );
      if (!columnsMatch) return false;

      // Run custom validation function if provided
      // NOTE: validateFn comes from controlled project content (lib/projects.ts), not user input
      if (step.validateFn) {
        try {
          const validateFn = new Function('results', 'columns', 'values', step.validateFn);
          return validateFn(queryResult.results, resultSet.columns, resultSet.values);
        } catch {
          return false;
        }
      }

      return true;
    },
    [step.expectedColumns, step.validateFn]
  );

  const handleRun = useCallback(() => {
    if (!query.trim()) return;

    setIsRunning(true);
    onQueryChange?.(query, undefined);

    setTimeout(() => {
      const queryResult = runQuery(database, query);
      setResult(queryResult);

      const correct = validateResult(queryResult);
      setIsCorrect(correct);

      if (!queryResult.success) {
        onQueryChange?.(query, queryResult.error);
      }

      if (correct && !isCompleted) {
        onComplete();
      } else if (!correct) {
        setAttempts((prev) => prev + 1);
      }

      setIsRunning(false);
    }, 100);
  }, [query, database, runQuery, validateResult, onComplete, onQueryChange, isCompleted]);

  const handleReset = useCallback(() => {
    setQuery('');
    setResult(null);
    if (!isCompleted) {
      setIsCorrect(false);
    }
  }, [isCompleted]);

  const handleUseSolution = useCallback(() => {
    setQuery(step.solution);
    setShowSolution(true);
  }, [step.solution]);

  if (isLocked) {
    return (
      <div className="rounded border border-slate-800 bg-slate-900/30 opacity-60 p-4 font-mono text-sm">
        <p className="text-xs text-slate-500">
          <span className="text-slate-600">[locked]</span> step {String(stepIndex + 1).padStart(2, '0')}/{String(totalSteps).padStart(2, '0')}
        </p>
        <p className="mt-1 text-slate-500">{step.title}</p>
      </div>
    );
  }

  const done = isCorrect || isCompleted;

  return (
    <div
      className={`rounded border transition-colors ${
        done ? 'border-emerald-700/50 bg-emerald-900/5' : 'border-slate-800 bg-slate-900/40'
      }`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center gap-3 hover:bg-slate-800/40 transition-colors text-left font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
        aria-expanded={isExpanded}
      >
        <span
          aria-hidden="true"
          className={`text-sm w-4 ${done ? 'text-emerald-400' : 'text-indigo-400'}`}
        >
          {done ? '✓' : '>'}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500">
            step {String(stepIndex + 1).padStart(2, '0')}/{String(totalSteps).padStart(2, '0')}
            {done && <span className="ml-2 text-emerald-400">· done</span>}
          </p>
          <p className="text-sm text-slate-100 truncate">{step.title}</p>
        </div>
        <span aria-hidden="true" className="text-xs text-slate-400">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>

      {isExpanded && (
        <div className="border-t border-slate-800">
          <div className="p-4 bg-slate-950/40 border-b border-slate-800">
            <p className="text-slate-300 text-sm leading-relaxed">{step.context}</p>
            <p className="text-slate-400 text-sm mt-3">
              <span className="font-mono text-xs text-indigo-400"># task: </span>
              {step.description}
            </p>
          </div>

          <div className="p-4 space-y-4">
            <SQLEditor
              value={query}
              onChange={setQuery}
              onRun={handleRun}
              onReset={handleReset}
              isRunning={isRunning}
              height="150px"
            />

            {result && (
              <div className="space-y-3 font-mono text-xs">
                {done ? (
                  <p className="text-emerald-400">
                    <span className="text-emerald-400">exit 0</span> · step validated
                  </p>
                ) : result.success ? (
                  <p className="text-amber-400">
                    # validation failed · check the query and try again
                  </p>
                ) : null}

                <ResultsTable result={result} />
              </div>
            )}

            {!done && (
              <div className="flex items-center gap-3 pt-1 font-mono text-xs">
                {step.hint && !showHint && (
                  <button
                    onClick={() => setShowHint(true)}
                    className="px-2 py-1 rounded border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  >
                    show hint
                  </button>
                )}
                {attempts >= 3 && !showSolution && (
                  <button
                    onClick={handleUseSolution}
                    className="px-2 py-1 rounded border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  >
                    show solution
                  </button>
                )}
                {attempts > 0 && (
                  <span className="ml-auto text-slate-500">attempts: {attempts}</span>
                )}
              </div>
            )}

            {showHint && step.hint && !done && (
              <p className="font-mono text-xs text-slate-300 border-l-2 border-indigo-400/40 pl-3">
                <span className="text-indigo-400">!</span> hint: {step.hint}
              </p>
            )}

            {showSolution && !done && (
              <div className="rounded border border-slate-800 bg-slate-950 p-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-2"># solution</p>
                <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap">
                  {step.solution}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
