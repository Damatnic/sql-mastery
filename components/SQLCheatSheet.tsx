'use client';

import { useState, useCallback, useEffect } from 'react';

export interface CheatSheetSection {
  title: string;
  items: Array<{
    syntax: string;
    description: string;
    example?: string;
  }>;
}

export const CHEAT_SHEET_DATA: CheatSheetSection[] = [
  {
    title: 'Basic Queries',
    items: [
      { syntax: 'SELECT', description: 'Retrieve columns from a table', example: 'SELECT name, salary FROM employees' },
      { syntax: 'SELECT *', description: 'Retrieve all columns', example: 'SELECT * FROM employees' },
      { syntax: 'SELECT DISTINCT', description: 'Remove duplicate rows', example: 'SELECT DISTINCT department FROM employees' },
      { syntax: 'FROM', description: 'Specify the table', example: 'FROM table_name' },
    ],
  },
  {
    title: 'Filtering',
    items: [
      { syntax: 'WHERE', description: 'Filter rows by condition', example: "WHERE salary > 50000" },
      { syntax: 'AND / OR', description: 'Combine conditions', example: "WHERE age > 25 AND city = 'NYC'" },
      { syntax: 'IN (...)' , description: 'Match any value in list', example: "WHERE dept IN ('Sales', 'HR')" },
      { syntax: 'BETWEEN a AND b', description: 'Value in range (inclusive)', example: 'WHERE salary BETWEEN 40000 AND 80000' },
      { syntax: "LIKE '%pattern%'", description: 'Text pattern match', example: "WHERE name LIKE 'J%'" },
      { syntax: 'IS NULL / IS NOT NULL', description: 'Check for null values', example: 'WHERE manager_id IS NOT NULL' },
    ],
  },
  {
    title: 'Sorting & Limiting',
    items: [
      { syntax: 'ORDER BY col', description: 'Sort results (default ASC)', example: 'ORDER BY salary DESC' },
      { syntax: 'ORDER BY col1, col2', description: 'Multi-column sort', example: 'ORDER BY dept ASC, salary DESC' },
      { syntax: 'LIMIT n', description: 'Return first n rows', example: 'LIMIT 10' },
      { syntax: 'LIMIT n OFFSET m', description: 'Skip m rows, return n', example: 'LIMIT 10 OFFSET 20' },
    ],
  },
  {
    title: 'Aggregation',
    items: [
      { syntax: 'COUNT(*)', description: 'Count all rows', example: 'SELECT COUNT(*) FROM employees' },
      { syntax: 'COUNT(col)', description: 'Count non-null values', example: 'SELECT COUNT(email) FROM users' },
      { syntax: 'SUM(col)', description: 'Sum of values', example: 'SELECT SUM(salary) FROM employees' },
      { syntax: 'AVG(col)', description: 'Average of values', example: 'SELECT AVG(salary) FROM employees' },
      { syntax: 'MIN(col) / MAX(col)', description: 'Minimum/Maximum value', example: 'SELECT MAX(salary) FROM employees' },
      { syntax: 'GROUP BY col', description: 'Group rows for aggregation', example: 'GROUP BY department' },
      { syntax: 'HAVING condition', description: 'Filter groups (after GROUP BY)', example: 'HAVING COUNT(*) > 5' },
    ],
  },
  {
    title: 'Joins',
    items: [
      { syntax: 'INNER JOIN', description: 'Only matching rows from both tables', example: 'FROM a INNER JOIN b ON a.id = b.a_id' },
      { syntax: 'LEFT JOIN', description: 'All from left + matching from right', example: 'FROM a LEFT JOIN b ON a.id = b.a_id' },
      { syntax: 'RIGHT JOIN', description: 'All from right + matching from left', example: 'FROM a RIGHT JOIN b ON a.id = b.a_id' },
      { syntax: 'ON condition', description: 'Join condition', example: 'ON employees.dept_id = departments.id' },
    ],
  },
  {
    title: 'Subqueries',
    items: [
      { syntax: 'WHERE col IN (SELECT ...)', description: 'Filter using subquery', example: "WHERE dept_id IN (SELECT id FROM depts WHERE loc = 'NYC')" },
      { syntax: 'WHERE col = (SELECT ...)', description: 'Compare with single value', example: 'WHERE salary = (SELECT MAX(salary) FROM employees)' },
      { syntax: 'FROM (SELECT ...) AS alias', description: 'Subquery as table', example: 'FROM (SELECT * FROM t1) AS sub' },
    ],
  },
  {
    title: 'CASE Expressions',
    items: [
      { syntax: 'CASE WHEN ... THEN ... END', description: 'Inline conditional value', example: "CASE WHEN sal > 100000 THEN 'High' ELSE 'Normal' END" },
      { syntax: 'CASE col WHEN x THEN ...', description: 'Simple CASE; compare one column against values', example: "CASE dept WHEN 'Eng' THEN 1 ELSE 0 END" },
      { syntax: 'Multiple WHEN clauses', description: 'Stack conditions; first match wins', example: "CASE WHEN x < 10 THEN 'low' WHEN x < 50 THEN 'mid' ELSE 'hi' END" },
      { syntax: 'CASE inside aggregation', description: 'Conditional counts and sums', example: 'SUM(CASE WHEN active THEN 1 ELSE 0 END)' },
    ],
  },
  {
    title: 'CTEs (WITH clause)',
    items: [
      { syntax: 'WITH name AS (...)', description: 'Named subquery; reuse below', example: 'WITH big AS (SELECT * FROM e WHERE salary > 90000) SELECT * FROM big' },
      { syntax: 'Multiple CTEs', description: 'Comma-separate; each can reference earlier ones', example: 'WITH a AS (...), b AS (SELECT * FROM a) SELECT * FROM b' },
      { syntax: 'WITH RECURSIVE name AS (...)', description: 'Recursive CTE; base case UNION ALL recursive case', example: 'WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i+1 FROM n WHERE i < 10) SELECT * FROM n' },
    ],
  },
  {
    title: 'Window Functions',
    items: [
      { syntax: 'ROW_NUMBER() OVER (...)', description: 'Sequential number; no ties', example: 'ROW_NUMBER() OVER (ORDER BY salary DESC)' },
      { syntax: 'RANK() OVER (...)', description: 'Gaps after ties (1,2,2,4)', example: 'RANK() OVER (ORDER BY salary DESC)' },
      { syntax: 'DENSE_RANK() OVER (...)', description: 'No gaps after ties (1,2,2,3)', example: 'DENSE_RANK() OVER (ORDER BY salary DESC)' },
      { syntax: 'PARTITION BY col', description: 'Reset window per partition', example: 'RANK() OVER (PARTITION BY dept ORDER BY salary DESC)' },
      { syntax: 'LAG(col, n)', description: 'Value from n rows back', example: 'LAG(salary, 1) OVER (ORDER BY hire_date)' },
      { syntax: 'LEAD(col, n)', description: 'Value from n rows ahead', example: 'LEAD(salary, 1) OVER (ORDER BY hire_date)' },
      { syntax: 'SUM(...) OVER (...)', description: 'Running totals; any aggregate works', example: 'SUM(salary) OVER (ORDER BY hire_date)' },
      { syntax: 'ROWS BETWEEN', description: 'Custom window frame', example: 'AVG(x) OVER (ORDER BY d ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)' },
    ],
  },
  {
    title: 'Correlated Subqueries',
    items: [
      { syntax: 'WHERE col > (SELECT ... WHERE outer = inner)', description: 'Subquery references the outer row', example: 'WHERE salary > (SELECT AVG(salary) FROM e e2 WHERE e2.dept = e.dept)' },
      { syntax: 'EXISTS (SELECT 1 ...)', description: 'Existence check; faster than IN for big sets', example: 'WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id)' },
      { syntax: 'NOT EXISTS', description: 'Inverse; rows with no match', example: 'WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id)' },
    ],
  },
  {
    title: 'Other',
    items: [
      { syntax: 'AS alias', description: 'Rename column/table', example: 'SELECT name AS employee_name' },
      { syntax: 'COALESCE(a, b)', description: 'First non-null value', example: 'COALESCE(nickname, name)' },
      { syntax: 'UNION', description: 'Combine results (removes duplicates)', example: 'SELECT ... UNION SELECT ...' },
      { syntax: 'UNION ALL', description: 'Combine results (keep duplicates)', example: 'SELECT ... UNION ALL SELECT ...' },
    ],
  },
];

interface SQLCheatSheetProps {
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

export default function SQLCheatSheet({
  className = '',
  open: controlledOpen,
  onOpenChange,
  hideTrigger,
}: SQLCheatSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const setIsOpen = useCallback(
    (v: boolean) => {
      if (onOpenChange) onOpenChange(v);
      else setInternalOpen(v);
    },
    [onOpenChange],
  );

  // Close on Escape key while open
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, setIsOpen]);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Basic Queries', 'Filtering']));

  const toggleSection = (title: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  return (
    <>
      {!hideTrigger && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-36 right-6 z-30 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-indigo-400/50 rounded text-slate-300 hover:text-slate-100 font-mono text-xs shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${className}`}
          aria-label="Open cheat sheet"
        >
          $ cat cheatsheet.sql
        </button>
      )}

      {isOpen && (
        <div
          className="fixed inset-y-0 right-0 z-50 w-96 bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col animate-slide-down font-mono text-sm"
          role="dialog"
          aria-label="SQL cheat sheet"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <span className="text-slate-100">
              <span className="text-indigo-400">&gt; </span>cheatsheet
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="px-2 py-1 rounded border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-600 transition-colors text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              aria-label="Close cheat sheet"
            >
              close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {CHEAT_SHEET_DATA.map(section => (
              <div key={section.title} className="border-b border-slate-800/60">
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-slate-900 transition-colors text-left text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <span aria-hidden="true" className="text-slate-500 w-3">
                    {expandedSections.has(section.title) ? '▼' : '▶'}
                  </span>
                  <span className="text-slate-200"># {section.title.toLowerCase()}</span>
                  <span className="ml-auto text-slate-600">{section.items.length}</span>
                </button>

                {expandedSections.has(section.title) && (
                  <ul className="px-4 pb-3 space-y-2 text-xs">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="grid grid-cols-[auto_1fr] gap-3 items-start">
                        <code className="text-indigo-300 whitespace-nowrap">{item.syntax}</code>
                        <span className="text-slate-400">{item.description}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div className="px-4 py-2.5 border-t border-slate-800 text-xs text-slate-500">
            # quick reference
          </div>
        </div>
      )}
    </>
  );
}
