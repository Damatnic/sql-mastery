// All 52 lessons across 10 modules. Single source of truth.
// Consolidated 2026-05-12 from four split files (lessons_m1_m3.ts, lessons_m4_m6.ts,
// lessons_m7_m9.ts, lessons_m10_school.ts). The splits were creating import indirection
// for no real organizational win.

export interface Lesson {
  module: number;
  lesson: number;
  slug: string;
  title: string;
  badge: 'concept' | 'practice' | 'challenge';
  database: 'company' | 'store' | 'school';
  theory: {
    content: string;
  };
  examples: Array<{
    title: string;
    explanation: string;
    sql: string;
  }>;
  challenges: Array<{
    id: string;
    prompt: string;
    hint?: string;
    expectedColumns: string[];
    validateFn: string;
    solution: string;
  }>;
  moduleSlug: string;
  lessonSlug: string;
}

export interface ModuleInfo {
  slug: string;
  name: string;
  color: string;
  lessons: number[];
}

export const modules: ModuleInfo[] = [
  { slug: 'getting-started', name: 'Getting Started', color: 'blue', lessons: [1, 2, 3, 4, 5] },
  { slug: 'data-analysis', name: 'Data Analysis Basics', color: 'green', lessons: [6, 7, 8, 9, 10] },
  { slug: 'joining-tables', name: 'Joining Tables', color: 'purple', lessons: [11, 12, 13, 14, 15] },
  { slug: 'subqueries-ctes', name: 'Subqueries & CTEs', color: 'orange', lessons: [16, 17, 18, 19] },
  { slug: 'modifying-data', name: 'Modifying Data', color: 'red', lessons: [20, 21, 22, 23] },
  { slug: 'functions', name: 'Functions & Expressions', color: 'teal', lessons: [24, 25, 26, 27, 28] },
  { slug: 'window-functions', name: 'Window Functions', color: 'pink', lessons: [29, 30, 31, 32, 33] },
  { slug: 'database-objects', name: 'Database Objects', color: 'indigo', lessons: [34, 35, 36, 37, 38] },
  { slug: 'advanced', name: 'SQL Server Advanced', color: 'yellow', lessons: [39, 40, 41, 42] },
  { slug: 'school-advanced', name: 'Advanced SQL (WCTC)', color: 'emerald', lessons: [43, 44, 45, 46, 47, 48, 49, 50, 51, 52] },
];

export const lessons: Lesson[] = [
  // ════════════════════════════════════════════════════════════════
  // M1-M3 (Modules 1-3)
  // ════════════════════════════════════════════════════════════════

  // ─── MODULE 1: GETTING STARTED ───────────────────────────────────────────

  {
    module: 1, lesson: 1,
    slug: "getting-started/select-basics",
    moduleSlug: "getting-started", lessonSlug: "select-basics",
    title: "SELECT Basics", badge: "concept", database: "company",
    theory: { content: `## Mental Model
SQL is how you ask questions about data sitting in a table. A table is like a spreadsheet; rows are individual records, columns are the fields each record has.

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
- \`*\` is shorthand for "every column"; great for exploring, but avoid in production queries

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
    title: "WHERE · Filtering Rows", badge: "concept", database: "company",
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
Every time you don't want all the rows; which is almost always.` },
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
    title: "ORDER BY · Sorting Results", badge: "concept", database: "company",
    theory: { content: `## Mental Model
ORDER BY is sort. By default results come back in no guaranteed order. ORDER BY controls the sequence. ASC = smallest to largest (or A→Z). DESC = largest to smallest (or Z→A).

## Syntax
\`\`\`sql
SELECT columns
FROM table
ORDER BY column1 ASC, column2 DESC;
\`\`\`

## How It Works
- **ASC** is the default; you can omit it
- **DESC** you must write explicitly
- You can sort by multiple columns; the second column breaks ties in the first
- You can ORDER BY a column you didn't SELECT (though it's unusual)

## When To Use This
Any time the order of results matters; leaderboards, most recent records, alphabetical lists.` },
    examples: [
      { title: "Highest paid first", explanation: "DESC puts the largest value at the top", sql: "SELECT name, salary\nFROM employees\nORDER BY salary DESC;" },
      { title: "Alphabetical by name", explanation: "ASC is default for text; A to Z", sql: "SELECT name, department\nFROM employees\nORDER BY name;" },
      { title: "Sort by dept then salary", explanation: "Second column breaks ties in the first", sql: "SELECT name, department, salary\nFROM employees\nORDER BY department ASC, salary DESC;" }
    ],
    challenges: [
      { id: "3-1", prompt: "List all employees sorted alphabetically by department, then by name within each department.", hint: "ORDER BY two columns; department first, then name.", expectedColumns: ["name","department"], validateFn: "return rows.length > 0 && rows[0].department <= rows[rows.length-1].department;", solution: "SELECT name, department\nFROM employees\nORDER BY department ASC, name ASC;" },
      { id: "3-2", prompt: "Find the 5 lowest-paid employees (show name and salary).", hint: "ORDER BY salary ASC; smallest first.", expectedColumns: ["name","salary"], validateFn: "return rows.length > 0 && rows[0].salary <= rows[rows.length-1].salary;", solution: "SELECT name, salary\nFROM employees\nORDER BY salary ASC\nLIMIT 5;" },
      { id: "3-3", prompt: "Show all employees hired most recently first.", hint: "Dates sort lexicographically in SQLite; DESC on hire_date works correctly.", expectedColumns: ["name","hire_date"], validateFn: "return rows.length > 0 && rows[0].hire_date >= rows[rows.length-1].hire_date;", solution: "SELECT name, hire_date\nFROM employees\nORDER BY hire_date DESC;" }
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
- LIMIT without ORDER BY gives you N rows in unpredictable order; usually pair them together
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
    title: "DISTINCT · Unique Values", badge: "concept", database: "company",
    theory: { content: `## Mental Model
DISTINCT removes duplicate rows from your results. If 10 employees are in "Engineering," SELECT DISTINCT department gives you "Engineering" once, not 10 times.

## Syntax
\`\`\`sql
SELECT DISTINCT column
FROM table;
\`\`\`

## How It Works
- Goes right after SELECT, before column names
- Applies to the full combination of columns you select; not just one
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
GROUP BY means "for each X, calculate Y." Instead of one number for the whole table, you get one number per group. It's like a pivot table in Excel; one row per unique value in the group column.

## Syntax
\`\`\`sql
SELECT grouping_column, AGG_FUNCTION(other_column)
FROM table
GROUP BY grouping_column;
\`\`\`

## The Golden Rule
**Every column in SELECT must either be in GROUP BY or be inside an aggregate function.** If you GROUP BY department, you can SELECT department and AVG(salary), but not name, because there are multiple names per department and SQL doesn't know which one to show.

## How It Works
1. SQL splits the table into groups by the GROUP BY column
2. For each group, it runs the aggregate functions
3. You get one output row per unique group value

## When To Use This
"For each department / category / region / month... what is the count / total / average?"` },
    examples: [
      { title: "Average salary by department", explanation: "The classic GROUP BY; one row per department", sql: "SELECT department, AVG(salary) AS avg_salary\nFROM employees\nGROUP BY department;" },
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
    title: "HAVING · Filtering Groups", badge: "concept", database: "company",
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
When you want to filter by a calculated value; "only show departments where average salary exceeds X" or "only show departments with more than 5 employees."` },
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
NULL means "no value exists here." It is not zero. It is not an empty string. It is the absence of a value. This causes a lot of confusion because NULL doesn't behave like normal values; you can't compare it with = or !=.

## Syntax
\`\`\`sql
-- Check for NULL
WHERE column IS NULL
WHERE column IS NOT NULL

-- Replace NULL with a default
COALESCE(column, default_value)
\`\`\`

## Common Mistake
\`WHERE manager_id = NULL\` will never match anything, even if manager_id is null. You must write \`WHERE manager_id IS NULL\`.

## COALESCE
COALESCE(a, b, c) returns the first non-NULL value from the list.
\`COALESCE(manager_id, 0)\` returns manager_id if it exists, otherwise 0.

## When To Use This
Any time a column might be empty; optional fields, foreign keys, or data that wasn't filled in.` },
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
- The whole CASE expression acts like a column; give it an alias with AS

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
      { title: "Count by tier using CASE", explanation: "Conditional aggregation; CASE inside COUNT", sql: "SELECT\n  COUNT(CASE WHEN salary >= 100000 THEN 1 END) AS senior_count,\n  COUNT(CASE WHEN salary >= 75000 AND salary < 100000 THEN 1 END) AS mid_count,\n  COUNT(CASE WHEN salary < 75000 THEN 1 END) AS junior_count\nFROM employees;" },
      { title: "Remote-friendly label", explanation: "Simple CASE matching a value", sql: "SELECT name, manager_id,\n  CASE\n    WHEN manager_id IS NULL THEN 'Team Lead'\n    ELSE 'IC'\n  END AS role_type\nFROM employees;" }
    ],
    challenges: [
      { id: "10-1", prompt: "Label each employee as 'High Budget' if their department budget > 1,500,000 or 'Standard' otherwise. Show employee name, department, and the label.", hint: "JOIN employees to departments, then use CASE on budget.", expectedColumns: ["name","department","budget_tier"], validateFn: "return rows.length > 0 && rows.some(r => r.budget_tier === 'High Budget') && rows.some(r => r.budget_tier === 'Standard');", solution: "SELECT e.name, e.department,\n  CASE\n    WHEN d.budget > 1500000 THEN 'High Budget'\n    ELSE 'Standard'\n  END AS budget_tier\nFROM employees e\nJOIN departments d ON e.department = d.name;" },
      { id: "10-2", prompt: "Show each employee's name and seniority tier: 'Veteran' (5+ years since 2020), 'Experienced' (hired before 2021), 'Newer' (hired 2021 or later).", hint: "CASE with WHEN hire_date conditions.", expectedColumns: ["name","seniority"], validateFn: "return rows.length > 0 && rows.some(r => r.seniority === 'Veteran');", solution: "SELECT name,\n  CASE\n    WHEN hire_date < '2019-01-01' THEN 'Veteran'\n    WHEN hire_date < '2021-01-01' THEN 'Experienced'\n    ELSE 'Newer'\n  END AS seniority\nFROM employees;" },
      { id: "10-3", prompt: "Count how many employees fall into each salary tier: 'High' (>= 95000), 'Mid' (70000-94999), 'Low' (< 70000).", hint: "Use CASE inside COUNT(); conditional aggregation.", expectedColumns: ["high","mid","low"], validateFn: "return rows.length === 1 && rows[0].hasOwnProperty('high') && rows[0].hasOwnProperty('low');", solution: "SELECT\n  COUNT(CASE WHEN salary >= 95000 THEN 1 END) AS high,\n  COUNT(CASE WHEN salary >= 70000 AND salary < 95000 THEN 1 END) AS mid,\n  COUNT(CASE WHEN salary < 70000 THEN 1 END) AS low\nFROM employees;" }
    ]
  },

  // ─── MODULE 3: JOINING TABLES ─────────────────────────────────────────────

  {
    module: 3, lesson: 11,
    slug: "joining-tables/inner-join",
    moduleSlug: "joining-tables", lessonSlug: "inner-join",
    title: "INNER JOIN", badge: "concept", database: "company",
    theory: { content: `## Mental Model
An INNER JOIN is like a Venn diagram; you only get rows that exist in BOTH tables. If an employee has no matching department, they're excluded. If a department has no employees, it's excluded.

## Syntax
\`\`\`sql
SELECT e.name, d.location
FROM employees e
JOIN departments d ON e.department = d.name;
\`\`\`
(INNER JOIN and JOIN mean the same thing; JOIN is shorthand)

## How It Works
- The ON clause specifies the matching condition; usually a foreign key relationship
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
      { id: "12-1", prompt: "List all departments and the number of employees in each. Include departments with zero employees.", hint: "LEFT JOIN from departments to employees, then COUNT(e.id); not COUNT(*); so empty depts show 0.", expectedColumns: ["name","headcount"], validateFn: "return rows.length >= 5;", solution: "SELECT d.name, COUNT(e.id) AS headcount\nFROM departments d\nLEFT JOIN employees e ON d.name = e.department\nGROUP BY d.name;" },
      { id: "12-2", prompt: "Find all employees who are NOT assigned to any project.", hint: "LEFT JOIN employee_projects, WHERE ep.employee_id IS NULL.", expectedColumns: ["name"], validateFn: "return rows.length >= 0;", solution: "SELECT e.name\nFROM employees e\nLEFT JOIN employee_projects ep ON e.id = ep.employee_id\nWHERE ep.employee_id IS NULL;" },
      { id: "12-3", prompt: "Show every employee with the name of their manager. Employees with no manager should show 'No Manager'.", hint: "Self-LEFT JOIN; employees e LEFT JOIN employees m ON e.manager_id = m.id.", expectedColumns: ["employee","manager"], validateFn: "return rows.length > 0 && rows.some(r => r.manager === 'No Manager');", solution: "SELECT e.name AS employee,\n       COALESCE(m.name, 'No Manager') AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.id;" }
    ]
  },

  {
    module: 3, lesson: 13,
    slug: "joining-tables/multiple-joins",
    moduleSlug: "joining-tables", lessonSlug: "multiple-joins",
    title: "Multiple JOINs", badge: "practice", database: "company",
    theory: { content: `## Mental Model
Chain JOINs to pull data from more than two tables. Each JOIN adds more columns from a new table. Think of it like connecting puzzle pieces; each piece adds new information.

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
- You can mix JOIN types; e.g., INNER then LEFT

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
A self JOIN joins a table to itself. Sounds weird, but it's the natural solution when a row has a relationship to another row in the same table; like an employee whose manager is also in the employees table.

## Syntax
\`\`\`sql
SELECT e.name AS employee, m.name AS manager
FROM employees e
JOIN employees m ON e.manager_id = m.id;
\`\`\`
Aliases are required; you need two different names for the same table to tell SQL which instance is which.

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
FULL OUTER JOIN keeps everything from both tables; matched and unmatched. Rows with no match on either side get NULLs filled in. It's the union of LEFT JOIN and RIGHT JOIN.

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
Finding records in either table that have no match; great for data audits and finding orphaned records.` },
    examples: [
      { title: "All employees and departments, matched where possible", explanation: "UNION of two LEFT JOINs simulates FULL OUTER", sql: "SELECT e.name AS employee, d.name AS department\nFROM employees e\nLEFT JOIN departments d ON e.department = d.name\n\nUNION\n\nSELECT e.name, d.name\nFROM departments d\nLEFT JOIN employees e ON d.name = e.department;" },
      { title: "Employees not on any project + projects with no employees", explanation: "Audit for unassigned items on both sides", sql: "SELECT e.name AS unassigned_employee, NULL AS empty_project\nFROM employees e\nLEFT JOIN employee_projects ep ON e.id = ep.employee_id\nWHERE ep.employee_id IS NULL\n\nUNION\n\nSELECT NULL, p.name\nFROM projects p\nLEFT JOIN employee_projects ep ON p.id = ep.project_id\nWHERE ep.project_id IS NULL;" }
    ],
    challenges: [
      { id: "15-1", prompt: "Find all departments that have no employees assigned to them.", hint: "LEFT JOIN from departments to employees, WHERE e.id IS NULL.", expectedColumns: ["department_name"], validateFn: "return rows.length >= 0;", solution: "SELECT d.name AS department_name\nFROM departments d\nLEFT JOIN employees e ON d.name = e.department\nWHERE e.id IS NULL;" },
      { id: "15-2", prompt: "Show all projects and how many employees are on each. Include projects with zero employees.", hint: "LEFT JOIN from projects to employee_projects, GROUP BY project.", expectedColumns: ["project_name","employee_count"], validateFn: "return rows.length > 0;", solution: "SELECT p.name AS project_name, COUNT(ep.employee_id) AS employee_count\nFROM projects p\nLEFT JOIN employee_projects ep ON p.id = ep.project_id\nGROUP BY p.name;" },
      { id: "15-3", prompt: "Find any employees whose department name doesn't match any entry in the departments table.", hint: "LEFT JOIN employees to departments, WHERE d.id IS NULL.", expectedColumns: ["name","department"], validateFn: "return rows.length >= 0;", solution: "SELECT e.name, e.department\nFROM employees e\nLEFT JOIN departments d ON e.department = d.name\nWHERE d.id IS NULL;" }
    ]
  },

  // ════════════════════════════════════════════════════════════════
  // M4-M6 (Modules 4-6)
  // ════════════════════════════════════════════════════════════════

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
When your filter condition depends on a calculated value from the same (or another) table; like "above average" comparisons.` },
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
When you need to do a "second-level" operation on aggregated data; like filtering groups after aggregating, or joining two aggregated result sets together. (CTEs do the same thing more readably.)` },
    examples: [
      { title: "Filter aggregated results", explanation: "Can't use HAVING for all cases; subquery in FROM is sometimes cleaner", sql: "SELECT d.department, d.avg_salary\nFROM (\n  SELECT department, AVG(salary) AS avg_salary\n  FROM employees\n  GROUP BY department\n) AS d\nWHERE d.avg_salary > 75000;" },
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
A correlated subquery references the outer query. It runs once for every row the outer query processes; the inner query uses a value from the current outer row. Slower than regular subqueries, but necessary for row-by-row comparisons.

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
Row-by-row comparisons where the filter depends on the current row's context; "above average for their own group" is the classic case.` },
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
    title: "CTEs · WITH Clause", badge: "concept", database: "company",
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
- Read top-to-bottom; easier to follow the logic
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
    title: "INSERT · Adding Rows", badge: "concept", database: "company",
    theory: { content: `## Mental Model
INSERT adds new rows to a table. You specify the table, the columns you're filling, and the values for each column in the same order.

## Syntax
\`\`\`sql
-- Insert one row (explicit columns; recommended)
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
Adding new records to a table; new employees, new orders, new entries of any kind.` },
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
    title: "UPDATE · Modifying Rows", badge: "concept", database: "company",
    theory: { content: `## Mental Model
UPDATE changes existing rows. The WHERE clause is critical; without it, you update every single row in the table. This is one of the most dangerous SQL mistakes.

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
    title: "DELETE · Removing Rows", badge: "concept", database: "company",
    theory: { content: `## Mental Model
DELETE removes rows from a table permanently. Like UPDATE, the WHERE clause is what keeps this from being catastrophic. Always test with a SELECT first.

## Syntax
\`\`\`sql
DELETE FROM employees
WHERE id = 15;
\`\`\`

## The Rules
1. **Always use WHERE**: DELETE FROM employees with no WHERE deletes every row
2. **Test with SELECT first**: run the same WHERE condition as a SELECT to confirm what you'll delete
3. **Consider foreign keys**: deleting a department that employees reference can cause errors

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
Any time you have two or more related changes that must succeed or fail together; financial transfers, order + inventory updates, multi-table inserts.` },
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
String functions let you manipulate text inside a query; clean it, transform it, extract pieces from it. Essential for messy real-world data.

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
Math functions handle numeric calculations. Most are straightforward; the ones worth knowing are ROUND (required for money), ABS (absolute value), and integer division.

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
      { id: "28-2", prompt: "Show each employee with a 'tier' column: 'Director' if they have no manager, 'Manager' if their id appears as someone else's manager, 'IC' otherwise.", hint: "Use IIF or CASE; check IS NULL for director, IN subquery for manager.", expectedColumns: ["name","tier"], validateFn: "return rows.length > 0 && rows.some(r => r.tier === 'Director');", solution: "SELECT name,\n  CASE\n    WHEN manager_id IS NULL THEN 'Director'\n    WHEN id IN (SELECT DISTINCT manager_id FROM employees WHERE manager_id IS NOT NULL) THEN 'Manager'\n    ELSE 'IC'\n  END AS tier\nFROM employees;" },
      { id: "28-3", prompt: "Show the average salary per department. If a department has 0 employees (would cause division by zero), use NULLIF to safely return NULL instead of an error.", hint: "NULLIF(COUNT(*), 0) in the denominator.", expectedColumns: ["department","avg_salary"], validateFn: "return rows.length > 0;", solution: "SELECT department,\n  ROUND(SUM(salary) * 1.0 / NULLIF(COUNT(*), 0), 2) AS avg_salary\nFROM employees\nGROUP BY department;" }
    ]
  },

  // ════════════════════════════════════════════════════════════════
  // M7-M9 (Modules 7-9)
  // ════════════════════════════════════════════════════════════════

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

## Picking the right one
- **ROW_NUMBER**: when you don't care about ties; you want exactly N rows back. Top-3 paginators, deduplication.
- **RANK**: when ties matter and the gap is informative. "I'm tied for 2nd, the next person is 4th."
- **DENSE_RANK**: when ties matter but you want consecutive ranks. Bucketing, tier assignment, "show the top 3 distinct salaries."

Run the first example below to actually see the difference on real rows.

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
      { id: "29-3", prompt: "Assign each employee a row number within their department (ordered by salary descending). Show name, department, salary, and rank within dept.", hint: "ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC).", expectedColumns: ["name","department","salary","dept_rank"], validateFn: "return rows.length > 0;", solution: "SELECT name, department, salary,\n  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank\nFROM employees\nORDER BY department, dept_rank;" },
      { id: "29-4", prompt: "Rank employees by salary so that ties share a rank AND the next rank is consecutive (no gaps after ties). Which of the three ranking functions does that? Show name, salary, and rank.", hint: "Of the three: ROW_NUMBER ignores ties, RANK leaves gaps after ties, DENSE_RANK closes gaps. Pick the gap-closing one.", expectedColumns: ["name","salary","rnk"], validateFn: "if (rows.length < 2) return false; const ranks = rows.map(r => Number(r.rnk)).filter(n => !isNaN(n)).sort((a,b) => a-b); for (let i = 1; i < ranks.length; i++) { if (ranks[i] - ranks[i-1] > 1) return false; } return ranks[0] === 1;", solution: "SELECT name, salary,\n  DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk\nFROM employees;" }
    ]
  },

  {
    module: 7, lesson: 30,
    slug: "window-functions/partition-by",
    moduleSlug: "window-functions", lessonSlug: "partition-by",
    title: "PARTITION BY", badge: "challenge", database: "company",
    theory: { content: `## Mental Model
PARTITION BY is to window functions what GROUP BY is to aggregates; it splits the calculation into groups. Without PARTITION BY, the window function runs across all rows. With PARTITION BY, it restarts for each group.

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
Any "vs their group" comparison; "how does this employee compare to their department average?"` },
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
Running totals accumulate as you go through rows. Each row shows the total up to and including that row. You get this by adding ORDER BY inside the OVER clause; without ORDER BY, you get the grand total repeated on every row.

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
A view is a saved query with a name. You create it once, then query it like a table. It doesn't store data; it runs the query every time you SELECT from it. Think of it as a shortcut or a named lens on your data.

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
      { title: "Index on department for faster filtering", explanation: "Create then query; EXPLAIN QUERY PLAN shows impact", sql: "CREATE INDEX IF NOT EXISTS idx_emp_dept ON employees(department);\n\nEXPLAIN QUERY PLAN\nSELECT name, salary FROM employees WHERE department = 'Engineering';" },
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
A stored procedure is a named, reusable block of SQL code stored in the database. You call it by name with parameters instead of rewriting the same query. Think of it like a function in programming; define once, call many times.

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
- Reusable; call with different parameters
- Secure; grant EXECUTE permission without exposing tables
- Faster; compiled execution plan
- Maintainable; change the proc, all callers benefit

## SQLite Reality
SQLite doesn't support stored procedures. In class you'll use T-SQL on SQL Server. The challenge below uses a CTE to simulate parameterized queries in SQLite.` },
    examples: [
      { title: "T-SQL stored procedure example", explanation: "This is T-SQL syntax; runs on SQL Server, not SQLite", sql: "-- T-SQL (SQL Server syntax, for reference):\n-- CREATE PROCEDURE GetDeptSummary\n--   @Department NVARCHAR(50)\n-- AS BEGIN\n--   SELECT COUNT(*) as headcount, AVG(salary) as avg_salary\n--   FROM employees WHERE department = @Department\n-- END;\n\n-- SQLite equivalent using a query:\nSELECT COUNT(*) AS headcount, ROUND(AVG(salary), 0) AS avg_salary\nFROM employees\nWHERE department = 'Engineering';" },
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
A trigger is a SQL statement that runs automatically when a specific event happens on a table; an INSERT, UPDATE, or DELETE. You don't call it; the database fires it for you. Used for audit trails, enforcing rules, and cascading updates.

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
- \`NEW.column\`; the new value (available in INSERT and UPDATE)
- \`OLD.column\`; the old value (available in UPDATE and DELETE)

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
A recursive CTE calls itself; like a loop. It has an anchor (the starting point) and a recursive member (the step that builds on the previous result). It keeps going until no new rows are produced.

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
    title: "PIVOT · Rotating Data", badge: "challenge", database: "company",
    theory: { content: `## Mental Model
PIVOT rotates rows into columns. Instead of one row per department with a "value" column, you get one row total with one column per department. Like transposing data from tall/narrow to wide/short.

## T-SQL PIVOT (SQL Server)
\`\`\`sql
SELECT *
FROM (SELECT department, salary FROM employees) AS source
PIVOT (AVG(salary) FOR department IN ([Engineering],[Sales],[Marketing])) AS pvt;
\`\`\`

## SQLite Equivalent: CASE + GROUP BY
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
A slow query is usually doing unnecessary work; scanning millions of rows when an index would skip to the right ones, or returning huge amounts of data when you only need 10 rows. EXPLAIN QUERY PLAN shows you exactly what the database is doing.

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

**3. Filter early; WHERE before HAVING**
HAVING filters after aggregation, WHERE filters before. Use WHERE whenever possible.

**4. Avoid functions on indexed columns in WHERE**
\`WHERE UPPER(name) = 'SARAH'\`; can't use an index on name.
\`WHERE name = 'Sarah'\`; can use an index.

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
      { id: "41-2", prompt: "Rewrite this slow query to be more efficient: SELECT * FROM employees WHERE UPPER(name) LIKE 'S%'. Hint: avoid the function on the column.", hint: "WHERE name LIKE 'S%' OR name LIKE 's%'; or just LIKE 'S%' since SQLite LIKE is case-insensitive for ASCII.", expectedColumns: ["name"], validateFn: "return rows.length >= 0;", solution: "-- Better: avoid UPPER() on the column so indexes can be used\nSELECT name, department, salary FROM employees WHERE name LIKE 'S%';" },
      { id: "41-3", prompt: "Find employees who are on at least one project; write it two ways: once with IN, once with EXISTS. Both should return the same results.", hint: "WHERE id IN (SELECT employee_id...) vs WHERE EXISTS (SELECT 1 FROM employee_projects WHERE employee_id = e.id).", expectedColumns: ["name"], validateFn: "return rows.length > 0;", solution: "-- With IN:\nSELECT name FROM employees WHERE id IN (SELECT employee_id FROM employee_projects);\n\n-- With EXISTS (preferred for large tables):\nSELECT name FROM employees e WHERE EXISTS (SELECT 1 FROM employee_projects ep WHERE ep.employee_id = e.id);" }
    ]
  },

  {
    module: 9, lesson: 42,
    slug: "advanced/real-world-patterns",
    moduleSlug: "advanced", lessonSlug: "real-world-patterns",
    title: "Real-World SQL Patterns", badge: "challenge", database: "company",
    theory: { content: `## Mental Model
These are the patterns you'll reach for again and again in real jobs. Not syntax exercises; actual recurring problems with standard SQL solutions.

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
-- Page 2 (keyset; faster than OFFSET on large tables)
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
      { id: "42-3", prompt: "Write a query that identifies employees who have no project assignment AND earn above the company average salary; these might be underutilized high performers.", hint: "LEFT JOIN employee_projects, WHERE ep.employee_id IS NULL AND salary > (SELECT AVG...).", expectedColumns: ["name","department","salary"], validateFn: "return rows.length >= 0;", solution: "SELECT e.name, e.department, e.salary\nFROM employees e\nLEFT JOIN employee_projects ep ON e.id = ep.employee_id\nWHERE ep.employee_id IS NULL\n  AND e.salary > (SELECT AVG(salary) FROM employees)\nORDER BY e.salary DESC;" }
    ]
  },

  // ════════════════════════════════════════════════════════════════
  // Module 10 (WCTC Advanced SQL)
  // ════════════════════════════════════════════════════════════════

  // ─── MODULE 10: ADVANCED SQL (WCTC) ─────────────────────────────────────────

  {
    module: 10, lesson: 43,
    slug: "school-advanced/stored-procedures",
    moduleSlug: "school-advanced", lessonSlug: "stored-procedures",
    title: "Stored Procedures", badge: "concept", database: "company",
    theory: { content: `## What's a Stored Procedure?

Think of a stored procedure as a saved script you can run over and over. Instead of typing out the same query every time, you save it with a name and just call that name. It's like a function in programming but for SQL.

Stored procedures keep business logic in the database instead of scattered across application code. The app calls one line and the database handles the work.

## T-SQL Syntax

\`\`\`sql
CREATE PROCEDURE GetEmployeesByDept
    @DeptName NVARCHAR(50)
AS
BEGIN
    SELECT name, salary, hire_date
    FROM employees
    WHERE department = @DeptName
    ORDER BY salary DESC;
END;

-- now you just call it like this
EXEC GetEmployeesByDept @DeptName = 'Engineering';
\`\`\`

## Parameters

You can have input params (data going in) and output params (data coming back out):

\`\`\`sql
CREATE PROCEDURE GetDeptStats
    @DeptName NVARCHAR(50),
    @AvgSalary DECIMAL(10,2) OUTPUT
AS
BEGIN
    SELECT @AvgSalary = AVG(salary)
    FROM employees
    WHERE department = @DeptName;
END;
\`\`\`

## Why Use Them?

- Reusable: write once, call from anywhere
- Faster: SQL Server compiles and caches the execution plan
- Secure: you can grant EXEC permission without exposing tables
- Maintainable: change the proc, all callers get the update

## SQLite Note

SQLite doesn't have stored procedures, so the challenges here use CTEs to simulate the concept. In your WCTC class you'll use real T-SQL on SQL Server.` },
    examples: [
      { title: "Simple procedure with parameter", explanation: "This is T-SQL syntax for SQL Server. We'll simulate it in SQLite below.", sql: "-- T-SQL (runs on SQL Server, not SQLite):\n-- CREATE PROCEDURE GetHighEarners\n--     @MinSalary DECIMAL(10,2)\n-- AS BEGIN\n--     SELECT name, salary FROM employees\n--     WHERE salary > @MinSalary;\n-- END;\n\n-- SQLite equivalent using a CTE as a 'parameter':\nWITH params AS (SELECT 90000 AS min_salary)\nSELECT e.name, e.salary\nFROM employees e, params\nWHERE e.salary > params.min_salary\nORDER BY e.salary DESC;" },
      { title: "Procedure with multiple params", explanation: "Filter by dept AND minimum salary", sql: "-- simulating a proc with two parameters\nWITH params AS (SELECT 'Engineering' AS dept, 80000 AS min_sal)\nSELECT e.name, e.department, e.salary\nFROM employees e, params\nWHERE e.department = params.dept\n  AND e.salary >= params.min_sal;" }
    ],
    challenges: [
      { id: "43-1", prompt: "Simulate a stored procedure that takes a department name and returns all employees in that department with their salary and hire date. Use 'Sales' as your test parameter.", hint: "CTE with SELECT 'Sales' AS dept, then join/filter on it.", expectedColumns: ["name","salary","hire_date"], validateFn: "return rows.length > 0 && rows.every(r => r.salary > 0);", solution: "WITH params AS (SELECT 'Sales' AS dept)\nSELECT e.name, e.salary, e.hire_date\nFROM employees e, params\nWHERE e.department = params.dept\nORDER BY e.salary DESC;" },
      { id: "43-2", prompt: "Simulate a procedure that takes a minimum salary and returns a summary: count of employees above that threshold and their average salary. Use 75000 as your test value.", hint: "CTE param, then COUNT and AVG with WHERE filter.", expectedColumns: ["emp_count","avg_salary"], validateFn: "return rows.length === 1 && rows[0].emp_count > 0;", solution: "WITH params AS (SELECT 75000 AS min_sal)\nSELECT COUNT(*) AS emp_count,\n       ROUND(AVG(salary), 0) AS avg_salary\nFROM employees e, params\nWHERE e.salary > params.min_sal;" },
      { id: "43-3", prompt: "Create a 'department report' procedure simulation: takes dept='Finance', returns headcount, avg salary, top salary, and total payroll for that department.", hint: "CTE with dept param, then multiple aggregates.", expectedColumns: ["department","headcount","avg_salary","top_salary","total_payroll"], validateFn: "return rows.length === 1 && rows[0].headcount > 0;", solution: "WITH params AS (SELECT 'Finance' AS dept)\nSELECT params.dept AS department,\n       COUNT(*) AS headcount,\n       ROUND(AVG(e.salary), 0) AS avg_salary,\n       MAX(e.salary) AS top_salary,\n       SUM(e.salary) AS total_payroll\nFROM employees e, params\nWHERE e.department = params.dept;" }
    ]
  },

  {
    module: 10, lesson: 44,
    slug: "school-advanced/temp-tables",
    moduleSlug: "school-advanced", lessonSlug: "temp-tables",
    title: "Temp Tables", badge: "concept", database: "company",
    theory: { content: `## What Are Temp Tables?

Temp tables are temporary storage that only exists for your session. Super useful when you need to stage data, break a complex query into steps, or store intermediate results.

I use these all the time when a query gets too complicated. Break it into pieces, dump results into a temp table, then query that.

## T-SQL Syntax

\`\`\`sql
-- Local temp table (only you can see it, # prefix)
CREATE TABLE #MyTempTable (
    id INT,
    name NVARCHAR(100),
    salary DECIMAL(10,2)
);

-- Insert some data
INSERT INTO #MyTempTable
SELECT id, name, salary FROM employees WHERE department = 'Engineering';

-- Query it like any table
SELECT * FROM #MyTempTable WHERE salary > 90000;

-- It auto-deletes when your session ends
-- or you can drop it manually:
DROP TABLE #MyTempTable;
\`\`\`

## Local vs Global

| Type | Prefix | Scope |
|------|--------|-------|
| Local | # | Only your session |
| Global | ## | All sessions (careful!) |

Global temp tables stick around until the last session using them disconnects. I almost never use global temp tables tbh, local is safer.

## SQLite Equivalent

SQLite uses regular tables with TEMP or TEMPORARY keyword:

\`\`\`sql
CREATE TEMP TABLE my_temp AS
SELECT * FROM employees WHERE department = 'Engineering';
\`\`\`

## When to Use Temp Tables

- Breaking complex queries into readable steps
- Storing intermediate results for reuse
- Testing and debugging complicated logic
- Performance: sometimes materializing a step is faster than repeating a subquery` },
    examples: [
      { title: "Create and query a temp table", explanation: "Stage high earners in a temp table, then query it", sql: "-- create a temp table with high earners\nCREATE TEMP TABLE IF NOT EXISTS high_earners AS\nSELECT id, name, department, salary\nFROM employees\nWHERE salary > 90000;\n\n-- now query it like any table\nSELECT name, salary FROM high_earners ORDER BY salary DESC;" },
      { title: "Temp table for staged processing", explanation: "Break a complex query into steps", sql: "-- step 1: get dept stats into a temp table\nCREATE TEMP TABLE IF NOT EXISTS dept_stats AS\nSELECT department,\n       COUNT(*) AS headcount,\n       AVG(salary) AS avg_sal\nFROM employees\nGROUP BY department;\n\n-- step 2: find depts above company average\nSELECT d.*, \n       (SELECT AVG(salary) FROM employees) AS company_avg\nFROM dept_stats d\nWHERE d.avg_sal > (SELECT AVG(salary) FROM employees);" }
    ],
    challenges: [
      { id: "44-1", prompt: "Create a temp table containing all Engineering employees with their id, name, and salary. Then query it to show the average salary of this group.", hint: "CREATE TEMP TABLE eng_emps AS SELECT..., then SELECT AVG from it.", expectedColumns: ["avg_engineering_salary"], validateFn: "return rows.length === 1 && rows[0].avg_engineering_salary > 0;", solution: "CREATE TEMP TABLE IF NOT EXISTS eng_emps AS\nSELECT id, name, salary FROM employees WHERE department = 'Engineering';\n\nSELECT ROUND(AVG(salary), 0) AS avg_engineering_salary FROM eng_emps;" },
      { id: "44-2", prompt: "Create a temp table with department totals (name, headcount, total_payroll). Then query it to find departments where total payroll exceeds 400000.", hint: "CREATE TEMP TABLE with GROUP BY, then SELECT with WHERE filter.", expectedColumns: ["department","total_payroll"], validateFn: "return rows.length > 0 && rows.every(r => r.total_payroll > 400000);", solution: "CREATE TEMP TABLE IF NOT EXISTS dept_totals AS\nSELECT department AS name, COUNT(*) AS headcount, SUM(salary) AS total_payroll\nFROM employees GROUP BY department;\n\nSELECT name AS department, total_payroll FROM dept_totals WHERE total_payroll > 400000;" },
      { id: "44-3", prompt: "Use a temp table approach: first store employees with their years of service, then query to find all 'veterans' (5+ years) in Engineering.", hint: "Temp table with years calc, then WHERE on both conditions.", expectedColumns: ["name","years"], validateFn: "return rows.length >= 0;", solution: "CREATE TEMP TABLE IF NOT EXISTS emp_tenure AS\nSELECT name, department,\n       CAST((julianday('now') - julianday(hire_date)) / 365.25 AS INTEGER) AS years\nFROM employees;\n\nSELECT name, years FROM emp_tenure\nWHERE department = 'Engineering' AND years >= 5;" }
    ]
  },

  {
    module: 10, lesson: 45,
    slug: "school-advanced/while-loops",
    moduleSlug: "school-advanced", lessonSlug: "while-loops",
    title: "WHILE Loops and Iteration", badge: "practice", database: "company",
    theory: { content: `## Iteration in SQL

SQL is set-based, meaning it processes whole sets of rows at once. But sometimes you need row-by-row processing. That's where WHILE loops come in.

Fair warning: loops in SQL are usually slower than set-based operations. Try to solve problems with regular queries first. Only use loops when you really need them.

## T-SQL WHILE Syntax

\`\`\`sql
DECLARE @counter INT = 1;
DECLARE @maxId INT;

SELECT @maxId = MAX(id) FROM employees;

WHILE @counter <= @maxId
BEGIN
    -- do something with each id
    PRINT 'Processing ID: ' + CAST(@counter AS VARCHAR);
    SET @counter = @counter + 1;
END;
\`\`\`

## Cursors (Row-by-Row Processing)

When you need to loop through actual query results:

\`\`\`sql
DECLARE emp_cursor CURSOR FOR
    SELECT id, name, salary FROM employees;

DECLARE @id INT, @name NVARCHAR(100), @salary DECIMAL;

OPEN emp_cursor;
FETCH NEXT FROM emp_cursor INTO @id, @name, @salary;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- process each row here
    PRINT @name + ': ' + CAST(@salary AS VARCHAR);
    FETCH NEXT FROM emp_cursor INTO @id, @name, @salary;
END;

CLOSE emp_cursor;
DEALLOCATE emp_cursor;
\`\`\`

Cursors are kind of confusing at first because there's so much boilerplate. But basically: DECLARE sets it up, OPEN starts it, FETCH gets rows, CLOSE and DEALLOCATE clean up.

## SQLite Reality

SQLite doesn't have WHILE loops or cursors in SQL. You'd handle iteration in your application code. The challenges here simulate concepts with recursive CTEs.` },
    examples: [
      { title: "Generate a number sequence (simulates WHILE)", explanation: "Recursive CTE acts like a loop counting from 1 to 10", sql: "-- this is like a WHILE loop counting to 10\nWITH RECURSIVE counter(n) AS (\n    SELECT 1\n    UNION ALL\n    SELECT n + 1 FROM counter WHERE n < 10\n)\nSELECT n FROM counter;" },
      { title: "Process each dept (simulates cursor)", explanation: "Get stats for each dept one at a time", sql: "-- simulating row-by-row dept processing\n-- in real T-SQL you might use a cursor\nSELECT department,\n       COUNT(*) AS processed_count,\n       'Processed dept: ' || department AS log_message\nFROM employees\nGROUP BY department;" }
    ],
    challenges: [
      { id: "45-1", prompt: "Use a recursive CTE to generate numbers 1 through 20 (simulating a WHILE counter loop).", hint: "Anchor: SELECT 1. Recursive: SELECT n+1 WHERE n < 20.", expectedColumns: ["n"], validateFn: "return rows.length === 20 && rows[0].n === 1 && rows[19].n === 20;", solution: "WITH RECURSIVE nums(n) AS (\n    SELECT 1\n    UNION ALL\n    SELECT n + 1 FROM nums WHERE n < 20\n)\nSELECT n FROM nums;" },
      { id: "45-2", prompt: "Generate a multiplication table for 7 (7x1 through 7x10) using iteration concepts.", hint: "Recursive CTE generates 1-10, then multiply by 7.", expectedColumns: ["multiplier","result"], validateFn: "return rows.length === 10 && rows[0].result === 7 && rows[9].result === 70;", solution: "WITH RECURSIVE mult(n) AS (\n    SELECT 1\n    UNION ALL\n    SELECT n + 1 FROM mult WHERE n < 10\n)\nSELECT n AS multiplier, 7 * n AS result FROM mult;" },
      { id: "45-3", prompt: "Simulate processing each employee: show each employee id, name, and a 'processing note' that says 'Row N processed' where N is their row number.", hint: "ROW_NUMBER() to get position, concatenate the message.", expectedColumns: ["id","name","processing_note"], validateFn: "return rows.length > 0 && rows[0].processing_note.includes('processed');", solution: "SELECT id, name,\n       'Row ' || ROW_NUMBER() OVER (ORDER BY id) || ' processed' AS processing_note\nFROM employees\nORDER BY id;" }
    ]
  },

  {
    module: 10, lesson: 46,
    slug: "school-advanced/user-defined-functions",
    moduleSlug: "school-advanced", lessonSlug: "user-defined-functions",
    title: "User-Defined Functions", badge: "concept", database: "company",
    theory: { content: `## What Are UDFs?

User-defined functions let you write custom functions that work just like built-in ones (UPPER, ROUND, etc.). Write the logic once, call it anywhere in your queries.

There are two main types in T-SQL:
- **Scalar functions**: return a single value
- **Table-valued functions**: return a whole table

## Scalar Function (T-SQL)

\`\`\`sql
CREATE FUNCTION dbo.GetSalaryTier(@salary DECIMAL)
RETURNS NVARCHAR(20)
AS BEGIN
    RETURN CASE
        WHEN @salary >= 100000 THEN 'Senior'
        WHEN @salary >= 75000 THEN 'Mid'
        ELSE 'Junior'
    END
END;

-- use it like any function
SELECT name, dbo.GetSalaryTier(salary) AS tier
FROM employees;
\`\`\`

## Table-Valued Function (T-SQL)

\`\`\`sql
CREATE FUNCTION dbo.GetDeptEmployees(@dept NVARCHAR(50))
RETURNS TABLE
AS RETURN (
    SELECT name, salary, hire_date
    FROM employees
    WHERE department = @dept
);

-- use it like a table
SELECT * FROM dbo.GetDeptEmployees('Engineering');
\`\`\`

Table-valued functions can be joined, filtered, and used anywhere a regular table can.

## SQLite Reality

SQLite doesn't support CREATE FUNCTION in SQL. You'd register functions through your application code. For class purposes, we simulate the concept with CASE expressions and views.

## UDF vs Stored Procedure

| Feature | Scalar UDF | Stored Procedure |
|---------|------------|------------------|
| Returns | Single value | Result set |
| Can use in SELECT | Yes | No |
| Can modify data | No | Yes |
| Can have side effects | No | Yes |` },
    examples: [
      { title: "Simulating a scalar UDF with CASE", explanation: "What a GetSalaryTier function would look like", sql: "-- this CASE is what a UDF would encapsulate\nSELECT name, salary,\n    CASE\n        WHEN salary >= 100000 THEN 'Senior'\n        WHEN salary >= 75000 THEN 'Mid'\n        ELSE 'Junior'\n    END AS tier\nFROM employees\nORDER BY salary DESC;" },
      { title: "Table-valued function via view", explanation: "A view acts like a reusable table-valued function", sql: "-- create a view (acts like a TVF)\nCREATE VIEW IF NOT EXISTS vw_engineering_team AS\nSELECT name, salary, hire_date\nFROM employees\nWHERE department = 'Engineering';\n\n-- query it like you would a TVF\nSELECT * FROM vw_engineering_team\nWHERE salary > 90000;" }
    ],
    challenges: [
      { id: "46-1", prompt: "Simulate a GetYearsOfService function: show each employee with their calculated years of service as if calling a custom function.", hint: "Use date math inline like a function would.", expectedColumns: ["name","years_of_service"], validateFn: "return rows.length > 0 && rows[0].years_of_service >= 0;", solution: "SELECT name,\n    CAST((julianday('now') - julianday(hire_date)) / 365.25 AS INTEGER) AS years_of_service\nFROM employees\nORDER BY years_of_service DESC;" },
      { id: "46-2", prompt: "Create a view that acts like a table-valued function GetHighEarners(threshold). For now, hardcode threshold at 90000. Return name, department, and salary for anyone above.", hint: "CREATE VIEW with the filter baked in.", expectedColumns: ["name","department","salary"], validateFn: "return rows.every(r => r.salary > 90000);", solution: "CREATE VIEW IF NOT EXISTS vw_high_earners AS\nSELECT name, department, salary\nFROM employees\nWHERE salary > 90000;\n\nSELECT * FROM vw_high_earners ORDER BY salary DESC;" },
      { id: "46-3", prompt: "Simulate a GetEmployeeBand function that returns salary bands: Band A (100k+), Band B (75k-99k), Band C (50k-74k), Band D (under 50k). Show name, salary, and band.", hint: "CASE with multiple WHEN conditions.", expectedColumns: ["name","salary","band"], validateFn: "return rows.length > 0 && rows.some(r => r.band.startsWith('Band'));", solution: "SELECT name, salary,\n    CASE\n        WHEN salary >= 100000 THEN 'Band A'\n        WHEN salary >= 75000 THEN 'Band B'\n        WHEN salary >= 50000 THEN 'Band C'\n        ELSE 'Band D'\n    END AS band\nFROM employees\nORDER BY salary DESC;" }
    ]
  },

  {
    module: 10, lesson: 47,
    slug: "school-advanced/triggers-advanced",
    moduleSlug: "school-advanced", lessonSlug: "triggers-advanced",
    title: "Triggers · INSERT, UPDATE, DELETE", badge: "practice", database: "company",
    theory: { content: `## Triggers Recap

A trigger fires automatically when something happens to a table. You don't call it, the database runs it for you. Super useful for audit trails and enforcing rules.

Triggers are kind of confusing at first because you have to think about when things run. But once you get it, they're powerful.

## T-SQL Trigger Syntax

\`\`\`sql
CREATE TRIGGER trg_employee_audit
ON employees
AFTER INSERT, UPDATE, DELETE
AS BEGIN
    -- inserted table: new rows (INSERT and UPDATE)
    -- deleted table: old rows (DELETE and UPDATE)

    INSERT INTO audit_log (action, emp_name, changed_at)
    SELECT 'INSERT', name, GETDATE() FROM inserted
    UNION ALL
    SELECT 'DELETE', name, GETDATE() FROM deleted;
END;
\`\`\`

## The inserted and deleted Tables

This is the confusing part but it's actually pretty logical:

| Operation | inserted | deleted |
|-----------|----------|---------|
| INSERT | new row | empty |
| UPDATE | new values | old values |
| DELETE | empty | deleted row |

So for UPDATE, you have both. That's how you compare old vs new values.

## SQLite Syntax

\`\`\`sql
CREATE TRIGGER trg_salary_audit
AFTER UPDATE ON employees
FOR EACH ROW
WHEN OLD.salary != NEW.salary  -- optional condition
BEGIN
    INSERT INTO salary_log (emp_id, old_sal, new_sal, changed_at)
    VALUES (NEW.id, OLD.salary, NEW.salary, datetime('now'));
END;
\`\`\`

## Common Use Cases

- Audit logging (who changed what when)
- Cascading updates (update related tables)
- Validation (reject bad data with RAISE)
- Computed columns (auto-update totals)` },
    examples: [
      { title: "Audit trigger for salary changes", explanation: "Log whenever someone's salary changes", sql: "-- setup: create audit table first\nCREATE TABLE IF NOT EXISTS salary_changes (\n    emp_name TEXT,\n    old_salary REAL,\n    new_salary REAL,\n    change_pct REAL,\n    changed_at TEXT\n);\n\n-- the trigger itself\nCREATE TRIGGER IF NOT EXISTS trg_log_salary_change\nAFTER UPDATE ON employees\nFOR EACH ROW\nWHEN OLD.salary != NEW.salary\nBEGIN\n    INSERT INTO salary_changes VALUES (\n        NEW.name,\n        OLD.salary,\n        NEW.salary,\n        ROUND((NEW.salary - OLD.salary) * 100.0 / OLD.salary, 1),\n        datetime('now')\n    );\nEND;\n\n-- test it\nUPDATE employees SET salary = 135000 WHERE id = 1;\nSELECT * FROM salary_changes;" },
      { title: "Prevent dangerous deletes", explanation: "Stop deletion of managers", sql: "CREATE TRIGGER IF NOT EXISTS trg_protect_managers\nBEFORE DELETE ON employees\nFOR EACH ROW\nWHEN OLD.id IN (SELECT DISTINCT manager_id FROM employees WHERE manager_id IS NOT NULL)\nBEGIN\n    SELECT RAISE(ABORT, 'Cannot delete: this employee is a manager!');\nEND;\n\n-- this would fail:\n-- DELETE FROM employees WHERE id = 1;" }
    ],
    challenges: [
      { id: "47-1", prompt: "Create a trigger that logs all new employee inserts to a table called new_hire_log (with name, department, and hire timestamp).", hint: "AFTER INSERT trigger, use NEW.name and NEW.department.", expectedColumns: ["name","department","logged_at"], validateFn: "return rows.length > 0;", solution: "CREATE TABLE IF NOT EXISTS new_hire_log (name TEXT, department TEXT, logged_at TEXT);\n\nCREATE TRIGGER IF NOT EXISTS trg_log_new_hire\nAFTER INSERT ON employees\nFOR EACH ROW\nBEGIN\n    INSERT INTO new_hire_log VALUES (NEW.name, NEW.department, datetime('now'));\nEND;\n\nINSERT INTO employees (id, name, department, salary, hire_date)\nVALUES (25, 'Test NewHire', 'Marketing', 65000, '2026-01-15');\n\nSELECT * FROM new_hire_log;" },
      { id: "47-2", prompt: "Create a trigger that prevents any employee from having a salary set to 0 or negative.", hint: "BEFORE UPDATE, check NEW.salary, use RAISE(ABORT, msg).", expectedColumns: [], validateFn: "return true;", solution: "CREATE TRIGGER IF NOT EXISTS trg_prevent_zero_salary\nBEFORE UPDATE ON employees\nFOR EACH ROW\nWHEN NEW.salary <= 0\nBEGIN\n    SELECT RAISE(ABORT, 'Salary cannot be zero or negative!');\nEND;\n\n-- test: this would fail\n-- UPDATE employees SET salary = 0 WHERE id = 1;\nSELECT 'Trigger created - try setting salary to 0 to see it fail' AS status;" },
      { id: "47-3", prompt: "List all triggers that exist on the employees table.", hint: "Query sqlite_master WHERE type='trigger' AND tbl_name='employees'.", expectedColumns: ["name","sql"], validateFn: "return rows.length >= 0;", solution: "SELECT name, sql\nFROM sqlite_master\nWHERE type = 'trigger' AND tbl_name = 'employees';" }
    ]
  },

  {
    module: 10, lesson: 48,
    slug: "school-advanced/dynamic-sql",
    moduleSlug: "school-advanced", lessonSlug: "dynamic-sql",
    title: "Dynamic SQL", badge: "challenge", database: "company",
    theory: { content: `## What Is Dynamic SQL?

Dynamic SQL is SQL that builds itself at runtime. Instead of a fixed query, you construct the query string using variables, then execute it.

Powerful when you need it, dangerous if you don't parameterize. SQL injection is the main risk.

## T-SQL Dynamic SQL

\`\`\`sql
-- simple EXEC
DECLARE @tableName NVARCHAR(50) = 'employees';
DECLARE @sql NVARCHAR(MAX);

SET @sql = 'SELECT * FROM ' + @tableName;
EXEC(@sql);  -- runs: SELECT * FROM employees
\`\`\`

## The Safe Way: sp_executesql

\`\`\`sql
-- parameterized dynamic SQL (prevents SQL injection)
DECLARE @dept NVARCHAR(50) = 'Engineering';
DECLARE @sql NVARCHAR(MAX) = N'
    SELECT name, salary
    FROM employees
    WHERE department = @deptParam';

EXEC sp_executesql @sql,
    N'@deptParam NVARCHAR(50)',
    @deptParam = @dept;
\`\`\`

Why sp_executesql? Because it uses parameters instead of string concatenation. If someone passes \`'; DROP TABLE employees; --\` as the department name, it won't execute the DROP.

## When to Use Dynamic SQL

- Column/table names from user input (can't parameterize these)
- Building complex WHERE clauses dynamically
- Pivot queries with unknown column names
- Generic reporting tools

## When NOT to Use It

- When a regular query works fine
- Without parameterization (SQL injection risk)
- For simple filters (just use WHERE)

## SQLite Note

SQLite doesn't have EXEC or sp_executesql. Dynamic SQL is handled in application code. The challenges here use query construction concepts.` },
    examples: [
      { title: "Dynamic column selection concept", explanation: "Simulating choosing what columns to return", sql: "-- in real dynamic SQL you'd build this string\n-- here we just show the concept with CASE\nSELECT \n    name,\n    CASE 'salary' -- this would be a variable\n        WHEN 'salary' THEN salary\n        WHEN 'hire_date' THEN hire_date\n    END AS dynamic_column\nFROM employees\nLIMIT 5;" },
      { title: "Dynamic filtering concept", explanation: "Different filters based on a condition", sql: "-- simulating dynamic WHERE clause\n-- in T-SQL you'd build the WHERE as a string\nWITH params AS (\n    SELECT 'department' AS filter_type, 'Engineering' AS filter_value\n)\nSELECT e.name, e.department, e.salary\nFROM employees e, params p\nWHERE \n    (p.filter_type = 'department' AND e.department = p.filter_value)\n    OR (p.filter_type = 'salary_above' AND e.salary > CAST(p.filter_value AS INTEGER));" }
    ],
    challenges: [
      { id: "48-1", prompt: "Simulate a dynamic query that can filter employees by either department OR by minimum salary, based on a filter_type parameter. Use filter_type='department' and filter_value='Sales'.", hint: "CTE with params, WHERE with OR conditions checking filter_type.", expectedColumns: ["name","department","salary"], validateFn: "return rows.length > 0;", solution: "WITH params AS (\n    SELECT 'department' AS filter_type, 'Sales' AS filter_value\n)\nSELECT e.name, e.department, e.salary\nFROM employees e, params p\nWHERE \n    (p.filter_type = 'department' AND e.department = p.filter_value)\n    OR (p.filter_type = 'min_salary' AND e.salary >= CAST(p.filter_value AS INTEGER))\nORDER BY e.salary DESC;" },
      { id: "48-2", prompt: "Create a 'flexible aggregation' query that can return either COUNT, SUM, or AVG of salaries based on a parameter. Use agg_type='avg'.", hint: "Three separate aggregates in SELECT, pick one based on param.", expectedColumns: ["result"], validateFn: "return rows.length === 1 && rows[0].result > 0;", solution: "WITH params AS (SELECT 'avg' AS agg_type)\nSELECT \n    CASE params.agg_type\n        WHEN 'count' THEN COUNT(*)\n        WHEN 'sum' THEN SUM(salary)\n        WHEN 'avg' THEN ROUND(AVG(salary), 0)\n    END AS result\nFROM employees, params;" },
      { id: "48-3", prompt: "Show how you'd build a dynamic sort: return employees sorted either by name ASC, salary DESC, or hire_date DESC based on a sort_by parameter. Use sort_by='salary'.", hint: "You can't truly parameterize ORDER BY in SQLite, but show the concept with CASE in ORDER BY.", expectedColumns: ["name","salary","hire_date"], validateFn: "return rows.length > 0;", solution: "WITH params AS (SELECT 'salary' AS sort_by)\nSELECT e.name, e.salary, e.hire_date\nFROM employees e, params p\nORDER BY \n    CASE WHEN p.sort_by = 'name' THEN e.name END ASC,\n    CASE WHEN p.sort_by = 'salary' THEN e.salary END DESC,\n    CASE WHEN p.sort_by = 'hire_date' THEN e.hire_date END DESC\nLIMIT 10;" }
    ]
  },

  {
    module: 10, lesson: 49,
    slug: "school-advanced/xml-sql-server",
    moduleSlug: "school-advanced", lessonSlug: "xml-sql-server",
    title: "XML in SQL Server", badge: "practice", database: "company",
    theory: { content: `## XML in SQL Server

SQL Server can output query results as XML and parse XML data. This was huge before JSON became popular. You'll still see it in older systems and SOAP web services.

Not gonna lie, XML syntax is kind of verbose compared to JSON, but it's still used a lot in enterprise systems.

## FOR XML PATH

The main way to generate XML from query results:

\`\`\`sql
-- basic XML output
SELECT name, salary
FROM employees
FOR XML PATH('employee'), ROOT('employees');

-- produces:
-- <employees>
--   <employee><name>Sarah</name><salary>120000</salary></employee>
--   ...
-- </employees>
\`\`\`

## FOR XML PATH Tricks

\`\`\`sql
-- attributes instead of elements
SELECT id AS '@id',   -- @ makes it an attribute
       name AS 'Name',
       salary AS 'Salary'
FROM employees
FOR XML PATH('emp'), ROOT('team');

-- produces:
-- <team>
--   <emp id="1"><Name>Sarah</Name><Salary>120000</Salary></emp>
-- </team>
\`\`\`

## Reading XML with OPENXML

\`\`\`sql
DECLARE @xml XML = '<employees>
    <emp id="1" name="Test" salary="80000"/>
</employees>';

SELECT *
FROM OPENXML(@xml.nodes('/employees/emp') AS t(c))
-- or use the newer .nodes() and .value() methods
\`\`\`

## SQLite Note

SQLite doesn't have native XML support. The challenges here use string concatenation to simulate XML building, which gives you the concept without the T-SQL functions.` },
    examples: [
      { title: "Simulating XML output", explanation: "Building XML structure with string concatenation", sql: "-- simulating what FOR XML PATH would produce\nSELECT \n    '<employee>' ||\n    '<name>' || name || '</name>' ||\n    '<dept>' || department || '</dept>' ||\n    '<salary>' || salary || '</salary>' ||\n    '</employee>' AS xml_row\nFROM employees\nLIMIT 5;" },
      { title: "Building an XML document", explanation: "Wrap rows in a root element", sql: "-- full XML doc simulation\nSELECT '<employees>' AS xml_output\nUNION ALL\nSELECT '  <emp id=\"' || id || '\">' ||\n       '<name>' || name || '</name>' ||\n       '<salary>' || salary || '</salary>' ||\n       '</emp>'\nFROM employees\nWHERE department = 'Engineering'\nUNION ALL\nSELECT '</employees>';" }
    ],
    challenges: [
      { id: "49-1", prompt: "Create simulated XML output for all Sales employees with id, name, and salary as elements.", hint: "String concatenation with XML tags around each field.", expectedColumns: ["xml_row"], validateFn: "return rows.length > 0 && rows[0].xml_row.includes('<employee>');", solution: "SELECT \n    '<employee>' ||\n    '<id>' || id || '</id>' ||\n    '<name>' || name || '</name>' ||\n    '<salary>' || salary || '</salary>' ||\n    '</employee>' AS xml_row\nFROM employees\nWHERE department = 'Sales';" },
      { id: "49-2", prompt: "Build XML with id as an attribute and name/salary as child elements. Format: <emp id=\"X\"><name>...</name><salary>...</salary></emp>", hint: "Use double quotes for attribute, single elements inside.", expectedColumns: ["xml_row"], validateFn: "return rows.length > 0 && rows[0].xml_row.includes('id=');", solution: "SELECT \n    '<emp id=\"' || id || '\">' ||\n    '<name>' || name || '</name>' ||\n    '<salary>' || salary || '</salary>' ||\n    '</emp>' AS xml_row\nFROM employees\nLIMIT 5;" },
      { id: "49-3", prompt: "Create a complete XML document with a root element <department_report> containing <summary> (with headcount) and then <employees> with each person's info.", hint: "UNION ALL to combine header, data rows, and footer.", expectedColumns: ["xml_line"], validateFn: "return rows.length > 3;", solution: "SELECT '<department_report dept=\"Engineering\">' AS xml_line\nUNION ALL\nSELECT '  <summary><count>' || COUNT(*) || '</count></summary>'\nFROM employees WHERE department = 'Engineering'\nUNION ALL\nSELECT '  <employees>'\nUNION ALL\nSELECT '    <emp>' || name || ' - $' || salary || '</emp>'\nFROM employees WHERE department = 'Engineering'\nUNION ALL\nSELECT '  </employees>'\nUNION ALL\nSELECT '</department_report>';" }
    ]
  },

  {
    module: 10, lesson: 50,
    slug: "school-advanced/json-sql-server",
    moduleSlug: "school-advanced", lessonSlug: "json-sql-server",
    title: "JSON in SQL Server", badge: "practice", database: "company",
    theory: { content: `## JSON in SQL Server

SQL Server 2016+ supports JSON parsing and serialization, which is what most modern APIs use.

## FOR JSON: Query Results to JSON

\`\`\`sql
-- AUTO mode (quick and easy)
SELECT name, salary, department
FROM employees
FOR JSON AUTO;
-- [{"name":"Sarah","salary":120000,"department":"Engineering"},...]

-- PATH mode (more control)
SELECT name AS 'employee.name',
       salary AS 'employee.pay.annual'
FROM employees
FOR JSON PATH;
-- [{"employee":{"name":"Sarah","pay":{"annual":120000}}},...]
\`\`\`

## OPENJSON: Parse JSON Data

\`\`\`sql
DECLARE @json NVARCHAR(MAX) = '[
    {"name":"Test1","salary":80000},
    {"name":"Test2","salary":90000}
]';

SELECT * FROM OPENJSON(@json)
WITH (
    name NVARCHAR(100),
    salary INT
);
\`\`\`

## JSON_VALUE: Extract Single Values

\`\`\`sql
DECLARE @json NVARCHAR(MAX) = '{"name":"Sarah","dept":"Eng"}';
SELECT JSON_VALUE(@json, '$.name');  -- returns 'Sarah'
SELECT JSON_VALUE(@json, '$.dept');  -- returns 'Eng'
\`\`\`

## JSON_QUERY: Extract Objects or Arrays

\`\`\`sql
DECLARE @json NVARCHAR(MAX) = '{"person":{"name":"Sarah","skills":["SQL","Python"]}}';
SELECT JSON_QUERY(@json, '$.person.skills');  -- returns '["SQL","Python"]'
\`\`\`

## SQLite JSON Support

SQLite has json functions too! They work slightly differently but the concept is similar. We'll use those in the challenges.` },
    examples: [
      { title: "Building JSON output in SQLite", explanation: "Using json_object to create JSON", sql: "-- SQLite's json_object function\nSELECT json_object(\n    'id', id,\n    'name', name,\n    'department', department,\n    'salary', salary\n) AS employee_json\nFROM employees\nLIMIT 5;" },
      { title: "JSON array of employees", explanation: "Aggregate into a JSON array", sql: "-- build a JSON array of all Engineering employees\nSELECT json_group_array(\n    json_object('name', name, 'salary', salary)\n) AS team_json\nFROM employees\nWHERE department = 'Engineering';" }
    ],
    challenges: [
      { id: "50-1", prompt: "Convert each employee to a JSON object with fields: id, name, department, salary.", hint: "Use json_object() function with column values.", expectedColumns: ["employee_json"], validateFn: "return rows.length > 0;", solution: "SELECT json_object(\n    'id', id,\n    'name', name,\n    'department', department,\n    'salary', salary\n) AS employee_json\nFROM employees;" },
      { id: "50-2", prompt: "Create a JSON array containing all unique department names.", hint: "json_group_array with SELECT DISTINCT department.", expectedColumns: ["departments_json"], validateFn: "return rows.length === 1;", solution: "SELECT json_group_array(department) AS departments_json\nFROM (SELECT DISTINCT department FROM employees);" },
      { id: "50-3", prompt: "Build a department summary as JSON: an array where each element has dept name, headcount, and avg_salary.", hint: "GROUP BY department, wrap aggregates in json_object, then json_group_array.", expectedColumns: ["summary_json"], validateFn: "return rows.length === 1;", solution: "SELECT json_group_array(\n    json_object(\n        'department', department,\n        'headcount', COUNT(*),\n        'avg_salary', ROUND(AVG(salary), 0)\n    )\n) AS summary_json\nFROM employees\nGROUP BY department;" }
    ]
  },

  {
    module: 10, lesson: 51,
    slug: "school-advanced/indexes-deep-dive",
    moduleSlug: "school-advanced", lessonSlug: "indexes-deep-dive",
    title: "Indexes Deep Dive", badge: "challenge", database: "company",
    theory: { content: `## Index Types in SQL Server

There are two main types and understanding the difference is important:

### Clustered Index

- Physically reorders the table data
- Only ONE per table (the data can only be sorted one way)
- Usually on the primary key
- The table IS the index basically

### Nonclustered Index

- Separate structure pointing to table rows
- Can have many per table
- Like the index in a book pointing to pages

\`\`\`sql
-- SQL Server syntax
CREATE CLUSTERED INDEX idx_pk ON employees(id);
CREATE NONCLUSTERED INDEX idx_dept ON employees(department);
\`\`\`

## Covering Indexes

A covering index includes all columns needed for a query. The database doesn't have to go back to the table because everything's in the index.

\`\`\`sql
-- this index "covers" queries that need dept + salary
CREATE INDEX idx_dept_salary ON employees(department, salary);

-- query is fully covered, no table lookup needed
SELECT department, salary FROM employees
WHERE department = 'Engineering';
\`\`\`

## When Indexes Help

- WHERE clauses (equality and range)
- JOIN conditions
- ORDER BY columns
- GROUP BY columns

## When Indexes DON'T Help

- Small tables (scan is faster than index lookup)
- Columns with few unique values
- Columns in functions: \`WHERE UPPER(name) = 'X'\`
- Columns you rarely query
- Tables with tons of INSERTs (index maintenance overhead)

## The INCLUDE Keyword (SQL Server)

\`\`\`sql
-- include extra columns without making them part of the key
CREATE INDEX idx_dept ON employees(department) INCLUDE (name, salary);
\`\`\`

This covers queries that filter on dept but need name/salary too.` },
    examples: [
      { title: "Check index usage with EXPLAIN", explanation: "See if your index is being used", sql: "-- create an index\nCREATE INDEX IF NOT EXISTS idx_dept ON employees(department);\n\n-- check if it's used\nEXPLAIN QUERY PLAN\nSELECT name, salary\nFROM employees\nWHERE department = 'Engineering';" },
      { title: "Composite index for common filter combo", explanation: "Index on multiple columns used together", sql: "-- queries often filter by dept AND check salary\nCREATE INDEX IF NOT EXISTS idx_dept_sal ON employees(department, salary);\n\n-- this query can use the composite index\nSELECT name, salary\nFROM employees\nWHERE department = 'Engineering' AND salary > 90000;" }
    ],
    challenges: [
      { id: "51-1", prompt: "Create an index on hire_date, then show EXPLAIN QUERY PLAN for a query finding employees hired after 2021-01-01.", hint: "CREATE INDEX, then EXPLAIN QUERY PLAN SELECT.", expectedColumns: [], validateFn: "return rows.length >= 0;", solution: "CREATE INDEX IF NOT EXISTS idx_hire ON employees(hire_date);\n\nEXPLAIN QUERY PLAN\nSELECT name, hire_date\nFROM employees\nWHERE hire_date > '2021-01-01';" },
      { id: "51-2", prompt: "Create a composite index that would cover this query pattern: SELECT name, salary FROM employees WHERE department = ? ORDER BY salary DESC", hint: "Index on (department, salary) covers both WHERE and ORDER BY.", expectedColumns: ["name","salary"], validateFn: "return rows.length > 0;", solution: "CREATE INDEX IF NOT EXISTS idx_dept_salary_cover ON employees(department, salary);\n\nSELECT name, salary\nFROM employees\nWHERE department = 'Finance'\nORDER BY salary DESC;" },
      { id: "51-3", prompt: "List all indexes currently on the employees table.", hint: "Query sqlite_master for type='index' and tbl_name='employees'.", expectedColumns: ["index_name"], validateFn: "return rows.length >= 0;", solution: "SELECT name AS index_name, sql\nFROM sqlite_master\nWHERE type = 'index' AND tbl_name = 'employees';" }
    ]
  },

  {
    module: 10, lesson: 52,
    slug: "school-advanced/temporal-tables",
    moduleSlug: "school-advanced", lessonSlug: "temporal-tables",
    title: "Tracking Changes · Temporal Tables", badge: "challenge", database: "company",
    theory: { content: `## What Are Temporal Tables?

Temporal tables (system-versioned tables in SQL Server 2016+) automatically track the full history of every change. Want to know what someone's salary was 6 months ago? Temporal tables got you.

It's like having automatic version control for your data. Super useful for auditing and debugging.

## SQL Server Temporal Table

\`\`\`sql
CREATE TABLE employees_temporal (
    id INT PRIMARY KEY,
    name NVARCHAR(100),
    salary DECIMAL(10,2),
    -- special temporal columns
    SysStartTime DATETIME2 GENERATED ALWAYS AS ROW START,
    SysEndTime DATETIME2 GENERATED ALWAYS AS ROW END,
    PERIOD FOR SYSTEM_TIME (SysStartTime, SysEndTime)
)
WITH (SYSTEM_VERSIONING = ON (HISTORY_TABLE = dbo.employees_history));
\`\`\`

## Querying Historical Data

\`\`\`sql
-- what was the data at a specific time?
SELECT * FROM employees
FOR SYSTEM_TIME AS OF '2025-01-01 12:00:00';

-- all versions between two dates
SELECT * FROM employees
FOR SYSTEM_TIME BETWEEN '2025-01-01' AND '2025-06-01';

-- entire history
SELECT * FROM employees
FOR SYSTEM_TIME ALL;
\`\`\`

## Change Tracking (Alternative Approach)

SQL Server also has Change Tracking for lightweight change detection:

\`\`\`sql
-- enable change tracking
ALTER DATABASE MyDB SET CHANGE_TRACKING = ON;
ALTER TABLE employees ENABLE CHANGE_TRACKING;

-- get changes since a version
SELECT * FROM CHANGETABLE(CHANGES employees, @last_version) AS ct;
\`\`\`

This tells you WHAT changed but not the old values.

## Manual History Tables (SQLite Simulation)

Without temporal table support, you can use triggers to maintain a history table. That's what we'll do in the challenges.` },
    examples: [
      { title: "Manual history tracking with triggers", explanation: "Store old values before every update", sql: "-- create history table\nCREATE TABLE IF NOT EXISTS employee_history (\n    history_id INTEGER PRIMARY KEY AUTOINCREMENT,\n    emp_id INTEGER,\n    name TEXT,\n    salary REAL,\n    department TEXT,\n    valid_from TEXT,\n    valid_to TEXT\n);\n\n-- trigger to capture changes\nCREATE TRIGGER IF NOT EXISTS trg_emp_history\nBEFORE UPDATE ON employees\nFOR EACH ROW\nBEGIN\n    INSERT INTO employee_history (emp_id, name, salary, department, valid_from, valid_to)\n    VALUES (OLD.id, OLD.name, OLD.salary, OLD.department, \n            datetime('now', '-1 year'), datetime('now'));\nEND;\n\nSELECT 'History tracking enabled' AS status;" },
      { title: "Query point-in-time data", explanation: "Find what data looked like at a specific time", sql: "-- assuming we have history data\n-- find records valid at a specific point\nSELECT * FROM employee_history\nWHERE valid_from <= '2025-06-01'\n  AND valid_to > '2025-06-01'\nLIMIT 5;" }
    ],
    challenges: [
      { id: "52-1", prompt: "Create a salary_history table that will store: emp_id, old_salary, new_salary, changed_at. Then create a trigger that populates it on salary updates.", hint: "CREATE TABLE then CREATE TRIGGER AFTER UPDATE WHEN OLD.salary != NEW.salary.", expectedColumns: ["emp_id","old_salary","new_salary","changed_at"], validateFn: "return rows.length >= 0;", solution: "CREATE TABLE IF NOT EXISTS salary_history (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    emp_id INTEGER,\n    old_salary REAL,\n    new_salary REAL,\n    changed_at TEXT\n);\n\nCREATE TRIGGER IF NOT EXISTS trg_salary_history\nAFTER UPDATE ON employees\nFOR EACH ROW\nWHEN OLD.salary != NEW.salary\nBEGIN\n    INSERT INTO salary_history (emp_id, old_salary, new_salary, changed_at)\n    VALUES (NEW.id, OLD.salary, NEW.salary, datetime('now'));\nEND;\n\n-- test it\nUPDATE employees SET salary = salary + 5000 WHERE id = 2;\nSELECT * FROM salary_history;" },
      { id: "52-2", prompt: "Create a department_changes table that tracks when employees change departments. Record emp_id, old_dept, new_dept, and timestamp.", hint: "Similar to salary history but check OLD.department != NEW.department.", expectedColumns: ["emp_id","old_dept","new_dept"], validateFn: "return rows.length >= 0;", solution: "CREATE TABLE IF NOT EXISTS department_changes (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    emp_id INTEGER,\n    emp_name TEXT,\n    old_dept TEXT,\n    new_dept TEXT,\n    changed_at TEXT\n);\n\nCREATE TRIGGER IF NOT EXISTS trg_dept_change\nAFTER UPDATE ON employees\nFOR EACH ROW\nWHEN OLD.department != NEW.department\nBEGIN\n    INSERT INTO department_changes (emp_id, emp_name, old_dept, new_dept, changed_at)\n    VALUES (NEW.id, NEW.name, OLD.department, NEW.department, datetime('now'));\nEND;\n\nSELECT 'Trigger created' AS status;" },
      { id: "52-3", prompt: "Query any history/audit tables you've created to show all tracked changes.", hint: "SELECT from salary_history or any audit table you created.", expectedColumns: [], validateFn: "return true;", solution: "-- show all salary changes tracked\nSELECT sh.*, e.name\nFROM salary_history sh\nJOIN employees e ON sh.emp_id = e.id\nORDER BY sh.changed_at DESC;" }
    ]
  },

];

/**
 * Get a lesson by its module and lesson slugs
 */
export function getLessonBySlug(moduleSlug: string, lessonSlug: string): Lesson | null {
  return lessons.find(
    l => l.moduleSlug === moduleSlug && l.lessonSlug === lessonSlug
  ) || null;
}

/**
 * Get all lessons in a module
 */
export function getModuleLessons(moduleSlug: string): Lesson[] {
  return lessons.filter(l => l.moduleSlug === moduleSlug);
}

/**
 * Get module info by slug
 */
export function getModuleBySlug(slug: string): ModuleInfo | null {
  return modules.find(m => m.slug === slug) || null;
}

/**
 * Get the next lesson in sequence
 */
export function getNextLesson(currentLesson: Lesson): Lesson | null {
  const currentIndex = lessons.findIndex(
    l => l.moduleSlug === currentLesson.moduleSlug && l.lessonSlug === currentLesson.lessonSlug
  );

  if (currentIndex === -1 || currentIndex === lessons.length - 1) {
    return null;
  }

  return lessons[currentIndex + 1];
}

/**
 * Get the previous lesson in sequence
 */
export function getPreviousLesson(currentLesson: Lesson): Lesson | null {
  const currentIndex = lessons.findIndex(
    l => l.moduleSlug === currentLesson.moduleSlug && l.lessonSlug === currentLesson.lessonSlug
  );

  if (currentIndex <= 0) {
    return null;
  }

  return lessons[currentIndex - 1];
}

/**
 * Get total lesson count
 */
export function getTotalLessonCount(): number {
  return lessons.length;
}

/**
 * Get lesson count for a module
 */
export function getModuleLessonCount(moduleSlug: string): number {
  return getModuleLessons(moduleSlug).length;
}

/**
 * Get all modules with metadata
 */
export function getAllModules(): ModuleInfo[] {
  return modules;
}
