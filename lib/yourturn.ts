// "Your turn": one fill-in-the-blank completion exercise per lesson, placed
// between the worked examples and the full challenges. The learner finishes a
// query themselves (with a reveal-answer escape hatch) so practice is active,
// not just reading. Every `runnable` is verified against the real sql.js engine.

import type { FillItem } from './checkpoints';

export function getYourTurn(moduleSlug: string, lessonSlug: string): FillItem[] {
  return YOUR_TURN[`${moduleSlug}/${lessonSlug}`] ?? [];
}

const fill = (
  prompt: string,
  template: string,
  answers: string[][],
  explain: string,
  runnable: string,
  database: FillItem['database'] = 'company',
): FillItem => ({ kind: 'fill', prompt, template, answers, explain, runnable, database });

export const YOUR_TURN: Record<string, FillItem[]> = {
  'start-here/welcome': [
    fill('Read every row and column of the employees table.', 'SELECT ___ FROM employees;', [['*']],
      '* means all columns; with no WHERE you get every row.', 'SELECT * FROM employees;'),
  ],
  'start-here/first-select': [
    fill('Show only the name and salary columns.', 'SELECT name, ___ FROM employees;', [['salary']],
      'List the columns you want, separated by commas.', 'SELECT name, salary FROM employees;'),
  ],
  'start-here/how-to-learn': [
    fill('Read the name column from the departments table.', 'SELECT name ___ departments;', [['FROM']],
      'FROM names the table the rows come from.', 'SELECT name FROM departments;'),
  ],
  'getting-started/select-basics': [
    fill("Show each employee's name and department.", 'SELECT name, ___ FROM employees;', [['department']],
      'Pick the columns you need by name.', 'SELECT name, department FROM employees;'),
  ],
  'getting-started/where-filtering': [
    fill('Only employees in the Engineering department.', "SELECT name FROM employees ___ department = 'Engineering';", [['WHERE']],
      'WHERE keeps only the rows that match the condition.', "SELECT name FROM employees WHERE department = 'Engineering';"),
  ],
  'getting-started/order-by': [
    fill('Sort employees by salary, highest first.', 'SELECT name, salary FROM employees ORDER BY salary ___;', [['DESC']],
      'DESC sorts high to low; ASC is the default low to high.', 'SELECT name, salary FROM employees ORDER BY salary DESC;'),
  ],
  'getting-started/limit-offset': [
    fill('Return only the first 3 rows.', 'SELECT name FROM employees ___ 3;', [['LIMIT']],
      'LIMIT caps how many rows come back.', 'SELECT name FROM employees LIMIT 3;'),
  ],
  'getting-started/distinct': [
    fill('List each department name once.', 'SELECT ___ department FROM employees;', [['DISTINCT']],
      'DISTINCT removes duplicate rows.', 'SELECT DISTINCT department FROM employees;'),
  ],
  'data-analysis/aggregate-functions': [
    fill('Count how many employees there are.', 'SELECT ___ FROM employees;', [['COUNT(*)']],
      'COUNT(*) counts rows.', 'SELECT COUNT(*) FROM employees;'),
  ],
  'data-analysis/group-by': [
    fill('Average salary per department.', 'SELECT department, AVG(salary) FROM employees ___ department;', [['GROUP BY']],
      'GROUP BY collapses rows so the aggregate runs per group.', 'SELECT department, AVG(salary) FROM employees GROUP BY department;'),
  ],
  'data-analysis/having': [
    fill('Keep only departments with more than 3 employees.', 'SELECT department, COUNT(*) FROM employees GROUP BY department ___ COUNT(*) > 3;', [['HAVING']],
      'HAVING filters grouped results; WHERE cannot use aggregates.', 'SELECT department, COUNT(*) FROM employees GROUP BY department HAVING COUNT(*) > 3;'),
  ],
  'data-analysis/null-values': [
    fill('Show manager_id, but display 0 when it is NULL.', 'SELECT name, ___(manager_id, 0) AS mgr FROM employees;', [['COALESCE']],
      'COALESCE returns the first non-NULL value.', 'SELECT name, COALESCE(manager_id, 0) AS mgr FROM employees;'),
  ],
  'data-analysis/case-expressions': [
    fill("Label salary >= 100000 as 'High', otherwise 'Standard'.", "SELECT name, CASE ___ salary >= 100000 THEN 'High' ELSE 'Standard' END AS tier FROM employees;", [['WHEN']],
      'CASE WHEN ... THEN ... ELSE ... END is SQL inline if/else.', "SELECT name, CASE WHEN salary >= 100000 THEN 'High' ELSE 'Standard' END AS tier FROM employees;"),
  ],
  'joining-tables/inner-join': [
    fill('Join employees to departments to get each location.', 'SELECT e.name, d.location FROM employees e JOIN departments d ___ e.department = d.name;', [['ON']],
      'ON states how the two tables line up.', 'SELECT e.name, d.location FROM employees e JOIN departments d ON e.department = d.name;'),
  ],
  'joining-tables/left-join': [
    fill('Keep every employee even with no project match.', 'SELECT e.name, ep.project_id FROM employees e ___ JOIN employee_projects ep ON e.id = ep.employee_id;', [['LEFT']],
      'LEFT JOIN keeps all left rows, NULL where the right has no match.', 'SELECT e.name, ep.project_id FROM employees e LEFT JOIN employee_projects ep ON e.id = ep.employee_id;'),
  ],
  'joining-tables/multiple-joins': [
    fill('Chain employees to employee_projects to projects.', 'SELECT e.name, p.name FROM employees e JOIN employee_projects ep ON e.id = ep.employee_id JOIN ___ p ON ep.project_id = p.id;', [['projects']],
      'Each JOIN adds another linked table.', 'SELECT e.name, p.name FROM employees e JOIN employee_projects ep ON e.id = ep.employee_id JOIN projects p ON ep.project_id = p.id;'),
  ],
  'joining-tables/self-join': [
    fill("Show each employee with their manager's name (join employees to itself).", 'SELECT e.name, m.name AS manager FROM employees e LEFT JOIN employees ___ ON e.manager_id = m.id;', [['m']],
      'A second alias lets you treat one table as two.', 'SELECT e.name, m.name AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.id;'),
  ],
  'joining-tables/full-outer-join': [
    fill('Find employees who have no manager.', 'SELECT name FROM employees WHERE manager_id ___ NULL;', [['IS']],
      'Compare to NULL with IS NULL, never = NULL.', 'SELECT name FROM employees WHERE manager_id IS NULL;'),
  ],
  'subqueries-ctes/subqueries-where': [
    fill('Employees who earn more than the company average.', 'SELECT name FROM employees WHERE salary > (SELECT ___ FROM employees);', [['AVG(salary)']],
      'The scalar subquery returns one number to compare against.', 'SELECT name FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);'),
  ],
  'subqueries-ctes/subqueries-from': [
    fill('Filter a derived table of department averages.', 'SELECT department FROM (SELECT department, AVG(salary) AS a FROM employees GROUP BY department) sub ___ a > 80000;', [['WHERE']],
      'You can SELECT from a subquery as if it were a table.', 'SELECT department FROM (SELECT department, AVG(salary) AS a FROM employees GROUP BY department) sub WHERE a > 80000;'),
  ],
  'subqueries-ctes/correlated-subqueries': [
    fill('Top earner per department (correlated subquery).', 'SELECT name FROM employees e WHERE salary = (SELECT MAX(salary) FROM employees ___ department = e.department);', [['WHERE']],
      'The inner query references the outer row (e.department).', 'SELECT name FROM employees e WHERE salary = (SELECT MAX(salary) FROM employees WHERE department = e.department);'),
  ],
  'subqueries-ctes/ctes-with': [
    fill('Define a CTE named dept_avg, then read it.', '___ dept_avg AS (SELECT department, AVG(salary) AS a FROM employees GROUP BY department) SELECT * FROM dept_avg;', [['WITH']],
      'WITH name AS (...) names a temporary result.', 'WITH dept_avg AS (SELECT department, AVG(salary) AS a FROM employees GROUP BY department) SELECT * FROM dept_avg;'),
  ],
  'modifying-data/insert': [
    fill('Add a new department row.', "INSERT ___ departments (id, name, budget, location) VALUES (99, 'Legal', 500000, 'NYC');", [['INTO']],
      'INSERT INTO table (columns) VALUES (...).', "INSERT INTO departments (id, name, budget, location) VALUES (99, 'Legal', 500000, 'NYC');"),
  ],
  'modifying-data/update': [
    fill('Set every Sales salary to 80000.', "UPDATE employees ___ salary = 80000 WHERE department = 'Sales';", [['SET']],
      'UPDATE table SET column = value WHERE ... .', "UPDATE employees SET salary = 80000 WHERE department = 'Sales';"),
  ],
  'modifying-data/delete': [
    fill('Delete the row with id 999 (scope it with WHERE).', 'DELETE FROM employees ___ id = 999;', [['WHERE']],
      'Without WHERE, DELETE empties the whole table.', 'DELETE FROM employees WHERE id = 999;'),
  ],
  'modifying-data/transactions': [
    fill('Start a transaction before the change.', '___ TRANSACTION; UPDATE employees SET salary = salary + 1 WHERE id = 1; COMMIT;', [['BEGIN']],
      'BEGIN starts it; COMMIT saves, ROLLBACK undoes.', 'BEGIN TRANSACTION; UPDATE employees SET salary = salary + 1 WHERE id = 1; COMMIT;'),
  ],
  'functions/string-functions': [
    fill('Uppercase every employee name.', 'SELECT ___(name) FROM employees;', [['UPPER']],
      'UPPER() returns an uppercase copy.', 'SELECT UPPER(name) FROM employees;'),
  ],
  'functions/date-functions': [
    fill('Pull the 4-digit year out of hire_date.', "SELECT name, strftime(___, hire_date) AS yr FROM employees;", [["'%Y'"]],
      "strftime('%Y', date) formats the year.", "SELECT name, strftime('%Y', hire_date) AS yr FROM employees;"),
  ],
  'functions/math-functions': [
    fill('Round salary to the nearest thousand.', 'SELECT name, ___(salary / 1000.0) * 1000 AS approx FROM employees;', [['ROUND']],
      'ROUND() rounds to the nearest whole number.', 'SELECT name, ROUND(salary / 1000.0) * 1000 AS approx FROM employees;'),
  ],
  'functions/type-casting': [
    fill('Convert salary to a whole integer.', 'SELECT name, ___(salary AS INTEGER) AS sal FROM employees;', [['CAST']],
      'CAST(value AS type) changes the type.', 'SELECT name, CAST(salary AS INTEGER) AS sal FROM employees;'),
  ],
  'functions/coalesce-nullif': [
    fill("Show manager_id as text, or 'none' when NULL.", "SELECT name, ___(CAST(manager_id AS TEXT), 'none') AS mgr FROM employees;", [['COALESCE']],
      'COALESCE returns the first non-NULL argument.', "SELECT name, COALESCE(CAST(manager_id AS TEXT), 'none') AS mgr FROM employees;"),
  ],
  'window-functions/ranking-functions': [
    fill('Number employees by salary, highest first.', 'SELECT name, ___() OVER (ORDER BY salary DESC) AS rn FROM employees;', [['ROW_NUMBER']],
      'ROW_NUMBER() gives a unique 1,2,3 with no ties.', 'SELECT name, ROW_NUMBER() OVER (ORDER BY salary DESC) AS rn FROM employees;'),
  ],
  'window-functions/partition-by': [
    fill('Rank salary within each department.', 'SELECT name, RANK() OVER (___ BY department ORDER BY salary DESC) AS r FROM employees;', [['PARTITION']],
      'PARTITION BY restarts the window per group.', 'SELECT name, RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS r FROM employees;'),
  ],
  'window-functions/lag-lead': [
    fill('Show the previous salary in hire order.', 'SELECT name, ___(salary) OVER (ORDER BY hire_date) AS prev FROM employees;', [['LAG']],
      'LAG looks at the row before; LEAD the row after.', 'SELECT name, LAG(salary) OVER (ORDER BY hire_date) AS prev FROM employees;'),
  ],
  'window-functions/running-totals': [
    fill('Running total of salary by hire date.', 'SELECT name, SUM(salary) ___ (ORDER BY hire_date) AS running FROM employees;', [['OVER']],
      'OVER turns an aggregate into a window calculation.', 'SELECT name, SUM(salary) OVER (ORDER BY hire_date) AS running FROM employees;'),
  ],
  'window-functions/first-last-value': [
    fill('Get the first salary in the hire-ordered window.', 'SELECT name, ___(salary) OVER (ORDER BY hire_date) AS first_sal FROM employees;', [['FIRST_VALUE']],
      'FIRST_VALUE returns the first row of the frame.', 'SELECT name, FIRST_VALUE(salary) OVER (ORDER BY hire_date) AS first_sal FROM employees;'),
  ],
  'database-objects/views': [
    fill('Save a query of high earners as a view.', 'CREATE ___ high_earners AS SELECT name FROM employees WHERE salary >= 100000;', [['VIEW']],
      'A view is a stored SELECT you can query like a table.', 'CREATE VIEW high_earners AS SELECT name FROM employees WHERE salary >= 100000;'),
  ],
  'database-objects/indexes': [
    fill('Index the department column for faster lookups.', 'CREATE ___ idx_dept ON employees(department);', [['INDEX']],
      'CREATE INDEX name ON table(column).', 'CREATE INDEX idx_dept ON employees(department);'),
  ],
  'database-objects/stored-procedures': [
    fill('SQLite has no procedures; the read-only equivalent is a view. Create one.', 'CREATE ___ active_emps AS SELECT name FROM employees;', [['VIEW']],
      'Views package a reusable query, like a read-only procedure.', 'CREATE VIEW active_emps AS SELECT name FROM employees;'),
  ],
  'database-objects/triggers': [
    fill('Make a trigger fire AFTER an insert.', 'CREATE TRIGGER log_ins ___ INSERT ON employees BEGIN SELECT 1; END;', [['AFTER']],
      'Triggers run automatically on the data event you choose.', 'CREATE TRIGGER log_ins AFTER INSERT ON employees BEGIN SELECT 1; END;'),
  ],
  'database-objects/user-defined-functions': [
    fill('Use a built-in function to get each name length.', 'SELECT name, ___(name) AS n FROM employees;', [['LENGTH']],
      'Functions package reusable logic; LENGTH() measures text.', 'SELECT name, LENGTH(name) AS n FROM employees;'),
  ],
  'advanced/recursive-ctes': [
    fill('Generate 1 through 5 with recursion.', 'WITH RECURSIVE n(x) AS (SELECT 1 ___ ALL SELECT x + 1 FROM n WHERE x < 5) SELECT x FROM n;', [['UNION']],
      'UNION ALL joins the anchor row to the recursive step.', 'WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM n WHERE x < 5) SELECT x FROM n;'),
  ],
  'advanced/pivot': [
    fill('Count Sales employees with a CASE pivot (close the CASE).', "SELECT SUM(CASE WHEN department = 'Sales' THEN 1 ELSE 0 ___) AS sales FROM employees;", [['END']],
      'CASE ... END plus SUM pivots rows into a column.', "SELECT SUM(CASE WHEN department = 'Sales' THEN 1 ELSE 0 END) AS sales FROM employees;"),
  ],
  'advanced/query-optimization': [
    fill('See how the engine will run a query.', "___ QUERY PLAN SELECT * FROM employees WHERE department = 'Sales';", [['EXPLAIN']],
      'EXPLAIN QUERY PLAN shows scan vs index use.', "EXPLAIN QUERY PLAN SELECT * FROM employees WHERE department = 'Sales';"),
  ],
  'advanced/real-world-patterns': [
    fill('Keep only the top earner per department (filter the rank).', 'SELECT name FROM (SELECT name, ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn FROM employees) sub WHERE rn = ___;', [['1']],
      'Rank in a subquery, then keep rank 1.', 'SELECT name FROM (SELECT name, ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn FROM employees) sub WHERE rn = 1;'),
  ],
  'school-advanced/stored-procedures': [
    fill('A view is the read-only stand-in for a stored procedure. Create one.', 'CREATE ___ emp_names AS SELECT name FROM employees;', [['VIEW']],
      'Views save a query under a name for reuse.', 'CREATE VIEW emp_names AS SELECT name FROM employees;'),
  ],
  'school-advanced/temp-tables': [
    fill('Stage results in a temporary table.', 'CREATE ___ TABLE scratch AS SELECT name FROM employees;', [['TEMP']],
      'A TEMP table holds intermediate work for the session.', 'CREATE TEMP TABLE scratch AS SELECT name FROM employees;'),
  ],
  'school-advanced/while-loops': [
    fill('SQLite iterates with recursion. Set the stop value to 10.', 'WITH RECURSIVE c(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM c WHERE n < ___) SELECT n FROM c;', [['10']],
      'The WHERE in the recursive step is the loop guard.', 'WITH RECURSIVE c(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM c WHERE n < 10) SELECT n FROM c;'),
  ],
  'school-advanced/user-defined-functions': [
    fill('Reuse a built-in to measure name length.', 'SELECT name, ___(name) AS n FROM employees;', [['LENGTH']],
      'Built-in functions are the portable version of a scalar UDF.', 'SELECT name, LENGTH(name) AS n FROM employees;'),
  ],
  'school-advanced/triggers-advanced': [
    fill('Fire a trigger AFTER an update.', 'CREATE TRIGGER t1 AFTER ___ ON employees BEGIN SELECT 1; END;', [['UPDATE']],
      'Triggers can target INSERT, UPDATE, or DELETE.', 'CREATE TRIGGER t1 AFTER UPDATE ON employees BEGIN SELECT 1; END;'),
  ],
  'school-advanced/dynamic-sql': [
    fill('Build a SQL string by concatenation (join the pieces).', "SELECT 'SELECT * FROM ' ___ 'employees' AS generated;", [['||']],
      '|| concatenates text; dynamic SQL builds a statement as a string.', "SELECT 'SELECT * FROM ' || 'employees' AS generated;"),
  ],
  'school-advanced/xml-sql-server': [
    fill('Wrap each name in tags using string concatenation.', "SELECT '<emp>' ___ name || '</emp>' AS tagged FROM employees;", [['||']],
      'SQLite has no XML type; you assemble markup with ||.', "SELECT '<emp>' || name || '</emp>' AS tagged FROM employees;"),
  ],
  'school-advanced/json-sql-server': [
    fill('Build a JSON object per employee.', "SELECT ___('name', name, 'salary', salary) AS j FROM employees;", [['json_object']],
      'json_object(key, value, ...) builds JSON in SQLite.', "SELECT json_object('name', name, 'salary', salary) AS j FROM employees;"),
  ],
  'school-advanced/indexes-deep-dive': [
    fill('Add a composite index on department then salary.', 'CREATE INDEX idx_ds ON employees(department, ___);', [['salary']],
      'Composite index column order matters for lookups.', 'CREATE INDEX idx_ds ON employees(department, salary);'),
  ],
  'school-advanced/temporal-tables': [
    fill('Find employees hired within a date range.', "SELECT name FROM employees WHERE hire_date ___ '2019-01-01' AND '2020-12-31';", [['BETWEEN']],
      'BETWEEN a AND b is the inclusive range filter.', "SELECT name FROM employees WHERE hire_date BETWEEN '2019-01-01' AND '2020-12-31';"),
  ],
  'set-design/set-operations': [
    fill('Stack department names and locations into one column, no duplicates.', 'SELECT department FROM employees ___ SELECT location FROM departments;', [['UNION']],
      'UNION stacks two same-shape SELECTs and dedupes.', 'SELECT department FROM employees UNION SELECT location FROM departments;'),
  ],
  'set-design/normalization': [
    fill('Link employees to departments on the matching key.', 'SELECT e.name, d.location FROM employees e JOIN departments d ON e.department = d.___;', [['name']],
      'Normalized data is joined back on its keys.', 'SELECT e.name, d.location FROM employees e JOIN departments d ON e.department = d.name;'),
  ],
  'set-design/data-modeling': [
    fill('Select the primary key column that uniquely IDs each employee.', 'SELECT ___ FROM employees;', [['id']],
      'A primary key is unique and never NULL.', 'SELECT id FROM employees;'),
  ],
  'window-advanced/window-frames': [
    fill('Running total of order totals, row by row.', 'SELECT id, SUM(total) OVER (ORDER BY order_date ___ BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running FROM orders;', [['ROWS']],
      'ROWS makes a strict row-by-row running total.', 'SELECT id, SUM(total) OVER (ORDER BY order_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running FROM orders;', 'store'),
  ],
  'window-advanced/window-distribution': [
    fill('Split students into 4 quartiles by GPA.', 'SELECT name, ___(4) OVER (ORDER BY gpa DESC) AS quartile FROM students;', [['NTILE']],
      'NTILE(n) makes n equal-count buckets.', 'SELECT name, NTILE(4) OVER (ORDER BY gpa DESC) AS quartile FROM students;', 'school'),
  ],
  'window-advanced/window-value-functions': [
    fill('First order total in the date-ordered window.', 'SELECT id, ___(total) OVER (ORDER BY order_date) AS first_total FROM orders;', [['FIRST_VALUE']],
      'FIRST_VALUE returns the first row of the frame.', 'SELECT id, FIRST_VALUE(total) OVER (ORDER BY order_date) AS first_total FROM orders;', 'store'),
  ],
  'recursive-queries/recursive-org-chart': [
    fill('Seed a recursive manager walk with the top (no manager).', 'WITH RECURSIVE chain AS (SELECT id, name, manager_id FROM employees WHERE manager_id ___ NULL UNION ALL SELECT e.id, e.name, e.manager_id FROM employees e JOIN chain c ON e.manager_id = c.id) SELECT name FROM chain;', [['IS']],
      'The anchor row starts at employees with no manager.', 'WITH RECURSIVE chain AS (SELECT id, name, manager_id FROM employees WHERE manager_id IS NULL UNION ALL SELECT e.id, e.name, e.manager_id FROM employees e JOIN chain c ON e.manager_id = c.id) SELECT name FROM chain;'),
  ],
  'recursive-queries/recursive-series-tree': [
    fill('Generate the series 1 through 5 (select the running value).', 'WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM n WHERE x < 5) SELECT ___ FROM n;', [['x']],
      'The recursive column carries the series value.', 'WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM n WHERE x < 5) SELECT x FROM n;', 'store'),
  ],
  'performance-indexing/explain-query-plan': [
    fill('Show the plan for a filtered orders query.', "___ QUERY PLAN SELECT * FROM orders WHERE status = 'shipped';", [['EXPLAIN']],
      'EXPLAIN QUERY PLAN reveals scan vs index search.', "EXPLAIN QUERY PLAN SELECT * FROM orders WHERE status = 'shipped';", 'store'),
  ],
  'performance-indexing/indexes-that-help': [
    fill('Index the column orders are filtered/joined on.', 'CREATE ___ idx_oc ON orders(customer_id);', [['INDEX']],
      'Index the columns you filter and join on most.', 'CREATE INDEX idx_oc ON orders(customer_id);', 'store'),
  ],
  'capstone/capstone-customer-value': [
    fill('Total spent per customer.', 'SELECT customer_id, SUM(total) AS spent FROM orders ___ customer_id;', [['GROUP BY']],
      'GROUP BY customer_id sums each customer separately.', 'SELECT customer_id, SUM(total) AS spent FROM orders GROUP BY customer_id;', 'store'),
  ],
  'capstone/capstone-school-report': [
    fill('Average GPA per grade level.', 'SELECT grade_level, AVG(gpa) AS avg_gpa FROM students ___ grade_level;', [['GROUP BY']],
      'Group by grade level, then average within each.', 'SELECT grade_level, AVG(gpa) AS avg_gpa FROM students GROUP BY grade_level;', 'school'),
  ],
  'capstone/capstone-org-analysis': [
    fill('Keep the top earner per department (filter the rank to 1).', 'SELECT name FROM (SELECT name, RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS r FROM employees) sub WHERE r = ___;', [['1']],
      'Rank within department, then keep rank 1.', 'SELECT name FROM (SELECT name, RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS r FROM employees) sub WHERE r = 1;'),
  ],
};
