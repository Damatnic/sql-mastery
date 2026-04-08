import type { Lesson } from "./lessons";

export const lessonsSchool: Lesson[] = [

  // ─── MODULE 10: ADVANCED SQL (WCTC) ─────────────────────────────────────────

  {
    module: 10, lesson: 43,
    slug: "school-advanced/stored-procedures",
    moduleSlug: "school-advanced", lessonSlug: "stored-procedures",
    title: "Stored Procedures", badge: "concept", database: "company",
    theory: { content: `## What's a Stored Procedure?

Think of a stored procedure as a saved script you can run over and over. Instead of typing out the same query every time, you save it with a name and just call that name. It's like a function in programming but for SQL.

Honestly stored procs are way cleaner than just running raw SQL everywhere. Your app calls one line and the database handles all the logic.

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

Table-valued functions are honestly super useful. You can join them to other tables, filter them, do whatever you'd do with a regular table.

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
    title: "Triggers — INSERT, UPDATE, DELETE", badge: "practice", database: "company",
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

Sounds cool but honestly it's also dangerous if you're not careful. SQL injection is a real thing.

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

SQL Server 2016+ has great JSON support. Way more readable than XML honestly, and it's what most modern APIs use.

## FOR JSON — Query Results to JSON

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

## OPENJSON — Parse JSON Data

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

## JSON_VALUE — Extract Single Values

\`\`\`sql
DECLARE @json NVARCHAR(MAX) = '{"name":"Sarah","dept":"Eng"}';
SELECT JSON_VALUE(@json, '$.name');  -- returns 'Sarah'
SELECT JSON_VALUE(@json, '$.dept');  -- returns 'Eng'
\`\`\`

## JSON_QUERY — Extract Objects or Arrays

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
    title: "Tracking Changes — Temporal Tables", badge: "challenge", database: "company",
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
  }

];
