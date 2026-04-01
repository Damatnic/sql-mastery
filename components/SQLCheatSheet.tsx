'use client';

import { useState } from 'react';
import { BookOpen, X, ChevronDown, ChevronRight, Code2 } from 'lucide-react';

interface CheatSheetSection {
  title: string;
  items: Array<{
    syntax: string;
    description: string;
    example?: string;
  }>;
}

const CHEAT_SHEET_DATA: CheatSheetSection[] = [
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
    title: 'Other',
    items: [
      { syntax: 'AS alias', description: 'Rename column/table', example: 'SELECT name AS employee_name' },
      { syntax: 'COALESCE(a, b)', description: 'First non-null value', example: 'COALESCE(nickname, name)' },
      { syntax: 'CASE WHEN ... THEN ... END', description: 'Conditional logic', example: "CASE WHEN sal > 100000 THEN 'High' ELSE 'Normal' END" },
      { syntax: 'UNION', description: 'Combine results (removes duplicates)', example: 'SELECT ... UNION SELECT ...' },
      { syntax: 'UNION ALL', description: 'Combine results (keep duplicates)', example: 'SELECT ... UNION ALL SELECT ...' },
    ],
  },
];

interface SQLCheatSheetProps {
  className?: string;
}

export default function SQLCheatSheet({ className = '' }: SQLCheatSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
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
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-36 right-6 z-30 flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-full text-slate-300 text-sm font-medium shadow-lg transition-all duration-200 ${className}`}
      >
        <BookOpen className="w-4 h-4 text-emerald-400" />
        <span>Cheat Sheet</span>
      </button>

      {/* Cheat Sheet Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-96 bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col animate-slide-down">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-gradient-to-b from-slate-800/80 to-slate-900">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-emerald-400" />
              <span className="font-semibold text-white">SQL Cheat Sheet</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {CHEAT_SHEET_DATA.map(section => (
              <div key={section.title} className="border-b border-slate-800">
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-800/50 transition-colors text-left"
                >
                  {expandedSections.has(section.title) ? (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  )}
                  <span className="font-medium text-slate-200">{section.title}</span>
                  <span className="ml-auto text-xs text-slate-500">{section.items.length}</span>
                </button>

                {expandedSections.has(section.title) && (
                  <div className="px-4 pb-3 space-y-2">
                    {section.items.map((item, idx) => (
                      <div key={idx} className="cheat-sheet-item">
                        <code className="cheat-sheet-syntax">{item.syntax}</code>
                        <span className="cheat-sheet-desc">{item.description}</span>
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
              Quick reference for common SQL syntax
            </p>
          </div>
        </div>
      )}
    </>
  );
}
