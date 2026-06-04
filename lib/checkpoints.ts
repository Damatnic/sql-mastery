// Module checkpoints: a short mixed quiz at the end of each module that checks
// understanding (multiple choice) and gives fill-in-the-blank query practice.
// Every item is grounded in concepts that module teaches, with no forward
// references. Fill-in `runnable` is the canonical fully-filled query and is
// verified against the real sql.js engine in the test harness.

export type CheckpointDatabase = 'company' | 'store' | 'school';

export interface McqItem {
  kind: 'mcq';
  question: string;
  options: string[];
  answer: number; // index into options
  explain: string;
}

export interface FillItem {
  kind: 'fill';
  prompt: string;
  // The query with one or more `___` blanks. Splitting on `___` yields the
  // segments; the learner fills the gaps.
  template: string;
  // Accepted answers per blank (compared case- and whitespace-insensitively).
  // The first entry of each blank, substituted into the template, must equal
  // `runnable`.
  answers: string[][];
  explain: string;
  runnable: string;
  database: CheckpointDatabase;
}

export type CheckpointItem = McqItem | FillItem;

export function getCheckpoint(moduleSlug: string): CheckpointItem[] {
  return MODULE_CHECKPOINTS[moduleSlug] ?? [];
}

export function hasCheckpoint(moduleSlug: string): boolean {
  return (MODULE_CHECKPOINTS[moduleSlug]?.length ?? 0) > 0;
}

export const MODULE_CHECKPOINTS: Record<string, CheckpointItem[]> = {
  'start-here': [
    {
      kind: 'mcq',
      question: 'In a database table, what does one row represent?',
      options: ['One column of data', 'One single record (one item)', 'The whole table', 'A type of query'],
      answer: 1,
      explain: 'A row is one record. Columns are the fields each record has.',
    },
    {
      kind: 'mcq',
      question: 'What does SELECT * FROM employees; return?',
      options: ['Only the first column', 'Every column for every row in employees', 'Just the column names', 'Nothing until you add WHERE'],
      answer: 1,
      explain: 'The * means every column, and with no WHERE you get every row.',
    },
    {
      kind: 'fill',
      prompt: 'Read every column from the departments table.',
      template: 'SELECT ___ FROM departments;',
      answers: [['*']],
      explain: '* is the shorthand for all columns.',
      runnable: 'SELECT * FROM departments;',
      database: 'company',
    },
    {
      kind: 'fill',
      prompt: 'Return just the name column from the employees table.',
      template: 'SELECT name ___ employees;',
      answers: [['FROM']],
      explain: 'FROM names the table the rows come from.',
      runnable: 'SELECT name FROM employees;',
      database: 'company',
    },
  ],

  'getting-started': [
    {
      kind: 'mcq',
      question: 'Which clause keeps only the rows that match a condition?',
      options: ['ORDER BY', 'WHERE', 'LIMIT', 'SELECT'],
      answer: 1,
      explain: 'WHERE filters rows. ORDER BY sorts, LIMIT caps the count.',
    },
    {
      kind: 'mcq',
      question: 'How do you sort results from highest salary to lowest?',
      options: ['ORDER BY salary', 'ORDER BY salary ASC', 'ORDER BY salary DESC', 'SORT salary DOWN'],
      answer: 2,
      explain: 'DESC is descending (high to low). ASC (the default) is low to high.',
    },
    {
      kind: 'mcq',
      question: 'What does DISTINCT do in SELECT DISTINCT department FROM employees?',
      options: ['Counts the departments', 'Removes duplicate department values', 'Sorts the departments', 'Filters out NULLs'],
      answer: 1,
      explain: 'DISTINCT collapses duplicate rows so each value appears once.',
    },
    {
      kind: 'fill',
      prompt: 'Find employees who earn more than 90000. Show name and salary.',
      template: 'SELECT name, salary FROM employees ___ salary > 90000;',
      answers: [['WHERE']],
      explain: 'WHERE filters to rows meeting the condition.',
      runnable: 'SELECT name, salary FROM employees WHERE salary > 90000;',
      database: 'company',
    },
    {
      kind: 'fill',
      prompt: 'Show the 5 highest-paid employees (name and salary), highest first.',
      template: 'SELECT name, salary FROM employees ORDER BY salary ___ LIMIT 5;',
      answers: [['DESC']],
      explain: 'DESC sorts high to low; LIMIT 5 keeps the top five.',
      runnable: 'SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 5;',
      database: 'company',
    },
  ],

  'data-analysis': [
    {
      kind: 'mcq',
      question: 'What does COUNT(*) return?',
      options: ['The sum of a column', 'The number of rows', 'The distinct values', 'The largest value'],
      answer: 1,
      explain: 'COUNT(*) counts rows. SUM adds a numeric column.',
    },
    {
      kind: 'mcq',
      question: 'You want the average salary per department. Which clause groups the rows?',
      options: ['WHERE department', 'GROUP BY department', 'ORDER BY department', 'HAVING department'],
      answer: 1,
      explain: 'GROUP BY collapses rows that share a value so aggregates run per group.',
    },
    {
      kind: 'mcq',
      question: 'WHERE filters individual rows. What filters the grouped results (e.g. keep groups with AVG(salary) > 80000)?',
      options: ['WHERE', 'HAVING', 'LIMIT', 'DISTINCT'],
      answer: 1,
      explain: 'HAVING filters after grouping; WHERE filters before grouping.',
    },
    {
      kind: 'fill',
      prompt: 'Count how many employees are in each department. Show department and the count.',
      template: 'SELECT department, COUNT(*) AS headcount FROM employees ___ department;',
      answers: [['GROUP BY']],
      explain: 'GROUP BY department makes COUNT(*) run once per department.',
      runnable: 'SELECT department, COUNT(*) AS headcount FROM employees GROUP BY department;',
      database: 'company',
    },
    {
      kind: 'fill',
      prompt: 'Label each employee Senior if salary is at least 100000, otherwise Junior. Show name and the label.',
      template: 'SELECT name,\n  ___ WHEN salary >= 100000 THEN \'Senior\' ELSE \'Junior\' END AS level\nFROM employees;',
      answers: [['CASE']],
      explain: 'CASE WHEN ... THEN ... ELSE ... END is SQL inline if/else.',
      runnable: "SELECT name,\n  CASE WHEN salary >= 100000 THEN 'Senior' ELSE 'Junior' END AS level\nFROM employees;",
      database: 'company',
    },
  ],

  'joining-tables': [
    {
      kind: 'mcq',
      question: 'An INNER JOIN between employees and departments returns...',
      options: ['Every employee, even with no matching department', 'Only rows where the join condition matches on both sides', 'Every department, even with no employees', 'All rows from both tables stacked'],
      answer: 1,
      explain: 'INNER JOIN keeps only matched rows. LEFT JOIN keeps unmatched left rows too.',
    },
    {
      kind: 'mcq',
      question: 'Which JOIN keeps every row from the left table even when there is no match on the right?',
      options: ['INNER JOIN', 'LEFT JOIN', 'CROSS JOIN', 'SELF JOIN'],
      answer: 1,
      explain: 'LEFT JOIN keeps all left rows, filling NULL where the right has no match.',
    },
    {
      kind: 'mcq',
      question: 'After LEFT JOIN, how do you find left rows that had NO match (the anti-join)?',
      options: ['WHERE right_column = 0', 'WHERE right_column IS NULL', 'HAVING COUNT(*) = 0', 'ORDER BY right_column'],
      answer: 1,
      explain: 'Unmatched right side is NULL, so WHERE right_col IS NULL isolates the gaps.',
    },
    {
      kind: 'fill',
      prompt: 'Show each employee name with their department location. Join employees to departments on the department name.',
      template: 'SELECT e.name, d.location\nFROM employees e\n___ JOIN departments d ON e.department = d.name;',
      answers: [['INNER', 'JOIN']],
      explain: 'INNER JOIN matches each employee to its department row via the ON condition.',
      runnable: 'SELECT e.name, d.location\nFROM employees e\nINNER JOIN departments d ON e.department = d.name;',
      database: 'company',
    },
  ],

  'subqueries-ctes': [
    {
      kind: 'mcq',
      question: 'When comparing to a subquery that returns MANY rows, which operator is correct?',
      options: ['=', 'IN', 'LIKE', 'AND'],
      answer: 1,
      explain: 'Use IN for multi-row subqueries; = is only for a guaranteed single value.',
    },
    {
      kind: 'mcq',
      question: 'What is a CTE (the WITH clause) mainly for?',
      options: ['Speeding up every query automatically', 'Naming a subquery so the main query reads top to bottom', 'Creating a permanent table', 'Replacing GROUP BY'],
      answer: 1,
      explain: 'A CTE names a temporary result so complex queries read in order.',
    },
    {
      kind: 'mcq',
      question: 'A correlated subquery is one that...',
      options: ['Runs once before the main query', 'References a column from the outer query, so it re-runs per outer row', 'Cannot use WHERE', 'Always returns one row'],
      answer: 1,
      explain: 'Correlated subqueries depend on the outer row, so they re-evaluate per row.',
    },
    {
      kind: 'fill',
      prompt: 'Find employees who earn more than the overall average salary. Use a subquery for the average.',
      template: 'SELECT name, salary FROM employees\nWHERE salary > (SELECT ___ FROM employees);',
      answers: [['AVG(salary)']],
      explain: 'The scalar subquery returns one number (the average) to compare against.',
      runnable: 'SELECT name, salary FROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees);',
      database: 'company',
    },
    {
      kind: 'fill',
      prompt: 'Using a CTE named dept_avg, list each department and its average salary.',
      template: '___ dept_avg AS (\n  SELECT department, AVG(salary) AS avg_sal FROM employees GROUP BY department\n)\nSELECT * FROM dept_avg;',
      answers: [['WITH']],
      explain: 'WITH name AS (...) defines a CTE you can then SELECT from.',
      runnable: 'WITH dept_avg AS (\n  SELECT department, AVG(salary) AS avg_sal FROM employees GROUP BY department\n)\nSELECT * FROM dept_avg;',
      database: 'company',
    },
  ],

  'modifying-data': [
    {
      kind: 'mcq',
      question: 'Why is a WHERE clause critical on UPDATE and DELETE?',
      options: ['It sorts the rows', 'Without it, the change applies to EVERY row', 'It makes the query faster', 'It is required syntax'],
      answer: 1,
      explain: 'UPDATE/DELETE with no WHERE hits the whole table. Always scope them.',
    },
    {
      kind: 'mcq',
      question: 'You ran several changes inside a transaction and something went wrong. Which command undoes them?',
      options: ['COMMIT', 'ROLLBACK', 'DELETE', 'RESET'],
      answer: 1,
      explain: 'ROLLBACK discards everything since BEGIN; COMMIT makes it permanent.',
    },
    {
      kind: 'mcq',
      question: 'Which statement adds a new row to a table?',
      options: ['UPDATE', 'INSERT', 'SELECT', 'ALTER'],
      answer: 1,
      explain: 'INSERT adds rows; UPDATE changes existing ones.',
    },
    {
      kind: 'fill',
      prompt: 'Give everyone in the Sales department a raise to 80000. (Run against a scratch copy.)',
      template: 'UPDATE employees ___ salary = 80000 WHERE department = \'Sales\';',
      answers: [['SET']],
      explain: 'UPDATE table SET column = value WHERE ... ; the WHERE scopes it to Sales.',
      runnable: "UPDATE employees SET salary = 80000 WHERE department = 'Sales';",
      database: 'company',
    },
  ],

  functions: [
    {
      kind: 'mcq',
      question: 'Which function returns the number of characters in a text value?',
      options: ['COUNT()', 'LENGTH()', 'SUM()', 'SUBSTR()'],
      answer: 1,
      explain: 'LENGTH() measures a string; COUNT() counts rows.',
    },
    {
      kind: 'mcq',
      question: 'COALESCE(commission, 0) does what?',
      options: ['Rounds commission', 'Returns the first non-NULL value, so NULL becomes 0', 'Counts commissions', 'Casts to text'],
      answer: 1,
      explain: 'COALESCE returns the first non-NULL argument, a clean way to default NULLs.',
    },
    {
      kind: 'mcq',
      question: 'To turn the text "42" into a number you would use...',
      options: ['ROUND("42")', 'CAST("42" AS INTEGER)', 'LENGTH("42")', 'UPPER("42")'],
      answer: 1,
      explain: 'CAST(value AS type) converts between types.',
    },
    {
      kind: 'fill',
      prompt: 'Show every employee name in UPPERCASE.',
      template: 'SELECT ___(name) AS shout FROM employees;',
      answers: [['UPPER']],
      explain: 'UPPER() uppercases text; LOWER() does the opposite.',
      runnable: 'SELECT UPPER(name) AS shout FROM employees;',
      database: 'company',
    },
    {
      kind: 'fill',
      prompt: 'Show each salary rounded to the nearest thousand. (salary / 1000, rounded, times 1000.)',
      template: 'SELECT name, ___(salary / 1000.0) * 1000 AS approx FROM employees;',
      answers: [['ROUND']],
      explain: 'ROUND() rounds a number to the nearest whole value.',
      runnable: 'SELECT name, ROUND(salary / 1000.0) * 1000 AS approx FROM employees;',
      database: 'company',
    },
  ],

  'window-functions': [
    {
      kind: 'mcq',
      question: 'How is a window function different from GROUP BY?',
      options: ['It deletes rows', 'It keeps every row and adds a computed column across a window', 'It only works on text', 'It cannot use ORDER BY'],
      answer: 1,
      explain: 'GROUP BY collapses rows; a window function returns one value per row.',
    },
    {
      kind: 'mcq',
      question: 'PARTITION BY in an OVER clause is like GROUP BY for window functions. It...',
      options: ['Sorts the whole table', 'Restarts the calculation for each group', 'Removes duplicates', 'Limits the rows'],
      answer: 1,
      explain: 'PARTITION BY splits rows into groups; the window function restarts per group.',
    },
    {
      kind: 'mcq',
      question: 'You want a strict 1,2,3,... with no ties or gaps within each department. Which function?',
      options: ['RANK()', 'DENSE_RANK()', 'ROW_NUMBER()', 'COUNT()'],
      answer: 2,
      explain: 'ROW_NUMBER() gives every row a unique sequential number, no ties.',
    },
    {
      kind: 'fill',
      prompt: 'Rank employees by salary (highest = 1) within their department.',
      template: 'SELECT name, department,\n  RANK() ___ (PARTITION BY department ORDER BY salary DESC) AS dept_rank\nFROM employees;',
      answers: [['OVER']],
      explain: 'OVER (...) defines the window: PARTITION BY groups, ORDER BY ranks within it.',
      runnable: 'SELECT name, department,\n  RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank\nFROM employees;',
      database: 'company',
    },
  ],

  'database-objects': [
    {
      kind: 'mcq',
      question: 'What is a VIEW?',
      options: ['A copy of the data', 'A saved query you can SELECT from like a table', 'An index', 'A backup file'],
      answer: 1,
      explain: 'A view is a stored SELECT; querying it re-runs the underlying query.',
    },
    {
      kind: 'mcq',
      question: 'An index mainly helps with...',
      options: ['Making writes faster', 'Finding matching rows faster on reads', 'Saving disk space', 'Sorting output alphabetically'],
      answer: 1,
      explain: 'Indexes speed up lookups at the cost of slightly slower writes and more storage.',
    },
    {
      kind: 'mcq',
      question: 'A trigger is code that runs...',
      options: ['On a schedule', 'Automatically in response to INSERT/UPDATE/DELETE on a table', 'Only when you call it by name', 'Once at database creation'],
      answer: 1,
      explain: 'Triggers fire automatically on the data event you attach them to.',
    },
    {
      kind: 'fill',
      prompt: 'Create a view called high_earners listing employees who make at least 100000, then read it.',
      template: 'CREATE ___ high_earners AS\n  SELECT name, salary FROM employees WHERE salary >= 100000;\nSELECT * FROM high_earners;',
      answers: [['VIEW']],
      explain: 'CREATE VIEW name AS <select> saves the query under a name.',
      runnable: 'CREATE VIEW high_earners AS\n  SELECT name, salary FROM employees WHERE salary >= 100000;\nSELECT * FROM high_earners;',
      database: 'company',
    },
  ],

  advanced: [
    {
      kind: 'mcq',
      question: 'A recursive CTE is useful for...',
      options: ['Simple one-table filters', 'Walking a hierarchy like manager -> reports -> their reports', 'Renaming columns', 'Counting rows'],
      answer: 1,
      explain: 'Recursive CTEs repeat a step to traverse trees and chains.',
    },
    {
      kind: 'mcq',
      question: 'Turning rows into columns (e.g. one column per category) is called...',
      options: ['Normalizing', 'Pivoting', 'Indexing', 'Joining'],
      answer: 1,
      explain: 'Pivoting reshapes long data into a wide, column-per-value layout.',
    },
    {
      kind: 'mcq',
      question: 'A recursive CTE must have a stopping condition or it will...',
      options: ['Return no rows', 'Run forever / error out', 'Sort incorrectly', 'Ignore the WHERE'],
      answer: 1,
      explain: 'Without a terminating case the recursion never ends.',
    },
    {
      kind: 'fill',
      prompt: 'Count employees per department, then keep only departments with more than 3 people.',
      template: 'SELECT department, COUNT(*) AS n FROM employees\nGROUP BY department\n___ COUNT(*) > 3;',
      answers: [['HAVING']],
      explain: 'HAVING filters grouped results; you cannot use COUNT(*) in WHERE.',
      runnable: 'SELECT department, COUNT(*) AS n FROM employees\nGROUP BY department\nHAVING COUNT(*) > 3;',
      database: 'company',
    },
  ],

  'school-advanced': [
    {
      kind: 'mcq',
      question: 'A stored procedure is best described as...',
      options: ['A saved, reusable block of SQL you call by name', 'A type of index', 'A backup', 'A single SELECT'],
      answer: 0,
      explain: 'Stored procedures package multi-statement logic you can call with parameters.',
    },
    {
      kind: 'mcq',
      question: 'A temporary table is mainly used to...',
      options: ['Permanently store results', 'Hold intermediate results during a session, then disappear', 'Replace indexes', 'Speed up every query'],
      answer: 1,
      explain: 'Temp tables stage intermediate work and are dropped when the session ends.',
    },
    {
      kind: 'mcq',
      question: 'Why are parameterized queries preferred over building SQL by string concatenation?',
      options: ['They look nicer', 'They prevent SQL injection and reuse query plans', 'They are required by SQLite', 'They run on more rows'],
      answer: 1,
      explain: 'Parameters separate data from code, blocking injection and helping plan reuse.',
    },
    {
      kind: 'fill',
      prompt: 'List students and their grade level, highest grade level first, then by name.',
      template: 'SELECT name, grade_level FROM students\nORDER BY grade_level DESC, name ___;',
      answers: [['ASC']],
      explain: 'You can sort by several keys; ASC is the ascending tiebreak on name.',
      runnable: 'SELECT name, grade_level FROM students\nORDER BY grade_level DESC, name ASC;',
      database: 'school',
    },
  ],

  'set-design': [
    {
      kind: 'mcq',
      question: 'UNION combines two result sets and, by default...',
      options: ['Keeps duplicates', 'Removes duplicate rows', 'Only keeps the first set', 'Sorts descending'],
      answer: 1,
      explain: 'UNION dedupes; UNION ALL keeps every row including duplicates.',
    },
    {
      kind: 'mcq',
      question: 'Which set operator returns only rows present in BOTH queries?',
      options: ['UNION', 'INTERSECT', 'EXCEPT', 'JOIN'],
      answer: 1,
      explain: 'INTERSECT keeps the overlap; EXCEPT subtracts one set from the other.',
    },
    {
      kind: 'mcq',
      question: 'A primary key must be...',
      options: ['Text only', 'Unique and not NULL for each row', 'The first column', 'The same for every row'],
      answer: 1,
      explain: 'A primary key uniquely identifies each row, so it cannot repeat or be NULL.',
    },
    {
      kind: 'fill',
      prompt: 'Stack the distinct department names and the distinct employee names into one column of labels.',
      template: 'SELECT department AS label FROM employees\n___\nSELECT name FROM employees;',
      answers: [['UNION']],
      explain: 'UNION stacks two same-shape SELECTs and removes duplicates.',
      runnable: 'SELECT department AS label FROM employees\nUNION\nSELECT name FROM employees;',
      database: 'company',
    },
  ],

  'window-advanced': [
    {
      kind: 'mcq',
      question: 'NTILE(4) over an ordered set does what?',
      options: ['Returns the top 4 rows', 'Splits rows into 4 roughly equal buckets (quartiles)', 'Rounds to 4 decimals', 'Counts 4 columns'],
      answer: 1,
      explain: 'NTILE(n) labels each row with its bucket number out of n equal-count buckets.',
    },
    {
      kind: 'mcq',
      question: 'A frame like ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW gives you...',
      options: ['A random sample', 'A running (cumulative) calculation up to the current row', 'Only the current row', 'The whole table every time'],
      answer: 1,
      explain: 'That frame accumulates from the first row through the current one (a running total).',
    },
    {
      kind: 'mcq',
      question: 'The default window frame is RANGE, which can surprise you when...',
      options: ['There are no NULLs', 'Rows tie on the ORDER BY value (they share a frame)', 'You use PARTITION BY', 'The table is small'],
      answer: 1,
      explain: 'RANGE groups tied rows together; spell out ROWS for strict row-by-row frames.',
    },
    {
      kind: 'fill',
      prompt: 'Compute a running total of salary ordered by hire_date, row by row.',
      template: 'SELECT name, hire_date,\n  SUM(salary) OVER (ORDER BY hire_date ___ BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running\nFROM employees;',
      answers: [['ROWS']],
      explain: 'ROWS makes a strict row-by-row running total regardless of ties.',
      runnable: 'SELECT name, hire_date,\n  SUM(salary) OVER (ORDER BY hire_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running\nFROM employees;',
      database: 'company',
    },
  ],

  'recursive-queries': [
    {
      kind: 'mcq',
      question: 'A recursive CTE has two parts joined by UNION ALL: the anchor and the...',
      options: ['index', 'recursive member that references the CTE itself', 'trigger', 'view'],
      answer: 1,
      explain: 'The anchor seeds the result; the recursive member builds on it until it stops.',
    },
    {
      kind: 'mcq',
      question: 'To walk an org chart (each employee has a manager_id), a recursive CTE follows...',
      options: ['salary order', 'the manager_id -> id chain level by level', 'the hire_date', 'alphabetical name order'],
      answer: 1,
      explain: 'Each step joins reports to their manager via manager_id, descending the tree.',
    },
    {
      kind: 'fill',
      prompt: 'Generate the numbers 1 through 5 with a recursive CTE. Fill the keyword that starts a recursive CTE.',
      template: 'WITH ___ nums(n) AS (\n  SELECT 1\n  UNION ALL\n  SELECT n + 1 FROM nums WHERE n < 5\n)\nSELECT n FROM nums;',
      answers: [['RECURSIVE']],
      explain: 'WITH RECURSIVE marks a CTE that can reference itself.',
      runnable: 'WITH RECURSIVE nums(n) AS (\n  SELECT 1\n  UNION ALL\n  SELECT n + 1 FROM nums WHERE n < 5\n)\nSELECT n FROM nums;',
      database: 'company',
    },
  ],

  'performance-indexing': [
    {
      kind: 'mcq',
      question: 'EXPLAIN QUERY PLAN shows you...',
      options: ['The query results', 'How the engine will run the query (scan vs index search)', 'The table schema', 'Syntax errors only'],
      answer: 1,
      explain: 'It reveals whether the engine scans the whole table or uses an index.',
    },
    {
      kind: 'mcq',
      question: 'A good index candidate is a column that is...',
      options: ['Rarely used', 'Frequently filtered or joined on', 'Always NULL', 'A free-text comment'],
      answer: 1,
      explain: 'Index the columns you search and join on most; that is where lookups pay off.',
    },
    {
      kind: 'mcq',
      question: 'The trade-off of adding indexes is...',
      options: ['Slower reads', 'Slower writes and more storage', 'Wrong results', 'Fewer rows'],
      answer: 1,
      explain: 'Each index must be maintained on writes and takes space; reads get faster.',
    },
    {
      kind: 'fill',
      prompt: 'Create an index on the employees department column to speed up filtering by department.',
      template: 'CREATE ___ idx_emp_dept ON employees(department);\nSELECT name FROM employees WHERE department = \'Sales\';',
      answers: [['INDEX']],
      explain: 'CREATE INDEX name ON table(column) builds the lookup structure.',
      runnable: "CREATE INDEX idx_emp_dept ON employees(department);\nSELECT name FROM employees WHERE department = 'Sales';",
      database: 'company',
    },
  ],

  capstone: [
    {
      kind: 'mcq',
      question: 'You need the top earner per department in one query. The cleanest tool is...',
      options: ['A window function like ROW_NUMBER() OVER (PARTITION BY department ...)', 'A spreadsheet export', 'Many separate queries', 'DISTINCT'],
      answer: 0,
      explain: 'Ranking within partitions is exactly what window functions are for.',
    },
    {
      kind: 'mcq',
      question: 'When a report needs several stacked steps, the most readable approach is usually...',
      options: ['One giant nested subquery', 'CTEs (WITH) that name each step', 'Temporary views you forget to drop', 'Copy-pasting results'],
      answer: 1,
      explain: 'CTEs let a complex report read top to bottom, one named step at a time.',
    },
    {
      kind: 'fill',
      prompt: 'Per department, show the department and its average salary rounded to a whole number, highest average first.',
      template: 'SELECT department, ROUND(AVG(salary)) AS avg_sal\nFROM employees\nGROUP BY department\nORDER BY avg_sal ___;',
      answers: [['DESC']],
      explain: 'Aggregate per group with GROUP BY, then order the groups by the average.',
      runnable: 'SELECT department, ROUND(AVG(salary)) AS avg_sal\nFROM employees\nGROUP BY department\nORDER BY avg_sal DESC;',
      database: 'company',
    },
  ],
};
