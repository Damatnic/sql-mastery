'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import SQLEditor from './SQLEditor';
import ResultsTable from './ResultsTable';
import { useShowcase } from '@/lib/mode';
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
  /** Active-recall review: start blank (ignore saved query) and don't persist,
   *  so re-solving is genuine recall and the saved solution is untouched. */
  reviewMode?: boolean;
  onAskTutor?: (prompt: string) => void;
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
  reviewMode = false,
  onAskTutor,
}: ChallengeBlockProps) {
  const learn = !useShowcase();
  const [query, setQuery] = useState('');
  const [why, setWhy] = useState('');
  const [showWhy, setShowWhy] = useState(false);
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [executionTime, setExecutionTime] = useState<number | undefined>();
  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [copiedSolution, setCopiedSolution] = useState(false);
  const [validatorBroken, setValidatorBroken] = useState(false);
  const [editorHeight, setEditorHeight] = useState<number>(150);
  const [expanded, setExpanded] = useState(false);
  const dragOriginRef = useRef<{ startY: number; startHeight: number } | null>(null);
  const hasFiredCompleteRef = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`sql-mastery-editor-h-${challenge.id}`);
      if (saved) {
        const n = parseInt(saved, 10);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from localStorage
        if (Number.isFinite(n) && n >= 100 && n <= 800) setEditorHeight(n);
      }
    } catch {
      // ignore
    }
  }, [challenge.id]);

  const expandTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!expanded) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    // Capture the trigger now; the ref may point elsewhere by cleanup time.
    const trigger = expandTriggerRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      // restore focus to expand trigger or previously focused element
      (trigger ?? previouslyFocused)?.focus?.();
    };
  }, [expanded]);

  const onResizePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const target = e.currentTarget;
      target.setPointerCapture?.(e.pointerId);
      dragOriginRef.current = { startY: e.clientY, startHeight: editorHeight };
      const onMove = (ev: PointerEvent) => {
        if (!dragOriginRef.current) return;
        const delta = ev.clientY - dragOriginRef.current.startY;
        const next = Math.max(100, Math.min(800, dragOriginRef.current.startHeight + delta));
        setEditorHeight(next);
      };
      const onUp = () => {
        dragOriginRef.current = null;
        target.removeEventListener('pointermove', onMove);
        target.removeEventListener('pointerup', onUp);
        target.removeEventListener('pointercancel', onUp);
      };
      target.addEventListener('pointermove', onMove);
      target.addEventListener('pointerup', onUp);
      target.addEventListener('pointercancel', onUp);
    },
    [editorHeight],
  );

  const onResizeKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>) => {
    const step = e.shiftKey ? 40 : 20;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setEditorHeight((h) => Math.min(800, h + step));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setEditorHeight((h) => Math.max(100, h - step));
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(`sql-mastery-editor-h-${challenge.id}`, String(editorHeight));
    } catch {
      // ignore
    }
  }, [editorHeight, challenge.id]);

  useEffect(() => {
    // Review mode starts blank (genuine recall); otherwise hydrate saved code.
    const saved = reviewMode
      ? null
      : localStorage.getItem(`sql-mastery-code-${challenge.id}`);
    // Reset editor state when the challenge changes. All intentional.
    /* eslint-disable react-hooks/set-state-in-effect -- reset-on-challenge-change */
    setQuery(saved ?? '');
    setResult(null);
    setExecutionTime(undefined);
    setIsCorrect(false);
    setWhy(localStorage.getItem(`sql-mastery-why-${challenge.id}`) || '');
    setShowWhy(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [challenge.id, reviewMode]);

  useEffect(() => {
    if (!reviewMode && query) {
      localStorage.setItem(`sql-mastery-code-${challenge.id}`, query);
    }
  }, [query, challenge.id, reviewMode]);

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
    try {
      localStorage.removeItem(`sql-mastery-code-${challenge.id}`);
    } catch {
      // ignore
    }
    setQuery('');
    setResult(null);
    setExecutionTime(undefined);
    setIsCorrect(false);
    hasFiredCompleteRef.current = false;
  }, [challenge.id]);

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
        <div data-tour-target="editor" className="relative">
          <SQLEditor
            value={query}
            onChange={setQuery}
            onRun={handleRun}
            onReset={handleReset}
            isRunning={isRunning}
            height={`${editorHeight}px`}
          />
          <div className="flex items-center justify-between -mt-px border-x border-b border-slate-800 bg-slate-900/60 rounded-b">
            <button
              ref={expandTriggerRef}
              type="button"
              onClick={() => setExpanded(true)}
              className="px-3 py-1 font-mono text-[11px] text-slate-400 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              aria-label="expand editor"
            >
              [ expand ]
            </button>
            <button
              type="button"
              onPointerDown={onResizePointerDown}
              onKeyDown={onResizeKeyDown}
              role="slider"
              aria-label="editor height"
              aria-valuemin={100}
              aria-valuemax={800}
              aria-valuenow={editorHeight}
              aria-valuetext={`${editorHeight} pixels`}
              className="px-3 py-1 font-mono text-[11px] text-slate-400 hover:text-slate-100 cursor-ns-resize select-none touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              title="drag, or use arrow keys to resize"
            >
              ─ drag to resize ─
            </button>
            <span className="px-3 py-1 font-mono text-[10px] text-slate-500" aria-hidden="true">
              {editorHeight}px
            </span>
          </div>
        </div>
        {expanded && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="expanded editor"
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur p-4 sm:p-8 flex flex-col"
          >
            <div className="flex items-center justify-between mb-3 font-mono text-xs">
              <span className="text-slate-400"># editor · esc to close</span>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="px-3 py-1 rounded border border-slate-700 text-slate-300 hover:text-slate-100 hover:border-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                collapse
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <SQLEditor
                value={query}
                onChange={setQuery}
                onRun={handleRun}
                onReset={handleReset}
                isRunning={isRunning}
                height="100%"
              />
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-3 font-mono text-xs">
            {isCorrect ? (
              <p className="text-emerald-400">
                <span className="text-emerald-400">exit 0</span> · query matches expected columns
              </p>
            ) : result.success ? (
              (() => {
                const got = result.results[0]?.columns ?? [];
                const want = challenge.expectedColumns;
                const rows = result.results[0]?.values.length ?? 0;
                return (
                  <p className="text-amber-400">
                    # not there yet · your columns:{' '}
                    <span className="text-slate-300">[{got.join(', ') || 'none'}]</span> · expected:{' '}
                    <span className="text-slate-300">[{want.join(', ')}]</span>
                    {rows === 0 && <span className="text-slate-500"> · 0 rows returned</span>}
                  </p>
                );
              })()
            ) : null}

            {isCorrect && learn && (
              !showWhy ? (
                <button
                  type="button"
                  onClick={() => setShowWhy(true)}
                  className="text-slate-500 hover:text-indigo-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
                >
                  + explain: in one sentence, why does this work?
                </button>
              ) : (
                <div className="space-y-1">
                  <label className="text-slate-500" htmlFor={`why-${challenge.id}`}>
                    why does this work?{' '}
                    <span className="text-slate-600">(for you, saved locally, never sent)</span>
                  </label>
                  <textarea
                    id={`why-${challenge.id}`}
                    value={why}
                    onChange={(e) => {
                      setWhy(e.target.value);
                      try {
                        localStorage.setItem(`sql-mastery-why-${challenge.id}`, e.target.value);
                      } catch {
                        /* private mode / quota */
                      }
                    }}
                    rows={2}
                    className="w-full resize-none rounded border border-slate-800 bg-slate-900/40 px-2 py-1.5 text-slate-100 placeholder:text-slate-600 focus:border-indigo-400 focus:outline-none"
                    placeholder="in your own words…"
                  />
                </div>
              )
            )}

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
          {onAskTutor && !isCorrect && (
            <button
              type="button"
              onClick={() => onAskTutor(`I'm stuck on this challenge: ${challenge.prompt}`)}
              className="text-slate-500 hover:text-indigo-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
            >
              &gt; stuck? ask the tutor
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
