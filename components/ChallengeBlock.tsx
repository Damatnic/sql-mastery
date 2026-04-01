'use client';

import { useState, useCallback } from 'react';
import { Target, Lightbulb, CheckCircle2, XCircle, Eye, Copy, Check, Columns, MessageCircle } from 'lucide-react';
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
  challengeNumber?: number;
  totalChallenges?: number;
  className?: string;
}

// Generate a helpful explanation for the solution based on its content
function generateSolutionExplanation(solution: string, expectedColumns: string[]): string {
  const explanations: string[] = [];
  const upper = solution.toUpperCase();

  if (upper.includes('SELECT DISTINCT')) {
    explanations.push('DISTINCT removes duplicate rows from the results');
  } else if (upper.includes('SELECT')) {
    if (expectedColumns.length === 1) {
      explanations.push(`We select just the ${expectedColumns[0]} column to get exactly what was asked`);
    } else {
      explanations.push(`We select ${expectedColumns.join(', ')} to get the required columns`);
    }
  }

  if (upper.includes('JOIN') || upper.includes('INNER JOIN')) {
    explanations.push('JOIN combines rows from multiple tables based on a related column');
  }
  if (upper.includes('LEFT JOIN')) {
    explanations.push('LEFT JOIN includes all rows from the first table, even if no match exists');
  }

  if (upper.includes('WHERE')) {
    explanations.push('WHERE filters the rows to only those matching our condition');
  }

  if (upper.includes('GROUP BY')) {
    explanations.push('GROUP BY groups rows with the same values, allowing us to aggregate');
  }

  if (upper.includes('HAVING')) {
    explanations.push('HAVING filters groups after aggregation (unlike WHERE which filters before)');
  }

  if (upper.includes('ORDER BY')) {
    if (upper.includes('DESC')) {
      explanations.push('ORDER BY with DESC sorts from highest to lowest');
    } else {
      explanations.push('ORDER BY sorts the results in ascending order');
    }
  }

  if (upper.includes('LIMIT')) {
    explanations.push('LIMIT restricts how many rows are returned');
  }

  if (upper.includes('COUNT(')) {
    explanations.push('COUNT() counts the number of rows or non-null values');
  }
  if (upper.includes('SUM(')) {
    explanations.push('SUM() adds up all the values in a column');
  }
  if (upper.includes('AVG(')) {
    explanations.push('AVG() calculates the average of a column');
  }
  if (upper.includes('MAX(') || upper.includes('MIN(')) {
    explanations.push('MAX/MIN finds the highest or lowest value');
  }

  if (upper.includes('LIKE')) {
    explanations.push('LIKE performs pattern matching with % as a wildcard');
  }

  if (upper.includes('BETWEEN')) {
    explanations.push('BETWEEN checks if a value is within a range (inclusive)');
  }

  if (upper.includes('IN (')) {
    explanations.push('IN checks if a value matches any in a list');
  }

  if (explanations.length === 0) {
    return 'This query uses the basic SQL structure to retrieve the requested data.';
  }

  return explanations.join('. ') + '.';
}

// Make hints sound like a senior dev giving a nudge
function formatHint(hint: string): string {
  const prefixes = [
    "Here's a thought: ",
    "Consider this: ",
    "A nudge in the right direction: ",
    "Think about it this way: ",
    "Quick tip: ",
  ];

  if (hint.length > 60 || hint.includes('...') || hint.toLowerCase().startsWith('try') || hint.toLowerCase().startsWith('think')) {
    return hint;
  }

  const prefix = prefixes[Math.floor(hint.length % prefixes.length)];
  return prefix + hint.charAt(0).toLowerCase() + hint.slice(1);
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

  const solutionExplanation = generateSolutionExplanation(challenge.solution, challenge.expectedColumns);

  return (
    <div className={`challenge-block ${className}`}>
      {/* Challenge header */}
      <div className="challenge-header">
        <div className="flex items-center gap-3">
          {challengeNumber && (
            <div className="challenge-number">{challengeNumber}</div>
          )}
          <div className="flex-1">
            <span className="challenge-title">Challenge</span>
            {totalChallenges && challengeNumber && (
              <span className="text-xs text-slate-500 ml-2">
                {challengeNumber} of {totalChallenges}
              </span>
            )}
          </div>
        </div>
        {isCorrect ? (
          <div className="challenge-status challenge-status-success">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </div>
        ) : attempts > 0 ? (
          <div className="challenge-status challenge-status-error">
            <span>{attempts} attempt{attempts !== 1 ? 's' : ''}</span>
          </div>
        ) : (
          <div className="challenge-status challenge-status-pending">
            <Target className="w-3.5 h-3.5" />
            <span>Todo</span>
          </div>
        )}
      </div>

      {/* Challenge prompt */}
      <div className="challenge-prompt">
        {challenge.prompt}
      </div>

      {/* Expected output shape */}
      <div className="challenge-expected">
        <Columns className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="challenge-expected-label">Expected columns: </span>
          <span className="font-mono text-slate-300">
            {challenge.expectedColumns.join(', ')}
          </span>
        </div>
      </div>

      {/* SQL Editor */}
      <div className="p-4 space-y-4">
        <SQLEditor
          value={query}
          onChange={setQuery}
          onRun={handleRun}
          onReset={handleReset}
          isRunning={isRunning}
          height="150px"
        />

        {/* Results area */}
        {result && (
          <div className="space-y-3">
            {isCorrect ? (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-900/20 border border-emerald-700/50">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="font-medium text-emerald-300">Correct! Great job!</p>
                  <p className="text-sm text-emerald-400/70 mt-0.5">Your query returns the expected results.</p>
                </div>
              </div>
            ) : result.success ? (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-900/20 border border-amber-700/50">
                <XCircle className="w-6 h-6 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-300">Not quite right</p>
                  <p className="text-sm text-amber-400/70 mt-0.5">
                    Check your query against the expected columns and try again.
                  </p>
                </div>
              </div>
            ) : null}

            <ResultsTable result={result} executionTime={executionTime} />
          </div>
        )}

        {/* Hint/Solution buttons */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-700/50">
          {challenge.hint && !showHint && !isCorrect && (
            <button
              onClick={() => setShowHint(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-amber-400/80 hover:text-amber-300 bg-amber-400/5 hover:bg-amber-400/10 rounded-lg transition-colors"
            >
              <Lightbulb className="w-4 h-4" />
              Need a hint?
            </button>
          )}

          {attempts >= 3 && !isCorrect && !showSolution && (
            <button
              onClick={handleUseSolution}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              Show Solution
            </button>
          )}

          {attempts > 0 && attempts < 3 && !isCorrect && (
            <span className="ml-auto text-xs text-slate-500">
              {3 - attempts} more attempt{3 - attempts !== 1 ? 's' : ''} until solution unlocks
            </span>
          )}
        </div>

        {/* Hint display */}
        {showHint && challenge.hint && (
          <div className="challenge-hint">
            <MessageCircle className="challenge-hint-icon w-5 h-5" />
            <div>
              <p className="text-sm font-medium text-amber-300 mb-1">From a senior dev:</p>
              <p className="text-sm text-amber-200/80">{formatHint(challenge.hint)}</p>
            </div>
          </div>
        )}

        {/* Solution display */}
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

            {/* Solution code */}
            <pre className="p-3 bg-slate-900 rounded-lg text-sm text-slate-200 font-mono overflow-x-auto border border-slate-700">
              {challenge.solution}
            </pre>

            {/* Solution explanation */}
            <div className="challenge-solution-explanation">
              <p className="text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Why this works:</p>
              <p>{solutionExplanation}</p>
            </div>
          </div>
        )}
      </div>

      {/* Progress bar at bottom */}
      {totalChallenges && challengeNumber && (
        <div className="px-4 py-2 border-t border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                style={{ width: `${((challengeNumber - 1) / totalChallenges) * 100 + (isCorrect ? 100 / totalChallenges : 0)}%` }}
              />
            </div>
            <span className="text-xs text-slate-500">
              {challengeNumber}/{totalChallenges}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
