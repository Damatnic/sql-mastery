'use client';

import { useState, useCallback } from 'react';
import { Target, Lightbulb, CheckCircle2, XCircle, Eye, Copy, Check } from 'lucide-react';
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
}

interface ChallengeBlockProps {
  challenge: Challenge;
  database: SqlJsDatabase;
  runQuery: (db: SqlJsDatabase, sql: string) => QueryResponse;
  onComplete: () => void;
  onQueryChange?: (query: string, error?: string) => void;
  className?: string;
}

export default function ChallengeBlock({
  challenge,
  database,
  runQuery,
  onComplete,
  onQueryChange,
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

  const validateResult = useCallback(
    (queryResult: QueryResponse): boolean => {
      if (!queryResult.success) return false;
      if (queryResult.results.length === 0) return false;

      const resultSet = queryResult.results[0];

      // Check column names match
      const resultColumns = resultSet.columns.map((c) => c.toLowerCase());
      const expectedColumns = challenge.expectedColumns.map((c) => c.toLowerCase());
      const columnsMatch = expectedColumns.every((col) => resultColumns.includes(col));
      if (!columnsMatch) return false;

      // Run custom validation function if provided
      // NOTE: validateFn comes from controlled lesson content, not user input
      if (challenge.validateFn) {
        try {
          const validateFn = new Function('results', 'columns', 'values', challenge.validateFn);
          return validateFn(queryResult.results, resultSet.columns, resultSet.values);
        } catch {
          return false;
        }
      }

      return true;
    },
    [challenge.expectedColumns, challenge.validateFn]
  );

  const handleRun = useCallback(() => {
    if (!query.trim()) return;

    setIsRunning(true);
    onQueryChange?.(query, undefined);

    // Small delay for UX
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
        onComplete();
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

  return (
    <div className={`rounded-lg border border-slate-700 bg-slate-800/50 overflow-hidden ${className}`}>
      <div className="p-4 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">Challenge</h3>
        </div>
        <p className="text-slate-300">{challenge.prompt}</p>
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
          <div className="space-y-3">
            {isCorrect ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-900/30 border border-emerald-700/50">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-300 font-medium">Correct! Great job!</span>
              </div>
            ) : result.success ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-900/30 border border-amber-700/50">
                <XCircle className="w-5 h-5 text-amber-400" />
                <span className="text-amber-300">Not quite right. Check your query and try again.</span>
              </div>
            ) : null}

            <ResultsTable result={result} executionTime={executionTime} />
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          {challenge.hint && !showHint && !isCorrect && (
            <button
              onClick={() => setShowHint(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Lightbulb className="w-4 h-4" />
              Show Hint
            </button>
          )}

          {attempts >= 3 && !isCorrect && !showSolution && (
            <button
              onClick={handleUseSolution}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Show Solution
            </button>
          )}

          {attempts > 0 && !isCorrect && (
            <span className="ml-auto text-xs text-slate-500">
              Attempts: {attempts}
            </span>
          )}
        </div>

        {showHint && challenge.hint && (
          <div className="p-3 rounded-lg bg-indigo-900/30 border border-indigo-700/50">
            <p className="text-sm text-indigo-300">
              <span className="font-semibold">Hint:</span> {challenge.hint}
            </p>
          </div>
        )}

        {showSolution && (
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-400">Solution:</p>
              <button
                onClick={handleCopySolution}
                className="flex items-center gap-1.5 px-2 py-0.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded transition-colors"
              >
                {copiedSolution ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="text-sm text-slate-200 font-mono whitespace-pre-wrap">{challenge.solution}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
