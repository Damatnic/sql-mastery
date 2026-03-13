// sql.js wrapper for client-side SQLite operations
// IMPORTANT: This module must only be used client-side

import type { Database as SqlJsDatabase, SqlJsStatic, QueryExecResult } from 'sql.js';

export interface QueryResult {
  success: true;
  results: QueryExecResult[];
  rowCount: number;
}

export interface QueryError {
  success: false;
  error: string;
}

export type QueryResponse = QueryResult | QueryError;

let SQL: SqlJsStatic | null = null;

/**
 * Initialize and return the sql.js library
 * Uses singleton pattern to ensure WASM is only loaded once
 */
export async function getSql(): Promise<SqlJsStatic> {
  if (SQL) {
    return SQL;
  }

  // Dynamic import to ensure client-side only
  const initSqlJs = (await import('sql.js')).default;

  const loadedSQL = await initSqlJs({
    locateFile: () => '/sql-wasm.wasm',
  });

  SQL = loadedSQL;

  return loadedSQL;
}

/**
 * Create a new database and initialize with schema SQL
 */
export async function createDatabase(schema: string): Promise<SqlJsDatabase> {
  const SqlJs = await getSql();
  const db = new SqlJs.Database();

  // Initialize with schema (may contain multiple statements)
  db.run(schema);

  return db;
}

/**
 * Run a query on the database and return results
 */
export function runQuery(db: SqlJsDatabase, sql: string): QueryResponse {
  try {
    const results = db.exec(sql);

    // Calculate total row count across all result sets
    const rowCount = results.reduce((sum: number, r: QueryExecResult) => sum + r.values.length, 0);

    return {
      success: true,
      results,
      rowCount,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get table names from a database
 */
export function getTableNames(db: SqlJsDatabase): string[] {
  const result = db.exec(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  );

  if (result.length === 0) return [];

  return result[0].values.map((row: unknown[]) => String(row[0]));
}

/**
 * Get column info for a specific table
 */
export function getTableSchema(db: SqlJsDatabase, tableName: string): Array<{
  name: string;
  type: string;
  notnull: boolean;
  pk: boolean;
}> {
  const result = db.exec(`PRAGMA table_info("${tableName}")`);

  if (result.length === 0) return [];

  return result[0].values.map((row: unknown[]) => ({
    name: String(row[1]),
    type: String(row[2]),
    notnull: Boolean(row[3]),
    pk: Boolean(row[5]),
  }));
}

/**
 * Get full schema info for all tables in database
 */
export function getDatabaseSchema(db: SqlJsDatabase): Record<string, Array<{
  name: string;
  type: string;
  notnull: boolean;
  pk: boolean;
}>> {
  const tables = getTableNames(db);
  const schema: Record<string, Array<{
    name: string;
    type: string;
    notnull: boolean;
    pk: boolean;
  }>> = {};

  for (const table of tables) {
    schema[table] = getTableSchema(db, table);
  }

  return schema;
}
