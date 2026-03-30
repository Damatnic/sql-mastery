import type { Lesson } from "./lessons";

export const lessonsM4M6: Lesson[] = [

  // ─── MODULE 4: SUBQUERIES & CTEs ─────────────────────────────────────────

  {
    module: 4, lesson: 16,
    slug: "subqueries-ctes/subqueries-where",
    moduleSlug: "subqueries-ctes", lessonSlug: "subqueries-where",
    title: "Subqueries in WHERE", badge: "concept", database: "company",
    theory: { content: `## Mental Model
A subquery is a query inside a query. SQL runs the inner query first, gets a result, then uses that result in the outer query. Think of it as answering a preliminary question so you can answer the main question.

## Syntax
\`\`\`sql
SELECT name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);
\`\`\`

## How It Works
- The inner query (in parentheses) runs first and returns a value
- The outer query uses that value just like a literal number or string
- Scalar subqueries return one value; list subqueries (used with IN) return multiple values

## With IN
\`\`\`sql
WHERE department IN (SELECT name FROM departments WHERE budget > 1000000)
\`\`\`

## When To Use This
When your filter condition depends on a calculated value from the same (or another) table — like "above average" comparisons.` },
    examples: [
      { title: "Above-average earners", explanation: "Subquery calculates the average, outer query filters against it", sql: "SELECT name, salary\nFROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees)\nORDER BY salary DESC;" },
      { title: "Employees in high-budget departments", explanation: "Subquery returns a list, IN checks membership", sql: "SELECT name, department\nFROM employees\nWHERE department IN (\n  SELECT name FROM departments WHERE budget > 1000000\n);" },
      { title: "The highest-paid employee", explanation: "Subquery finds the max, outer query finds who has it", sql: "SELECT name, salary\nFROM employees\nWHERE salary = (SELECT MAX(salary) FROM employees);" }
    ],
    challenges: [
      { id: "16-1", prompt: "Find all employees who earn more than the average salary. Show name and salary.", hint: "WHERE salary > (SELECT AVG(salary) FROM employees).", expectedColumns: ["name","salary"], validateFn: "return rows.length > 0;", solution: "SELECT name, salary\nFROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees)\nORDER BY salary DESC;" },
      { id: "16-2", prompt: "Find employees who work in departments with a budget over $1,500,000.", hint: "WHERE department IN (SELECT name FROM departments WHERE budget > ...).", expectedColumns: ["name","department"], validateFn: "return rows.length > 0;", solution: "SELECT name, department\nFROM employees\nWHERE department IN (\n  SELECT name FROM departments WHERE budget > 1500000\n);" },
      { id: "16-3", prompt: "Find the employee(s) with the lowest salary in the company.", hint: "WHERE salary = (SELECT MIN(salary) FROM employees).", expectedColumns: ["name","salary"], validateFn: "return rows.length > 0 && rows.every(r => r.salary === rows[0].salary);", solution: "SELECT name, salary\nFROM employees\nWHERE salary = (SELECT MIN(salary) FROM employees);" }
    ]
  },

  {
    module: 4, lesson: 17,
    slug: "subqueries-ctes/subqueries-from",
    moduleSlug: "subqueries-ctes", lessonSlug: "subqueries-from",
    title: "Subqueries in FROM", badge: "concept", database: "company",
    theory: { content: `## Mental Model
You can use a query as if it were a table. Put the subquery in the FROM clause, give it an alias, and query it just like a real table. It's a temporary, virtual table that exists just for this query.

## Syntax
\`\`\`sql
SELECT dept_stats.department, dept_stats.avg_salary
FROM (
  SELECT department, AVG(salary) AS avg_salary
  FROM employees
  GROUP BY department
) AS dept_stats
WHERE dept_stats.avg_salary > 80000;
\`\`\`

## How It Works
- The inner query runs first and produces a result set
- You give it an alias (dept_stats above) and treat it like any table
- This is useful when you need to filter or aggregate on an already-aggregated result

## When To Use This
When you need to do a "second-level" operation on aggregated data — like filtering groups after aggregating, or joining two aggregated result sets together. (CTEs do the same thing more readably.)` },
    examples: [
      { title: "Filter aggregated results", explanation: "Can't use HAVING for all cases — subquery in FROM is sometimes cleaner", sql: "SELECT d.department, d.avg_salary\nFROM (\n  SELECT department, AVG(salary) AS avg_salary\n  FROM employees\n  GROUP BY department\n) AS d\nWHERE d.avg_salary > 75000;" },
      { title: "Rank departments by average salary", explanation: "Build the aggregated table first, then sort it", sql: "SELECT department, ROUND(avg_salary, 0) AS avg_salary\nFROM (\n  SELECT department, AVG(salary) AS avg_salary\n  FROM employees\n  GROUP BY department\n) AS dept_avgs\nORDER BY avg_salary DESC;" }
    ],
    challenges: [
      { id: "17-1", prompt: "Find departments where the average salary is below the company-wide average. Show department name and its average salary.", hint: "Subquery in FROM for dept averages, compare against (SELECT AVG(salary) FROM employees).", expectedColumns: ["department","avg_salary"], validateFn: "return rows.length > 0;", solution: "SELECT department, ROUND(avg_salary, 0) AS avg_salary\nFROM (\n  SELECT department, AVG(salary) AS avg_salary\n  FROM employees\n  GROUP BY department\n) AS dept_avgs\nWHERE avg_salary < (SELECT AVG(salary) FROM employees);" },
      { id: "17-2", prompt: "Show the top 2 departments by total payroll.", hint: "Subquery in FROM to get payroll per dept, ORDER BY and LIMIT in outer query.", expectedColumns: ["department","total_payroll"], validateFn: "return rows.length === 2;", solution: "SELECT department, total_payroll\nFROM (\n  SELECT department, SUM(salary) AS total_payroll\n  FROM employees\n  GROUP BY department\n) AS payroll\nORDER BY total_payroll DESC\nLIMIT 2;" },
      { id: "17-3", prompt: "How many departments have more than 3 employees? Return just the count.", hint: "Subquery in FROM to get headcount per dept, outer query counts the depts.", expectedColumns: ["dept_count"], validateFn: "return rows.length === 1 && rows[0].dept_count > 0;", solution: "SELECT COUNT(*) AS dept_count\nFROM (\n  SELECT department, COUNT(*) AS headcount\n  FROM employees\n  GROUP BY department\n) AS counts\nWHERE headcount > 3;" }
    ]
  },

  {
    module: 4, lesson: 18,
    slug: "subqueries-ctes/correlated-subqueries",
    moduleSlug: "subqueries-ctes", lessonSlug: "correlated-subqueries",
    title: "Correlated Subqueries", badge: "practice", database: "company",
    theory: { content: `## Mental Model
A correlated subquery references the outer query. It runs once for every row the outer query processes — the inner query uses a value from the current outer row. Slower than regular subqueries, but necessary for row-by-row comparisons.

## Syntax
\`\`\`sql
SELECT name, salary, department
FROM employees e
WHERE salary > (
  SELECT AVG(salary)
  FROM employees
  WHERE department = e.department  -- references outer query's row
);
\`\`\`

## How It Works
- For each employee row in the outer query, the subquery runs with that employee's department
- It compares each employee against their own department's average, not the company average
- The outer alias (e) is accessible inside the subquery

## When To Use This
Row-by-row comparisons where the filter depends on the current row's context — "above average for their own group" is the classic case.` },
    examples: [
      { title: "Employees above their department average", explanation: "Each employee compared to their own dept average", sql: "SELECT e.name, e.salary, e.department\nFROM employees e\nWHERE e.salary > (\n  SELECT AVG(salary)\n  FROM employees\n  WHERE department = e.department\n)\nORDER BY e.department;" },
      { title: "Most expensive project per department", explanation: "Correlated to find the top project per department", sql: "SELECT p.name, p.budget, d.name AS department\nFROM projects p\nJOIN departments d ON p.dept_id = d.id\nWHERE p.budget = (\n  SELECT MAX(budget)\n  FROM projects\n  WHERE dept_id = d.id\n);" }
    ],
    challenges: [
      { id: "18-1", prompt: "Find employees who earn more than the average salary for their own department.", hint: "Correlated subquery: WHERE salary > (SELECT AVG(salary) FROM employees WHERE department = e.department).", expectedColumns: ["name","salary","department"], validateFn: "return rows.length > 0;", solution: "SELECT e.name, e.salary, e.department\nFROM employees e\nWHERE e.salary > (\n  SELECT AVG(salary) FROM employees WHERE department = e.department\n)\nORDER BY e.department;" },
      { id: "18-2", prompt: "Find the highest-paid employee in each department using a correlated subquery.", hint: "WHERE salary = (SELECT MAX(salary) FROM employees WHERE department = e.department).", expectedColumns: ["name","salary","department"], validateFn: "return rows.length > 1;", solution: "SELECT e.name, e.salary, e.department\nFROM employees e\nWHERE e.salary = (\n  SELECT MAX(salary) FROM employees WHERE department = e.department\n)\nORDER BY e.department;" },
      { id: "18-3", prompt: "Find departments where at least one employee earns over $100,000. Return department names only.", hint: "SELECT DISTINCT department WHERE EXISTS (SELECT 1 FROM employees WHERE department = e.department AND salary > 100000).", expectedColumns: ["department"], validateFn: "return rows.length > 0;", solution: "SELECT DISTINCT department\nFROM employees e\nWHERE EXISTS (\n  SELECT 1 FROM employees WHERE department = e.department AND salary > 100000\n);" }
    ]
  },

  {
    module: 4, lesson: 19,
    slug: "subqueries-ctes/ctes-with",
    moduleSlug: "subqueries-ctes", lessonSlug: "ctes-with",
    title: "CTEs — WITH Clause", badge: "concept", database: "company",
    theory: { content: `## Mental Model
A CTE (Common Table Expression) is a named subquery. Instead of nesting a subquery inside another query, you name it at the top with WITH, then reference it by name. Same result, way more readable.

## Syntax
\`\`\`sql
WITH dept_stats AS (
  SELECT department, AVG(salary) AS avg_salary
  FROM employees
  GROUP BY department
)
SELECT e.name, e.salary, d.avg_salary
FROM employees e
JOIN dept_stats d ON e.department = d.department
WHERE e.salary > d.avg_salary;
\`\`\`

## Multiple CTEs
\`\`\`sql
WITH
  cte_one AS (SELECT ...),
  cte_two AS (SELECT ...)
SELECT ... FROM cte_one JOIN cte_two ON ...;
\`\`\`

## CTE vs Subquery in FROM
They produce the same result. CTEs are preferred because:
- Named, so you can reference them multiple times
- Read top-to-bottom — easier to follow the logic
- Easier to debug (just SELECT * FROM the CTE name)

## When To Use This
Any time you have a complex query with a subquery. CTEs make it readable.` },
    examples: [
      { title: "Above-average salary with CTE", explanation: "Same as the subquery version but much more readable", sql: "WITH company_avg AS (\n  SELECT AVG(salary) AS avg_sal FROM employees\n)\nSELECT e.name, e.salary\nFROM employees e, company_avg\nWHERE e.salary > company_avg.avg_sal;" },
      { title: "Two CTEs chained", explanation: "Build dept stats and compare against company stats", sql: "WITH\n  dept_avg AS (\n    SELECT department, AVG(salary) AS avg_sal\n    FROM employees GROUP BY department\n  ),\n  company_avg AS (\n    SELECT AVG(salary) AS avg_sal FROM employees\n  )\nSELECT dept_avg.department, ROUND(dept_avg.avg_sal, 0) AS dept_avg,\n       ROUND(company_avg.avg_sal, 0) AS company_avg\nFROM dept_avg, company_avg\nORDER BY dept_avg.avg_sal DESC;" }
    ],
    challenges: [
      { id: "19-1", prompt: "Using a CTE, find all employees who earn above the company average salary.", hint: "WITH avg_cte AS (SELECT AVG(salary) AS avg FROM employees) then JOIN/compare.", expectedColumns: ["name","salary"], validateFn: "return rows.length > 0;", solution: "WITH avg_cte AS (\n  SELECT AVG(salary) AS avg FROM employees\n)\nSELECT e.name, e.salary\nFROM employees e, avg_cte\nWHERE e.salary > avg_cte.avg\nORDER BY e.salary DESC;" },
      { id: "19-2", prompt: "Using a CTE, get the average salary per department, then show only departments where the average exceeds $80,000.", hint: "CTE for dept averages, then filter in the outer SELECT.", expectedColumns: ["department","avg_salary"], validateFn: "return rows.length > 0 && rows.every(r => r.avg_salary > 80000);", solution: "WITH dept_avgs AS (\n  SELECT department, AVG(salary) AS avg_salary\n  FROM employees\n  GROUP BY department\n)\nSELECT department, ROUND(avg_salary, 0) AS avg_salary\nFROM dept_avgs\nWHERE avg_salary > 80000;" },
      { id: "19-3", prompt: "Using two CTEs: first calculate total payroll per department, then calculate what percentage of company payroll each department represents.", hint: "CTE1 = dept payroll, CTE2 = total company payroll. Join them and divide.", expectedColumns: ["department","payroll","pct_of_total"], validateFn: "return rows.length > 0 && rows[0].pct_of_total > 0;", solution: "WITH\n  dept_payroll AS (\n    SELECT department, SUM(salary) AS payroll FROM employees GROUP BY department\n  ),\n  total AS (\n    SELECT SUM(salary) AS total_payroll FROM employees\n  )\nSELECT department, payroll,\n       ROUND(payroll * 100.0 / total_payroll, 1) AS pct_of_total\nFROM dept_payroll, total\nORDER BY payroll DESC;" }
    ]
  },

  // ─── MODULE 5: MODIFYING DATA ─────────────────────────────────────────────

  {
    module: 5, lesson: 20,
    slug: "modifying-data/insert",
    moduleSlug: "modifying-data", lessonSlug: "insert",
    title: "INSERT — Adding Rows", badge: "concept", database: "company",
    theory: { content: `## Mental Model
INSERT adds new rows to a table. You specify the table, the columns you're filling, and the values for each column in the same order.

## Syntax
\`\`\`sql
-- Insert one row (explicit columns — recommended)
INSERT INTO employees (name, department, salary, hire_date)
VALUES ('Alex Torres', 'Engineering', 85000, '2026-01-15');

-- Insert multiple rows at once
INSERT INTO employees (name, department, salary, hire_date)
VALUES
  ('Maria Santos', 'Marketing', 62000, '2026-02-01'),
  ('James Park', 'Sales', 70000, '2026-02-15');
\`\`\`

## Best Practice
Always list the column names explicitly. Relying on column order works until someone adds a column and breaks your insert.

## Insert from a SELECT
\`\`\`sql
INSERT INTO archive_employees
SELECT * FROM employees WHERE hire_date < '2019-01-01';
\`\`\`

## When To Use This
Adding new records to a table — new employees, new orders, new entries of any kind.` },
    examples: [
      { title: "Add one employee", explanation: "Named columns + matching values", sql: "INSERT INTO employees (id, name, department, salary, hire_date, manager_id)\nVALUES (21, 'Alex Torres', 'Engineering', 85000, '2026-01-15', 1);" },
      { title: "Add multiple employees", explanation: "One INSERT, multiple value sets", sql: "INSERT INTO employees (id, name, department, salary, hire_date, manager_id)\nVALUES\n  (22, 'Maria Santos', 'Marketing', 62000, '2026-02-01', 9),\n  (23, 'James Park', 'Sales', 70000, '2026-02-15', 5);" }
    ],
    challenges: [
      { id: "20-1", prompt: "Add a new department: name='Data Science', budget=1100000, location='Building D'. Then SELECT * FROM departments to verify.", hint: "INSERT INTO departments (id, name, budget, location) VALUES (...).", expectedColumns: ["id","name","budget","location"], validateFn: "return rows.some(r => r.name === 'Data Science');", solution: "INSERT INTO departments (id, name, budget, location)\nVALUES (6, 'Data Science', 1100000, 'Building D');\nSELECT * FROM departments;" },
      { id: "20-2", prompt: "Add two new employees to the Engineering department (make up realistic names and salaries). Then count all Engineering employees.", hint: "INSERT two rows, then SELECT COUNT(*) WHERE department = 'Engineering'.", expectedColumns: ["count"], validateFn: "return rows.length === 1 && rows[0].count >= 8;", solution: "INSERT INTO employees (id, name, department, salary, hire_date, manager_id)\nVALUES\n  (21, 'Taylor Kim', 'Engineering', 91000, '2026-01-10', 1),\n  (22, 'Jordan Lee', 'Engineering', 87000, '2026-02-01', 1);\nSELECT COUNT(*) AS count FROM employees WHERE department = 'Engineering';" },
      { id: "20-3", prompt: "Add a new project: Cloud Security, owned by IT (use Finance dept_id=5 if no IT exists), budget 250000, start_date '2026-03-01'. Verify by selecting all projects.", hint: "INSERT INTO projects with an existing dept_id.", expectedColumns: ["id","name","dept_id","budget"], validateFn: "return rows.some(r => r.name === 'Cloud Security');", solution: "INSERT INTO projects (id, name, dept_id, start_date, budget)\nVALUES (7, 'Cloud Security', 5, '2026-03-01', 250000);\nSELECT * FROM projects;" }
    ]
  },

  {
    module: 5, lesson: 21,
    slug: "modifying-data/update",
    moduleSlug: "modifying-data", lessonSlug: "update",
    title: "UPDATE — Modifying Rows", badge: "concept", database: "company",
    theory: { content: `## Mental Model
UPDATE changes existing rows. The WHERE clause is critical — without it, you update every single row in the table. This is one of the most dangerous SQL mistakes.

## Syntax
\`\`\`sql
UPDATE employees
SET salary = 95000,
    department = 'Engineering'
WHERE id = 5;
\`\`\`

## The Golden Rule
**Always write the WHERE clause first before the SET.** Test it with a SELECT to confirm which rows you'll hit before running the UPDATE.

## Useful patterns
\`\`\`sql
-- Increase by percentage
UPDATE employees SET salary = salary * 1.1 WHERE department = 'Engineering';

-- Update based on another table
UPDATE employees SET salary = salary * 1.05
WHERE department IN (SELECT name FROM departments WHERE budget > 1000000);
\`\`\`

## When To Use This
Correcting data, applying raises/adjustments, changing status fields.` },
    examples: [
      { title: "Give one employee a raise", explanation: "Always use WHERE with a specific ID", sql: "UPDATE employees\nSET salary = 130000\nWHERE id = 1;\nSELECT name, salary FROM employees WHERE id = 1;" },
      { title: "10% raise for Engineering", explanation: "Multiply existing value", sql: "UPDATE employees\nSET salary = salary * 1.10\nWHERE department = 'Engineering';\nSELECT name, salary FROM employees WHERE department = 'Engineering';" },
      { title: "Update multiple columns", explanation: "Comma-separated SET assignments", sql: "UPDATE departments\nSET budget = 1300000, location = 'Building D'\nWHERE name = 'Marketing';" }
    ],
    challenges: [
      { id: "21-1", prompt: "Give all Sales employees a 5% raise. Then show their names and new salaries.", hint: "UPDATE WHERE department = 'Sales', SET salary = salary * 1.05.", expectedColumns: ["name","salary"], validateFn: "return rows.length > 0;", solution: "UPDATE employees SET salary = salary * 1.05 WHERE department = 'Sales';\nSELECT name, salary FROM employees WHERE department = 'Sales';" },
      { id: "21-2", prompt: "The Finance department is moving to Building A. Update their location.", hint: "UPDATE departments SET location = 'Building A' WHERE name = 'Finance'.", expectedColumns: ["name","location"], validateFn: "return rows.some(r => r.name === 'Finance' && r.location === 'Building A');", solution: "UPDATE departments SET location = 'Building A' WHERE name = 'Finance';\nSELECT name, location FROM departments;" },
      { id: "21-3", prompt: "Any employee earning less than $60,000 should receive a raise to exactly $62,000. Verify with a SELECT.", hint: "UPDATE WHERE salary < 60000 SET salary = 62000.", expectedColumns: ["name","salary"], validateFn: "return rows.every(r => r.salary >= 60000);", solution: "UPDATE employees SET salary = 62000 WHERE salary < 60000;\nSELECT name, salary FROM employees ORDER BY salary;" }
    ]
  },

  {
    module: 5, lesson: 22,
    slug: "modifying-data/delete",
    moduleSlug: "modifying-data", lessonSlug: "delete",
    title: "DELETE — Removing Rows", badge: "concept", database: "company",
    theory: { content: `## Mental Model
DELETE removes rows from a table permanently. Like UPDATE, the WHERE clause is what keeps this from being catastrophic. Always test with a SELECT first.

## Syntax
\`\`\`sql
DELETE FROM employees
WHERE id = 15;
\`\`\`

## The Rules
1. **Always use WHERE** — DELETE FROM employees with no WHERE deletes every row
2. **Test with SELECT first** — run the same WHERE condition as a SELECT to confirm what you'll delete
3. **Consider foreign keys** — deleting a department that employees reference can cause errors

## Soft Delete Pattern
Instead of actually deleting, many systems add an is_deleted or status column and UPDATE instead of DELETE. Safer, recoverable.

## When To Use This
Removing test data, deleting expired records, cleaning up orphaned rows.` },
    examples: [
      { title: "Delete one employee", explanation: "Always by specific ID when possible", sql: "DELETE FROM employees WHERE id = 20;\nSELECT COUNT(*) AS remaining FROM employees;" },
      { title: "Delete old project assignments", explanation: "Multiple rows matching a condition", sql: "DELETE FROM employee_projects\nWHERE project_id = 1;\nSELECT COUNT(*) AS remaining FROM employee_projects;" }
    ],
    challenges: [
      { id: "22-1", prompt: "Delete all employee_projects records for project_id = 5. Verify the count before and after.", hint: "SELECT COUNT first, then DELETE WHERE project_id = 5, then SELECT COUNT again.", expectedColumns: ["remaining"], validateFn: "return rows.length === 1;", solution: "DELETE FROM employee_projects WHERE project_id = 5;\nSELECT COUNT(*) AS remaining FROM employee_projects WHERE project_id = 5;" },
      { id: "22-2", prompt: "Remove all projects with a budget under $150,000. Show remaining projects.", hint: "DELETE FROM projects WHERE budget < 150000.", expectedColumns: ["id","name","budget"], validateFn: "return rows.every(r => r.budget >= 150000);", solution: "DELETE FROM projects WHERE budget < 150000;\nSELECT id, name, budget FROM projects;" },
      { id: "22-3", prompt: "A test employee was added with id=99. Delete them safely (if they exist) and confirm they're gone.", hint: "DELETE WHERE id = 99. Then SELECT to confirm zero rows.", expectedColumns: ["count"], validateFn: "return rows.length === 1 && rows[0].count === 0;", solution: "DELETE FROM employees WHERE id = 99;\nSELECT COUNT(*) AS count FROM employees WHERE id = 99;" }
    ]
  },

  {
    module: 5, lesson: 23,
    slug: "modifying-data/transactions",
    moduleSlug: "modifying-data", lessonSlug: "transactions",
    title: "Transactions", badge: "concept", database: "company",
    theory: { content: `## Mental Model
A transaction is an all-or-nothing operation. Either every statement inside it succeeds and gets saved, or if anything fails, everything rolls back like it never happened. Think of it as an undo button for a group of related changes.

## Syntax
\`\`\`sql
BEGIN;
  UPDATE accounts SET balance = balance - 500 WHERE id = 1;
  UPDATE accounts SET balance = balance + 500 WHERE id = 2;
COMMIT;
\`\`\`
If something goes wrong:
\`\`\`sql
ROLLBACK;  -- undo everything since BEGIN
\`\`\`

## ACID Properties (the theory)
- **Atomic**: all or nothing
- **Consistent**: data stays valid
- **Isolated**: concurrent transactions don't interfere
- **Durable**: committed changes survive crashes

## When To Use This
Any time you have two or more related changes that must succeed or fail together — financial transfers, order + inventory updates, multi-table inserts.` },
    examples: [
      { title: "Safe multi-step update", explanation: "Both updates wrapped in a transaction", sql: "BEGIN;\n  UPDATE employees SET salary = 125000 WHERE id = 1;\n  UPDATE departments SET budget = budget - 5000 WHERE name = 'Engineering';\nCOMMIT;\nSELECT id, salary FROM employees WHERE id = 1;" },
      { title: "Rolling back an accident", explanation: "ROLLBACK undoes everything since BEGIN", sql: "BEGIN;\n  UPDATE employees SET salary = 0 WHERE department = 'Engineering'; -- oops\nROLLBACK;\nSELECT name, salary FROM employees WHERE department = 'Engineering';" }
    ],
    challenges: [
      { id: "23-1", prompt: "Transfer an employee (id=10) from Marketing to Sales: update their department AND give them a $3,000 raise. Do it in a transaction.", hint: "BEGIN; UPDATE name/dept; UPDATE salary; COMMIT;", expectedColumns: ["name","department","salary"], validateFn: "return rows.some(r => r.department === 'Sales');", solution: "BEGIN;\n  UPDATE employees SET department = 'Sales', salary = salary + 3000 WHERE id = 10;\nCOMMIT;\nSELECT name, department, salary FROM employees WHERE id = 10;" },
      { id: "23-2", prompt: "Start a transaction that deletes a project (id=6). Then ROLLBACK and verify the project still exists.", hint: "BEGIN; DELETE ...; ROLLBACK; SELECT to verify.", expectedColumns: ["id","name"], validateFn: "return rows.some(r => r.id === 6);", solution: "BEGIN;\n  DELETE FROM projects WHERE id = 6;\nROLLBACK;\nSELECT id, name FROM projects WHERE id = 6;" },
      { id: "23-3", prompt: "In one transaction: add a new department 'Data Science' (id=6, budget=1000000, location='Building D') AND add one employee to it. Commit and verify both.", hint: "BEGIN; INSERT departments; INSERT employees; COMMIT;", expectedColumns: ["name","department"], validateFn: "return rows.some(r => r.department === 'Data Science');", solution: "BEGIN;\n  INSERT INTO departments (id, name, budget, location) VALUES (6, 'Data Science', 1000000, 'Building D');\n  INSERT INTO employees (id, name, department, salary, hire_date) VALUES (21, 'Sam Rivera', 'Data Science', 88000, '2026-01-01');\nCOMMIT;\nSELECT name, department FROM employees WHERE department = 'Data Science';" }
    ]
  },

  // ─── MODULE 6: FUNCTIONS & EXPRESSIONS ───────────────────────────────────

  {
    module: 6, lesson: 24,
    slug: "functions/string-functions",
    moduleSlug: "functions", lessonSlug: "string-functions",
    title: "String Functions", badge: "practice", database: "company",
    theory: { content: `## Mental Model
String functions let you manipulate text inside a query — clean it, transform it, extract pieces from it. Essential for messy real-world data.

## Common Functions (SQLite)
| Function | What it does | Example |
|----------|-------------|---------|
| LENGTH(s) | Character count | LENGTH('hello') → 5 |
| UPPER(s) | All uppercase | UPPER('hello') → 'HELLO' |
| LOWER(s) | All lowercase | LOWER('Hello') → 'hello' |
| TRIM(s) | Remove leading/trailing spaces | TRIM(' hi ') → 'hi' |
| SUBSTR(s, start, len) | Extract substring | SUBSTR('hello', 2, 3) → 'ell' |
| REPLACE(s, old, new) | Replace text | REPLACE('hi world', 'world', 'there') → 'hi there' |
| INSTR(s, sub) | Find position of substring | INSTR('hello', 'ell') → 2 |
| s || s | Concatenate strings | 'Hello' || ' ' || 'World' |

## When To Use This
Cleaning inconsistent data, formatting output, building display values, searching within text.` },
    examples: [
      { title: "Format names", explanation: "UPPER for display, concatenation for full name", sql: "SELECT UPPER(name) AS name_upper,\n       LENGTH(name) AS name_length\nFROM employees\nLIMIT 5;" },
      { title: "Extract first name", explanation: "SUBSTR + INSTR to get text before the space", sql: "SELECT name,\n       SUBSTR(name, 1, INSTR(name, ' ') - 1) AS first_name\nFROM employees;" },
      { title: "Build email addresses", explanation: "Concatenation + LOWER + REPLACE", sql: "SELECT name,\n       LOWER(REPLACE(name, ' ', '.')) || '@company.com' AS email\nFROM employees;" }
    ],
    challenges: [
      { id: "24-1", prompt: "Show each employee's name in UPPERCASE and the length of their name.", hint: "UPPER(name), LENGTH(name).", expectedColumns: ["name_upper","name_length"], validateFn: "return rows.length > 0 && rows[0].name_upper === rows[0].name_upper.toUpperCase();", solution: "SELECT UPPER(name) AS name_upper, LENGTH(name) AS name_length FROM employees;" },
      { id: "24-2", prompt: "Build a fake email for each employee: first letter of first name + last name, all lowercase, @company.com. E.g. 'Sarah Chen' → 'schen@company.com'.", hint: "SUBSTR for first initial, split on space for last name using SUBSTR + INSTR.", expectedColumns: ["name","email"], validateFn: "return rows.length > 0 && rows[0].email.includes('@company.com');", solution: "SELECT name,\n  LOWER(\n    SUBSTR(name, 1, 1) ||\n    SUBSTR(name, INSTR(name, ' ') + 1)\n  ) || '@company.com' AS email\nFROM employees;" },
      { id: "24-3", prompt: "Find all employees whose name contains the letters 'son' anywhere (case-insensitive).", hint: "LOWER(name) LIKE '%son%'.", expectedColumns: ["name"], validateFn: "return rows.length > 0 && rows.every(r => r.name.toLowerCase().includes('son'));", solution: "SELECT name FROM employees WHERE LOWER(name) LIKE '%son%';" }
    ]
  },

  {
    module: 6, lesson: 25,
    slug: "functions/date-functions",
    moduleSlug: "functions", lessonSlug: "date-functions",
    title: "Date Functions", badge: "practice", database: "company",
    theory: { content: `## Mental Model
Date functions let you calculate time differences, extract parts of dates, and format dates. In SQLite, dates are stored as text (YYYY-MM-DD) but date functions treat them as actual dates.

## Key SQLite Date Functions
\`\`\`sql
date('now')                    -- today's date: '2026-03-29'
date('now', '-1 year')         -- one year ago
date('now', '+30 days')        -- 30 days from now

strftime('%Y', hire_date)      -- extract year
strftime('%m', hire_date)      -- extract month (01-12)
strftime('%Y-%m', hire_date)   -- year-month: '2020-01'

julianday('now') - julianday(hire_date)  -- days between dates
\`\`\`

## Calculating Years of Service
\`\`\`sql
CAST((julianday('now') - julianday(hire_date)) / 365.25 AS INTEGER)
\`\`\`

## When To Use This
Calculating tenure, finding records in a date range, grouping by month/year, aging reports.` },
    examples: [
      { title: "Years of service", explanation: "Calculate tenure using julianday", sql: "SELECT name,\n       hire_date,\n       CAST((julianday('now') - julianday(hire_date)) / 365.25 AS INTEGER) AS years_of_service\nFROM employees\nORDER BY years_of_service DESC;" },
      { title: "Employees hired this year", explanation: "Extract year from hire_date and compare", sql: "SELECT name, hire_date\nFROM employees\nWHERE strftime('%Y', hire_date) = '2022';" },
      { title: "Group hires by year", explanation: "Aggregate by extracted year", sql: "SELECT strftime('%Y', hire_date) AS hire_year,\n       COUNT(*) AS new_hires\nFROM employees\nGROUP BY hire_year\nORDER BY hire_year;" }
    ],
    challenges: [
      { id: "25-1", prompt: "Show each employee's name, hire date, and how many complete years they've worked at the company.", hint: "CAST(julianday('now') - julianday(hire_date)) / 365.25 AS INTEGER).", expectedColumns: ["name","hire_date","years_of_service"], validateFn: "return rows.length > 0 && rows[0].years_of_service >= 0;", solution: "SELECT name, hire_date,\n  CAST((julianday('now') - julianday(hire_date)) / 365.25 AS INTEGER) AS years_of_service\nFROM employees ORDER BY years_of_service DESC;" },
      { id: "25-2", prompt: "How many employees were hired each year? Show year and count, ordered by year.", hint: "strftime('%Y', hire_date) to extract year, GROUP BY that.", expectedColumns: ["hire_year","new_hires"], validateFn: "return rows.length > 1;", solution: "SELECT strftime('%Y', hire_date) AS hire_year, COUNT(*) AS new_hires\nFROM employees GROUP BY hire_year ORDER BY hire_year;" },
      { id: "25-3", prompt: "Find employees hired more than 5 years ago.", hint: "WHERE hire_date < date('now', '-5 years').", expectedColumns: ["name","hire_date"], validateFn: "return rows.length > 0;", solution: "SELECT name, hire_date\nFROM employees\nWHERE hire_date < date('now', '-5 years')\nORDER BY hire_date;" }
    ]
  },

  {
    module: 6, lesson: 26,
    slug: "functions/math-functions",
    moduleSlug: "functions", lessonSlug: "math-functions",
    title: "Math Functions", badge: "practice", database: "company",
    theory: { content: `## Mental Model
Math functions handle numeric calculations. Most are straightforward — the ones worth knowing are ROUND (crucial for money), ABS (absolute value), and integer division.

## Common Functions
\`\`\`sql
ROUND(3.14159, 2)   → 3.14   -- round to N decimal places
ABS(-42)            → 42     -- absolute value
10 / 3              → 3      -- integer division in SQLite (both integers)
10.0 / 3            → 3.333  -- float division (one must be decimal)
10 % 3              → 1      -- modulo (remainder)
MAX(a, b)           -- greater of two values (not aggregate here)
MIN(a, b)           -- lesser of two values
\`\`\`

## Watch Out
Integer ÷ Integer = Integer in most databases. \`SELECT 1/2\` returns 0, not 0.5. Use \`1.0/2\` or \`CAST(1 AS REAL)/2\`.

## When To Use This
Financial calculations (rounding), percentages, ranking math, modulo for even/odd checks.` },
    examples: [
      { title: "Salary calculations", explanation: "ROUND for clean numbers, math for bonus calculation", sql: "SELECT name, salary,\n       ROUND(salary * 0.1, 2) AS bonus_10pct,\n       ROUND(salary / 12.0, 2) AS monthly_salary\nFROM employees;" },
      { title: "Percentage of company payroll", explanation: "Float division for percentages", sql: "SELECT name, salary,\n       ROUND(salary * 100.0 / (SELECT SUM(salary) FROM employees), 2) AS pct_of_payroll\nFROM employees\nORDER BY pct_of_payroll DESC;" }
    ],
    challenges: [
      { id: "26-1", prompt: "Show each employee's annual salary and their equivalent monthly salary, rounded to 2 decimal places.", hint: "salary / 12.0 to avoid integer division.", expectedColumns: ["name","annual_salary","monthly_salary"], validateFn: "return rows.length > 0 && rows[0].monthly_salary > 0;", solution: "SELECT name, salary AS annual_salary,\n  ROUND(salary / 12.0, 2) AS monthly_salary\nFROM employees;" },
      { id: "26-2", prompt: "Show each employee and what percentage of their department's total payroll they represent. Round to 1 decimal place.", hint: "Correlated subquery or CTE for dept total, then divide.", expectedColumns: ["name","department","pct_of_dept"], validateFn: "return rows.length > 0;", solution: "WITH dept_totals AS (\n  SELECT department, SUM(salary) AS total FROM employees GROUP BY department\n)\nSELECT e.name, e.department,\n  ROUND(e.salary * 100.0 / dt.total, 1) AS pct_of_dept\nFROM employees e\nJOIN dept_totals dt ON e.department = dt.department\nORDER BY e.department;" },
      { id: "26-3", prompt: "Show each department's total budget and what percentage of all department budgets it represents.", hint: "SUM(budget) for each + total from subquery.", expectedColumns: ["name","budget","pct_of_total"], validateFn: "return rows.length > 0 && rows[0].pct_of_total > 0;", solution: "SELECT name, budget,\n  ROUND(budget * 100.0 / (SELECT SUM(budget) FROM departments), 1) AS pct_of_total\nFROM departments\nORDER BY budget DESC;" }
    ]
  },

  {
    module: 6, lesson: 27,
    slug: "functions/type-casting",
    moduleSlug: "functions", lessonSlug: "type-casting",
    title: "Type Casting", badge: "concept", database: "company",
    theory: { content: `## Mental Model
Sometimes SQL stores a number as text, or you need to convert between types for math or display. CAST is the explicit way to tell SQL "treat this as this type."

## Syntax
\`\`\`sql
CAST(column AS INTEGER)
CAST(column AS REAL)      -- float/decimal
CAST(column AS TEXT)
CAST(column AS NUMERIC)
\`\`\`

## typeof()
\`\`\`sql
SELECT typeof(salary) FROM employees LIMIT 1;
-- Returns: 'integer', 'real', 'text', 'null', 'blob'
\`\`\`

## Common Uses
\`\`\`sql
-- Fix integer division
CAST(count AS REAL) / total

-- Convert number to string for concatenation
'Employee #' || CAST(id AS TEXT)

-- Safely convert text to number
CAST('42' AS INTEGER)  -- → 42
CAST('abc' AS INTEGER) -- → 0 (silently)
\`\`\`

## When To Use This
Division that keeps losing decimals, concatenating numbers into strings, dealing with columns that stored numbers as text.` },
    examples: [
      { title: "Fix integer division", explanation: "Cast to REAL before dividing to get decimal result", sql: "SELECT department,\n       COUNT(*) AS headcount,\n       CAST(COUNT(*) AS REAL) / (SELECT COUNT(*) FROM employees) AS fraction\nFROM employees\nGROUP BY department;" },
      { title: "Build string with ID", explanation: "CAST number to text for concatenation", sql: "SELECT 'EMP-' || CAST(id AS TEXT) AS employee_id, name\nFROM employees\nLIMIT 5;" }
    ],
    challenges: [
      { id: "27-1", prompt: "Show each department's headcount as a percentage of total employees, as a decimal (e.g. 0.35 not 35). Use CAST to avoid integer division.", hint: "CAST(COUNT(*) AS REAL) / (SELECT COUNT(*) FROM employees).", expectedColumns: ["department","pct"], validateFn: "return rows.length > 0 && rows[0].pct < 1;", solution: "SELECT department,\n  ROUND(CAST(COUNT(*) AS REAL) / (SELECT COUNT(*) FROM employees), 3) AS pct\nFROM employees\nGROUP BY department\nORDER BY pct DESC;" },
      { id: "27-2", prompt: "Build a formatted employee ID string like 'EMP-001' for each employee (zero-pad to 3 digits).", hint: "PRINTF('EMP-%03d', id) is a SQLite function that formats numbers.", expectedColumns: ["emp_code","name"], validateFn: "return rows.length > 0 && rows[0].emp_code.startsWith('EMP-');", solution: "SELECT PRINTF('EMP-%03d', id) AS emp_code, name FROM employees;" },
      { id: "27-3", prompt: "Show the data type of each column in the employees table by selecting one row and using typeof().", hint: "SELECT typeof(id), typeof(name), typeof(salary), typeof(hire_date), typeof(manager_id) FROM employees LIMIT 1.", expectedColumns: [], validateFn: "return rows.length === 1;", solution: "SELECT typeof(id) AS id_type, typeof(name) AS name_type,\n  typeof(salary) AS salary_type, typeof(hire_date) AS date_type,\n  typeof(manager_id) AS mgr_type\nFROM employees LIMIT 1;" }
    ]
  },

  {
    module: 6, lesson: 28,
    slug: "functions/coalesce-nullif",
    moduleSlug: "functions", lessonSlug: "coalesce-nullif",
    title: "COALESCE, NULLIF, and IIF", badge: "concept", database: "company",
    theory: { content: `## Mental Model
These are practical NULL-handling and conditional tools. COALESCE gives you the first non-NULL value in a list. NULLIF converts a value to NULL if it matches a condition. IIF is a compact if/else.

## COALESCE
\`\`\`sql
COALESCE(a, b, c)  -- returns first non-NULL value
COALESCE(manager_id, 0)          -- replace NULL with 0
COALESCE(nickname, first_name)   -- use nickname if it exists, else first_name
\`\`\`

## NULLIF
\`\`\`sql
NULLIF(a, b)  -- returns NULL if a equals b, otherwise returns a
NULLIF(salary, 0)    -- treat 0 salary as NULL (prevents division-by-zero)
\`\`\`

## IIF (SQLite 3.32+)
\`\`\`sql
IIF(condition, value_if_true, value_if_false)
IIF(salary > 90000, 'High', 'Standard')  -- inline if/else
\`\`\`

## When To Use This
Cleaning NULL values in output, safe division, compact conditional columns.` },
    examples: [
      { title: "Replace NULL manager with label", explanation: "COALESCE converts NULL to readable text", sql: "SELECT name,\n  COALESCE(CAST(manager_id AS TEXT), 'No Manager') AS manager\nFROM employees;" },
      { title: "Quick salary tier with IIF", explanation: "IIF for simple binary conditions", sql: "SELECT name, salary,\n  IIF(salary >= 90000, 'Senior', 'Standard') AS tier\nFROM employees;" },
      { title: "Safe percentage with NULLIF", explanation: "NULLIF prevents division by zero", sql: "SELECT name, salary,\n  ROUND(salary * 100.0 / NULLIF((SELECT SUM(salary) FROM employees), 0), 2) AS pct\nFROM employees;" }
    ],
    challenges: [
      { id: "28-1", prompt: "Show each employee's name and manager ID. For those with no manager, show 0 instead of NULL.", hint: "COALESCE(manager_id, 0).", expectedColumns: ["name","manager_id"], validateFn: "return rows.length > 0 && rows.every(r => r.manager_id !== null);", solution: "SELECT name, COALESCE(manager_id, 0) AS manager_id FROM employees;" },
      { id: "28-2", prompt: "Show each employee with a 'tier' column: 'Director' if they have no manager, 'Manager' if their id appears as someone else's manager, 'IC' otherwise.", hint: "Use IIF or CASE — check IS NULL for director, IN subquery for manager.", expectedColumns: ["name","tier"], validateFn: "return rows.length > 0 && rows.some(r => r.tier === 'Director');", solution: "SELECT name,\n  CASE\n    WHEN manager_id IS NULL THEN 'Director'\n    WHEN id IN (SELECT DISTINCT manager_id FROM employees WHERE manager_id IS NOT NULL) THEN 'Manager'\n    ELSE 'IC'\n  END AS tier\nFROM employees;" },
      { id: "28-3", prompt: "Show the average salary per department. If a department has 0 employees (would cause division by zero), use NULLIF to safely return NULL instead of an error.", hint: "NULLIF(COUNT(*), 0) in the denominator.", expectedColumns: ["department","avg_salary"], validateFn: "return rows.length > 0;", solution: "SELECT department,\n  ROUND(SUM(salary) * 1.0 / NULLIF(COUNT(*), 0), 2) AS avg_salary\nFROM employees\nGROUP BY department;" }
    ]
  }

];
