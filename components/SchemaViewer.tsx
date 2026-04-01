'use client';

import { useState, useMemo, useCallback } from 'react';
import { Database, Table2, ChevronDown, ChevronRight, Key, Hash, Type, X, Search, Calendar, Link2, Eye, EyeOff } from 'lucide-react';
import { getDatabaseSchema, getTableNames, runQuery } from '@/lib/db';
import type { Database as SqlJsDatabase } from 'sql.js';

interface SchemaViewerProps {
  database: SqlJsDatabase | null;
  databaseName: string;
  className?: string;
}

interface ColumnInfo {
  name: string;
  type: string;
  notnull: boolean;
  pk: boolean;
  fk?: { table: string; column: string };
}

interface TableInfo {
  name: string;
  columns: ColumnInfo[];
}

// Common FK patterns to detect relationships
const FK_PATTERNS = [
  { pattern: /^(\w+)_id$/i, extractor: (match: RegExpMatchArray) => match[1] },
  { pattern: /^(\w+)Id$/i, extractor: (match: RegExpMatchArray) => match[1].toLowerCase() },
];

export default function SchemaViewer({ database, databaseName, className = '' }: SchemaViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [previewTable, setPreviewTable] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRelationships, setShowRelationships] = useState(true);

  // Derive tables and detect relationships
  const tables = useMemo<TableInfo[]>(() => {
    if (!database) return [];
    const tableNames = getTableNames(database);
    const schema = getDatabaseSchema(database);

    // First pass: get all tables and columns
    const tableList = tableNames.map(name => ({
      name,
      columns: (schema[name] || []).map(col => ({ ...col, fk: undefined as ColumnInfo['fk'] })),
    }));

    // Second pass: detect foreign keys based on naming conventions
    tableList.forEach(table => {
      table.columns.forEach(column => {
        if (column.pk) return; // Skip primary keys

        for (const { pattern, extractor } of FK_PATTERNS) {
          const match = column.name.match(pattern);
          if (match) {
            const potentialTable = extractor(match);
            // Check if this table exists (pluralize check)
            const targetTable = tableNames.find(t =>
              t.toLowerCase() === potentialTable ||
              t.toLowerCase() === potentialTable + 's' ||
              t.toLowerCase() === potentialTable + 'es'
            );
            if (targetTable) {
              column.fk = { table: targetTable, column: 'id' };
            }
            break;
          }
        }
      });
    });

    return tableList;
  }, [database]);

  // Get sample data for a table
  const sampleData = useMemo(() => {
    if (!database || !previewTable) return null;
    const result = runQuery(database, `SELECT * FROM ${previewTable} LIMIT 5`);
    if (result.success && result.results.length > 0) {
      return result.results[0];
    }
    return null;
  }, [database, previewTable]);

  // Filter tables and columns based on search
  const filteredTables = useMemo(() => {
    if (!searchQuery.trim()) return tables;

    const query = searchQuery.toLowerCase();
    return tables
      .map(table => {
        const tableMatches = table.name.toLowerCase().includes(query);
        const matchingColumns = table.columns.filter(col =>
          col.name.toLowerCase().includes(query) || col.type.toLowerCase().includes(query)
        );

        if (tableMatches) {
          return { ...table, highlighted: true as const };
        } else if (matchingColumns.length > 0) {
          return { ...table, columns: matchingColumns, highlighted: false as const };
        }
        return null;
      })
      .filter((t): t is (TableInfo & { highlighted: boolean }) => t !== null);
  }, [tables, searchQuery]);

  const toggleTable = useCallback((tableName: string) => {
    setExpandedTables(prev => {
      const next = new Set(prev);
      if (next.has(tableName)) {
        next.delete(tableName);
      } else {
        next.add(tableName);
      }
      return next;
    });
  }, []);

  const getTypeIcon = (type: string, column: ColumnInfo) => {
    if (column.pk) return <Key className="w-3.5 h-3.5 text-amber-400" />;
    if (column.fk) return <Link2 className="w-3.5 h-3.5 text-blue-400" />;

    const upperType = type.toUpperCase();
    if (upperType.includes('INT')) return <Hash className="w-3.5 h-3.5 text-emerald-400" />;
    if (upperType.includes('REAL') || upperType.includes('FLOAT') || upperType.includes('DOUBLE') || upperType.includes('DECIMAL')) {
      return <Hash className="w-3.5 h-3.5 text-purple-400" />;
    }
    if (upperType.includes('DATE') || upperType.includes('TIME')) return <Calendar className="w-3.5 h-3.5 text-cyan-400" />;
    return <Type className="w-3.5 h-3.5 text-slate-400" />;
  };

  if (!database) return null;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 right-6 z-30 flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-full text-slate-300 text-sm font-medium shadow-lg transition-all duration-200 ${className}`}
      >
        <Database className="w-4 h-4 text-indigo-400" />
        <span>Schema</span>
      </button>

      {/* Schema Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-96 bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col animate-slide-down">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-gradient-to-b from-slate-800/80 to-slate-900">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              <span className="font-semibold text-white">Database Explorer</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Database Name */}
          <div className="px-4 py-2 bg-slate-800/30 border-b border-slate-700/50 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Database</span>
              <p className="text-sm font-medium text-slate-300 capitalize">{databaseName}</p>
            </div>
            <button
              onClick={() => setShowRelationships(!showRelationships)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${showRelationships ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-700 text-slate-400'
                }`}
              title="Toggle relationship indicators"
            >
              <Link2 className="w-3 h-3" />
              <span>FKs</span>
            </button>
          </div>

          {/* Search */}
          <div className="px-3 py-2 border-b border-slate-700/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search tables and columns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          {/* Legend */}
          <div className="px-4 py-2 border-b border-slate-700/50 flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Key className="w-3 h-3 text-amber-400" /> PK
            </span>
            {showRelationships && (
              <span className="flex items-center gap-1">
                <Link2 className="w-3 h-3 text-blue-400" /> FK
              </span>
            )}
            <span className="flex items-center gap-1">
              <Hash className="w-3 h-3 text-emerald-400" /> Number
            </span>
            <span className="flex items-center gap-1">
              <Type className="w-3 h-3 text-slate-400" /> Text
            </span>
          </div>

          {/* Tables List */}
          <div className="flex-1 overflow-y-auto">
            {filteredTables.map(table => (
              <div key={table.name} className="border-b border-slate-800">
                <button
                  onClick={() => toggleTable(table.name)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-slate-800/50 transition-colors text-left"
                >
                  {expandedTables.has(table.name) ? (
                    <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  )}
                  <Table2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="font-medium text-slate-200">{table.name}</span>
                  <span className="ml-auto text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                    {table.columns.length}
                  </span>
                </button>

                {expandedTables.has(table.name) && (
                  <div className="bg-slate-950/50 border-t border-slate-800">
                    {/* Column list */}
                    <div className="px-4 py-2 space-y-1">
                      {table.columns.map(column => (
                        <div
                          key={column.name}
                          className="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-slate-800/50 group"
                        >
                          <span title={column.pk ? 'Primary Key' : column.fk ? `References ${column.fk.table}` : column.type}>
                            {getTypeIcon(column.type, column)}
                          </span>
                          <span className={`font-mono text-sm ${column.pk
                              ? 'text-amber-300 font-medium'
                              : column.fk
                                ? 'text-blue-300'
                                : 'text-slate-300'
                            }`}>
                            {column.name}
                          </span>

                          {showRelationships && column.fk && (
                            <span className="text-xs text-blue-400/70 ml-1">
                              → {column.fk.table}
                            </span>
                          )}

                          <span className="ml-auto text-xs text-slate-500 font-mono opacity-60 group-hover:opacity-100">
                            {column.type}
                          </span>

                          {column.notnull && !column.pk && (
                            <span className="text-[9px] text-orange-400/70 font-medium px-1 bg-orange-400/10 rounded">
                              REQ
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Sample data toggle */}
                    <div className="px-4 py-2 border-t border-slate-800">
                      <button
                        onClick={() => setPreviewTable(previewTable === table.name ? null : table.name)}
                        className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-300 transition-colors"
                      >
                        {previewTable === table.name ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Hide sample data</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview sample data</span>
                          </>
                        )}
                      </button>

                      {/* Sample data display */}
                      {previewTable === table.name && sampleData && (
                        <div className="mt-2 overflow-x-auto rounded border border-slate-700 bg-slate-900">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-slate-800">
                                {sampleData.columns.map((col, i) => (
                                  <th key={i} className="px-2 py-1.5 text-left text-slate-400 font-medium whitespace-nowrap">
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {sampleData.values.map((row, rowIdx) => (
                                <tr key={rowIdx} className={rowIdx % 2 === 1 ? 'bg-slate-800/30' : ''}>
                                  {row.map((cell, cellIdx) => (
                                    <td key={cellIdx} className="px-2 py-1 text-slate-300 whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis">
                                      {cell === null ? (
                                        <span className="text-slate-500 italic">null</span>
                                      ) : (
                                        String(cell)
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div className="px-2 py-1 text-[10px] text-slate-500 border-t border-slate-700 bg-slate-800/50">
                            Showing {sampleData.values.length} row{sampleData.values.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredTables.length === 0 && searchQuery && (
              <div className="px-4 py-8 text-center text-slate-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No matching tables or columns</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/30 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {tables.length} table{tables.length !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-slate-500">
              {tables.reduce((sum, t) => sum + t.columns.length, 0)} columns
            </p>
          </div>
        </div>
      )}
    </>
  );
}
