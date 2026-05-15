'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import SQLEditor from './SQLEditor';
import ResultsTable from './ResultsTable';
import type { QueryResponse } from '@/lib/db';
import type { Database as SqlJsDatabase } from 'sql.js';

interface Challenge {
  id: string;
  prompt: string;
  hint?: string;
  expectedColumns: string[];
  validateFn: string;
  solution: string;
  noHint?: boolean;
}

interface ChallengeBlockProps {
  challenge: Challenge;
  database: SqlJsDatabase;
  runQuery: (db: SqlJsDatabase, sql: string) => QueryResponse;
  onComplete: () => void;
  onQueryChange?: (query: string, error?: string) => void;
  challengeNumber?: number;
  totalChallenges?: number;
  className?: string;
}


export default function ChallengeBlock({
  challenge,
  database,
  runQuery,
  onComplete,
  onQueryChange,
  challengeNumber,
  totalChallenges,
  className = '',
}: ChallengeBlockProps) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [executionTime, setExecutionTime] = useState<number | undefined>();
  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [copiedSolution, setCopiedSolution] = useState(false);
  const [validatorBroken, setValidatorBroken] = useState(false);
  const hasFiredCompleteRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem(`sql-mastery-code-${challenge.id}`);
    if (saved) {
      setQuery(saved);
    } else {
      setQuery('');
    }
    
    // Also reset other states on challenge change just in case
    setResult(null);
    setExecutionTime(undefined);
    setIsCorrect(false);
  }, [challenge.id]);

  useEffect(() => {
    if (query) {
      localStorage.setItem(`sql-mastery-code-${challenge.id}`, query);
    }
  }, [query, challenge.id]);

  const validateResult = useCallback(
    (queryResult: QueryResponse): boolean => {
      if (!queryResult.success) return false;
      if (queryResult.results.length === 0) return false;

      const resultSet = queryResult.results[0];

      // Validation helper uses 'rows' (array of objects) for easier writing in lesson files
      const rows = resultSet.values.map((row) => {
        const obj: Record<string, unknown> = {};
        resultSet.columns.forEach((col, i) => {
          obj[col] = row[i];
        });
        return obj;
      });

      // Check column names match
      const resultColumns = resultSet.columns.map((c) => c.toLowerCase());
      const expectedColumns = challenge.expectedColumns.map((c) => c.toLowerCase());
      const columnsMatch = expectedColumns.every((col) => resultColumns.includes(col));
      if (!columnsMatch) return false;

      // Run custom validation function if provided
      // SECURITY NOTE: validateFn comes from controlled lesson content, not user input
      if (challenge.validateFn) {
        try {
          const validateFn = new Function('rows', 'columns', 'values', challenge.validateFn);
          return validateFn(rows, resultSet.columns, resultSet.values);
        } catch (err) {
          console.warn(`[ChallengeBlock] validateFn threw for challenge ${challenge.id}:`, err);
          setValidatorBroken(true);
          return false;
        }
      }

      return true;
    },
    [challenge.expectedColumns, challenge.validateFn, challenge.id]
  );

  const handleRun = useCallback(() => {
    if (!query.trim()) return;

    setIsRunning(true);
    onQueryChange?.(query, undefined);

    setTimeout(() => {
      const startTime = performance.now();
      const queryResult = runQuery(database, query);
      const endTime = performance.now();
      setExecutionTime(Math.round(endTime - startTime));
      setResult(queryResult);

      const correct = validateResult(queryResult);
      setIsCorrect(correct);

      if (!queryResult.success) {
        onQueryChange?.(query, queryResult.error);
      }

      if (correct) {
        if (!hasFiredCompleteRef.current) {
          hasFiredCompleteRef.current = true;
          onComplete();
        }
      } else {
        setAttempts((prev) => prev + 1);
      }

      setIsRunning(false);
    }, 100);
  }, [query, database, runQuery, validateResult, onComplete, onQueryChange]);

  const handleReset = useCallback(() => {
    setQuery('');
    setResult(null);
    setExecutionTime(undefined);
    setIsCorrect(false);
    hasFiredCompleteRef.current = false;
  }, []);

  const handleCopySolution = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(challenge.solution);
      setCopiedSolution(true);
      setTimeout(() => setCopiedSolution(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [challenge.solution]);

  const handleUseSolution = useCallback(() => {
    setQuery(challenge.solution);
    setShowSolution(true);
  }, [challenge.solution]);

  const status = isCorrect
    ? '✓ done'
    : attempts > 0
    ? `${attempts} attempt${attempts !== 1 ? 's' : ''}`
    : 'todo';
  const statusClass = isCorrect
    ? 'text-emerald-400'
    : attempts > 0
    ? 'text-amber-400'
    : 'text-slate-500';

  return (
    <div className={`rounded border border-slate-800 bg-slate-900/40 ${className}`}>
      <div className="px-4 py-3 border-b border-slate-800 font-mono text-xs flex items-center justify-between">
        <span className="text-slate-400">
          <span className={challenge.noHint ? 'text-emerald-400' : 'text-indigo-400'}>
            # {challenge.noHint ? 'capstone' : 'challenge'}
          </span>
          {totalChallenges && challengeNumber && (
            <span className="text-slate-500"> {String(challengeNumber).padStart(2, '0')}/{String(totalChallenges).padStart(2, '0')}</span>
          )}
        </span>
        <span className={statusClass}>{status}</span>
      </div>

      {challenge.noHint && (
        <div className="px-4 py-2 border-b border-emerald-400/30 bg-emerald-400/[0.04] font-mono text-[11px] text-emerald-300">
          <span className="text-emerald-400">✦</span> no hint. work it. compose what you&apos;ve learned.
        </div>
      )}

      <div className="px-4 py-4 text-sm text-slate-200 leading-relaxed border-b border-slate-800/60">
        {challenge.prompt}
      </div>

      <div className="px-4 py-2 border-b border-slate-800/60 font-mono text-xs text-slate-400">
        <span className="text-indigo-400">columns: </span>
        <span className="text-slate-200">{challenge.expectedColumns.join(', ')}</span>
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
            {isCorrect ? (
              <p className="text-emerald-400">
                <span className="text-emerald-400">exit 0</span> · query matches expected columns
              </p>
            ) : result.success ? (
              <p className="text-amber-400">
                # validation failed · check your columns and try again
              </p>
            ) : null}

            <ResultsTable result={result} executionTime={executionTime} />

            {validatorBroken && (
              <p className="font-mono text-xs text-rose-400 border-l-2 border-rose-400 pl-3">
                <span className="font-semibold">!</span> validator error in this challenge. open devtools to see the cause and please report.
              </p>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2 border-t border-slate-800/60 font-mono text-xs">
          {challenge.hint && !showHint && !isCorrect && (
            <button
              onClick={() => setShowHint(true)}
              className="px-2 py-1 rounded border border-slate-800 text-amber-400 hover:bg-amber-400/10 hover:border-amber-400/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              show hint
            </button>
          )}
          {(() => {
            const solutionGate = challenge.noHint ? 6 : 3;
            if (attempts >= solutionGate && !isCorrect && !showSolution) {
              return (
                <button
                  onClick={handleUseSolution}
                  className="px-2 py-1 rounded border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  show solution
                </button>
              );
            }
            if (attempts > 0 && attempts < solutionGate && !isCorrect) {
              return (
                <span className="ml-auto text-slate-500">
                  {solutionGate - attempts} more attempt{solutionGate - attempts !== 1 ? 's' : ''} until solution unlocks
                </span>
              );
            }
            return null;
          })()}
        </div>

        {showHint && challenge.hint && (
          <p className="font-mono text-xs text-slate-300 border-l-2 border-amber-400/40 pl-3">
            <span className="text-amber-400">!</span> hint: {challenge.hint}
          </p>
        )}

        {showSolution && (
          <div className="rounded border border-slate-800 bg-slate-950">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 font-mono text-xs">
              <span className="text-slate-400"># solution</span>
              <button
                onClick={handleCopySolution}
                className="px-2 py-1 rounded border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                {copiedSolution ? (
                  <span className="text-emerald-400">copied</span>
                ) : (
                  <span>copy</span>
                )}
              </button>
            </div>
            <pre className="p-3 text-xs text-slate-200 font-mono overflow-x-auto">
              {challenge.solution}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
