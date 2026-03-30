import type { Lesson } from "./lessons";

export const lessonsM1M3: Lesson[] = [

  // ─── MODULE 1: GETTING STARTED ───────────────────────────────────────────

  {
    module: 1, lesson: 1,
    slug: "getting-started/select-basics",
    moduleSlug: "getting-started", lessonSlug: "select-basics",
    title: "SELECT Basics", badge: "concept", database: "company",
    theory: { content: `## Mental Model
SQL is how you ask questions about data sitting in a table. A table is like a spreadsheet — rows are individual records, columns are the fields each record has.

## Syntax
\`\`\`sql
SELECT column1, column2
FROM table_name;
\`\`\`
To grab every column at once:
\`\`\`sql
SELECT *
FROM table_name;
\`\`\`

## How It Works
- **SELECT** tells SQL what columns you want back
- **FROM** tells SQL which table to look in
- The semicolon ends the statement
- \`*\` is shorthand for "every column" — great for exploring, but avoid in production queries

## When To Use This
Any time you want to see data. This is the foundation of every query you'll ever write.` },
    examples: [
      { title: "See all employees", explanation: "Grab every column from the employees table", sql: "SELECT *\nFROM employees;" },
      { title: "Just names and salaries", explanation: "Pick specific columns to keep the result clean", sql: "SELECT name, salary\nFROM employees;" },
      { title: "Three columns", explanation: "You can list as many columns as you need", sql: "SELECT name, department, hire_date\nFROM employees;" }
    ],
    challenges: [
      { id: "1-1", prompt: "Show every column from the departments table.", hint: "Use SELECT * to grab all columns.", expectedColumns: ["id","name","budget","location"], validateFn: "return rows.length === 5 && rows[0].hasOwnProperty('budget');", solution: "SELECT *\nFROM departments;" },
      { id: "1-2", prompt: "Show only the name and location columns from departments.", hint: "List just the two columns you want after SELECT.", expectedColumns: ["name","location"], validateFn: "return rows.length === 5 && rows[0].hasOwnProperty('name') && !rows[0].hasOwnProperty('budget');", solution: "SELECT name, location\nFROM departments;" },
      { id: "1-3", prompt: "Show the name, department, and salary of all employees.", hint: "SELECT the three columns, FROM employees.", expectedColumns: ["name","department","salary"], validateFn: "return rows.length > 0 && rows[0].hasOwnProperty('salary') && !rows[0].hasOwnProperty('hire_date');", solution: "SELECT name, department, salary\nFROM employees;" }
    ]
  },

  {
    module: 1, lesson: 2,
    slug: "getting-started/where-filtering",
    moduleSlug: "getting-started", lessonSlug: "where-filtering",
    title: "WHERE — Filtering Rows", badge: "concept", database: "company",
    theory: { content: `## Mental Model
WHERE is a filter. Without it, you get every row. With it, you only get rows where the condition is true. Think of it like the filter button in Excel.

## Syntax
\`\`\`sql
SELECT columns
FROM table
WHERE condition;
\`\`\`

## Operators
| Operator | Meaning |
|----------|---------|
| = | equals |
| != or <> | not equals |
| < > <= >= | comparisons |
| BETWEEN a AND b | value in range (inclusive) |
| IN (a, b, c) | value matches any in list |
| LIKE 'pattern%' | text pattern match |
| NOT | negate any condition |

**LIKE patterns:** \`%\` matches anything, \`_\` matches one character.
- \`'S%'\` = starts with S
- \`'%son'\` = ends with son
- \`'%ar%'\` = contains ar

## When To Use This
Every time you don't want all the rows — which is almost always.` },
    examples: [
      { title: "Engineers only", explanation: "Filter to one specific department", sql: "SELECT name, salary\nFROM employees\nWHERE department = 'Engineering';" },
      { title: "High earners", explanation: "Comparison operators work on numbers", sql: "SELECT name, department, salary\nFROM employees\nWHERE salary > 90000;" },
      { title: "Salary range with BETWEEN", explanation: "BETWEEN is inclusive on both ends", sql: "SELECT name, salary\nFROM employees\nWHERE salary BETWEEN 70000 AND 90000;" },
      { title: "Multiple departments with IN", explanation: "IN is cleaner than writing multiple OR conditions", sql: "SELECT name, department\nFROM employees\nWHERE department IN ('Engineering', 'Finance');" }
    ],
    challenges: [
      { id: "2-1", prompt: "Find all employees in the Sales department.", hint: "WHERE department = ...", expectedColumns: ["name","department"], validateFn: "return rows.length > 0 && rows.every(r => r.department === 'Sales');", solution: "SELECT name, department\nFROM employees\nWHERE department = 'Sales';" },
      { id: "2-2", prompt: "Find all employees earning more than $95,000.", hint: "Use > with the salary column.", expectedColumns: ["name","salary"], validateFn: "return rows.length > 0 && rows.every(r => r.salary > 95000);", solution: "SELECT name, salary\nFROM employees\nWHERE salary > 95000;" },
      { id: "2-3", prompt: "Find all employees whose name starts with the letter 'J'.", hint: "Use LIKE with a % wildcard after the letter.", expectedColumns: ["name"], validateFn: "return rows.length > 0 && rows.every(r => r.name.startsWith('J'));", solution: "SELECT name\nFROM employees\nWHERE name LIKE 'J%';" }
    ]
  },

  {
    module: 1, lesson: 3,
    slug: "getting-started/order-by",
    moduleSlug: "getting-started", lessonSlug: "order-by",
    title: "ORDER BY — Sorting Results", badge: "concept", database: "company",
    theory: { content: `## Mental Model
ORDER BY is sort. By default results come back in no guaranteed order. ORDER BY controls the sequence. ASC = smallest to largest (or A→Z). DESC = largest to smallest (or Z→A).

## Syntax
\`\`\`sql
SELECT columns
FROM table
ORDER BY column1 ASC, column2 DESC;
\`\`\`

## How It Works
- **ASC** is the default — you can omit it
- **DESC** you must write explicitly
- You can sort by multiple columns — the second column breaks ties in the first
- You can ORDER BY a column you didn't SELECT (though it's unusual)

## When To Use This
Any time the order of results matters — leaderboards, most recent records, alphabetical lists.` },
    examples: [
      { title: "Highest paid first", explanation: "DESC puts the largest value at the top", sql: "SELECT name, salary\nFROM employees\nORDER BY salary DESC;" },
      { title: "Alphabetical by name", explanation: "ASC is default for text — A to Z", sql: "SELECT name, department\nFROM employees\nORDER BY name;" },
      { title: "Sort by dept then salary", explanation: "Second column breaks ties in the first", sql: "SELECT name, department, salary\nFROM employees\nORDER BY department ASC, salary DESC;" }
    ],
    challenges: [
      { id: "3-1", prompt: "List all employees sorted alphabetically by department, then by name within each department.", hint: "ORDER BY two columns — department first, then name.", expectedColumns: ["name","department"], validateFn: "return rows.length > 0 && rows[0].department <= rows[rows.length-1].department;", solution: "SELECT name, department\nFROM employees\nORDER BY department ASC, name ASC;" },
      { id: "3-2", prompt: "Find the 5 lowest-paid employees (show name and salary).", hint: "ORDER BY salary ASC — smallest first.", expectedColumns: ["name","salary"], validateFn: "return rows.length > 0 && rows[0].salary <= rows[rows.length-1].salary;", solution: "SELECT name, salary\nFROM employees\nORDER BY salary ASC\nLIMIT 5;" },
      { id: "3-3", prompt: "Show all employees hired most recently first.", hint: "Dates sort lexicographically in SQLite — DESC on hire_date works correctly.", expectedColumns: ["name","hire_date"], validateFn: "return rows.length > 0 && rows[0].hire_date >= rows[rows.length-1].hire_date;", solution: "SELECT name, hire_date\nFROM employees\nORDER BY hire_date DESC;" }
    ]
  },

  {
    module: 1, lesson: 4,
    slug: "getting-started/limit-offset",
    moduleSlug: "getting-started", lessonSlug: "limit-offset",
    title: "LIMIT and OFFSET", badge: "concept", database: "company",
    theory: { content: `## Mental Model
LIMIT says "stop after N results." OFFSET says "skip the first N results before you start." Together they let you page through large datasets.

## Syntax
\`\`\`sql
SELECT columns
FROM table
ORDER BY column
LIMIT 10;          -- first 10 rows

LIMIT 10 OFFSET 20; -- rows 21-30 (skip first 20, take next 10)
\`\`\`

## How It Works
- LIMIT without ORDER BY gives you N rows in unpredictable order — usually pair them together
- OFFSET is 0-based: OFFSET 0 = start at beginning, OFFSET 10 = skip first 10
- Page formula: \`OFFSET = (page_number - 1) * page_size\`

## When To Use This
- "Show me the top 5" queries
- Pagination in applications
- Sampling a large table to see what's in it` },
    examples: [
      { title: "Top 3 earners", explanation: "Sort descending, take the first 3", sql: "SELECT name, salary\nFROM employees\nORDER BY salary DESC\nLIMIT 3;" },
      { title: "Page 2 of employees", explanation: "Skip the first 5, get the next 5", sql: "SELECT name, salary\nFROM employees\nORDER BY salary DESC\nLIMIT 5 OFFSET 5;" },
      { title: "Quick data sample", explanation: "Just peek at a few rows", sql: "SELECT *\nFROM employees\nLIMIT 5;" }
    ],
    challenges: [
      { id: "4-1", prompt: "Show the top 5 highest-paid employees.", hint: "ORDER BY salary DESC, then LIMIT 5.", expectedColumns: ["name","salary"], validateFn: "return rows.length === 5 && rows[0].salary >= rows[4].salary;", solution: "SELECT name, salary\nFROM employees\nORDER BY salary DESC\nLIMIT 5;" },
      { id: "4-2", prompt: "Show employees ranked 6 through 10 by salary (highest to lowest).", hint: "LIMIT 5 OFFSET 5 after sorting DESC.", expectedColumns: ["name","salary"], validateFn: "return rows.length === 5;", solution: "SELECT name, salary\nFROM employees\nORDER BY salary DESC\nLIMIT 5 OFFSET 5;" },
      { id: "4-3", prompt: "Show the 3 most recently hired employees.", hint: "ORDER BY hire_date DESC, LIMIT 3.", expectedColumns: ["name","hire_date"], validateFn: "return rows.length === 3;", solution: "SELECT name, hire_date\nFROM employees\nORDER BY hire_date DESC\nLIMIT 3;" }
    ]
  },

  {
    module: 1, lesson: 5,
    slug: "getting-started/distinct",
    moduleSlug: "getting-started", lessonSlug: "distinct",
    title: "DISTINCT — Unique Values", badge: "concept", database: "company",
    theory: { content: `## Mental Model
DISTINCT removes duplicate rows from your results. If 10 employees are in "Engineering," SELECT DISTINCT department gives you "Engineering" once, not 10 times.

## Syntax
\`\`\`sql
SELECT DISTINCT column
FROM table;
\`\`\`

## How It Works
- Goes right after SELECT, before column names
- Applies to the full combination of columns you select — not just one
- \`SELECT DISTINCT dept, location\` gives unique dept+location pairs, not just unique depts

## When To Use This
- Finding all unique values in a column ("what departments exist?")
- Deduplicating results before counting
- Exploring data you've never seen before` },
    examples: [
      { title: "What departments exist?", explanation: "Get each department name once", sql: "SELECT DISTINCT department\nFROM employees;" },
      { title: "Unique dept + location combos", explanation: "DISTINCT applies to the row as a whole", sql: "SELECT DISTINCT name, location\nFROM departments;" },
      { title: "Count unique departments", explanation: "Combine DISTINCT with COUNT", sql: "SELECT COUNT(DISTINCT department) AS dept_count\nFROM employees;" }
    ],
    challenges: [
      { id: "5-1", prompt: "List all unique departments in the employees table.", hint: "SELECT DISTINCT on the department column.", expectedColumns: ["department"], validateFn: "const depts = rows.map(r => r.department); return new Set(depts).size === depts.length;", solution: "SELECT DISTINCT department\nFROM employees;" },
      { id: "5-2", prompt: "How many unique departments are there?", hint: "Use COUNT(DISTINCT department).", expectedColumns: ["dept_count"], validateFn: "return rows.length === 1 && rows[0].dept_count > 0;", solution: "SELECT COUNT(DISTINCT department) AS dept_count\nFROM employees;" },
      { id: "5-3", prompt: "List all unique roles employees have on projects.", hint: "DISTINCT on the role column from employee_projects.", expectedColumns: ["role"], validateFn: "const roles = rows.map(r => r.role); return new Set(roles).size === roles.length && roles.length > 0;", solution: "SELECT DISTINCT role\nFROM employee_projects;" }
    ]
  },

  // ─── MODULE 2: DATA ANALYSIS BASICS ──────────────────────────────────────

  {
    module: 2, lesson: 6,
    slug: "data-analysis/aggregate-functions",
    moduleSlug: "data-analysis", lessonSlug: "aggregate-functions",
    title: "Aggregate Functions", badge: "concept", database: "company",
    theory: { content: `## Mental Model
Aggregate functions collapse many rows into a single number. Instead of listing 20 salaries, COUNT tells you there are 20. SUM adds them all up. AVG gives the average. They answer the "how many / how much total / what's the average" questions.

## Syntax
\`\`\`sql
SELECT COUNT(*), SUM(salary), AVG(salary), MIN(salary), MAX(salary)
FROM employees;
\`\`\`

## The Functions
| Function | What it does |
|----------|-------------|
| COUNT(*) | Count all rows |
| COUNT(column) | Count non-NULL values in column |
| SUM(column) | Add up all values |
| AVG(column) | Average of all values |
| MIN(column) | Smallest value |
| MAX(column) | Largest value |

## How It Works
- Without GROUP BY, they collapse the entire table into one row
- \`COUNT(*)\` counts rows; \`COUNT(salary)\` counts rows where salary is NOT NULL
- You can alias results: \`AVG(salary) AS avg_salary\`

## When To Use This
Any question with "how many," "total," "average," "highest," or "lowest" in it.` },
    examples: [
      { title: "Basic stats", explanation: "Multiple aggregates in one query", sql: "SELECT COUNT(*) AS total_employees,\n       AVG(salary) AS avg_salary,\n       MIN(salary) AS lowest,\n       MAX(salary) AS highest\nFROM employees;" },
      { title: "Total payroll", explanation: "SUM all salaries", sql: "SELECT SUM(salary) AS total_payroll\nFROM employees;" },
      { title: "Count in Engineering", explanation: "Combine aggregate with WHERE", sql: "SELECT COUNT(*) AS eng_headcount\nFROM employees\nWHERE department = 'Engineering';" }
    ],
    challenges: [
      { id: "6-1", prompt: "How many employees are there total?", hint: "COUNT(*) gives you all rows.", expectedColumns: ["total"], validateFn: "return rows.length === 1 && rows[0].total > 0;", solution: "SELECT COUNT(*) AS total\nFROM employees;" },
      { id: "6-2", prompt: "What is the average salary of employees in the Sales department?", hint: "WHERE to filter first, then AVG.", expectedColumns: ["avg_salary"], validateFn: "return rows.length === 1 && rows[0].avg_salary > 0;", solution: "SELECT AVG(salary) AS avg_salary\nFROM employees\nWHERE department = 'Sales';" },
      { id: "6-3", prompt: "Show the total budget, minimum budget, and maximum budget across all departments.", hint: "Three aggregate functions in one SELECT.", expectedColumns: ["total_budget","min_budget","max_budget"], validateFn: "return rows.length === 1 && rows[0].total_budget > 0;", solution: "SELECT SUM(budget) AS total_budget,\n       MIN(budget) AS min_budget,\n       MAX(budget) AS max_budget\nFROM departments;" }
    ]
  },

  {
    module: 2, lesson: 7,
    slug: "data-analysis/group-by",
    moduleSlug: "data-analysis", lessonSlug: "group-by",
    title: "GROUP BY", badge: "concept", database: "company",
    theory: { content: `## Mental Model
GROUP BY means "for each X, calculate Y." Instead of one number for the whole table, you get one number per group. It's like a pivot table in Excel — one row per unique value in the group column.

## Syntax
\`\`\`sql
SELECT grouping_column, AGG_FUNCTION(other_column)
FROM table
GROUP BY grouping_column;
\`\`\`

## The Golden Rule
**Every column in SELECT must either be in GROUP BY or be inside an aggregate function.** This trips up almost every beginner. If you GROUP BY department, you can SELECT department and AVG(salary), but not name — because there are multiple names per department and SQL doesn't know which one to show.

## How It Works
1. SQL splits the table into groups by the GROUP BY column
2. For each group, it runs the aggregate functions
3. You get one output row per unique group value

## When To Use This
"For each department / category / region / month... what is the count / total / average?"` },
    examples: [
      { title: "Average salary by department", explanation: "The classic GROUP BY — one row per department", sql: "SELECT department, AVG(salary) AS avg_salary\nFROM employees\nGROUP BY department;" },
      { title: "Headcount per department", explanation: "COUNT(*) with GROUP BY", sql: "SELECT department, COUNT(*) AS headcount\nFROM employees\nGROUP BY department\nORDER BY headcount DESC;" },
      { title: "Multiple aggregates", explanation: "Several metrics per group at once", sql: "SELECT department,\n       COUNT(*) AS headcount,\n       AVG(salary) AS avg_salary,\n       MAX(salary) AS top_salary\nFROM employees\nGROUP BY department;" }
    ],
    challenges: [
      { id: "7-1", prompt: "Show the total salary cost (payroll) for each department.", hint: "GROUP BY department, use SUM(salary).", expectedColumns: ["department","total_payroll"], validateFn: "return rows.length > 1 && rows[0].total_payroll > 0;", solution: "SELECT department, SUM(salary) AS total_payroll\nFROM employees\nGROUP BY department;" },
      { id: "7-2", prompt: "How many employees are in each department? Sort by headcount descending.", hint: "COUNT(*) GROUP BY department ORDER BY headcount DESC.", expectedColumns: ["department","headcount"], validateFn: "return rows.length > 1 && rows[0].headcount >= rows[rows.length-1].headcount;", solution: "SELECT department, COUNT(*) AS headcount\nFROM employees\nGROUP BY department\nORDER BY headcount DESC;" },
      { id: "7-3", prompt: "For each department, show the average salary rounded to 2 decimal places, and the number of employees. Only include departments where employees earn an average over $70,000.", hint: "GROUP BY then HAVING avg_salary > 70000.", expectedColumns: ["department","avg_salary","headcount"], validateFn: "return rows.length > 0 && rows.every(r => r.avg_salary > 70000);", solution: "SELECT department,\n       ROUND(AVG(salary), 2) AS avg_salary,\n       COUNT(*) AS headcount\nFROM employees\nGROUP BY department\nHAVING avg_salary > 70000;" }
    ]
  },

  {
    module: 2, lesson: 8,
    slug: "data-analysis/having",
    moduleSlug: "data-analysis", lessonSlug: "having",
    title: "HAVING — Filtering Groups", badge: "concept", database: "company",
    theory: { content: `## Mental Model
WHERE filters rows before grouping. HAVING filters groups after grouping. If WHERE is a pre-filter, HAVING is a post-filter.

## Syntax
\`\`\`sql
SELECT department, AVG(salary) AS avg_salary
FROM employees
WHERE hire_date > '2020-01-01'   -- filter rows first
GROUP BY department
HAVING avg_salary > 80000;       -- then filter groups
\`\`\`

## WHERE vs HAVING
| | WHERE | HAVING |
|---|---|---|
| Runs | Before GROUP BY | After GROUP BY |
| Filters | Individual rows | Groups/aggregates |
| Can use aggregates? | No | Yes |

## When To Use This
When you want to filter by a calculated value — "only show departments where average salary exceeds X" or "only show departments with more than 5 employees."` },
    examples: [
      { title: "Departments with avg salary over $80k", explanation: "Filter on the aggregate result", sql: "SELECT department, AVG(salary) AS avg_salary\nFROM employees\nGROUP BY department\nHAVING avg_salary > 80000;" },
      { title: "Departments with more than 3 employees", explanation: "HAVING with COUNT", sql: "SELECT department, COUNT(*) AS headcount\nFROM employees\nGROUP BY department\nHAVING headcount > 3;" },
      { title: "WHERE and HAVING together", explanation: "Pre-filter rows, then filter groups", sql: "SELECT department, COUNT(*) AS headcount\nFROM employees\nWHERE salary > 70000\nGROUP BY department\nHAVING headcount >= 2;" }
    ],
    challenges: [
      { id: "8-1", prompt: "Show departments where the total salary cost exceeds $400,000.", hint: "SUM(salary) in HAVING.", expectedColumns: ["department","total_payroll"], validateFn: "return rows.length > 0 && rows.every(r => r.total_payroll > 400000);", solution: "SELECT department, SUM(salary) AS total_payroll\nFROM employees\nGROUP BY department\nHAVING total_payroll > 400000;" },
      { id: "8-2", prompt: "Show departments with at least 4 employees, sorted by headcount descending.", hint: "COUNT(*) then HAVING headcount >= 4.", expectedColumns: ["department","headcount"], validateFn: "return rows.length > 0 && rows.every(r => r.headcount >= 4);", solution: "SELECT department, COUNT(*) AS headcount\nFROM employees\nGROUP BY department\nHAVING headcount >= 4\nORDER BY headcount DESC;" },
      { id: "8-3", prompt: "Find departments where the highest-paid employee earns more than $100,000.", hint: "MAX(salary) in HAVING.", expectedColumns: ["department","top_salary"], validateFn: "return rows.length > 0 && rows.every(r => r.top_salary > 100000);", solution: "SELECT department, MAX(salary) AS top_salary\nFROM employees\nGROUP BY department\nHAVING top_salary > 100000;" }
    ]
  },

  {
    module: 2, lesson: 9,
    slug: "data-analysis/null-values",
    moduleSlug: "data-analysis", lessonSlug: "null-values",
    title: "NULL Values", badge: "concept", database: "company",
    theory: { content: `## Mental Model
NULL means "no value exists here." It is not zero. It is not an empty string. It is the absence of a value. This causes a lot of confusion because NULL doesn't behave like normal values — you can't compare it with = or !=.

## Syntax
\`\`\`sql
-- Check for NULL
WHERE column IS NULL
WHERE column IS NOT NULL

-- Replace NULL with a default
COALESCE(column, default_value)
\`\`\`

## The Tricky Part
\`WHERE manager_id = NULL\` will never match anything — even if manager_id IS null. You must write \`WHERE manager_id IS NULL\`. This trips up almost everyone.

## COALESCE
COALESCE(a, b, c) returns the first non-NULL value from the list.
\`COALESCE(manager_id, 0)\` returns manager_id if it exists, otherwise 0.

## When To Use This
Any time a column might be empty — optional fields, foreign keys, or data that wasn't filled in.` },
    examples: [
      { title: "Find employees with no manager", explanation: "IS NULL finds missing values", sql: "SELECT name, department\nFROM employees\nWHERE manager_id IS NULL;" },
      { title: "Find employees who have a manager", explanation: "IS NOT NULL is the opposite", sql: "SELECT name, manager_id\nFROM employees\nWHERE manager_id IS NOT NULL;" },
      { title: "Replace NULL with a label", explanation: "COALESCE substitutes a default when value is missing", sql: "SELECT name,\n       COALESCE(CAST(manager_id AS TEXT), 'No Manager') AS manager\nFROM employees;" }
    ],
    challenges: [
      { id: "9-1", prompt: "How many employees have no manager (manager_id is NULL)?", hint: "WHERE manager_id IS NULL, then COUNT.", expectedColumns: ["count"], validateFn: "return rows.length === 1 && rows[0].count > 0;", solution: "SELECT COUNT(*) AS count\nFROM employees\nWHERE manager_id IS NULL;" },
      { id: "9-2", prompt: "Show all employees who DO have a manager, displaying their name and manager_id.", hint: "WHERE manager_id IS NOT NULL.", expectedColumns: ["name","manager_id"], validateFn: "return rows.length > 0 && rows.every(r => r.manager_id !== null);", solution: "SELECT name, manager_id\nFROM employees\nWHERE manager_id IS NOT NULL;" },
      { id: "9-3", prompt: "Show all employees. For those without a manager, display 'Top Level' instead of NULL in the manager column.", hint: "COALESCE(CAST(manager_id AS TEXT), 'Top Level')", expectedColumns: ["name","manager"], validateFn: "return rows.length > 0 && rows.some(r => r.manager === 'Top Level');", solution: "SELECT name,\n       COALESCE(CAST(manager_id AS TEXT), 'Top Level') AS manager\nFROM employees;" }
    ]
  },

  {
    module: 2, lesson: 10,
    slug: "data-analysis/case-expressions",
    moduleSlug: "data-analysis", lessonSlug: "case-expressions",
    title: "CASE Expressions", badge: "concept", database: "company",
    theory: { content: `## Mental Model
CASE is if/else inside a SQL query. It lets you create a new column whose value depends on conditions. Like an Excel IF formula but more powerful.

## Syntax
\`\`\`sql
SELECT name,
  CASE
    WHEN salary >= 100000 THEN 'Senior'
    WHEN salary >= 70000  THEN 'Mid-Level'
    ELSE 'Junior'
  END AS level
FROM employees;
\`\`\`

## How It Works
- SQL checks each WHEN condition top to bottom
- Returns the THEN value for the first condition that's true
- ELSE is the fallback if nothing matches (returns NULL if you omit it)
- The whole CASE expression acts like a column — give it an alias with AS

## Simple CASE (matching one value)
\`\`\`sql
CASE department
  WHEN 'Engineering' THEN 'Tech'
  WHEN 'Marketing'   THEN 'Business'
  ELSE 'Other'
END
\`\`\`

## When To Use This
Bucketing/categorizing continuous values, translating codes to labels, conditional aggregation.` },
    examples: [
      { title: "Salary tier label", explanation: "Bucket numeric values into categories", sql: "SELECT name, salary,\n  CASE\n    WHEN salary >= 100000 THEN 'Senior'\n    WHEN salary >= 75000  THEN 'Mid-Level'\n    ELSE 'Junior'\n  END AS tier\nFROM employees;" },
      { title: "Count by tier using CASE", explanation: "Conditional aggregation — CASE inside COUNT", sql: "SELECT\n  COUNT(CASE WHEN salary >= 100000 THEN 1 END) AS senior_count,\n  COUNT(CASE WHEN salary >= 75000 AND salary < 100000 THEN 1 END) AS mid_count,\n  COUNT(CASE WHEN salary < 75000 THEN 1 END) AS junior_count\nFROM employees;" },
      { title: "Remote-friendly label", explanation: "Simple CASE matching a value", sql: "SELECT name, manager_id,\n  CASE\n    WHEN manager_id IS NULL THEN 'Team Lead'\n    ELSE 'IC'\n  END AS role_type\nFROM employees;" }
    ],
    challenges: [
      { id: "10-1", prompt: "Label each employee as 'High Budget' if their department budget > 1,500,000 or 'Standard' otherwise. Show employee name, department, and the label.", hint: "JOIN employees to departments, then use CASE on budget.", expectedColumns: ["name","department","budget_tier"], validateFn: "return rows.length > 0 && rows.some(r => r.budget_tier === 'High Budget') && rows.some(r => r.budget_tier === 'Standard');", solution: "SELECT e.name, e.department,\n  CASE\n    WHEN d.budget > 1500000 THEN 'High Budget'\n    ELSE 'Standard'\n  END AS budget_tier\nFROM employees e\nJOIN departments d ON e.department = d.name;" },
      { id: "10-2", prompt: "Show each employee's name and seniority tier: 'Veteran' (5+ years since 2020), 'Experienced' (hired before 2021), 'Newer' (hired 2021 or later).", hint: "CASE with WHEN hire_date conditions.", expectedColumns: ["name","seniority"], validateFn: "return rows.length > 0 && rows.some(r => r.seniority === 'Veteran');", solution: "SELECT name,\n  CASE\n    WHEN hire_date < '2019-01-01' THEN 'Veteran'\n    WHEN hire_date < '2021-01-01' THEN 'Experienced'\n    ELSE 'Newer'\n  END AS seniority\nFROM employees;" },
      { id: "10-3", prompt: "Count how many employees fall into each salary tier: 'High' (>= 95000), 'Mid' (70000-94999), 'Low' (< 70000).", hint: "Use CASE inside COUNT() — conditional aggregation.", expectedColumns: ["high","mid","low"], validateFn: "return rows.length === 1 && rows[0].hasOwnProperty('high') && rows[0].hasOwnProperty('low');", solution: "SELECT\n  COUNT(CASE WHEN salary >= 95000 THEN 1 END) AS high,\n  COUNT(CASE WHEN salary >= 70000 AND salary < 95000 THEN 1 END) AS mid,\n  COUNT(CASE WHEN salary < 70000 THEN 1 END) AS low\nFROM employees;" }
    ]
  },

  // ─── MODULE 3: JOINING TABLES ─────────────────────────────────────────────

  {
    module: 3, lesson: 11,
    slug: "joining-tables/inner-join",
    moduleSlug: "joining-tables", lessonSlug: "inner-join",
    title: "INNER JOIN", badge: "concept", database: "company",
    theory: { content: `## Mental Model
An INNER JOIN is like a Venn diagram — you only get rows that exist in BOTH tables. If an employee has no matching department, they're excluded. If a department has no employees, it's excluded.

## Syntax
\`\`\`sql
SELECT e.name, d.location
FROM employees e
JOIN departments d ON e.department = d.name;
\`\`\`
(INNER JOIN and JOIN mean the same thing — JOIN is shorthand)

## How It Works
- The ON clause specifies the matching condition — usually a foreign key relationship
- Use table aliases (e, d) to keep queries readable and avoid ambiguity
- When both tables have a column with the same name, prefix with the alias: \`e.name\` vs \`d.name\`

## When To Use This
When you need columns from two tables and only want rows that have matches in both. The most common join type.` },
    examples: [
      { title: "Employees with their department location", explanation: "Pull location from departments into the employee results", sql: "SELECT e.name, e.department, d.location\nFROM employees e\nJOIN departments d ON e.department = d.name;" },
      { title: "Employees on projects", explanation: "Three-column result from two tables", sql: "SELECT e.name, ep.project_id, ep.role\nFROM employees e\nJOIN employee_projects ep ON e.id = ep.employee_id;" },
      { title: "High earners with budget context", explanation: "Filter + join together", sql: "SELECT e.name, e.salary, d.budget\nFROM employees e\nJOIN departments d ON e.department = d.name\nWHERE e.salary > 90000;" }
    ],
    challenges: [
      { id: "11-1", prompt: "Show each employee's name, department, and the location of their department.", hint: "JOIN employees to departments ON department = name.", expectedColumns: ["name","department","location"], validateFn: "return rows.length > 0 && rows[0].hasOwnProperty('location');", solution: "SELECT e.name, e.department, d.location\nFROM employees e\nJOIN departments d ON e.department = d.name;" },
      { id: "11-2", prompt: "Show the name and budget of each department, along with how many employees are in it.", hint: "JOIN then GROUP BY department.", expectedColumns: ["name","budget","headcount"], validateFn: "return rows.length > 0 && rows[0].hasOwnProperty('headcount');", solution: "SELECT d.name, d.budget, COUNT(e.id) AS headcount\nFROM departments d\nJOIN employees e ON d.name = e.department\nGROUP BY d.name, d.budget;" },
      { id: "11-3", prompt: "List every project name along with the department name that owns it.", hint: "JOIN projects to departments ON dept_id = id.", expectedColumns: ["project_name","department_name"], validateFn: "return rows.length > 0 && rows[0].hasOwnProperty('department_name');", solution: "SELECT p.name AS project_name, d.name AS department_name\nFROM projects p\nJOIN departments d ON p.dept_id = d.id;" }
    ]
  },

  {
    module: 3, lesson: 12,
    slug: "joining-tables/left-join",
    moduleSlug: "joining-tables", lessonSlug: "left-join",
    title: "LEFT JOIN", badge: "concept", database: "company",
    theory: { content: `## Mental Model
LEFT JOIN keeps ALL rows from the left (first) table, and attaches matching rows from the right table. If there's no match on the right, you get NULL in those columns. Nothing from the left table gets dropped.

## Syntax
\`\`\`sql
SELECT e.name, p.name AS project_name
FROM employees e
LEFT JOIN employee_projects ep ON e.id = ep.employee_id
LEFT JOIN projects p ON ep.project_id = p.id;
\`\`\`

## INNER vs LEFT
- INNER JOIN: only rows with matches in both tables
- LEFT JOIN: all rows from left table, NULLs if no match on right

## Finding Missing Relationships
LEFT JOIN + WHERE right_table.id IS NULL finds rows in the left table with NO match on the right. Classic pattern for "find employees not assigned to any project."

## When To Use This
When you want to keep all records from the main table even if the related data is missing.` },
    examples: [
      { title: "All employees, with project if they have one", explanation: "Employees without projects still show up with NULL project", sql: "SELECT e.name, ep.project_id\nFROM employees e\nLEFT JOIN employee_projects ep ON e.id = ep.employee_id;" },
      { title: "Find employees with NO projects", explanation: "LEFT JOIN + IS NULL finds the gaps", sql: "SELECT e.name\nFROM employees e\nLEFT JOIN employee_projects ep ON e.id = ep.employee_id\nWHERE ep.employee_id IS NULL;" },
      { title: "All departments, with headcount", explanation: "Departments with 0 employees show 0, not get dropped", sql: "SELECT d.name, COUNT(e.id) AS headcount\nFROM departments d\nLEFT JOIN employees e ON d.name = e.department\nGROUP BY d.name;" }
    ],
    challenges: [
      { id: "12-1", prompt: "List all departments and the number of employees in each. Include departments with zero employees.", hint: "LEFT JOIN from departments to employees, then COUNT(e.id) — not COUNT(*) — so empty depts show 0.", expectedColumns: ["name","headcount"], validateFn: "return rows.length >= 5;", solution: "SELECT d.name, COUNT(e.id) AS headcount\nFROM departments d\nLEFT JOIN employees e ON d.name = e.department\nGROUP BY d.name;" },
      { id: "12-2", prompt: "Find all employees who are NOT assigned to any project.", hint: "LEFT JOIN employee_projects, WHERE ep.employee_id IS NULL.", expectedColumns: ["name"], validateFn: "return rows.length >= 0;", solution: "SELECT e.name\nFROM employees e\nLEFT JOIN employee_projects ep ON e.id = ep.employee_id\nWHERE ep.employee_id IS NULL;" },
      { id: "12-3", prompt: "Show every employee with the name of their manager. Employees with no manager should show 'No Manager'.", hint: "Self-LEFT JOIN — employees e LEFT JOIN employees m ON e.manager_id = m.id.", expectedColumns: ["employee","manager"], validateFn: "return rows.length > 0 && rows.some(r => r.manager === 'No Manager');", solution: "SELECT e.name AS employee,\n       COALESCE(m.name, 'No Manager') AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.id;" }
    ]
  },

  {
    module: 3, lesson: 13,
    slug: "joining-tables/multiple-joins",
    moduleSlug: "joining-tables", lessonSlug: "multiple-joins",
    title: "Multiple JOINs", badge: "practice", database: "company",
    theory: { content: `## Mental Model
Chain JOINs to pull data from more than two tables. Each JOIN adds more columns from a new table. Think of it like connecting puzzle pieces — each piece adds new information.

## Syntax
\`\`\`sql
SELECT e.name, p.name AS project, d.location
FROM employees e
JOIN employee_projects ep ON e.id = ep.employee_id
JOIN projects p ON ep.project_id = p.id
JOIN departments d ON e.department = d.name;
\`\`\`

## How It Works
- Each JOIN adds to the result set from the previous step
- Order usually doesn't matter for the final result, but matters for readability
- The junction table (employee_projects) is the "bridge" between employees and projects
- You can mix JOIN types — e.g., INNER then LEFT

## When To Use This
When your data lives across 3+ tables and you need columns from all of them.` },
    examples: [
      { title: "Employees with project and location", explanation: "Three JOINs connecting four tables", sql: "SELECT e.name, p.name AS project, d.location\nFROM employees e\nJOIN employee_projects ep ON e.id = ep.employee_id\nJOIN projects p ON ep.project_id = p.id\nJOIN departments d ON e.department = d.name;" },
      { title: "Project details with department budget", explanation: "Project + owning department info", sql: "SELECT p.name AS project, p.budget, d.name AS dept, d.budget AS dept_budget\nFROM projects p\nJOIN departments d ON p.dept_id = d.id;" },
      { title: "Full employee context", explanation: "All information about each employee in one row", sql: "SELECT e.name, e.salary, d.location, ep.role\nFROM employees e\nJOIN departments d ON e.department = d.name\nLEFT JOIN employee_projects ep ON e.id = ep.employee_id;" }
    ],
    challenges: [
      { id: "13-1", prompt: "Show each employee's name, their project name, and their role on the project.", hint: "JOIN employees → employee_projects → projects.", expectedColumns: ["name","project_name","role"], validateFn: "return rows.length > 0 && rows[0].hasOwnProperty('role');", solution: "SELECT e.name, p.name AS project_name, ep.role\nFROM employees e\nJOIN employee_projects ep ON e.id = ep.employee_id\nJOIN projects p ON ep.project_id = p.id;" },
      { id: "13-2", prompt: "List each project with the department name that owns it and the department's location.", hint: "JOIN projects → departments.", expectedColumns: ["project","department","location"], validateFn: "return rows.length > 0 && rows[0].hasOwnProperty('location');", solution: "SELECT p.name AS project, d.name AS department, d.location\nFROM projects p\nJOIN departments d ON p.dept_id = d.id;" },
      { id: "13-3", prompt: "Show each Engineering employee's name, salary, their project name, and the project budget. Only include employees actually on a project.", hint: "WHERE department = 'Engineering' after three JOINs.", expectedColumns: ["name","salary","project_name","project_budget"], validateFn: "return rows.length > 0 && rows.every(r => r.project_name);", solution: "SELECT e.name, e.salary, p.name AS project_name, p.budget AS project_budget\nFROM employees e\nJOIN employee_projects ep ON e.id = ep.employee_id\nJOIN projects p ON ep.project_id = p.id\nWHERE e.department = 'Engineering';" }
    ]
  },

  {
    module: 3, lesson: 14,
    slug: "joining-tables/self-join",
    moduleSlug: "joining-tables", lessonSlug: "self-join",
    title: "Self JOIN", badge: "practice", database: "company",
    theory: { content: `## Mental Model
A self JOIN joins a table to itself. Sounds weird, but it's the natural solution when a row has a relationship to another row in the same table — like an employee whose manager is also in the employees table.

## Syntax
\`\`\`sql
SELECT e.name AS employee, m.name AS manager
FROM employees e
JOIN employees m ON e.manager_id = m.id;
\`\`\`
Aliases are required — you need two different names for the same table to tell SQL which instance is which.

## How It Works
- You create two "copies" of the table with different aliases
- One alias is for the "child" row, the other for the "parent" row
- The ON clause connects them via the self-referencing key

## When To Use This
Hierarchies (employees/managers, categories/subcategories), comparing rows in the same table.` },
    examples: [
      { title: "Employee and manager names", explanation: "Classic self-join for org chart data", sql: "SELECT e.name AS employee, m.name AS manager\nFROM employees e\nJOIN employees m ON e.manager_id = m.id;" },
      { title: "Include employees with no manager", explanation: "LEFT self-join keeps everyone", sql: "SELECT e.name AS employee,\n       COALESCE(m.name, 'No Manager') AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.id;" },
      { title: "Who reports to Sarah Chen?", explanation: "Filter on the manager side", sql: "SELECT e.name AS employee, e.department\nFROM employees e\nJOIN employees m ON e.manager_id = m.id\nWHERE m.name = 'Sarah Chen';" }
    ],
    challenges: [
      { id: "14-1", prompt: "List every employee along with their manager's name. Include employees with no manager (show 'No Manager').", hint: "LEFT JOIN employees to itself on manager_id = id.", expectedColumns: ["employee","manager"], validateFn: "return rows.length > 0 && rows.some(r => r.manager === 'No Manager');", solution: "SELECT e.name AS employee,\n       COALESCE(m.name, 'No Manager') AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.id;" },
      { id: "14-2", prompt: "Show all employees who report directly to someone in the Finance department.", hint: "JOIN e to m on manager_id, then WHERE m.department = 'Finance'.", expectedColumns: ["employee","manager_dept"], validateFn: "return rows.length >= 0;", solution: "SELECT e.name AS employee, m.department AS manager_dept\nFROM employees e\nJOIN employees m ON e.manager_id = m.id\nWHERE m.department = 'Finance';" },
      { id: "14-3", prompt: "Show each manager's name and how many employees report directly to them.", hint: "JOIN employees m to employees e on m.id = e.manager_id, GROUP BY m.name.", expectedColumns: ["manager","direct_reports"], validateFn: "return rows.length > 0 && rows[0].direct_reports > 0;", solution: "SELECT m.name AS manager, COUNT(e.id) AS direct_reports\nFROM employees m\nJOIN employees e ON m.id = e.manager_id\nGROUP BY m.name\nORDER BY direct_reports DESC;" }
    ]
  },

  {
    module: 3, lesson: 15,
    slug: "joining-tables/full-outer-join",
    moduleSlug: "joining-tables", lessonSlug: "full-outer-join",
    title: "FULL OUTER JOIN", badge: "concept", database: "company",
    theory: { content: `## Mental Model
FULL OUTER JOIN keeps everything from both tables — matched and unmatched. Rows with no match on either side get NULLs filled in. It's the union of LEFT JOIN and RIGHT JOIN.

## Syntax (SQLite workaround)
SQLite doesn't support FULL OUTER JOIN directly. Simulate it with UNION:
\`\`\`sql
SELECT e.name, d.name AS dept_name
FROM employees e
LEFT JOIN departments d ON e.department = d.name

UNION

SELECT e.name, d.name AS dept_name
FROM employees e
RIGHT JOIN departments d ON e.department = d.name;
\`\`\`
Or use LEFT JOIN UNION LEFT JOIN with tables swapped.

## When To Use This
Finding records in either table that have no match — great for data audits and finding orphaned records.` },
    examples: [
      { title: "All employees and departments, matched where possible", explanation: "UNION of two LEFT JOINs simulates FULL OUTER", sql: "SELECT e.name AS employee, d.name AS department\nFROM employees e\nLEFT JOIN departments d ON e.department = d.name\n\nUNION\n\nSELECT e.name, d.name\nFROM departments d\nLEFT JOIN employees e ON d.name = e.department;" },
      { title: "Employees not on any project + projects with no employees", explanation: "Audit for unassigned items on both sides", sql: "SELECT e.name AS unassigned_employee, NULL AS empty_project\nFROM employees e\nLEFT JOIN employee_projects ep ON e.id = ep.employee_id\nWHERE ep.employee_id IS NULL\n\nUNION\n\nSELECT NULL, p.name\nFROM projects p\nLEFT JOIN employee_projects ep ON p.id = ep.project_id\nWHERE ep.project_id IS NULL;" }
    ],
    challenges: [
      { id: "15-1", prompt: "Find all departments that have no employees assigned to them.", hint: "LEFT JOIN from departments to employees, WHERE e.id IS NULL.", expectedColumns: ["department_name"], validateFn: "return rows.length >= 0;", solution: "SELECT d.name AS department_name\nFROM departments d\nLEFT JOIN employees e ON d.name = e.department\nWHERE e.id IS NULL;" },
      { id: "15-2", prompt: "Show all projects and how many employees are on each. Include projects with zero employees.", hint: "LEFT JOIN from projects to employee_projects, GROUP BY project.", expectedColumns: ["project_name","employee_count"], validateFn: "return rows.length > 0;", solution: "SELECT p.name AS project_name, COUNT(ep.employee_id) AS employee_count\nFROM projects p\nLEFT JOIN employee_projects ep ON p.id = ep.project_id\nGROUP BY p.name;" },
      { id: "15-3", prompt: "Find any employees whose department name doesn't match any entry in the departments table.", hint: "LEFT JOIN employees to departments, WHERE d.id IS NULL.", expectedColumns: ["name","department"], validateFn: "return rows.length >= 0;", solution: "SELECT e.name, e.department\nFROM employees e\nLEFT JOIN departments d ON e.department = d.name\nWHERE d.id IS NULL;" }
    ]
  }

];
