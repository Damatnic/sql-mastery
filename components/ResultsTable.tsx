'use client';

import { AlertCircle, CheckCircle2, Table } from 'lucide-react';
import type { QueryResponse } from '@/lib/db';

interface ResultsTableProps {
  result: QueryResponse | null;
  className?: string;
}

export default function ResultsTable({ result, className = '' }: ResultsTableProps) {
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

  // Error state
  if (!result.success) {
    return (
      <div className={`rounded-lg border border-red-900/50 bg-red-950/30 p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-400">Query Error</p>
            <p className="text-sm text-red-300/80 mt-1 font-mono">{result.error}</p>
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
            <span className="text-xs text-slate-500">
              {resultSet.values.length} row{resultSet.values.length !== 1 ? 's' : ''} returned
            </span>
            <span className="text-xs text-slate-500">
              {resultSet.columns.length} column{resultSet.columns.length !== 1 ? 's' : ''}
            </span>
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
