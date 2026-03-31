'use client';

import { AlertCircle, CheckCircle2, Table, Clock, Rows3 } from 'lucide-react';
import type { QueryResponse } from '@/lib/db';

interface ResultsTableProps {
  result: QueryResponse | null;
  executionTime?: number;
  className?: string;
}

function parseErrorMessage(error: string): { title: string; description: string; suggestion?: string } {
  const lowerError = error.toLowerCase();

  // Syntax errors
  if (lowerError.includes('syntax error') || lowerError.includes('near')) {
    const match = error.match(/near "([^"]+)"/i);
    const nearWord = match ? match[1] : null;
    return {
      title: 'Syntax Error',
      description: nearWord
        ? `There's a problem near "${nearWord}" in your query.`
        : 'There\'s a syntax error in your query.',
      suggestion: 'Check for typos, missing commas, or unclosed quotes.',
    };
  }

  // No such table
  if (lowerError.includes('no such table')) {
    const match = error.match(/no such table: (\w+)/i);
    const tableName = match ? match[1] : 'unknown';
    return {
      title: 'Table Not Found',
      description: `The table "${tableName}" doesn't exist in this database.`,
      suggestion: 'Check the Schema panel for available tables. Table names are case-sensitive.',
    };
  }

  // No such column
  if (lowerError.includes('no such column')) {
    const match = error.match(/no such column: (\S+)/i);
    const columnName = match ? match[1] : 'unknown';
    return {
      title: 'Column Not Found',
      description: `The column "${columnName}" doesn't exist.`,
      suggestion: 'Check the Schema panel for available columns in each table.',
    };
  }

  // Ambiguous column
  if (lowerError.includes('ambiguous column name')) {
    const match = error.match(/ambiguous column name: (\w+)/i);
    const columnName = match ? match[1] : 'unknown';
    return {
      title: 'Ambiguous Column',
      description: `The column "${columnName}" exists in multiple tables.`,
      suggestion: 'Use table aliases like "table.column" to specify which one.',
    };
  }

  // Aggregate function errors
  if (lowerError.includes('misuse of aggregate')) {
    return {
      title: 'Aggregate Function Error',
      description: 'Aggregate functions like COUNT, SUM, AVG cannot be used here.',
      suggestion: 'Make sure aggregate functions are in SELECT or HAVING, not WHERE.',
    };
  }

  // Group by errors
  if (lowerError.includes('not an aggregate') || (lowerError.includes('must appear in') && lowerError.includes('group by'))) {
    return {
      title: 'GROUP BY Error',
      description: 'When using GROUP BY, all selected columns must be in GROUP BY or inside an aggregate function.',
      suggestion: 'Add the missing column to GROUP BY or wrap it in an aggregate like MAX() or MIN().',
    };
  }

  // Default error
  return {
    title: 'Query Error',
    description: error,
  };
}

export default function ResultsTable({ result, executionTime, className = '' }: ResultsTableProps) {
  if (!result) {
    return (
      <div className={`rounded-lg border border-slate-700 bg-slate-800 p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center text-slate-500">
          <Table className="w-8 h-8 mb-2" />
          <p className="text-sm">Run a query to see results</p>
        </div>
      </div>
    );
  }

  // Error state with improved messages
  if (!result.success) {
    const parsed = parseErrorMessage(result.error);
    return (
      <div className={`rounded-lg border border-red-900/50 bg-red-950/30 p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-red-400">{parsed.title}</p>
            <p className="text-sm text-red-300/90 mt-1">{parsed.description}</p>
            {parsed.suggestion && (
              <p className="text-xs text-red-300/60 mt-2 italic">{parsed.suggestion}</p>
            )}
            <details className="mt-3">
              <summary className="text-xs text-red-400/50 cursor-pointer hover:text-red-400/70">
                Show raw error
              </summary>
              <pre className="text-xs text-red-300/50 mt-1 font-mono overflow-x-auto">{result.error}</pre>
            </details>
          </div>
        </div>
      </div>
    );
  }

  // No results
  if (result.results.length === 0 || result.rowCount === 0) {
    return (
      <div className={`rounded-lg border border-slate-700 bg-slate-800 p-4 ${className}`}>
        <div className="flex items-center gap-2 text-slate-400">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="text-sm">Query executed successfully. No results returned.</span>
        </div>
      </div>
    );
  }

  // Render results for each result set (queries can return multiple result sets)
  return (
    <div className={`space-y-4 ${className}`}>
      {result.results.map((resultSet, idx) => (
        <div
          key={idx}
          className="rounded-lg border border-slate-700 bg-slate-800 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-700">
                  {resultSet.columns.map((column, colIdx) => (
                    <th
                      key={colIdx}
                      className="px-4 py-2 text-left text-xs font-semibold text-slate-300 uppercase tracking-wide"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {resultSet.values.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    {row.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className="px-4 py-2 text-slate-200 whitespace-nowrap"
                      >
                        {formatCellValue(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-2 bg-slate-900/30 border-t border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <Rows3 className="w-3.5 h-3.5" />
                {resultSet.values.length} row{resultSet.values.length !== 1 ? 's' : ''}
              </span>
              <span className="text-xs text-slate-500">
                {resultSet.columns.length} column{resultSet.columns.length !== 1 ? 's' : ''}
              </span>
            </div>
            {executionTime !== undefined && (
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                {executionTime < 1 ? '<1' : executionTime}ms
              </span>
            )}
          </div>
        </div>
      ))}

      {result.results.length > 1 && (
        <p className="text-xs text-slate-500 text-center">
          Total: {result.rowCount} rows across {result.results.length} result sets
        </p>
      )}
    </div>
  );
}

function formatCellValue(value: unknown): string {
  if (value === null) {
    return 'NULL';
  }

  if (value === undefined) {
    return '';
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'number') {
    // Format numbers nicely
    if (Number.isInteger(value)) {
      return value.toLocaleString();
    }
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}
