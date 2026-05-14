'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import SQLEditor from './SQLEditor';
import ResultsTable from './ResultsTable';
import type { QueryResponse } from '@/lib/db';
import type { Database as SqlJsDatabase } from 'sql.js';
import type { ProjectChallenge, ProjectThread } from '@/lib/project-threads';
import { useThreadProgressStore, THREAD_XP_VALUES } from '@/lib/thread-progress';
import { useProgressStore } from '@/lib/progress';

interface ProjectChallengeBlockProps {
  challenge: ProjectChallenge;
  thread: ProjectThread;
  lessonKey: string;
  database: SqlJsDatabase;
  runQuery: (db: SqlJsDatabase, sql: string) => QueryResponse;
  onQueryChange?: (query: string, error?: string) => void;
}

export default function ProjectChallengeBlock({
  challenge,
  thread,
  lessonKey,
  database,
  runQuery,
  onQueryChange,
}: ProjectChallengeBlockProps) {
  const [query, setQuery] = useState(challenge.starterCode || '');
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [executionTime, setExecutionTime] = useState<number | undefined>();
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [copiedSolution, setCopiedSolution] = useState(false);
  const [validatorBroken, setValidatorBroken] = useState(false);
  const xpAwardedRef = useRef(false);

  const { completeChallenge, incrementAttempts, isChallengeCompleted, getAttemptCount } = useThreadProgressStore();
  const addXP = useProgressStore((state) => state.addXP);

  const isAlreadyComplete = isChallengeCompleted(lessonKey);
  const attempts = getAttemptCount(lessonKey);

  const validateResult = useCallback(
    (queryResult: QueryResponse): boolean => {
      if (!queryResult.success) return false;
      if (queryResult.results.length === 0) return false;

      const resultSet = queryResult.results[0];

      const resultColumns = resultSet.columns.map((c) => c.toLowerCase());
      const expectedColumns = challenge.expectedColumns.map((c) => c.toLowerCase());
      const columnsMatch = expectedColumns.every((col) => resultColumns.includes(col));
      if (!columnsMatch) return false;

      // validateFn comes from controlled lesson content (lib/project-threads.ts), not user input
      if (challenge.validateFn) {
        try {
          const validateFn = new Function('results', 'columns', 'values', 'rows', challenge.validateFn);
          const rows = resultSet.values.map((row) =>
            Object.fromEntries(resultSet.columns.map((col, i) => [col.toLowerCase(), row[i]]))
          );
          return validateFn(queryResult.results, resultSet.columns, resultSet.values, rows);
        } catch (err) {
          console.warn(`[ProjectChallengeBlock] validateFn threw for challenge ${challenge.id}:`, err);
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

      if (correct && !isAlreadyComplete && !xpAwardedRef.current) {
        xpAwardedRef.current = true;
        completeChallenge(lessonKey);
        const xp = attempts === 0 ? THREAD_XP_VALUES.CHALLENGE_COMPLETE + THREAD_XP_VALUES.FIRST_TRY_BONUS : THREAD_XP_VALUES.CHALLENGE_COMPLETE;
        addXP(xp);
      } else if (!correct) {
        incrementAttempts(lessonKey);
      }

      setIsRunning(false);
    }, 100);
  }, [query, database, runQuery, validateResult, isAlreadyComplete, completeChallenge, lessonKey, attempts, addXP, incrementAttempts, onQueryChange]);

  const handleReset = useCallback(() => {
    setQuery(challenge.starterCode || '');
    setResult(null);
    setExecutionTime(undefined);
    setIsCorrect(false);
  }, [challenge.starterCode]);

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

  const done = isCorrect || isAlreadyComplete;

  return (
    <div className="rounded border border-amber-700/40 bg-amber-900/5">
      <div className="px-4 py-3 border-b border-amber-700/20 font-mono text-xs flex items-center justify-between">
        <span className="text-amber-400"># project-challenge · {thread.title}</span>
        <span className="text-slate-500">
          step {String(challenge.stepNumber).padStart(2, '0')}/{String(thread.totalSteps).padStart(2, '0')}
          {done && <span className="ml-2 text-emerald-400">· done</span>}
        </span>
      </div>

      <div className="px-4 py-3 border-b border-slate-800/60">
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-1"># brief</p>
        <p className="text-sm text-slate-200 leading-relaxed">{challenge.scenario}</p>
      </div>

      <div className="px-4 py-3 border-b border-slate-800/60">
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-1"># task</p>
        <p className="text-sm text-slate-100">{challenge.title}</p>
        <p className="mt-2 font-mono text-xs text-slate-400">
          <span className="text-indigo-400">columns: </span>
          <span className="text-slate-200">{challenge.expectedColumns.join(', ')}</span>
        </p>
      </div>

      <div className="p-4 space-y-4">
        <SQLEditor
          value={query}
          onChange={setQuery}
          onRun={handleRun}
          onReset={handleReset}
          isRunning={isRunning}
          height="180px"
        />

        {result && (
          <div className="space-y-3 font-mono text-xs">
            {done ? (
              <p className="text-emerald-400">
                <span className="text-emerald-400">exit 0</span> · project task validated
                {!isAlreadyComplete && <span className="text-amber-400"> · +{challenge.xpReward} xp</span>}
              </p>
            ) : result.success ? (
              <p className="text-amber-400">
                # validation failed · check the task requirements and try again
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
          {challenge.hint && !showHint && !done && (
            <button
              onClick={() => setShowHint(true)}
              className="px-2 py-1 rounded border border-slate-800 text-amber-400 hover:bg-amber-400/10 hover:border-amber-400/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              show hint
            </button>
          )}
          {attempts >= 3 && !done && !showSolution && (
            <button
              onClick={handleUseSolution}
              className="px-2 py-1 rounded border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              show solution
            </button>
          )}
          {attempts > 0 && attempts < 3 && !done && (
            <span className="ml-auto text-slate-500">
              {3 - attempts} more attempt{3 - attempts !== 1 ? 's' : ''} until solution unlocks
            </span>
          )}
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
                {copiedSolution ? <span className="text-emerald-400">copied</span> : <span>copy</span>}
              </button>
            </div>
            <pre className="p-3 text-xs text-slate-200 font-mono overflow-x-auto">
              {challenge.solution}
            </pre>
          </div>
        )}
      </div>

      <div className="px-4 py-2.5 border-t border-amber-700/20 bg-amber-900/5 font-mono text-xs">
        <Link
          href={`/projects/thread/${thread.id}`}
          className="text-amber-400 hover:text-amber-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
        >
          cd /projects/thread/{thread.id} →
        </Link>
      </div>
    </div>
  );
}
