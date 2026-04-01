'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Hammer, Lightbulb, CheckCircle2, XCircle, Eye, Copy, Check,
  ChevronRight, Sparkles, User, MessageCircle, Columns, Briefcase
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

// Generate a business impact summary based on the challenge
function generateBusinessImpact(challenge: ProjectChallenge, thread: ProjectThread): string {
  const title = challenge.title.toLowerCase();
  const scenario = challenge.scenario.toLowerCase();

  if (title.includes('dashboard') || title.includes('overview') || title.includes('summary')) {
    return 'This query powers the main dashboard view, giving stakeholders a quick snapshot of key metrics.';
  }
  if (title.includes('report') || title.includes('analysis')) {
    return 'This report will be used by management to make data-driven decisions about resource allocation.';
  }
  if (scenario.includes('manager') || scenario.includes('stakeholder') || scenario.includes('executive')) {
    return 'Leadership relies on this data to track performance and identify opportunities for improvement.';
  }
  if (title.includes('top') || title.includes('best') || title.includes('performance')) {
    return 'Identifying top performers helps the team recognize success and replicate winning strategies.';
  }
  if (title.includes('trend') || scenario.includes('over time')) {
    return 'Trend analysis reveals patterns that inform strategic planning and forecasting.';
  }
  if (scenario.includes('customer') || scenario.includes('user')) {
    return 'Understanding customer data helps improve user experience and drive engagement.';
  }

  return `This query is part of the ${thread.title} project, contributing to a complete business solution.`;
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

  const progressPercent = Math.round((challenge.stepNumber / thread.totalSteps) * 100);
  const businessImpact = generateBusinessImpact(challenge, thread);

  return (
    <div className="rounded-xl border-2 border-amber-700/50 bg-gradient-to-b from-amber-900/20 to-slate-900/50 overflow-hidden">
      {/* Project Progress Mini-Dashboard */}
      <div className="project-progress">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-amber-300">{thread.title}</span>
        </div>
        <div className="project-progress-bar">
          <div
            className="project-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="project-progress-text">
          Step {challenge.stepNumber} of {thread.totalSteps} · {progressPercent}%
        </span>
      </div>

      {/* Manager Message Card */}
      <div className="project-context">
        <div className="project-context-header">
          <div className="project-context-avatar">
            <User className="w-5 h-5" />
          </div>
          <div>
            <span className="project-context-sender">Project Manager</span>
            <span className="project-context-label">Task Assignment</span>
          </div>
        </div>
        <div className="project-context-message">
          <p>{challenge.scenario}</p>
        </div>
      </div>

      {/* Challenge Header */}
      <div className="p-4 border-b border-amber-700/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20">
              <Hammer className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white">{challenge.title}</h3>
          </div>
          {(isCorrect || isAlreadyComplete) && (
            <span className="flex items-center gap-1 px-2 py-0.5 text-xs text-emerald-400 bg-emerald-900/30 border border-emerald-700/50 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              Complete
            </span>
          )}
        </div>

        {/* Expected output */}
        <div className="flex items-center gap-2 mt-3 text-sm">
          <Columns className="w-4 h-4 text-slate-400" />
          <span className="text-slate-500">Expected columns:</span>
          <span className="font-mono text-slate-300">
            {challenge.expectedColumns.join(', ')}
          </span>
        </div>
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
              <div className="p-4 rounded-lg bg-emerald-900/30 border border-emerald-700/50">
                <div className="flex items-center justify-between mb-3">
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

                {/* Business Impact Summary */}
                <div className="mt-3 p-3 bg-emerald-950/30 rounded-lg border border-emerald-800/30">
                  <p className="text-xs font-medium text-emerald-400/80 mb-1 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3 h-3" />
                    What this does for your project
                  </p>
                  <p className="text-sm text-emerald-200/80">{businessImpact}</p>
                </div>
              </div>
            ) : result.success ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-900/30 border border-amber-700/50">
                <XCircle className="w-5 h-5 text-amber-400" />
                <span className="text-amber-300">Not quite. Review the task requirements and try again.</span>
              </div>
            ) : null}

            <ResultsTable result={result} executionTime={executionTime} />
          </div>
        )}

        {/* Hint and Solution Controls */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-700/50">
          {challenge.hint && !showHint && !isCorrect && !isAlreadyComplete && (
            <button
              onClick={() => setShowHint(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-amber-400/80 hover:text-amber-300 bg-amber-400/5 hover:bg-amber-400/10 rounded-lg transition-colors"
            >
              <Lightbulb className="w-4 h-4" />
              Need a hint?
            </button>
          )}

          {attempts >= 3 && !isCorrect && !isAlreadyComplete && !showSolution && (
            <button
              onClick={handleUseSolution}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              Show Solution
            </button>
          )}

          {attempts > 0 && attempts < 3 && !isCorrect && !isAlreadyComplete && (
            <span className="ml-auto text-xs text-slate-500">
              {3 - attempts} more attempt{3 - attempts !== 1 ? 's' : ''} until solution unlocks
            </span>
          )}
        </div>

        {/* Hint Display */}
        {showHint && challenge.hint && (
          <div className="challenge-hint">
            <MessageCircle className="challenge-hint-icon w-5 h-5" />
            <div>
              <p className="text-sm font-medium text-amber-300 mb-1">Project Manager says:</p>
              <p className="text-sm text-amber-200/80">{challenge.hint}</p>
            </div>
          </div>
        )}

        {/* Solution Display */}
        {showSolution && (
          <div className="challenge-solution">
            <div className="challenge-solution-header">
              <CheckCircle2 className="w-4 h-4" />
              <span>Solution</span>
              <button
                onClick={handleCopySolution}
                className="ml-auto flex items-center gap-1.5 px-2 py-0.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded transition-colors"
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
            <pre className="p-3 bg-slate-900 rounded-lg text-sm text-slate-200 font-mono overflow-x-auto border border-slate-700">
              {challenge.solution}
            </pre>
          </div>
        )}
      </div>

      {/* View Full Project Link */}
      <div className="px-4 py-3 border-t border-amber-700/30 bg-amber-900/10">
        <Link
          href={`/projects/thread/${thread.id}`}
          className="flex items-center justify-center gap-2 text-sm text-amber-400/80 hover:text-amber-300 transition-colors"
        >
          <span>View full {thread.title} project</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
