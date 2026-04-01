'use client';

import { useState, useMemo } from 'react';
import { AlertCircle, CheckCircle2, Table, Clock, Rows3, Hash, Type, Calendar, ArrowUpDown, ArrowUp, ArrowDown, Search, Lightbulb, Database } from 'lucide-react';
import type { QueryResponse } from '@/lib/db';

interface ResultsTableProps {
  result: QueryResponse | null;
  executionTime?: number;
  className?: string;
}

type SortDirection = 'asc' | 'desc' | null;
interface SortState {
  column: number;
  direction: SortDirection;
}

// Enhanced error messages with human-friendly explanations
const ERROR_PATTERNS: Array<{
  pattern: RegExp;
  getInfo: (match: RegExpMatchArray, error: string) => { title: string; description: string; suggestion: string; highlight?: string };
}> = [
  {
    pattern: /syntax error/i,
    getInfo: (_, error) => {
      const nearMatch = error.match(/near "([^"]+)"/i);
      const nearWord = nearMatch?.[1];
      return {
        title: 'Syntax Error',
        description: nearWord
          ? `Something looks off near "${nearWord}" in your query.`
          : 'There\'s a syntax error in your query.',
        suggestion: 'Check for typos, missing commas, or unclosed quotes. SQL keywords should be uppercase (SELECT, FROM, WHERE).',
        highlight: nearWord,
      };
    },
  },
  {
    pattern: /no such table: (\w+)/i,
    getInfo: (match) => ({
      title: 'Table Not Found',
      description: `The table "${match[1]}" doesn't exist in this database.`,
      suggestion: 'Open the Schema panel to see available tables. Table names are case-sensitive in some databases.',
      highlight: match[1],
    }),
  },
  {
    pattern: /no such column: (\S+)/i,
    getInfo: (match) => ({
      title: 'Column Not Found',
      description: `The column "${match[1]}" doesn't exist.`,
      suggestion: 'Check your column name — did you forget to alias your table? Open the Schema panel to see available columns.',
      highlight: match[1],
    }),
  },
  {
    pattern: /ambiguous column name: (\w+)/i,
    getInfo: (match) => ({
      title: 'Ambiguous Column',
      description: `Multiple tables have a column named "${match[1]}".`,
      suggestion: 'Prefix it with the table name: table_name.column_name or use an alias.',
      highlight: match[1],
    }),
  },
  {
    pattern: /misuse of aggregate/i,
    getInfo: () => ({
      title: 'Aggregate Function Error',
      description: 'Aggregate functions (COUNT, SUM, AVG, etc.) can\'t be used in WHERE clauses.',
      suggestion: 'Use HAVING instead of WHERE when filtering on aggregate results.',
    }),
  },
  {
    pattern: /not an aggregate|must appear in.*group by/i,
    getInfo: () => ({
      title: 'GROUP BY Error',
      description: 'When using GROUP BY, every column in SELECT must either be in GROUP BY or wrapped in an aggregate function.',
      suggestion: 'Add the missing column to GROUP BY, or wrap it in MAX(), MIN(), or another aggregate function.',
    }),
  },
  {
    pattern: /UNIQUE constraint failed/i,
    getInfo: () => ({
      title: 'Duplicate Value',
      description: 'You\'re trying to insert a value that already exists in a unique column.',
      suggestion: 'Check if this record already exists, or use INSERT OR REPLACE.',
    }),
  },
  {
    pattern: /FOREIGN KEY constraint failed/i,
    getInfo: () => ({
      title: 'Foreign Key Error',
      description: 'The value you\'re referencing doesn\'t exist in the parent table.',
      suggestion: 'Make sure the referenced record exists before creating this relationship.',
    }),
  },
];

function parseErrorMessage(error: string): { title: string; description: string; suggestion?: string; highlight?: string } {
  for (const { pattern, getInfo } of ERROR_PATTERNS) {
    const match = error.match(pattern);
    if (match) {
      return getInfo(match, error);
    }
  }
  return {
    title: 'Query Error',
    description: error,
  };
}

// Detect column data type from values
function detectColumnType(values: unknown[]): 'numeric' | 'text' | 'date' | 'null' {
  const nonNullValues = values.filter(v => v !== null && v !== undefined);
  if (nonNullValues.length === 0) return 'null';

  const sample = nonNullValues[0];
  if (typeof sample === 'number') return 'numeric';

  // Check for date patterns
  if (typeof sample === 'string') {
    const datePattern = /^\d{4}-\d{2}-\d{2}|^\d{2}\/\d{2}\/\d{4}/;
    if (datePattern.test(sample)) return 'date';
  }

  return 'text';
}

// Get type indicator icon
function TypeIcon({ type }: { type: 'numeric' | 'text' | 'date' | 'null' }) {
  switch (type) {
    case 'numeric':
      return <Hash className="w-3 h-3" />;
    case 'date':
      return <Calendar className="w-3 h-3" />;
    default:
      return <Type className="w-3 h-3" />;
  }
}

export default function ResultsTable({ result, executionTime, className = '' }: ResultsTableProps) {
  const [sortState, setSortState] = useState<SortState>({ column: -1, direction: null });

  // Initial empty state
  if (!result) {
    return (
      <div className={`results-container ${className}`}>
        <div className="results-empty">
          <Database className="results-empty-icon" />
          <p className="results-empty-title">Run a query to see results</p>
          <p className="results-empty-hint">Press Ctrl+Enter or click Run to execute your SQL</p>
        </div>
      </div>
    );
  }

  // Error state with improved messages
  if (!result.success) {
    const parsed = parseErrorMessage(result.error);
    return (
      <div className={`results-container ${className}`}>
        <div className="results-error">
          <div className="results-error-title">
            <AlertCircle className="w-5 h-5" />
            <span>{parsed.title}</span>
          </div>
          <div className="results-error-message">{parsed.description}</div>
          {parsed.suggestion && (
            <div className="results-error-hint">
              <Lightbulb className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span>{parsed.suggestion}</span>
            </div>
          )}
          <details className="mt-3">
            <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400">
              Show raw error
            </summary>
            <pre className="text-xs text-slate-400 mt-2 font-mono p-2 bg-slate-900/50 rounded overflow-x-auto">
              {result.error}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  // No results state
  if (result.results.length === 0 || result.rowCount === 0) {
    return (
      <div className={`results-container ${className}`}>
        <div className="results-header">
          <div className="results-meta">
            <span className="results-meta-item">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-400">Query successful</span>
            </span>
          </div>
        </div>
        <div className="results-empty">
          <Search className="results-empty-icon" />
          <p className="results-empty-title">Query returned no results</p>
          <p className="results-empty-hint">Try adjusting your WHERE conditions or check if the table has data</p>
        </div>
      </div>
    );
  }

  // Render results
  return (
    <div className={`space-y-4 ${className}`}>
      {result.results.map((resultSet, idx) => (
        <ResultSetTable
          key={idx}
          resultSet={resultSet}
          executionTime={idx === 0 ? executionTime : undefined}
          sortState={sortState}
          setSortState={setSortState}
        />
      ))}

      {result.results.length > 1 && (
        <p className="text-xs text-slate-500 text-center">
          Total: {result.rowCount} rows across {result.results.length} result sets
        </p>
      )}
    </div>
  );
}

interface ResultSetTableProps {
  resultSet: { columns: string[]; values: unknown[][] };
  executionTime?: number;
  sortState: SortState;
  setSortState: (state: SortState) => void;
}

function ResultSetTable({ resultSet, executionTime, sortState, setSortState }: ResultSetTableProps) {
  // Detect column types
  const columnTypes = useMemo(() => {
    return resultSet.columns.map((_, colIdx) => {
      const columnValues = resultSet.values.map(row => row[colIdx]);
      return detectColumnType(columnValues);
    });
  }, [resultSet]);

  // Sort values
  const sortedValues = useMemo(() => {
    if (sortState.column === -1 || sortState.direction === null) {
      return resultSet.values;
    }

    const sorted = [...resultSet.values].sort((a, b) => {
      const aVal = a[sortState.column];
      const bVal = b[sortState.column];

      if (aVal === null) return 1;
      if (bVal === null) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortState.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortState.direction === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    return sorted;
  }, [resultSet.values, sortState]);

  const handleSort = (colIdx: number) => {
    if (sortState.column === colIdx) {
      // Cycle through: asc -> desc -> none
      if (sortState.direction === 'asc') {
        setSortState({ column: colIdx, direction: 'desc' });
      } else if (sortState.direction === 'desc') {
        setSortState({ column: -1, direction: null });
      } else {
        setSortState({ column: colIdx, direction: 'asc' });
      }
    } else {
      setSortState({ column: colIdx, direction: 'asc' });
    }
  };

  return (
    <div className="results-container">
      {/* Results header with metadata */}
      <div className="results-header">
        <div className="results-meta">
          <span className="results-meta-item">
            <Rows3 className="w-4 h-4" />
            <span className="results-meta-value">{sortedValues.length}</span>
            <span>row{sortedValues.length !== 1 ? 's' : ''}</span>
          </span>
          {executionTime !== undefined && (
            <span className="results-meta-item">
              <Clock className="w-4 h-4" />
              <span className="results-meta-value">{executionTime < 1 ? '<1' : executionTime}ms</span>
            </span>
          )}
        </div>
        <span className="text-xs text-slate-500">
          {resultSet.columns.length} column{resultSet.columns.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Results table */}
      <div className="results-table-wrapper">
        <table className="results-table">
          <thead>
            <tr>
              {resultSet.columns.map((column, colIdx) => {
                const type = columnTypes[colIdx];
                const isSorted = sortState.column === colIdx;

                return (
                  <th
                    key={colIdx}
                    onClick={() => handleSort(colIdx)}
                    className={`${type === 'numeric' ? 'text-right' : 'text-left'} ${isSorted ? 'sorted' : ''}`}
                  >
                    <div className="flex items-center gap-1.5" style={{ justifyContent: type === 'numeric' ? 'flex-end' : 'flex-start' }}>
                      <span className="type-badge opacity-50" title={type}>
                        <TypeIcon type={type} />
                      </span>
                      <span>{column}</span>
                      <span className="sort-indicator">
                        {isSorted ? (
                          sortState.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3" />
                        )}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedValues.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {row.map((cell, cellIdx) => {
                  const type = columnTypes[cellIdx];
                  const formatted = formatCellValue(cell);
                  const isNull = cell === null;
                  const isLong = typeof cell === 'string' && cell.length > 50;

                  return (
                    <td
                      key={cellIdx}
                      className={`${type === 'numeric' ? 'col-numeric' : 'col-text'} ${isNull ? 'cell-null' : ''}`}
                      title={isLong ? String(cell) : undefined}
                    >
                      {formatted}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
    if (Number.isInteger(value)) {
      return value.toLocaleString();
    }
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  const str = String(value);
  // Truncate long strings
  if (str.length > 60) {
    return str.substring(0, 57) + '...';
  }

  return str;
}
