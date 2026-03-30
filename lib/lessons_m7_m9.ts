import type { Lesson } from "./lessons";

export const lessonsM7M9: Lesson[] = [

  // ─── MODULE 7: WINDOW FUNCTIONS ───────────────────────────────────────────

  {
    module: 7, lesson: 29,
    slug: "window-functions/ranking-functions",
    moduleSlug: "window-functions", lessonSlug: "ranking-functions",
    title: "ROW_NUMBER, RANK, DENSE_RANK", badge: "challenge", database: "company",
    theory: { content: `## Mental Model
Window functions add a new column to every row without collapsing the table. GROUP BY loses individual rows. Window functions keep them all and add computed values alongside.

## The Three Ranking Functions
\`\`\`sql
ROW_NUMBER() OVER (ORDER BY salary DESC)  -- 1,2,3,4,5... no ties
RANK()       OVER (ORDER BY salary DESC)  -- 1,2,2,4,5... ties get same rank, gap after
DENSE_RANK() OVER (ORDER BY salary DESC)  -- 1,2,2,3,4... ties get same rank, no gap
\`\`\`

## Syntax
\`\`\`sql
SELECT name, salary,
  ROW_NUMBER() OVER (ORDER BY salary DESC) AS row_num
FROM employees;
\`\`\`

## When To Use This
Leaderboards, finding top-N per group, paginating sorted results, deduplication (keep only row_number = 1 per group).` },
    examples: [
      { title: "Rank all employees by salary", explanation: "Three ranking functions side-by-side to see the difference", sql: "SELECT name, salary,\n  ROW_NUMBER() OVER (ORDER BY salary DESC) AS row_num,\n  RANK()       OVER (ORDER BY salary DESC) AS rnk,\n  DENSE_RANK() OVER (ORDER BY salary DESC) AS dense_rnk\nFROM employees;" },
      { title: "Top 3 earners using ROW_NUMBER", explanation: "Wrap in subquery and filter on row_num", sql: "SELECT name, salary, row_num\nFROM (\n  SELECT name, salary,\n    ROW_NUMBER() OVER (ORDER BY salary DESC) AS row_num\n  FROM employees\n) ranked\nWHERE row_num <= 3;" }
    ],
    challenges: [
      { id: "29-1", prompt: "Rank all employees by salary (highest first) using DENSE_RANK. Show name, salary, and rank.", hint: "DENSE_RANK() OVER (ORDER BY salary DESC).", expectedColumns: ["name","salary","salary_rank"], validateFn: "return rows.length > 0 && rows[0].salary_rank === 1;", solution: "SELECT name, salary,\n  DENSE_RANK() OVER (ORDER BY salary DESC) AS salary_rank\nFROM employees;" },
      { id: "29-2", prompt: "Find the top 3 highest-paid employees using ROW_NUMBER (one per rank, no ties).", hint: "Subquery with ROW_NUMBER, outer query WHERE row_num <= 3.", expectedColumns: ["name","salary"], validateFn: "return rows.length === 3;", solution: "SELECT name, salary\nFROM (\n  SELECT name, salary, ROW_NUMBER() OVER (ORDER BY salary DESC) AS rn\n  FROM employees\n) t\nWHERE rn <= 3;" },
      { id: "29-3", prompt: "Assign each employee a row number within their department (ordered by salary descending). Show name, department, salary, and rank within dept.", hint: "ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC).", expectedColumns: ["name","department","salary","dept_rank"], validateFn: "return rows.length > 0;", solution: "SELECT name, department, salary,\n  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank\nFROM employees\nORDER BY department, dept_rank;" }
    ]
  },

  {
    module: 7, lesson: 30,
    slug: "window-functions/partition-by",
    moduleSlug: "window-functions", lessonSlug: "partition-by",
    title: "PARTITION BY", badge: "challenge", database: "company",
    theory: { content: `## Mental Model
PARTITION BY is to window functions what GROUP BY is to aggregates — it splits the calculation into groups. Without PARTITION BY, the window function runs across all rows. With PARTITION BY, it restarts for each group.

## Syntax
\`\`\`sql
SELECT name, department, salary,
  AVG(salary) OVER (PARTITION BY department) AS dept_avg,
  salary - AVG(salary) OVER (PARTITION BY department) AS diff_from_avg
FROM employees;
\`\`\`

## How It Works
- \`AVG(salary) OVER ()\` → company-wide average (one value, repeated)
- \`AVG(salary) OVER (PARTITION BY department)\` → dept average (different per dept, same for all in dept)
- \`RANK() OVER (PARTITION BY department ORDER BY salary DESC)\` → rank within each department

## When To Use This
Any "vs their group" comparison — "how does this employee compare to their department average?"` },
    examples: [
      { title: "Salary vs dept average", explanation: "PARTITION BY keeps rows while adding dept context", sql: "SELECT name, department, salary,\n  ROUND(AVG(salary) OVER (PARTITION BY department), 0) AS dept_avg,\n  salary - ROUND(AVG(salary) OVER (PARTITION BY department), 0) AS diff\nFROM employees\nORDER BY department, diff DESC;" },
      { title: "Rank within department", explanation: "Ranking resets for each department", sql: "SELECT name, department, salary,\n  RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank\nFROM employees\nORDER BY department, dept_rank;" }
    ],
    challenges: [
      { id: "30-1", prompt: "Show each employee with their salary and the average salary of their department. Add a column showing how much above or below the dept average they are.", hint: "AVG(salary) OVER (PARTITION BY department).", expectedColumns: ["name","department","salary","dept_avg","diff"], validateFn: "return rows.length > 0 && rows[0].hasOwnProperty('diff');", solution: "SELECT name, department, salary,\n  ROUND(AVG(salary) OVER (PARTITION BY department), 0) AS dept_avg,\n  salary - ROUND(AVG(salary) OVER (PARTITION BY department), 0) AS diff\nFROM employees ORDER BY department;" },
      { id: "30-2", prompt: "Find the #1 highest-paid employee in each department using RANK() with PARTITION BY.", hint: "Subquery with RANK() OVER (PARTITION BY department ORDER BY salary DESC), filter WHERE dept_rank = 1.", expectedColumns: ["name","department","salary"], validateFn: "return rows.length > 1;", solution: "SELECT name, department, salary\nFROM (\n  SELECT name, department, salary,\n    RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS r\n  FROM employees\n) t\nWHERE r = 1;" },
      { id: "30-3", prompt: "For each employee, show their salary as a percentage of their department's total payroll.", hint: "salary / SUM(salary) OVER (PARTITION BY department).", expectedColumns: ["name","department","pct_of_dept"], validateFn: "return rows.length > 0 && rows[0].pct_of_dept <= 100;", solution: "SELECT name, department, salary,\n  ROUND(salary * 100.0 / SUM(salary) OVER (PARTITION BY department), 1) AS pct_of_dept\nFROM employees\nORDER BY department, pct_of_dept DESC;" }
    ]
  },

  {
    module: 7, lesson: 31,
    slug: "window-functions/lag-lead",
    moduleSlug: "window-functions", lessonSlug: "lag-lead",
    title: "LAG and LEAD", badge: "challenge", database: "company",
    theory: { content: `## Mental Model
LAG looks at the previous row. LEAD looks at the next row. They let you compare a value to its neighbor without a self-join.

## Syntax
\`\`\`sql
LAG(column, n, default)  OVER (ORDER BY ...)  -- n rows back (default n=1)
LEAD(column, n, default) OVER (ORDER BY ...)  -- n rows forward
\`\`\`

## Examples
\`\`\`sql
-- Compare to previous employee's salary
LAG(salary) OVER (ORDER BY hire_date) AS prev_salary

-- Difference from previous
salary - LAG(salary) OVER (ORDER BY salary) AS salary_gap

-- Default value if no previous row
LAG(salary, 1, 0) OVER (ORDER BY hire_date) AS prev_or_zero
\`\`\`

## When To Use This
Calculating change over time, comparing sequential records, finding gaps between consecutive values.` },
    examples: [
      { title: "Compare each salary to the next lower", explanation: "See the gap between each salary level", sql: "SELECT name, salary,\n  LAG(salary)  OVER (ORDER BY salary DESC) AS next_higher,\n  LEAD(salary) OVER (ORDER BY salary DESC) AS next_lower\nFROM employees\nORDER BY salary DESC;" },
      { title: "Salary gap between employees hired consecutively", explanation: "LAG on hire_date ordering", sql: "SELECT name, hire_date, salary,\n  LAG(salary) OVER (ORDER BY hire_date) AS prev_hire_salary,\n  salary - LAG(salary, 1, salary) OVER (ORDER BY hire_date) AS salary_diff\nFROM employees\nORDER BY hire_date;" }
    ],
    challenges: [
      { id: "31-1", prompt: "List employees ordered by salary. Show each employee's salary, the salary of the next-higher-paid employee, and the gap between them.", hint: "LAG(salary) OVER (ORDER BY salary DESC) gives the salary above.", expectedColumns: ["name","salary","gap_to_next"], validateFn: "return rows.length > 0;", solution: "SELECT name, salary,\n  LAG(salary) OVER (ORDER BY salary DESC) AS higher_salary,\n  LAG(salary, 1, salary) OVER (ORDER BY salary DESC) - salary AS gap_to_next\nFROM employees\nORDER BY salary DESC;" },
      { id: "31-2", prompt: "Within each department, show employees ordered by hire date and the hire date of the person hired just before them.", hint: "LAG(hire_date) OVER (PARTITION BY department ORDER BY hire_date).", expectedColumns: ["name","department","hire_date","prev_hire_date"], validateFn: "return rows.length > 0;", solution: "SELECT name, department, hire_date,\n  LAG(hire_date) OVER (PARTITION BY department ORDER BY hire_date) AS prev_hire_date\nFROM employees\nORDER BY department, hire_date;" },
      { id: "31-3", prompt: "Show each employee with how many days passed since the previous employee was hired (ordering by hire_date company-wide).", hint: "julianday(hire_date) - julianday(LAG(hire_date) OVER (ORDER BY hire_date)).", expectedColumns: ["name","hire_date","days_since_prev_hire"], validateFn: "return rows.length > 0;", solution: "SELECT name, hire_date,\n  CAST(julianday(hire_date) - julianday(LAG(hire_date) OVER (ORDER BY hire_date)) AS INTEGER) AS days_since_prev_hire\nFROM employees\nORDER BY hire_date;" }
    ]
  },

  {
    module: 7, lesson: 32,
    slug: "window-functions/running-totals",
    moduleSlug: "window-functions", lessonSlug: "running-totals",
    title: "Running Totals and Moving Averages", badge: "challenge", database: "company",
    theory: { content: `## Mental Model
Running totals accumulate as you go through rows. Each row shows the total up to and including that row. You get this by adding ORDER BY inside the OVER clause — without ORDER BY, you get the grand total repeated on every row.

## Syntax
\`\`\`sql
SUM(salary)  OVER (ORDER BY hire_date) AS running_payroll
AVG(salary)  OVER (ORDER BY hire_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg_3
COUNT(*)     OVER (ORDER BY hire_date) AS running_headcount
\`\`\`

## Frame Clauses
\`\`\`sql
OVER (ORDER BY col)                                   -- running total (default: all preceding rows)
OVER (ORDER BY col ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)  -- 3-row moving window
OVER (ORDER BY col ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)  -- explicit running total
\`\`\`

## When To Use This
Running totals for payroll/revenue, moving averages for trends, cumulative counts.` },
    examples: [
      { title: "Running payroll as employees were hired", explanation: "Cumulative SUM ordered by hire date", sql: "SELECT name, hire_date, salary,\n  SUM(salary) OVER (ORDER BY hire_date) AS running_payroll,\n  COUNT(*)    OVER (ORDER BY hire_date) AS running_headcount\nFROM employees\nORDER BY hire_date;" },
      { title: "Running total within department", explanation: "PARTITION BY keeps running total per dept", sql: "SELECT name, department, salary,\n  SUM(salary) OVER (PARTITION BY department ORDER BY salary DESC) AS dept_running_total\nFROM employees\nORDER BY department, salary DESC;" }
    ],
    challenges: [
      { id: "32-1", prompt: "Show employees in hire date order with a running total of payroll (cumulative salary as each person was added).", hint: "SUM(salary) OVER (ORDER BY hire_date).", expectedColumns: ["name","hire_date","salary","running_payroll"], validateFn: "return rows.length > 0 && rows[rows.length-1].running_payroll > rows[0].running_payroll;", solution: "SELECT name, hire_date, salary,\n  SUM(salary) OVER (ORDER BY hire_date) AS running_payroll\nFROM employees\nORDER BY hire_date;" },
      { id: "32-2", prompt: "Show a running count of employees per department as ordered by hire date within that department.", hint: "COUNT(*) OVER (PARTITION BY department ORDER BY hire_date).", expectedColumns: ["name","department","hire_date","running_count"], validateFn: "return rows.length > 0;", solution: "SELECT name, department, hire_date,\n  COUNT(*) OVER (PARTITION BY department ORDER BY hire_date) AS running_count\nFROM employees\nORDER BY department, hire_date;" },
      { id: "32-3", prompt: "Show each employee and the running average salary (ordered by hire_date). Also show how their salary compares to the running average at the time they were hired.", hint: "AVG(salary) OVER (ORDER BY hire_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW).", expectedColumns: ["name","salary","running_avg","diff_from_running_avg"], validateFn: "return rows.length > 0;", solution: "SELECT name, hire_date, salary,\n  ROUND(AVG(salary) OVER (ORDER BY hire_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 0) AS running_avg,\n  salary - ROUND(AVG(salary) OVER (ORDER BY hire_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 0) AS diff_from_running_avg\nFROM employees\nORDER BY hire_date;" }
    ]
  },

  {
    module: 7, lesson: 33,
    slug: "window-functions/first-last-value",
    moduleSlug: "window-functions", lessonSlug: "first-last-value",
    title: "FIRST_VALUE and LAST_VALUE", badge: "challenge", database: "company",
    theory: { content: `## Mental Model
FIRST_VALUE returns the value from the first row of the window. LAST_VALUE returns the value from the last row. Useful for comparing every row against the best/worst/first/last in its group.

## Syntax
\`\`\`sql
FIRST_VALUE(salary) OVER (PARTITION BY department ORDER BY salary DESC) AS dept_max_salary
LAST_VALUE(salary)  OVER (PARTITION BY department ORDER BY salary DESC
                          ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS dept_min_salary
\`\`\`

## Important: LAST_VALUE Frame
By default, the frame ends at the current row, so LAST_VALUE only sees rows up to now. Use \`ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING\` to see all rows in the partition.

## NTH_VALUE
\`\`\`sql
NTH_VALUE(salary, 2) OVER (PARTITION BY department ORDER BY salary DESC)  -- 2nd highest per dept
\`\`\`

## When To Use This
Showing the best/worst alongside every row, "what was the first hire in this department?" type queries.` },
    examples: [
      { title: "Each employee vs dept max salary", explanation: "FIRST_VALUE gets the highest (since ordered DESC)", sql: "SELECT name, department, salary,\n  FIRST_VALUE(salary) OVER (PARTITION BY department ORDER BY salary DESC) AS dept_max,\n  FIRST_VALUE(name)   OVER (PARTITION BY department ORDER BY salary DESC) AS top_earner\nFROM employees\nORDER BY department, salary DESC;" },
      { title: "First hire in each department", explanation: "FIRST_VALUE with date ordering", sql: "SELECT name, department, hire_date,\n  FIRST_VALUE(name) OVER (PARTITION BY department ORDER BY hire_date) AS first_hire\nFROM employees\nORDER BY department, hire_date;" }
    ],
    challenges: [
      { id: "33-1", prompt: "Show each employee with the name and salary of the highest-paid person in their department.", hint: "FIRST_VALUE(name) and FIRST_VALUE(salary) OVER (PARTITION BY dept ORDER BY salary DESC).", expectedColumns: ["name","salary","dept_top_earner","dept_max_salary"], validateFn: "return rows.length > 0;", solution: "SELECT name, salary,\n  FIRST_VALUE(name)   OVER (PARTITION BY department ORDER BY salary DESC) AS dept_top_earner,\n  FIRST_VALUE(salary) OVER (PARTITION BY department ORDER BY salary DESC) AS dept_max_salary\nFROM employees\nORDER BY department, salary DESC;" },
      { id: "33-2", prompt: "Show each employee and who was hired first in their department.", hint: "FIRST_VALUE(name) OVER (PARTITION BY department ORDER BY hire_date).", expectedColumns: ["name","department","first_hire"], validateFn: "return rows.length > 0;", solution: "SELECT name, department, hire_date,\n  FIRST_VALUE(name) OVER (PARTITION BY department ORDER BY hire_date) AS first_hire\nFROM employees\nORDER BY department, hire_date;" },
      { id: "33-3", prompt: "Using NTH_VALUE, show each employee alongside the 2nd-highest salary in their department.", hint: "NTH_VALUE(salary, 2) OVER (PARTITION BY department ORDER BY salary DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING).", expectedColumns: ["name","department","salary","second_highest"], validateFn: "return rows.length > 0;", solution: "SELECT name, department, salary,\n  NTH_VALUE(salary, 2) OVER (\n    PARTITION BY department ORDER BY salary DESC\n    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING\n  ) AS second_highest\nFROM employees\nORDER BY department, salary DESC;" }
    ]
  },

  // ─── MODULE 8: DATABASE OBJECTS ───────────────────────────────────────────

  {
    module: 8, lesson: 34,
    slug: "database-objects/views",
    moduleSlug: "database-objects", lessonSlug: "views",
    title: "Views", badge: "practice", database: "company",
    theory: { content: `## Mental Model
A view is a saved query with a name. You create it once, then query it like a table. It doesn't store data — it runs the query every time you SELECT from it. Think of it as a shortcut or a named lens on your data.

## Syntax
\`\`\`sql
-- Create
CREATE VIEW eng_employees AS
SELECT name, salary, hire_date
FROM employees
WHERE department = 'Engineering';

-- Use it like a table
SELECT * FROM eng_employees WHERE salary > 90000;

-- Drop it
DROP VIEW IF EXISTS eng_employees;
\`\`\`

## Why Use Views?
- Simplify complex queries you run repeatedly
- Hide complexity from other users (they just see a clean table-like interface)
- Security: expose only certain columns to certain users

## When To Use This
Complex queries you'll reuse, sharing a consistent "report" definition, simplifying multi-table joins for other queries.` },
    examples: [
      { title: "Create a high-earners view", explanation: "Define once, query many times", sql: "CREATE VIEW high_earners AS\nSELECT name, department, salary\nFROM employees\nWHERE salary > 90000;\n\nSELECT * FROM high_earners ORDER BY salary DESC;" },
      { title: "View with computed columns", explanation: "Views can include calculations", sql: "CREATE VIEW employee_summary AS\nSELECT e.name, e.department, e.salary, d.location,\n  CAST((julianday('now') - julianday(e.hire_date)) / 365.25 AS INTEGER) AS years\nFROM employees e\nJOIN departments d ON e.department = d.name;\n\nSELECT * FROM employee_summary WHERE years > 4;" }
    ],
    challenges: [
      { id: "34-1", prompt: "Create a view called 'dept_stats' showing department, headcount, average salary, and min/max salary. Then query it.", hint: "CREATE VIEW dept_stats AS SELECT ... GROUP BY department.", expectedColumns: ["department","headcount","avg_salary"], validateFn: "return rows.length > 0 && rows[0].hasOwnProperty('headcount');", solution: "CREATE VIEW dept_stats AS\nSELECT department,\n  COUNT(*) AS headcount,\n  ROUND(AVG(salary), 0) AS avg_salary,\n  MIN(salary) AS min_salary,\n  MAX(salary) AS max_salary\nFROM employees\nGROUP BY department;\n\nSELECT * FROM dept_stats ORDER BY avg_salary DESC;" },
      { id: "34-2", prompt: "Create a view called 'project_roster' that shows each employee's name, their project name, and their role. Then query it for employees with a 'Lead' role.", hint: "CREATE VIEW ... JOINing employees, employee_projects, projects.", expectedColumns: ["name","project_name","role"], validateFn: "return rows.length > 0;", solution: "CREATE VIEW project_roster AS\nSELECT e.name, p.name AS project_name, ep.role\nFROM employees e\nJOIN employee_projects ep ON e.id = ep.employee_id\nJOIN projects p ON ep.project_id = p.id;\n\nSELECT * FROM project_roster WHERE role LIKE '%Lead%';" },
      { id: "34-3", prompt: "Create a view 'senior_employees' for employees with 5+ years tenure. Query it to count how many seniors are in each department.", hint: "Use date logic in the view definition, then GROUP BY in the query.", expectedColumns: ["department","senior_count"], validateFn: "return rows.length > 0;", solution: "CREATE VIEW senior_employees AS\nSELECT name, department, hire_date,\n  CAST((julianday('now') - julianday(hire_date)) / 365.25 AS INTEGER) AS years\nFROM employees\nWHERE CAST((julianday('now') - julianday(hire_date)) / 365.25 AS INTEGER) >= 5;\n\nSELECT department, COUNT(*) AS senior_count\nFROM senior_employees\nGROUP BY department;" }
    ]
  },

  {
    module: 8, lesson: 35,
    slug: "database-objects/indexes",
    moduleSlug: "database-objects", lessonSlug: "indexes",
    title: "Indexes", badge: "concept", database: "company",
    theory: { content: `## Mental Model
An index is like the index at the back of a book. Without it, SQL scans every row to find what you're looking for (table scan). With an index on the right column, it jumps directly to matching rows. Faster reads, slightly slower writes and more storage.

## Syntax
\`\`\`sql
-- Create an index
CREATE INDEX idx_emp_dept ON employees(department);

-- Composite index (multiple columns)
CREATE INDEX idx_emp_dept_salary ON employees(department, salary);

-- Unique index (enforces uniqueness)
CREATE UNIQUE INDEX idx_emp_name ON employees(name);

-- See what indexes exist
SELECT * FROM sqlite_master WHERE type = 'index';

-- Drop
DROP INDEX IF EXISTS idx_emp_dept;
\`\`\`

## When To Add an Index
- Columns frequently used in WHERE, JOIN ON, or ORDER BY
- Foreign key columns (department in employees)
- Columns used in GROUP BY on large tables

## When NOT To
- Small tables (scan is fast enough)
- Columns you rarely filter on
- Tables with very frequent INSERT/UPDATE/DELETE` },
    examples: [
      { title: "Index on department for faster filtering", explanation: "Create then query — EXPLAIN QUERY PLAN shows impact", sql: "CREATE INDEX IF NOT EXISTS idx_emp_dept ON employees(department);\n\nEXPLAIN QUERY PLAN\nSELECT name, salary FROM employees WHERE department = 'Engineering';" },
      { title: "Composite index for dept + salary queries", explanation: "Multi-column index helps queries that filter on both", sql: "CREATE INDEX IF NOT EXISTS idx_dept_salary ON employees(department, salary);\n\nSELECT name FROM employees\nWHERE department = 'Engineering' AND salary > 90000;" }
    ],
    challenges: [
      { id: "35-1", prompt: "Create an index on the hire_date column of employees. Then use EXPLAIN QUERY PLAN to show it's being used on a query filtering by hire_date.", hint: "CREATE INDEX idx_hire ON employees(hire_date); EXPLAIN QUERY PLAN SELECT...", expectedColumns: [], validateFn: "return rows.length >= 0;", solution: "CREATE INDEX IF NOT EXISTS idx_hire ON employees(hire_date);\nEXPLAIN QUERY PLAN\nSELECT name, hire_date FROM employees WHERE hire_date > '2021-01-01';" },
      { id: "35-2", prompt: "Check what indexes currently exist on the employees table.", hint: "SELECT * FROM sqlite_master WHERE type = 'index' AND tbl_name = 'employees'.", expectedColumns: [], validateFn: "return rows.length >= 0;", solution: "SELECT name, sql FROM sqlite_master WHERE type = 'index' AND tbl_name = 'employees';" },
      { id: "35-3", prompt: "Create a composite index on (department, salary) then run a query that would use it: find all Engineering employees earning over $90,000.", hint: "CREATE INDEX on two columns, then SELECT with both conditions.", expectedColumns: ["name","department","salary"], validateFn: "return rows.every(r => r.department === 'Engineering' && r.salary > 90000);", solution: "CREATE INDEX IF NOT EXISTS idx_dept_sal ON employees(department, salary);\nSELECT name, department, salary FROM employees\nWHERE department = 'Engineering' AND salary > 90000;" }
    ]
  },

  {
    module: 8, lesson: 36,
    slug: "database-objects/stored-procedures",
    moduleSlug: "database-objects", lessonSlug: "stored-procedures",
    title: "Stored Procedures (T-SQL Concept)", badge: "concept", database: "company",
    theory: { content: `## Mental Model
A stored procedure is a named, reusable block of SQL code stored in the database. You call it by name with parameters instead of rewriting the same query. Think of it like a function in programming — define once, call many times.

## T-SQL Syntax (SQL Server / WCTC class)
\`\`\`sql
CREATE PROCEDURE GetEmployeesByDept
  @Department NVARCHAR(50)
AS
BEGIN
  SELECT name, salary, hire_date
  FROM employees
  WHERE department = @Department
  ORDER BY salary DESC;
END;

-- Call it
EXEC GetEmployeesByDept @Department = 'Engineering';
\`\`\`

## Why Use Stored Procedures?
- Reusable — call with different parameters
- Secure — grant EXECUTE permission without exposing tables
- Faster — compiled execution plan
- Maintainable — change the proc, all callers benefit

## SQLite Reality
SQLite doesn't support stored procedures. In class you'll use T-SQL on SQL Server. The challenge below uses a CTE to simulate parameterized queries in SQLite.` },
    examples: [
      { title: "T-SQL stored procedure example", explanation: "This is T-SQL syntax — runs on SQL Server, not SQLite", sql: "-- T-SQL (SQL Server syntax, for reference):\n-- CREATE PROCEDURE GetDeptSummary\n--   @Department NVARCHAR(50)\n-- AS BEGIN\n--   SELECT COUNT(*) as headcount, AVG(salary) as avg_salary\n--   FROM employees WHERE department = @Department\n-- END;\n\n-- SQLite equivalent using a query:\nSELECT COUNT(*) AS headcount, ROUND(AVG(salary), 0) AS avg_salary\nFROM employees\nWHERE department = 'Engineering';" },
      { title: "CTE as a reusable query pattern", explanation: "CTEs are the closest SQLite equivalent", sql: "WITH dept_param(dept) AS (SELECT 'Engineering')\nSELECT e.name, e.salary\nFROM employees e, dept_param\nWHERE e.department = dept_param.dept\nORDER BY e.salary DESC;" }
    ],
    challenges: [
      { id: "36-1", prompt: "Write a query that acts like a stored procedure: takes 'Marketing' as the department and returns all employees there with their salary and years of service.", hint: "Use a CTE to define the 'parameter', then query with it.", expectedColumns: ["name","salary","years"], validateFn: "return rows.length > 0 && rows[0].hasOwnProperty('years');", solution: "WITH params AS (SELECT 'Marketing' AS dept)\nSELECT e.name, e.salary,\n  CAST((julianday('now') - julianday(e.hire_date)) / 365.25 AS INTEGER) AS years\nFROM employees e, params\nWHERE e.department = params.dept\nORDER BY e.salary DESC;" },
      { id: "36-2", prompt: "Write a reusable query pattern that takes a minimum salary threshold and returns a summary: count of employees earning above it and their average salary.", hint: "CTE with the threshold value, then aggregate.", expectedColumns: ["above_threshold_count","avg_salary_above"], validateFn: "return rows.length === 1;", solution: "WITH params AS (SELECT 80000 AS min_salary)\nSELECT COUNT(*) AS above_threshold_count,\n  ROUND(AVG(salary), 0) AS avg_salary_above\nFROM employees e, params\nWHERE e.salary > params.min_salary;" },
      { id: "36-3", prompt: "Simulate a 'department report' procedure: given department='Sales', return headcount, average salary, highest salary, and total payroll.", hint: "CTE parameter + aggregates.", expectedColumns: ["dept","headcount","avg_salary","max_salary","total_payroll"], validateFn: "return rows.length === 1;", solution: "WITH params AS (SELECT 'Sales' AS dept)\nSELECT params.dept,\n  COUNT(*) AS headcount,\n  ROUND(AVG(e.salary), 0) AS avg_salary,\n  MAX(e.salary) AS max_salary,\n  SUM(e.salary) AS total_payroll\nFROM employees e, params\nWHERE e.department = params.dept;" }
    ]
  },

  {
    module: 8, lesson: 37,
    slug: "database-objects/triggers",
    moduleSlug: "database-objects", lessonSlug: "triggers",
    title: "Triggers", badge: "practice", database: "company",
    theory: { content: `## Mental Model
A trigger is a SQL statement that runs automatically when a specific event happens on a table — an INSERT, UPDATE, or DELETE. You don't call it; the database fires it for you. Used for audit trails, enforcing rules, and cascading updates.

## Syntax (SQLite)
\`\`\`sql
CREATE TRIGGER trigger_name
AFTER INSERT ON employees     -- or BEFORE, or AFTER UPDATE/DELETE
FOR EACH ROW
BEGIN
  INSERT INTO audit_log (action, table_name, record_id, changed_at)
  VALUES ('INSERT', 'employees', NEW.id, datetime('now'));
END;
\`\`\`

## NEW and OLD
- \`NEW.column\` — the new value (available in INSERT and UPDATE)
- \`OLD.column\` — the old value (available in UPDATE and DELETE)

## When To Use This
Audit logs (track every change), enforcing business rules the app can't enforce, automatic timestamp updates.` },
    examples: [
      { title: "Create an audit log table and trigger", explanation: "Every INSERT into employees creates an audit record", sql: "CREATE TABLE IF NOT EXISTS emp_audit (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  emp_name TEXT,\n  action TEXT,\n  changed_at TEXT\n);\n\nCREATE TRIGGER IF NOT EXISTS trg_emp_insert\nAFTER INSERT ON employees\nFOR EACH ROW\nBEGIN\n  INSERT INTO emp_audit (emp_name, action, changed_at)\n  VALUES (NEW.name, 'INSERT', datetime('now'));\nEND;\n\n-- Test it\nINSERT INTO employees (id, name, department, salary, hire_date)\nVALUES (21, 'Test Employee', 'Engineering', 80000, '2026-01-01');\n\nSELECT * FROM emp_audit;" }
    ],
    challenges: [
      { id: "37-1", prompt: "Create an audit table and a trigger that logs salary changes: records the employee name, old salary, new salary, and timestamp whenever an UPDATE happens on employees.", hint: "AFTER UPDATE ON employees, use OLD.salary and NEW.salary.", expectedColumns: ["emp_name","old_salary","new_salary"], validateFn: "return rows.length > 0;", solution: "CREATE TABLE IF NOT EXISTS salary_audit (emp_name TEXT, old_salary REAL, new_salary REAL, changed_at TEXT);\n\nCREATE TRIGGER IF NOT EXISTS trg_salary_change\nAFTER UPDATE ON employees\nFOR EACH ROW\nWHEN OLD.salary != NEW.salary\nBEGIN\n  INSERT INTO salary_audit VALUES (NEW.name, OLD.salary, NEW.salary, datetime('now'));\nEND;\n\nUPDATE employees SET salary = 100000 WHERE id = 1;\nSELECT * FROM salary_audit;" },
      { id: "37-2", prompt: "Create a trigger that prevents employees from being deleted if they are a manager (i.e., their id appears in someone else's manager_id). Use a trigger with SELECT RAISE(ABORT, 'message').", hint: "BEFORE DELETE, check if OLD.id IN (SELECT manager_id FROM employees WHERE manager_id IS NOT NULL).", expectedColumns: [], validateFn: "return true;", solution: "CREATE TRIGGER IF NOT EXISTS trg_no_delete_manager\nBEFORE DELETE ON employees\nFOR EACH ROW\nWHEN OLD.id IN (SELECT manager_id FROM employees WHERE manager_id IS NOT NULL)\nBEGIN\n  SELECT RAISE(ABORT, 'Cannot delete: employee is a manager');\nEND;\n\n-- Test: try to delete a manager (should fail)\n-- DELETE FROM employees WHERE id = 1;" },
      { id: "37-3", prompt: "Check what triggers exist on the employees table.", hint: "SELECT * FROM sqlite_master WHERE type = 'trigger'.", expectedColumns: [], validateFn: "return rows.length >= 0;", solution: "SELECT name, sql FROM sqlite_master WHERE type = 'trigger' AND tbl_name = 'employees';" }
    ]
  },

  {
    module: 8, lesson: 38,
    slug: "database-objects/user-defined-functions",
    moduleSlug: "database-objects", lessonSlug: "user-defined-functions",
    title: "User-Defined Functions", badge: "concept", database: "company",
    theory: { content: `## Mental Model
User-defined functions (UDFs) let you write custom functions and use them just like built-in SQL functions (UPPER, ROUND, etc.). In T-SQL, you write them in SQL. In application code, you can also register functions with the database driver.

## T-SQL Scalar Function
\`\`\`sql
-- SQL Server syntax:
CREATE FUNCTION dbo.GetSalaryTier(@salary DECIMAL)
RETURNS NVARCHAR(20)
AS BEGIN
  RETURN CASE
    WHEN @salary >= 100000 THEN 'Senior'
    WHEN @salary >= 75000  THEN 'Mid'
    ELSE 'Junior'
  END
END;

-- Use it:
SELECT name, dbo.GetSalaryTier(salary) AS tier FROM employees;
\`\`\`

## SQLite Alternative
SQLite supports UDFs registered via application code, but not CREATE FUNCTION in SQL. Use CASE expressions or CTEs to simulate reusable logic in pure SQL.

## When To Use This
Complex logic you'd repeat in many queries, calculations that need to stay consistent, business rule encoding.` },
    examples: [
      { title: "Simulating a UDF with CASE", explanation: "The CASE below is what a GetSalaryTier() UDF would do", sql: "-- This is what a GetSalaryTier UDF would return:\nSELECT name, salary,\n  CASE\n    WHEN salary >= 100000 THEN 'Senior'\n    WHEN salary >= 75000  THEN 'Mid'\n    ELSE 'Junior'\n  END AS tier\nFROM employees;" },
      { title: "Reusing logic with a view", explanation: "A view with the computed column is the cleanest SQLite equivalent", sql: "CREATE VIEW IF NOT EXISTS emp_with_tier AS\nSELECT name, department, salary,\n  CASE\n    WHEN salary >= 100000 THEN 'Senior'\n    WHEN salary >= 75000  THEN 'Mid'\n    ELSE 'Junior'\n  END AS tier\nFROM employees;\n\nSELECT * FROM emp_with_tier WHERE tier = 'Senior';" }
    ],
    challenges: [
      { id: "38-1", prompt: "Write a query that applies a 'salary band' classification: Band A ($100k+), Band B ($75k-$99k), Band C ($60k-$74k), Band D (under $60k). Show name, salary, and band.", hint: "CASE expression with four WHEN conditions.", expectedColumns: ["name","salary","band"], validateFn: "return rows.length > 0 && rows.some(r => r.band === 'Band A');", solution: "SELECT name, salary,\n  CASE\n    WHEN salary >= 100000 THEN 'Band A'\n    WHEN salary >= 75000  THEN 'Band B'\n    WHEN salary >= 60000  THEN 'Band C'\n    ELSE 'Band D'\n  END AS band\nFROM employees\nORDER BY salary DESC;" },
      { id: "38-2", prompt: "Create a view that encodes the salary band logic (from the previous challenge), then query it to count employees per band.", hint: "CREATE VIEW emp_bands AS ... ; SELECT band, COUNT(*) FROM emp_bands GROUP BY band.", expectedColumns: ["band","count"], validateFn: "return rows.length > 0;", solution: "CREATE VIEW IF NOT EXISTS emp_bands AS\nSELECT name, salary,\n  CASE WHEN salary >= 100000 THEN 'Band A' WHEN salary >= 75000 THEN 'Band B' WHEN salary >= 60000 THEN 'Band C' ELSE 'Band D' END AS band\nFROM employees;\n\nSELECT band, COUNT(*) AS count FROM emp_bands GROUP BY band ORDER BY band;" },
      { id: "38-3", prompt: "Write a reusable query (using a WITH/CTE) that accepts a department name and returns the salary distribution (count in each band) for that department.", hint: "CTE for the parameter, CASE inside for bands, GROUP BY band.", expectedColumns: ["band","count"], validateFn: "return rows.length > 0;", solution: "WITH dept_param AS (SELECT 'Engineering' AS dept)\nSELECT\n  CASE WHEN e.salary >= 100000 THEN 'Band A' WHEN e.salary >= 75000 THEN 'Band B' WHEN e.salary >= 60000 THEN 'Band C' ELSE 'Band D' END AS band,\n  COUNT(*) AS count\nFROM employees e, dept_param\nWHERE e.department = dept_param.dept\nGROUP BY band\nORDER BY band;" }
    ]
  },

  // ─── MODULE 9: SQL SERVER ADVANCED ───────────────────────────────────────

  {
    module: 9, lesson: 39,
    slug: "advanced/recursive-ctes",
    moduleSlug: "advanced", lessonSlug: "recursive-ctes",
    title: "Recursive CTEs", badge: "challenge", database: "company",
    theory: { content: `## Mental Model
A recursive CTE calls itself — like a loop. It has an anchor (the starting point) and a recursive member (the step that builds on the previous result). It keeps going until no new rows are produced.

## Syntax
\`\`\`sql
WITH RECURSIVE org_chart AS (
  -- Anchor: start with the CEO (no manager)
  SELECT id, name, manager_id, 0 AS level
  FROM employees
  WHERE manager_id IS NULL

  UNION ALL

  -- Recursive: add employees who report to someone already in the CTE
  SELECT e.id, e.name, e.manager_id, oc.level + 1
  FROM employees e
  JOIN org_chart oc ON e.manager_id = oc.id
)
SELECT * FROM org_chart ORDER BY level, name;
\`\`\`

## How It Works
1. Anchor query runs once, gives the starting rows
2. Recursive member joins the CTE to itself, adding the next "level"
3. Repeats until no new rows can be added
4. All results are combined with UNION ALL

## When To Use This
Org charts, category trees, finding all ancestors/descendants, pathfinding.` },
    examples: [
      { title: "Build an org chart", explanation: "Starting from top-level employees, walk down the hierarchy", sql: "WITH RECURSIVE org AS (\n  SELECT id, name, manager_id, 0 AS depth,\n         name AS path\n  FROM employees\n  WHERE manager_id IS NULL\n\n  UNION ALL\n\n  SELECT e.id, e.name, e.manager_id, org.depth + 1,\n         org.path || ' > ' || e.name\n  FROM employees e\n  JOIN org ON e.manager_id = org.id\n)\nSELECT name, depth, path FROM org ORDER BY path;" },
      { title: "Count levels in the hierarchy", explanation: "Max depth tells you how tall the org chart is", sql: "WITH RECURSIVE org AS (\n  SELECT id, 0 AS depth FROM employees WHERE manager_id IS NULL\n  UNION ALL\n  SELECT e.id, org.depth + 1 FROM employees e JOIN org ON e.manager_id = org.id\n)\nSELECT MAX(depth) AS max_levels FROM org;" }
    ],
    challenges: [
      { id: "39-1", prompt: "Build an org chart starting from employees with no manager. Show each employee's name, their depth in the hierarchy (0 = top), and a path string like 'CEO > Manager > Employee'.", hint: "Anchor: WHERE manager_id IS NULL. Recursive: JOIN employees e ON e.manager_id = org.id. Track depth and path.", expectedColumns: ["name","depth","path"], validateFn: "return rows.length > 0 && rows.some(r => r.depth === 0);", solution: "WITH RECURSIVE org AS (\n  SELECT id, name, 0 AS depth, name AS path\n  FROM employees WHERE manager_id IS NULL\n  UNION ALL\n  SELECT e.id, e.name, o.depth + 1, o.path || ' > ' || e.name\n  FROM employees e JOIN org o ON e.manager_id = o.id\n)\nSELECT name, depth, path FROM org ORDER BY path;" },
      { id: "39-2", prompt: "Generate numbers 1 through 20 using a recursive CTE (no table needed).", hint: "Anchor: SELECT 1. Recursive: SELECT n + 1 WHERE n < 20.", expectedColumns: ["n"], validateFn: "return rows.length === 20 && rows[19].n === 20;", solution: "WITH RECURSIVE nums(n) AS (\n  SELECT 1\n  UNION ALL\n  SELECT n + 1 FROM nums WHERE n < 20\n)\nSELECT n FROM nums;" },
      { id: "39-3", prompt: "Find all employees who report (directly or indirectly) to the employee with id=1 (Sarah Chen). Include their depth in the chain.", hint: "Anchor: WHERE id = 1. Recursive: JOIN on manager_id = org.id.", expectedColumns: ["name","depth"], validateFn: "return rows.length > 0;", solution: "WITH RECURSIVE reports AS (\n  SELECT id, name, 0 AS depth FROM employees WHERE id = 1\n  UNION ALL\n  SELECT e.id, e.name, r.depth + 1\n  FROM employees e JOIN reports r ON e.manager_id = r.id\n)\nSELECT name, depth FROM reports WHERE depth > 0 ORDER BY depth, name;" }
    ]
  },

  {
    module: 9, lesson: 40,
    slug: "advanced/pivot",
    moduleSlug: "advanced", lessonSlug: "pivot",
    title: "PIVOT — Rotating Data", badge: "challenge", database: "company",
    theory: { content: `## Mental Model
PIVOT rotates rows into columns. Instead of one row per department with a "value" column, you get one row total with one column per department. Like transposing data from tall/narrow to wide/short.

## T-SQL PIVOT (SQL Server)
\`\`\`sql
SELECT *
FROM (SELECT department, salary FROM employees) AS source
PIVOT (AVG(salary) FOR department IN ([Engineering],[Sales],[Marketing])) AS pvt;
\`\`\`

## SQLite Equivalent — CASE + GROUP BY
SQLite doesn't have PIVOT. Use CASE inside aggregate functions:
\`\`\`sql
SELECT
  AVG(CASE WHEN department = 'Engineering' THEN salary END) AS engineering_avg,
  AVG(CASE WHEN department = 'Sales'       THEN salary END) AS sales_avg,
  AVG(CASE WHEN department = 'Marketing'   THEN salary END) AS marketing_avg
FROM employees;
\`\`\`

## When To Use This
Cross-tab reports, comparing categories side-by-side, turning category values into column headers.` },
    examples: [
      { title: "Pivot salary by department", explanation: "One column per department, CASE selects the right rows", sql: "SELECT\n  AVG(CASE WHEN department = 'Engineering' THEN salary END) AS engineering,\n  AVG(CASE WHEN department = 'Sales' THEN salary END) AS sales,\n  AVG(CASE WHEN department = 'Marketing' THEN salary END) AS marketing,\n  AVG(CASE WHEN department = 'Finance' THEN salary END) AS finance\nFROM employees;" },
      { title: "Count employees per dept by location", explanation: "Pivot two dimensions", sql: "SELECT location,\n  COUNT(CASE WHEN e.department = 'Engineering' THEN 1 END) AS engineering,\n  COUNT(CASE WHEN e.department = 'Sales' THEN 1 END) AS sales,\n  COUNT(CASE WHEN e.department = 'Marketing' THEN 1 END) AS marketing\nFROM departments d\nLEFT JOIN employees e ON d.name = e.department\nGROUP BY location;" }
    ],
    challenges: [
      { id: "40-1", prompt: "Show a single-row summary with one column per department showing the total payroll for that department.", hint: "SUM(CASE WHEN department = 'X' THEN salary END) for each dept.", expectedColumns: ["engineering","sales","marketing","finance","human_resources"], validateFn: "return rows.length === 1 && rows[0].engineering > 0;", solution: "SELECT\n  SUM(CASE WHEN department = 'Engineering' THEN salary END) AS engineering,\n  SUM(CASE WHEN department = 'Sales' THEN salary END) AS sales,\n  SUM(CASE WHEN department = 'Marketing' THEN salary END) AS marketing,\n  SUM(CASE WHEN department = 'Finance' THEN salary END) AS finance,\n  SUM(CASE WHEN department = 'Human Resources' THEN salary END) AS human_resources\nFROM employees;" },
      { id: "40-2", prompt: "Show each hire year as a row, with one column per department showing how many people were hired that year in each department.", hint: "GROUP BY hire_year, COUNT(CASE WHEN dept = X) for each dept.", expectedColumns: ["hire_year"], validateFn: "return rows.length > 1;", solution: "SELECT strftime('%Y', hire_date) AS hire_year,\n  COUNT(CASE WHEN department = 'Engineering' THEN 1 END) AS engineering,\n  COUNT(CASE WHEN department = 'Sales' THEN 1 END) AS sales,\n  COUNT(CASE WHEN department = 'Marketing' THEN 1 END) AS marketing,\n  COUNT(CASE WHEN department = 'Finance' THEN 1 END) AS finance\nFROM employees\nGROUP BY hire_year\nORDER BY hire_year;" },
      { id: "40-3", prompt: "Create a department comparison showing each dept's headcount, total payroll, and average salary all in one wide row (all 5 departments as columns).", hint: "Three CASE patterns × 5 departments. Use COUNT/SUM/AVG per CASE.", expectedColumns: [], validateFn: "return rows.length === 1;", solution: "SELECT\n  COUNT(CASE WHEN department = 'Engineering' THEN 1 END) AS eng_count,\n  SUM(CASE WHEN department = 'Engineering' THEN salary END) AS eng_payroll,\n  ROUND(AVG(CASE WHEN department = 'Engineering' THEN salary END),0) AS eng_avg,\n  COUNT(CASE WHEN department = 'Sales' THEN 1 END) AS sales_count,\n  SUM(CASE WHEN department = 'Sales' THEN salary END) AS sales_payroll,\n  ROUND(AVG(CASE WHEN department = 'Sales' THEN salary END),0) AS sales_avg\nFROM employees;" }
    ]
  },

  {
    module: 9, lesson: 41,
    slug: "advanced/query-optimization",
    moduleSlug: "advanced", lessonSlug: "query-optimization",
    title: "Query Optimization", badge: "challenge", database: "company",
    theory: { content: `## Mental Model
A slow query is usually doing unnecessary work — scanning millions of rows when an index would skip to the right ones, or returning huge amounts of data when you only need 10 rows. EXPLAIN QUERY PLAN shows you exactly what the database is doing.

## EXPLAIN QUERY PLAN
\`\`\`sql
EXPLAIN QUERY PLAN
SELECT name FROM employees WHERE department = 'Engineering';
-- "SCAN employees" = bad (reads every row)
-- "SEARCH employees USING INDEX" = good
\`\`\`

## Common Optimization Tips

**1. Add indexes on WHERE columns**
\`\`\`sql
CREATE INDEX idx_dept ON employees(department);
\`\`\`

**2. Avoid SELECT ***
Select only what you need. Avoids reading unnecessary columns.

**3. Filter early — WHERE before HAVING**
HAVING filters after aggregation, WHERE filters before. Use WHERE whenever possible.

**4. Avoid functions on indexed columns in WHERE**
\`WHERE UPPER(name) = 'SARAH'\` — can't use an index on name.
\`WHERE name = 'Sarah'\` — can use an index.

**5. Use EXISTS instead of IN for large subqueries**
EXISTS stops as soon as it finds one match. IN evaluates the full list.

## When To Care
Small tables (under ~10k rows) don't need optimization. When tables are large and queries get slow, start here.` },
    examples: [
      { title: "Check query plan before and after index", explanation: "See how EXPLAIN QUERY PLAN changes", sql: "EXPLAIN QUERY PLAN\nSELECT name, salary FROM employees WHERE department = 'Engineering';\n\n-- Create an index\nCREATE INDEX IF NOT EXISTS idx_dept ON employees(department);\n\n-- Check again\nEXPLAIN QUERY PLAN\nSELECT name, salary FROM employees WHERE department = 'Engineering';" },
      { title: "EXISTS vs IN", explanation: "EXISTS is often faster for large subqueries", sql: "-- Using EXISTS:\nSELECT name FROM employees e\nWHERE EXISTS (\n  SELECT 1 FROM employee_projects ep WHERE ep.employee_id = e.id\n);\n\n-- Equivalent with IN (slower on large datasets):\nSELECT name FROM employees\nWHERE id IN (SELECT employee_id FROM employee_projects);" }
    ],
    challenges: [
      { id: "41-1", prompt: "Run EXPLAIN QUERY PLAN on a query filtering employees by department. Create an index, then run EXPLAIN again. Note the difference.", hint: "EXPLAIN QUERY PLAN SELECT...; CREATE INDEX; EXPLAIN QUERY PLAN SELECT... again.", expectedColumns: [], validateFn: "return rows.length >= 0;", solution: "EXPLAIN QUERY PLAN SELECT name FROM employees WHERE department = 'Sales';\nCREATE INDEX IF NOT EXISTS idx_dept ON employees(department);\nEXPLAIN QUERY PLAN SELECT name FROM employees WHERE department = 'Sales';" },
      { id: "41-2", prompt: "Rewrite this slow query to be more efficient: SELECT * FROM employees WHERE UPPER(name) LIKE 'S%'. Hint: avoid the function on the column.", hint: "WHERE name LIKE 'S%' OR name LIKE 's%' — or just LIKE 'S%' since SQLite LIKE is case-insensitive for ASCII.", expectedColumns: ["name"], validateFn: "return rows.length >= 0;", solution: "-- Better: avoid UPPER() on the column so indexes can be used\nSELECT name, department, salary FROM employees WHERE name LIKE 'S%';" },
      { id: "41-3", prompt: "Find employees who are on at least one project — write it two ways: once with IN, once with EXISTS. Both should return the same results.", hint: "WHERE id IN (SELECT employee_id...) vs WHERE EXISTS (SELECT 1 FROM employee_projects WHERE employee_id = e.id).", expectedColumns: ["name"], validateFn: "return rows.length > 0;", solution: "-- With IN:\nSELECT name FROM employees WHERE id IN (SELECT employee_id FROM employee_projects);\n\n-- With EXISTS (preferred for large tables):\nSELECT name FROM employees e WHERE EXISTS (SELECT 1 FROM employee_projects ep WHERE ep.employee_id = e.id);" }
    ]
  },

  {
    module: 9, lesson: 42,
    slug: "advanced/real-world-patterns",
    moduleSlug: "advanced", lessonSlug: "real-world-patterns",
    title: "Real-World SQL Patterns", badge: "challenge", database: "company",
    theory: { content: `## Mental Model
These are the patterns you'll reach for again and again in real jobs. Not syntax exercises — actual recurring problems with standard SQL solutions.

## Pattern 1: Deduplication (keep latest record)
\`\`\`sql
WITH ranked AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY employee_id ORDER BY changed_at DESC) AS rn
  FROM audit_log
)
SELECT * FROM ranked WHERE rn = 1;
\`\`\`

## Pattern 2: Pagination (cursor-based)
\`\`\`sql
-- Page 1
SELECT * FROM employees ORDER BY id LIMIT 10;
-- Page 2 (keyset — faster than OFFSET on large tables)
SELECT * FROM employees WHERE id > 10 ORDER BY id LIMIT 10;
\`\`\`

## Pattern 3: Running total
\`\`\`sql
SUM(amount) OVER (ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
\`\`\`

## Pattern 4: Find gaps in a sequence
\`\`\`sql
SELECT id + 1 AS missing_from
FROM employees e
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE id = e.id + 1)
AND id < (SELECT MAX(id) FROM employees);
\`\`\`

## Pattern 5: Top N per group
\`\`\`sql
WHERE row_num <= 3  -- filter on ROW_NUMBER() OVER (PARTITION BY group ORDER BY value DESC)
\`\`\``,
    },
    examples: [
      { title: "Top 2 earners per department", explanation: "Classic top-N per group pattern", sql: "SELECT name, department, salary\nFROM (\n  SELECT name, department, salary,\n    ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn\n  FROM employees\n) t\nWHERE rn <= 2\nORDER BY department, salary DESC;" },
      { title: "Find gaps in employee IDs", explanation: "Useful for data quality checks", sql: "SELECT id + 1 AS gap_starts_at\nFROM employees e\nWHERE NOT EXISTS (\n  SELECT 1 FROM employees WHERE id = e.id + 1\n)\nAND id < (SELECT MAX(id) FROM employees)\nORDER BY gap_starts_at;" }
    ],
    challenges: [
      { id: "42-1", prompt: "Get the top 2 highest-paid employees from each department.", hint: "ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC), filter WHERE rn <= 2.", expectedColumns: ["name","department","salary"], validateFn: "return rows.length > 0;", solution: "SELECT name, department, salary\nFROM (\n  SELECT name, department, salary,\n    ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn\n  FROM employees\n) t\nWHERE rn <= 2\nORDER BY department, salary DESC;" },
      { id: "42-2", prompt: "Show a running total of employees hired over time (by hire date). Show each hire date and the cumulative headcount at that point.", hint: "COUNT(*) OVER (ORDER BY hire_date).", expectedColumns: ["hire_date","name","running_total"], validateFn: "return rows.length > 0 && rows[rows.length-1].running_total > 1;", solution: "SELECT hire_date, name,\n  COUNT(*) OVER (ORDER BY hire_date, id) AS running_total\nFROM employees\nORDER BY hire_date;" },
      { id: "42-3", prompt: "Write a query that identifies employees who have no project assignment AND earn above the company average salary — these might be underutilized high performers.", hint: "LEFT JOIN employee_projects, WHERE ep.employee_id IS NULL AND salary > (SELECT AVG...).", expectedColumns: ["name","department","salary"], validateFn: "return rows.length >= 0;", solution: "SELECT e.name, e.department, e.salary\nFROM employees e\nLEFT JOIN employee_projects ep ON e.id = ep.employee_id\nWHERE ep.employee_id IS NULL\n  AND e.salary > (SELECT AVG(salary) FROM employees)\nORDER BY e.salary DESC;" }
    ]
  }

];
