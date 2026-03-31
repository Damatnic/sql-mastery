'use client';

import { useState, useMemo, useCallback } from 'react';
import { Database, Table2, ChevronDown, ChevronRight, Key, Hash, Type, X } from 'lucide-react';
import { getDatabaseSchema, getTableNames } from '@/lib/db';
import type { Database as SqlJsDatabase } from 'sql.js';

interface SchemaViewerProps {
  database: SqlJsDatabase | null;
  databaseName: string;
  className?: string;
}

interface TableInfo {
  name: string;
  columns: Array<{
    name: string;
    type: string;
    notnull: boolean;
    pk: boolean;
  }>;
}

export default function SchemaViewer({ database, databaseName, className = '' }: SchemaViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

  // Derive tables from database using useMemo
  const tables = useMemo<TableInfo[]>(() => {
    if (!database) return [];
    const tableNames = getTableNames(database);
    const schema = getDatabaseSchema(database);
    return tableNames.map(name => ({
      name,
      columns: schema[name] || [],
    }));
  }, [database]);

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

  const getTypeIcon = (type: string) => {
    const upperType = type.toUpperCase();
    if (upperType.includes('INT')) return <Hash className="w-3 h-3 text-blue-400" />;
    if (upperType.includes('TEXT') || upperType.includes('VARCHAR') || upperType.includes('CHAR')) return <Type className="w-3 h-3 text-green-400" />;
    if (upperType.includes('REAL') || upperType.includes('FLOAT') || upperType.includes('DOUBLE')) return <Hash className="w-3 h-3 text-amber-400" />;
    return <Type className="w-3 h-3 text-slate-400" />;
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
        <div className="fixed inset-y-0 right-0 z-50 w-80 bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/50">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              <span className="font-semibold text-white">Database Schema</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Database Name */}
          <div className="px-4 py-2 bg-slate-800/30 border-b border-slate-700/50">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Database</span>
            <p className="text-sm font-medium text-slate-300 capitalize">{databaseName}</p>
          </div>

          {/* Tables List */}
          <div className="flex-1 overflow-y-auto p-2">
            {tables.map(table => (
              <div key={table.name} className="mb-1">
                <button
                  onClick={() => toggleTable(table.name)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-left"
                >
                  {expandedTables.has(table.name) ? (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  )}
                  <Table2 className="w-4 h-4 text-amber-400" />
                  <span className="font-medium text-slate-200">{table.name}</span>
                  <span className="ml-auto text-xs text-slate-500">{table.columns.length} cols</span>
                </button>

                {expandedTables.has(table.name) && (
                  <div className="ml-6 pl-3 border-l border-slate-700 mt-1 mb-2">
                    {table.columns.map(column => (
                      <div
                        key={column.name}
                        className="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-slate-800/50"
                      >
                        {column.pk ? (
                          <span title="Primary Key">
                            <Key className="w-3 h-3 text-amber-400" />
                          </span>
                        ) : (
                          getTypeIcon(column.type)
                        )}
                        <span className={`${column.pk ? 'text-amber-300 font-medium' : 'text-slate-300'}`}>
                          {column.name}
                        </span>
                        <span className="ml-auto text-xs text-slate-500 font-mono">
                          {column.type}
                        </span>
                        {column.notnull && !column.pk && (
                          <span className="text-[10px] text-red-400/70 font-medium">NOT NULL</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/30">
            <p className="text-xs text-slate-500">
              {tables.length} table{tables.length !== 1 ? 's' : ''} in this database
            </p>
          </div>
        </div>
      )}
    </>
  );
}
