'use client';

import { useState, useCallback } from 'react';
import {
  Lightbulb,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  Lock,
} from 'lucide-react';
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
      <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 overflow-hidden opacity-60">
        <div className="p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center">
            <Lock className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                Step {stepIndex + 1} of {totalSteps}
              </span>
            </div>
            <h3 className="text-lg font-medium text-slate-500">{step.title}</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border overflow-hidden transition-all ${
        isCorrect || isCompleted
          ? 'border-emerald-700/50 bg-emerald-900/10'
          : 'border-slate-700 bg-slate-800/50'
      }`}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center gap-3 hover:bg-slate-700/20 transition-colors"
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isCorrect || isCompleted
              ? 'bg-emerald-900/50 text-emerald-400'
              : 'bg-indigo-900/50 text-indigo-400'
          }`}
        >
          {isCorrect || isCompleted ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <span className="text-sm font-bold">{stepIndex + 1}</span>
          )}
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              Step {stepIndex + 1} of {totalSteps}
            </span>
            {(isCorrect || isCompleted) && (
              <span className="text-xs text-emerald-400">Complete</span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-white">{step.title}</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-slate-700/50">
          {/* Context */}
          <div className="p-4 bg-slate-900/30 border-b border-slate-700/50">
            <p className="text-slate-300 text-sm leading-relaxed">{step.context}</p>
            <p className="text-slate-400 text-sm mt-3">
              <strong className="text-slate-300">Task:</strong> {step.description}
            </p>
          </div>

          {/* Editor */}
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
                {isCorrect || isCompleted ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-900/30 border border-emerald-700/50">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-300 font-medium">
                      Correct! Step completed.
                    </span>
                  </div>
                ) : result.success ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-900/30 border border-amber-700/50">
                    <XCircle className="w-5 h-5 text-amber-400" />
                    <span className="text-amber-300">
                      Not quite right. Check your query and try again.
                    </span>
                  </div>
                ) : null}

                <ResultsTable result={result} />
              </div>
            )}

            {/* Hint and Solution buttons */}
            {!isCorrect && !isCompleted && (
              <div className="flex items-center gap-3 pt-2">
                {step.hint && !showHint && (
                  <button
                    onClick={() => setShowHint(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <Lightbulb className="w-4 h-4" />
                    Show Hint
                  </button>
                )}

                {attempts >= 3 && !showSolution && (
                  <button
                    onClick={handleUseSolution}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Show Solution
                  </button>
                )}

                {attempts > 0 && (
                  <span className="ml-auto text-xs text-slate-500">
                    Attempts: {attempts}
                  </span>
                )}
              </div>
            )}

            {showHint && step.hint && !isCorrect && !isCompleted && (
              <div className="p-3 rounded-lg bg-indigo-900/30 border border-indigo-700/50">
                <p className="text-sm text-indigo-300">
                  <span className="font-semibold">Hint:</span> {step.hint}
                </p>
              </div>
            )}

            {showSolution && !isCorrect && !isCompleted && (
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-600">
                <p className="text-xs text-slate-400 mb-2">Solution:</p>
                <pre className="text-sm text-slate-200 font-mono whitespace-pre-wrap">
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
