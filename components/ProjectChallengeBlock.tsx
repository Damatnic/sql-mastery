'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Hammer, Lightbulb, CheckCircle2, XCircle, Eye, Copy, Check,
  ChevronRight, Sparkles,
} from 'lucide-react';
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

  const { completeChallenge, incrementAttempts, isChallengeCompleted, getAttemptCount } = useThreadProgressStore();
  const addXP = useProgressStore((state) => state.addXP);

  const isAlreadyComplete = isChallengeCompleted(lessonKey);
  const attempts = getAttemptCount(lessonKey);

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
      // NOTE: validateFn comes from controlled lesson content (lib/project-threads.ts), not user input
      // This is the same pattern used in ChallengeBlock.tsx for lesson challenges
      if (challenge.validateFn) {
        try {
          const validateFn = new Function('results', 'columns', 'values', 'rows', challenge.validateFn);
          const rows = resultSet.values.map((row) =>
            Object.fromEntries(resultSet.columns.map((col, i) => [col.toLowerCase(), row[i]]))
          );
          return validateFn(queryResult.results, resultSet.columns, resultSet.values, rows);
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

      if (correct && !isAlreadyComplete) {
        completeChallenge(lessonKey);
        // Award XP - bonus for first try
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

  return (
    <div className="rounded-xl border-2 border-amber-700/50 bg-gradient-to-b from-amber-900/20 to-slate-900/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-amber-700/30 bg-amber-900/20">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20">
            <Hammer className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Project Challenge
          </span>
          <span className="text-xs text-amber-500/70">
            Step {challenge.stepNumber} of {thread.totalSteps}
          </span>
          {(isCorrect || isAlreadyComplete) && (
            <span className="ml-auto flex items-center gap-1 px-2 py-0.5 text-xs text-emerald-400 bg-emerald-900/30 border border-emerald-700/50 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              Complete
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold text-white mb-1">{challenge.title}</h3>
        <Link
          href={`/projects/thread/${thread.id}`}
          className="inline-flex items-center gap-1 text-xs text-amber-400/80 hover:text-amber-300 transition-colors"
        >
          {thread.title}
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Scenario */}
      <div className="p-4 bg-slate-800/30 border-b border-slate-700/50">
        <p className="text-sm text-slate-300 leading-relaxed">{challenge.scenario}</p>
      </div>

      {/* Editor and Results */}
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
          <div className="space-y-3">
            {isCorrect || isAlreadyComplete ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-900/30 border border-emerald-700/50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-300 font-medium">
                    {isAlreadyComplete && !isCorrect ? 'Already completed!' : 'Perfect! You nailed this project task.'}
                  </span>
                </div>
                {!isAlreadyComplete && (
                  <div className="flex items-center gap-1 text-amber-400">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-semibold">+{challenge.xpReward} XP</span>
                  </div>
                )}
              </div>
            ) : result.success ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-900/30 border border-amber-700/50">
                <XCircle className="w-5 h-5 text-amber-400" />
                <span className="text-amber-300">Not quite. Review the scenario and try again.</span>
              </div>
            ) : null}

            <ResultsTable result={result} executionTime={executionTime} />
          </div>
        )}

        {/* Hint and Solution Controls */}
        <div className="flex items-center gap-3 pt-2">
          {challenge.hint && !showHint && !isCorrect && !isAlreadyComplete && (
            <button
              onClick={() => setShowHint(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-amber-400/80 hover:text-amber-300 transition-colors"
            >
              <Lightbulb className="w-4 h-4" />
              Show Hint
            </button>
          )}

          {attempts >= 3 && !isCorrect && !isAlreadyComplete && !showSolution && (
            <button
              onClick={handleUseSolution}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Show Solution
            </button>
          )}

          {attempts > 0 && !isCorrect && !isAlreadyComplete && (
            <span className="ml-auto text-xs text-slate-500">
              Attempts: {attempts}
            </span>
          )}
        </div>

        {showHint && challenge.hint && (
          <div className="p-3 rounded-lg bg-amber-900/20 border border-amber-700/40">
            <p className="text-sm text-amber-200">
              <span className="font-semibold text-amber-400">Hint:</span> {challenge.hint}
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
