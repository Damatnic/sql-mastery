// Project Thread definitions - learn and build simultaneously
// Each thread spans multiple modules and gives students a running real-world project

export interface ProjectChallenge {
  id: string;
  threadId: string;
  stepNumber: number;
  title: string;
  scenario: string; // Why this matters for the project
  hint: string;
  expectedColumns: string[];
  validateFn: string;
  solution: string;
  starterCode?: string;
  xpReward: number;
}

export interface ProjectThread {
  id: string;
  title: string;
  description: string;
  scenario: string; // Full scenario context
  database: 'company' | 'store' | 'school';
  databaseLabel: string;
  color: string;
  modules: number[]; // Which modules this thread covers
  totalSteps: number;
  previewDescription: string; // What the finished product looks like
}

// Three project threads - one per module group
export const projectThreads: ProjectThread[] = [
  {
    id: 'company-dashboard',
    title: 'Building a Company Dashboard',
    description: 'Create a complete HR analytics dashboard for Acme Corp',
    scenario: `You just joined Acme Corp as a data analyst. Your manager, Sarah, needs a series of reports for the executive team. Over the next few modules, you'll build queries that power their company dashboard - from basic employee listings to sophisticated payroll analytics.

Each lesson teaches you a concept, and then you apply it immediately to build the next piece of the dashboard.`,
    database: 'company',
    databaseLabel: 'COMPANY_DB',
    color: 'blue',
    modules: [1, 2, 3],
    totalSteps: 15,
    previewDescription: 'A dashboard showing employee directories, department summaries, salary analytics, and aggregated HR metrics.',
  },
  {
    id: 'ecommerce-intelligence',
    title: 'E-Commerce Intelligence Report',
    description: 'Build a weekly sales analytics report for an online store',
    scenario: `Welcome to ShopSmart! You're the new junior analyst on the Business Intelligence team. The marketing director needs a comprehensive weekly sales report that tracks customer behavior, product performance, and revenue trends.

As you learn JOINs, subqueries, and window functions, you'll assemble the complete intelligence report piece by piece.`,
    database: 'store',
    databaseLabel: 'STORE_DB',
    color: 'emerald',
    modules: [4, 5, 6],
    totalSteps: 14,
    previewDescription: 'A sales intelligence report with customer rankings, revenue trends, category performance, and product analytics.',
  },
  {
    id: 'school-analytics',
    title: 'School Performance Analytics',
    description: 'Analyze student and teacher performance for a school district',
    scenario: `Greenfield School District hired you to modernize their analytics. The superintendent wants data-driven insights on student achievement, teacher effectiveness, and course outcomes.

Using advanced SQL techniques, you'll build the analytics platform that helps educators make better decisions.`,
    database: 'school',
    databaseLabel: 'SCHOOL_DB',
    color: 'amber',
    modules: [7, 8, 9],
    totalSteps: 13,
    previewDescription: 'An analytics suite showing student performance trends, teacher metrics, course statistics, and academic rankings.',
  },
];

// Map of lesson key (moduleSlug/lessonSlug) to project challenge
export const projectChallenges: Record<string, ProjectChallenge> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // THREAD 1: COMPANY DASHBOARD (Modules 1-3)
  // ═══════════════════════════════════════════════════════════════════════════

  // Module 1: Getting Started
  'getting-started/select-basics': {
    id: 'pc-1-1',
    threadId: 'company-dashboard',
    stepNumber: 1,
    title: 'Employee Directory - Basic View',
    scenario: `Sarah's first request: "I need a basic employee directory for the dashboard homepage. Start by showing all employee information so we can see what data we have to work with."`,
    hint: 'Use SELECT * to see all available employee data.',
    expectedColumns: ['id', 'name', 'department', 'salary', 'hire_date'],
    validateFn: `return rows.length >= 15 && rows[0].hasOwnProperty('name') && rows[0].hasOwnProperty('salary');`,
    solution: 'SELECT * FROM employees;',
    starterCode: '-- Show all employee data for the directory\nSELECT ',
    xpReward: 50,
  },
  'getting-started/where-filtering': {
    id: 'pc-1-2',
    threadId: 'company-dashboard',
    stepNumber: 2,
    title: 'Engineering Team Roster',
    scenario: `Sarah says: "The VP of Engineering wants a quick view of just their team members. Can you filter the directory to show only Engineering employees with their names and salaries?"`,
    hint: 'Use WHERE to filter by the department column.',
    expectedColumns: ['name', 'salary'],
    validateFn: `return rows.length > 0 && rows.every(r => true) && rows[0].hasOwnProperty('salary');`,
    solution: `SELECT name, salary FROM employees WHERE department = 'Engineering';`,
    starterCode: `-- Show Engineering team members with salaries\nSELECT name, salary\nFROM employees\nWHERE `,
    xpReward: 50,
  },
  'getting-started/order-by': {
    id: 'pc-1-3',
    threadId: 'company-dashboard',
    stepNumber: 3,
    title: 'Salary Leaderboard',
    scenario: `Sarah needs a "Top Earners" widget: "Show me all employees sorted by salary from highest to lowest. Include their department too so execs can see the distribution."`,
    hint: 'Use ORDER BY with DESC to sort highest first.',
    expectedColumns: ['name', 'department', 'salary'],
    validateFn: `return rows.length > 0 && rows[0].salary >= rows[rows.length-1].salary;`,
    solution: `SELECT name, department, salary FROM employees ORDER BY salary DESC;`,
    starterCode: `-- Employee leaderboard sorted by salary (highest first)\nSELECT name, department, salary\nFROM employees\n`,
    xpReward: 50,
  },
  'getting-started/limit-offset': {
    id: 'pc-1-4',
    threadId: 'company-dashboard',
    stepNumber: 4,
    title: 'Top 5 Earners Widget',
    scenario: `Sarah says: "The leaderboard is too long for the dashboard. Let's show just the top 5 highest-paid employees as a compact widget."`,
    hint: 'Add LIMIT 5 after your ORDER BY clause.',
    expectedColumns: ['name', 'department', 'salary'],
    validateFn: `return rows.length === 5 && rows[0].salary >= rows[4].salary;`,
    solution: `SELECT name, department, salary FROM employees ORDER BY salary DESC LIMIT 5;`,
    starterCode: `-- Top 5 earners for the dashboard widget\nSELECT name, department, salary\nFROM employees\nORDER BY salary DESC\n`,
    xpReward: 50,
  },
  'getting-started/distinct': {
    id: 'pc-1-5',
    threadId: 'company-dashboard',
    stepNumber: 5,
    title: 'Department Filter Dropdown',
    scenario: `Sarah wants a dropdown filter on the dashboard: "I need a list of all unique departments so users can filter the employee view. No duplicates!"`,
    hint: 'Use SELECT DISTINCT on the department column.',
    expectedColumns: ['department'],
    validateFn: `const depts = rows.map(r => r.department); return new Set(depts).size === depts.length && depts.length > 0;`,
    solution: `SELECT DISTINCT department FROM employees ORDER BY department;`,
    starterCode: `-- Unique departments for the filter dropdown\n`,
    xpReward: 50,
  },

  // Module 2: Data Analysis Basics
  'data-analysis/and-or-operators': {
    id: 'pc-2-1',
    threadId: 'company-dashboard',
    stepNumber: 6,
    title: 'High-Paid Engineers Alert',
    scenario: `Sarah's building an "attention needed" panel: "Flag employees who are in Engineering AND earn over $95,000. Finance wants to review these salaries."`,
    hint: 'Combine conditions with AND to require both to be true.',
    expectedColumns: ['name', 'department', 'salary'],
    validateFn: `return rows.length > 0 && rows.every(r => r.salary > 95000);`,
    solution: `SELECT name, department, salary FROM employees WHERE department = 'Engineering' AND salary > 95000;`,
    starterCode: `-- Engineering employees earning over $95,000\nSELECT name, department, salary\nFROM employees\nWHERE `,
    xpReward: 50,
  },
  'data-analysis/between-in': {
    id: 'pc-2-2',
    threadId: 'company-dashboard',
    stepNumber: 7,
    title: 'Mid-Tier Salary Report',
    scenario: `HR needs a compensation report: "Show me employees earning between $70,000 and $90,000. This is our mid-tier salary band and we're reviewing for equity."`,
    hint: 'Use BETWEEN for inclusive range checks on salary.',
    expectedColumns: ['name', 'department', 'salary'],
    validateFn: `return rows.length > 0 && rows.every(r => r.salary >= 70000 && r.salary <= 90000);`,
    solution: `SELECT name, department, salary FROM employees WHERE salary BETWEEN 70000 AND 90000 ORDER BY salary;`,
    starterCode: `-- Mid-tier salary band ($70K-$90K)\nSELECT name, department, salary\nFROM employees\nWHERE `,
    xpReward: 50,
  },
  'data-analysis/null-handling': {
    id: 'pc-2-3',
    threadId: 'company-dashboard',
    stepNumber: 8,
    title: 'Projects Missing Deadlines',
    scenario: `The project manager asks: "Which projects don't have a deadline set yet? We need to assign dates to these ASAP. Show the project name and budget."`,
    hint: 'Use IS NULL to find rows where a column has no value.',
    expectedColumns: ['name', 'budget'],
    validateFn: `return rows.length >= 0;`,
    solution: `SELECT name, budget FROM projects WHERE deadline IS NULL;`,
    starterCode: `-- Projects without deadlines\nSELECT name, budget\nFROM projects\nWHERE `,
    xpReward: 50,
  },
  'data-analysis/column-aliases': {
    id: 'pc-2-4',
    threadId: 'company-dashboard',
    stepNumber: 9,
    title: 'Executive-Friendly Labels',
    scenario: `Sarah says: "The executives don't like cryptic column names. Rename 'name' to 'Employee Name', 'department' to 'Team', and 'salary' to 'Annual Compensation' for the report."`,
    hint: 'Use AS to give columns cleaner display names.',
    expectedColumns: ['Employee Name', 'Team', 'Annual Compensation'],
    validateFn: `return rows.length > 0 && rows[0].hasOwnProperty('Employee Name') || rows[0].hasOwnProperty('employee name');`,
    solution: `SELECT name AS "Employee Name", department AS "Team", salary AS "Annual Compensation" FROM employees;`,
    starterCode: `-- Clean column names for executive report\nSELECT \n  name AS "Employee Name",\n  `,
    xpReward: 50,
  },
  'data-analysis/basic-aggregates': {
    id: 'pc-2-5',
    threadId: 'company-dashboard',
    stepNumber: 10,
    title: 'Dashboard Summary Stats',
    scenario: `Sarah needs KPIs for the dashboard header: "Show me the total headcount, average salary, highest salary, and lowest salary. These will be the big numbers at the top of the dashboard."`,
    hint: 'Use COUNT, AVG, MAX, and MIN aggregate functions.',
    expectedColumns: ['headcount', 'avg_salary', 'max_salary', 'min_salary'],
    validateFn: `return rows.length === 1 && rows[0].headcount > 0;`,
    solution: `SELECT COUNT(*) AS headcount, ROUND(AVG(salary), 2) AS avg_salary, MAX(salary) AS max_salary, MIN(salary) AS min_salary FROM employees;`,
    starterCode: `-- Dashboard KPIs: headcount, average/max/min salary\nSELECT\n  COUNT(*) AS headcount,\n  `,
    xpReward: 50,
  },

  // Module 3: Joining Tables
  'joining-tables/inner-join': {
    id: 'pc-3-1',
    threadId: 'company-dashboard',
    stepNumber: 11,
    title: 'Employee-Project Assignments',
    scenario: `The PMO needs visibility: "Show me which employees are assigned to which projects. I need the employee name, project name, and their role on the project."`,
    hint: 'Join employees to employee_projects to projects using the foreign keys.',
    expectedColumns: ['employee_name', 'project_name', 'role'],
    validateFn: `return rows.length > 0 && rows[0].hasOwnProperty('role');`,
    solution: `SELECT e.name AS employee_name, p.name AS project_name, ep.role
FROM employees e
JOIN employee_projects ep ON e.id = ep.employee_id
JOIN projects p ON ep.project_id = p.id
ORDER BY e.name;`,
    starterCode: `-- Employee project assignments with roles\nSELECT e.name AS employee_name, p.name AS project_name, ep.role\nFROM employees e\nJOIN `,
    xpReward: 50,
  },
  'joining-tables/left-join': {
    id: 'pc-3-2',
    threadId: 'company-dashboard',
    stepNumber: 12,
    title: 'Unassigned Employees Report',
    scenario: `Sarah worries about utilization: "Find employees who aren't assigned to ANY project. These people might need work assignments. Show their names and departments."`,
    hint: 'Use LEFT JOIN and filter WHERE the joined column IS NULL.',
    expectedColumns: ['name', 'department'],
    validateFn: `return rows.length >= 0;`,
    solution: `SELECT e.name, e.department
FROM employees e
LEFT JOIN employee_projects ep ON e.id = ep.employee_id
WHERE ep.employee_id IS NULL;`,
    starterCode: `-- Employees not assigned to any project\nSELECT e.name, e.department\nFROM employees e\nLEFT JOIN `,
    xpReward: 50,
  },
  'joining-tables/group-by': {
    id: 'pc-3-3',
    threadId: 'company-dashboard',
    stepNumber: 13,
    title: 'Department Headcount Chart',
    scenario: `Sarah wants a bar chart: "Count how many employees are in each department. This will power the headcount visualization on the dashboard."`,
    hint: 'Use GROUP BY department with COUNT(*).',
    expectedColumns: ['department', 'employee_count'],
    validateFn: `return rows.length === 5 && rows.every(r => r.employee_count > 0);`,
    solution: `SELECT department, COUNT(*) AS employee_count
FROM employees
GROUP BY department
ORDER BY employee_count DESC;`,
    starterCode: `-- Headcount by department\nSELECT department, COUNT(*) AS employee_count\nFROM employees\n`,
    xpReward: 50,
  },
  'joining-tables/having-clause': {
    id: 'pc-3-4',
    threadId: 'company-dashboard',
    stepNumber: 14,
    title: 'Overstaffed Departments Alert',
    scenario: `The COO wants alerts: "Flag departments with more than 5 employees. These might be candidates for restructuring. Show the department and count."`,
    hint: 'Use HAVING to filter groups after aggregation.',
    expectedColumns: ['department', 'employee_count'],
    validateFn: `return rows.length > 0 && rows.every(r => r.employee_count > 5);`,
    solution: `SELECT department, COUNT(*) AS employee_count
FROM employees
GROUP BY department
HAVING COUNT(*) > 5
ORDER BY employee_count DESC;`,
    starterCode: `-- Departments with more than 5 employees\nSELECT department, COUNT(*) AS employee_count\nFROM employees\nGROUP BY department\n`,
    xpReward: 50,
  },
  'joining-tables/multiple-joins': {
    id: 'pc-3-5',
    threadId: 'company-dashboard',
    stepNumber: 15,
    title: 'Complete Dashboard: Payroll by Department',
    scenario: `The final dashboard piece! Sarah says: "Show total payroll cost per department - sum of all salaries. Sort by cost descending. This is the CFO's favorite metric."`,
    hint: 'GROUP BY department with SUM(salary).',
    expectedColumns: ['department', 'total_payroll'],
    validateFn: `return rows.length === 5 && rows[0].total_payroll >= rows[rows.length-1].total_payroll;`,
    solution: `SELECT department, SUM(salary) AS total_payroll
FROM employees
GROUP BY department
ORDER BY total_payroll DESC;`,
    starterCode: `-- Total payroll by department\nSELECT department, SUM(salary) AS total_payroll\nFROM employees\n`,
    xpReward: 50,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // THREAD 2: E-COMMERCE INTELLIGENCE (Modules 4-6)
  // ═══════════════════════════════════════════════════════════════════════════

  // Module 4: Subqueries & CTEs
  'subqueries-ctes/scalar-subqueries': {
    id: 'pc-4-1',
    threadId: 'ecommerce-intelligence',
    stepNumber: 1,
    title: 'Above-Average Orders',
    scenario: `Your first ShopSmart task! The marketing director says: "Find all orders where the total exceeds our average order value. These are our whale customers."`,
    hint: 'Use a subquery in WHERE to calculate the average total.',
    expectedColumns: ['id', 'customer_id', 'total'],
    validateFn: `return rows.length > 0 && rows.every(r => r.total > 100);`,
    solution: `SELECT id, customer_id, total
FROM orders
WHERE total > (SELECT AVG(total) FROM orders)
ORDER BY total DESC;`,
    starterCode: `-- Orders above average value\nSELECT id, customer_id, total\nFROM orders\nWHERE total > `,
    xpReward: 50,
  },
  'subqueries-ctes/in-subqueries': {
    id: 'pc-4-2',
    threadId: 'ecommerce-intelligence',
    stepNumber: 2,
    title: 'Multi-Purchase Customers',
    scenario: `Marketing wants to find repeat buyers: "Show me customers who have placed more than 2 orders. These are candidates for our loyalty program."`,
    hint: 'Use a subquery with GROUP BY and HAVING to find customer_ids with multiple orders.',
    expectedColumns: ['name', 'email'],
    validateFn: `return rows.length > 0;`,
    solution: `SELECT name, email
FROM customers
WHERE id IN (
  SELECT customer_id
  FROM orders
  GROUP BY customer_id
  HAVING COUNT(*) > 2
);`,
    starterCode: `-- Customers with more than 2 orders\nSELECT name, email\nFROM customers\nWHERE id IN (\n  `,
    xpReward: 50,
  },
  'subqueries-ctes/correlated-subqueries': {
    id: 'pc-4-3',
    threadId: 'ecommerce-intelligence',
    stepNumber: 3,
    title: 'Customer Spend vs Category Average',
    scenario: `The analytics team needs comparison data: "For each customer, show their total spending and how it compares to the overall average spend per customer."`,
    hint: 'Use a correlated subquery to calculate each customer\'s total orders.',
    expectedColumns: ['customer_name', 'total_spent'],
    validateFn: `return rows.length > 0;`,
    solution: `SELECT
  c.name AS customer_name,
  (SELECT SUM(total) FROM orders o WHERE o.customer_id = c.id) AS total_spent
FROM customers c
ORDER BY total_spent DESC;`,
    starterCode: `-- Customer spending totals\nSELECT \n  c.name AS customer_name,\n  (SELECT SUM(total) FROM orders o WHERE `,
    xpReward: 50,
  },
  'subqueries-ctes/basic-cte': {
    id: 'pc-4-4',
    threadId: 'ecommerce-intelligence',
    stepNumber: 4,
    title: 'Customer Revenue Tiers',
    scenario: `The director wants customer segmentation: "Use a CTE to calculate total spend per customer, then show customers who spent over $500 as 'VIP' candidates."`,
    hint: 'Define a CTE with customer spending, then query from it with a filter.',
    expectedColumns: ['customer_name', 'total_spent'],
    validateFn: `return rows.length > 0 && rows.every(r => r.total_spent >= 500);`,
    solution: `WITH customer_totals AS (
  SELECT c.id, c.name AS customer_name, SUM(o.total) AS total_spent
  FROM customers c
  JOIN orders o ON c.id = o.customer_id
  GROUP BY c.id, c.name
)
SELECT customer_name, total_spent
FROM customer_totals
WHERE total_spent >= 500
ORDER BY total_spent DESC;`,
    starterCode: `-- VIP customers (spent $500+) using CTE\nWITH customer_totals AS (\n  SELECT c.id, c.name AS customer_name, SUM(o.total) AS total_spent\n  FROM customers c\n  JOIN orders o ON c.id = o.customer_id\n  GROUP BY c.id, c.name\n)\n`,
    xpReward: 50,
  },

  // Module 5: Modifying Data (read-only reports for this thread)
  'modifying-data/insert-basics': {
    id: 'pc-5-1',
    threadId: 'ecommerce-intelligence',
    stepNumber: 5,
    title: 'New Products This Month',
    scenario: `Inventory wants a report: "Show me the most recently added products (highest IDs). Limit to the 5 newest items so we can feature them."`,
    hint: 'ORDER BY id DESC and LIMIT to get newest records.',
    expectedColumns: ['name', 'price', 'category_id'],
    validateFn: `return rows.length === 5;`,
    solution: `SELECT name, price, category_id
FROM products
ORDER BY id DESC
LIMIT 5;`,
    starterCode: `-- 5 most recently added products\nSELECT name, price, category_id\nFROM products\n`,
    xpReward: 50,
  },
  'modifying-data/update-basics': {
    id: 'pc-5-2',
    threadId: 'ecommerce-intelligence',
    stepNumber: 6,
    title: 'Price Audit Report',
    scenario: `Before any price updates, finance needs an audit: "Show me all products with their current prices and category. Flag items over $100 as premium by including them in this view."`,
    hint: 'Simple SELECT with ORDER BY price to see the price distribution.',
    expectedColumns: ['name', 'price', 'category_id'],
    validateFn: `return rows.length > 0 && rows[0].price >= rows[rows.length-1].price;`,
    solution: `SELECT name, price, category_id
FROM products
ORDER BY price DESC;`,
    starterCode: `-- Product price audit (highest first)\nSELECT name, price, category_id\nFROM products\n`,
    xpReward: 50,
  },
  'modifying-data/delete-basics': {
    id: 'pc-5-3',
    threadId: 'ecommerce-intelligence',
    stepNumber: 7,
    title: 'Zero-Order Products Audit',
    scenario: `Before removing any products, we need to identify them: "Find products that have never been ordered. These might be candidates for discontinuation."`,
    hint: 'Use LEFT JOIN with order_items and filter for NULL matches.',
    expectedColumns: ['name', 'price'],
    validateFn: `return rows.length >= 0;`,
    solution: `SELECT p.name, p.price
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
WHERE oi.id IS NULL;`,
    starterCode: `-- Products with zero orders\nSELECT p.name, p.price\nFROM products p\nLEFT JOIN `,
    xpReward: 50,
  },
  'modifying-data/transactions': {
    id: 'pc-5-4',
    threadId: 'ecommerce-intelligence',
    stepNumber: 8,
    title: 'Order Consistency Check',
    scenario: `For data integrity, finance wants verification: "Show orders where the total matches the sum of (quantity * unit_price) from order_items. This validates our transaction consistency."`,
    hint: 'Join orders with aggregated order_items and compare totals.',
    expectedColumns: ['order_id', 'recorded_total', 'calculated_total'],
    validateFn: `return rows.length > 0;`,
    solution: `SELECT
  o.id AS order_id,
  o.total AS recorded_total,
  SUM(oi.quantity * oi.unit_price) AS calculated_total
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.total
ORDER BY o.id;`,
    starterCode: `-- Verify order totals match line items\nSELECT \n  o.id AS order_id,\n  o.total AS recorded_total,\n  `,
    xpReward: 50,
  },

  // Module 6: Functions & Expressions
  'functions/string-functions': {
    id: 'pc-6-1',
    threadId: 'ecommerce-intelligence',
    stepNumber: 9,
    title: 'Customer Name Formatting',
    scenario: `Email team needs formatted data: "Show customer names in UPPERCASE with their email. This is for our marketing email template."`,
    hint: 'Use UPPER() to convert text to uppercase.',
    expectedColumns: ['formatted_name', 'email'],
    validateFn: `return rows.length > 0 && rows[0].formatted_name === rows[0].formatted_name.toUpperCase();`,
    solution: `SELECT UPPER(name) AS formatted_name, email
FROM customers
ORDER BY name;`,
    starterCode: `-- Customer names in uppercase for email\nSELECT UPPER(name) AS formatted_name, email\nFROM customers\n`,
    xpReward: 50,
  },
  'functions/date-functions': {
    id: 'pc-6-2',
    threadId: 'ecommerce-intelligence',
    stepNumber: 10,
    title: 'Monthly Sales Trend',
    scenario: `The CFO wants trend analysis: "Group orders by month and show total revenue per month. This powers our sales trend chart."`,
    hint: 'Use strftime to extract year-month from order_date.',
    expectedColumns: ['month', 'revenue'],
    validateFn: `return rows.length > 0 && rows.every(r => r.revenue > 0);`,
    solution: `SELECT
  strftime('%Y-%m', order_date) AS month,
  SUM(total) AS revenue
FROM orders
GROUP BY strftime('%Y-%m', order_date)
ORDER BY month;`,
    starterCode: `-- Monthly revenue trend\nSELECT \n  strftime('%Y-%m', order_date) AS month,\n  `,
    xpReward: 50,
  },
  'functions/numeric-functions': {
    id: 'pc-6-3',
    threadId: 'ecommerce-intelligence',
    stepNumber: 11,
    title: 'Rounded Price Display',
    scenario: `The merchandising team needs clean numbers: "Show products with prices rounded to the nearest dollar, and calculate a 15% discount price also rounded."`,
    hint: 'Use ROUND() for both the regular price and the calculated discount.',
    expectedColumns: ['name', 'original_price', 'sale_price'],
    validateFn: `return rows.length > 0 && rows.every(r => Number.isInteger(r.original_price));`,
    solution: `SELECT
  name,
  ROUND(price) AS original_price,
  ROUND(price * 0.85) AS sale_price
FROM products
ORDER BY price DESC;`,
    starterCode: `-- Products with rounded prices and 15% discount\nSELECT \n  name,\n  ROUND(price) AS original_price,\n  `,
    xpReward: 50,
  },
  'functions/case-expressions': {
    id: 'pc-6-4',
    threadId: 'ecommerce-intelligence',
    stepNumber: 12,
    title: 'Customer Spending Tiers',
    scenario: `Marketing needs segmentation: "Categorize each customer as 'Bronze' (under $300), 'Silver' ($300-$700), or 'Gold' (over $700) based on their total spend."`,
    hint: 'Use CASE WHEN to assign tier labels based on spending thresholds.',
    expectedColumns: ['customer_name', 'total_spent', 'tier'],
    validateFn: `return rows.length > 0 && rows.every(r => ['Bronze', 'Silver', 'Gold'].includes(r.tier));`,
    solution: `SELECT
  c.name AS customer_name,
  SUM(o.total) AS total_spent,
  CASE
    WHEN SUM(o.total) > 700 THEN 'Gold'
    WHEN SUM(o.total) >= 300 THEN 'Silver'
    ELSE 'Bronze'
  END AS tier
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
ORDER BY total_spent DESC;`,
    starterCode: `-- Customer spending tiers\nSELECT \n  c.name AS customer_name,\n  SUM(o.total) AS total_spent,\n  CASE\n    `,
    xpReward: 50,
  },
  'functions/coalesce-nullif': {
    id: 'pc-6-5',
    threadId: 'ecommerce-intelligence',
    stepNumber: 14,
    title: 'Complete Intelligence Report',
    scenario: `Final report! Show products with their category name (or 'Uncategorized' if null), price, and a calculated 'value score'. This completes the Intelligence Report."`,
    hint: 'Use COALESCE to provide default values for NULLs.',
    expectedColumns: ['product_name', 'category', 'price'],
    validateFn: `return rows.length > 0;`,
    solution: `SELECT
  p.name AS product_name,
  COALESCE(cat.name, 'Uncategorized') AS category,
  p.price
FROM products p
LEFT JOIN categories cat ON p.category_id = cat.id
ORDER BY p.price DESC;`,
    starterCode: `-- Products with category (default to 'Uncategorized')\nSELECT \n  p.name AS product_name,\n  COALESCE(`,
    xpReward: 50,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // THREAD 3: SCHOOL ANALYTICS (Modules 7-9)
  // ═══════════════════════════════════════════════════════════════════════════

  // Module 7: Window Functions
  'window-functions/intro-window': {
    id: 'pc-7-1',
    threadId: 'school-analytics',
    stepNumber: 1,
    title: 'Student GPA with Class Average',
    scenario: `Welcome to Greenfield Schools! The principal asks: "Show each student's GPA alongside the overall class average. I want to see how individuals compare to the group."`,
    hint: 'Use AVG() as a window function with OVER() to include the average on each row.',
    expectedColumns: ['name', 'gpa', 'class_average'],
    validateFn: `return rows.length > 0 && rows.every(r => r.class_average === rows[0].class_average);`,
    solution: `SELECT
  name,
  gpa,
  ROUND(AVG(gpa) OVER(), 2) AS class_average
FROM students
ORDER BY gpa DESC;`,
    starterCode: `-- Student GPA with class average\nSELECT \n  name,\n  gpa,\n  ROUND(AVG(gpa) OVER(), 2) AS class_average\nFROM students\n`,
    xpReward: 50,
  },
  'window-functions/row-number': {
    id: 'pc-7-2',
    threadId: 'school-analytics',
    stepNumber: 2,
    title: 'Student GPA Rankings',
    scenario: `The dean needs rankings: "Rank all students by GPA from highest to lowest. Assign a rank number to each student."`,
    hint: 'Use ROW_NUMBER() with ORDER BY gpa DESC.',
    expectedColumns: ['rank', 'name', 'gpa'],
    validateFn: `return rows.length > 0 && rows[0].rank === 1;`,
    solution: `SELECT
  ROW_NUMBER() OVER(ORDER BY gpa DESC) AS rank,
  name,
  gpa
FROM students;`,
    starterCode: `-- Student GPA rankings\nSELECT \n  ROW_NUMBER() OVER(`,
    xpReward: 50,
  },
  'window-functions/rank-dense-rank': {
    id: 'pc-7-3',
    threadId: 'school-analytics',
    stepNumber: 3,
    title: 'Course Enrollment Rankings',
    scenario: `Administration wants to know: "Rank courses by enrollment count. Use DENSE_RANK so tied courses get the same rank."`,
    hint: 'Join enrollments with courses, count enrollments, and use DENSE_RANK.',
    expectedColumns: ['course_name', 'enrollment_count', 'rank'],
    validateFn: `return rows.length > 0;`,
    solution: `SELECT
  c.name AS course_name,
  COUNT(e.id) AS enrollment_count,
  DENSE_RANK() OVER(ORDER BY COUNT(e.id) DESC) AS rank
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
GROUP BY c.id, c.name
ORDER BY rank;`,
    starterCode: `-- Course enrollment rankings\nSELECT \n  c.name AS course_name,\n  COUNT(e.id) AS enrollment_count,\n  DENSE_RANK() OVER(`,
    xpReward: 50,
  },
  'window-functions/partition-by': {
    id: 'pc-7-4',
    threadId: 'school-analytics',
    stepNumber: 4,
    title: 'Top Students Per Grade Level',
    scenario: `Each grade's counselor wants to recognize achievers: "Rank students by GPA within their grade level. Show the top 3 per grade."`,
    hint: 'Use PARTITION BY grade with ROW_NUMBER, then filter in a subquery.',
    expectedColumns: ['grade', 'name', 'gpa', 'rank'],
    validateFn: `return rows.length > 0 && rows.every(r => r.rank <= 3);`,
    solution: `SELECT grade, name, gpa, rank
FROM (
  SELECT
    grade,
    name,
    gpa,
    ROW_NUMBER() OVER(PARTITION BY grade ORDER BY gpa DESC) AS rank
  FROM students
) ranked
WHERE rank <= 3
ORDER BY grade, rank;`,
    starterCode: `-- Top 3 students per grade level\nSELECT grade, name, gpa, rank\nFROM (\n  SELECT \n    grade,\n    name,\n    gpa,\n    ROW_NUMBER() OVER(`,
    xpReward: 50,
  },
  'window-functions/lead-lag': {
    id: 'pc-7-5',
    threadId: 'school-analytics',
    stepNumber: 5,
    title: 'GPA Gap Analysis',
    scenario: `Admissions wants trend data: "For each student ranked by GPA, show the GPA of the next student below them. This helps us see the gaps between students."`,
    hint: 'Use LEAD() to peek at the next row\'s value.',
    expectedColumns: ['name', 'gpa', 'next_gpa'],
    validateFn: `return rows.length > 0;`,
    solution: `SELECT
  name,
  gpa,
  LEAD(gpa) OVER(ORDER BY gpa DESC) AS next_gpa
FROM students
ORDER BY gpa DESC;`,
    starterCode: `-- Student GPA with next student's GPA\nSELECT \n  name,\n  gpa,\n  LEAD(gpa) OVER(`,
    xpReward: 50,
  },

  // Module 8: Database Objects
  'database-objects/views-intro': {
    id: 'pc-8-1',
    threadId: 'school-analytics',
    stepNumber: 6,
    title: 'Student Performance Summary',
    scenario: `Create a reusable query: "Build a summary showing each student with their course count and average grade value (A=4, B=3, etc). This will be used across multiple reports."`,
    hint: 'Use CASE to convert letter grades to numbers, then aggregate.',
    expectedColumns: ['student_name', 'course_count', 'avg_grade'],
    validateFn: `return rows.length > 0 && rows.every(r => r.course_count > 0);`,
    solution: `SELECT
  s.name AS student_name,
  COUNT(e.course_id) AS course_count,
  ROUND(AVG(CASE
    WHEN e.grade = 'A' THEN 4
    WHEN e.grade = 'B' THEN 3
    WHEN e.grade = 'C' THEN 2
    WHEN e.grade = 'D' THEN 1
    ELSE 0
  END), 2) AS avg_grade
FROM students s
JOIN enrollments e ON s.id = e.student_id
GROUP BY s.id, s.name
ORDER BY avg_grade DESC;`,
    starterCode: `-- Student performance summary\nSELECT \n  s.name AS student_name,\n  COUNT(e.course_id) AS course_count,\n  ROUND(AVG(CASE \n    `,
    xpReward: 50,
  },
  'database-objects/indexes': {
    id: 'pc-8-2',
    threadId: 'school-analytics',
    stepNumber: 7,
    title: 'Course Search Optimization',
    scenario: `IT needs to understand query patterns: "Show courses filtered by department. This query runs thousands of times daily and we want to ensure it's optimized."`,
    hint: 'A simple filtered query that would benefit from an index on department.',
    expectedColumns: ['name', 'department', 'credits'],
    validateFn: `return rows.length > 0;`,
    solution: `SELECT name, department, credits
FROM courses
WHERE department = 'Computer Science'
ORDER BY name;`,
    starterCode: `-- Courses by department (frequently queried)\nSELECT name, department, credits\nFROM courses\nWHERE `,
    xpReward: 50,
  },
  'database-objects/constraints': {
    id: 'pc-8-3',
    threadId: 'school-analytics',
    stepNumber: 8,
    title: 'Data Integrity Audit',
    scenario: `Before adding constraints, audit the data: "Find any enrollments that reference non-existent students or courses. These would violate foreign key constraints."`,
    hint: 'Use LEFT JOINs and check for NULL matches to find orphaned records.',
    expectedColumns: ['enrollment_id', 'student_id', 'course_id'],
    validateFn: `return rows.length >= 0;`,
    solution: `SELECT e.id AS enrollment_id, e.student_id, e.course_id
FROM enrollments e
LEFT JOIN students s ON e.student_id = s.id
LEFT JOIN courses c ON e.course_id = c.id
WHERE s.id IS NULL OR c.id IS NULL;`,
    starterCode: `-- Find orphaned enrollment records\nSELECT e.id AS enrollment_id, e.student_id, e.course_id\nFROM enrollments e\nLEFT JOIN `,
    xpReward: 50,
  },
  'database-objects/temp-tables': {
    id: 'pc-8-4',
    threadId: 'school-analytics',
    stepNumber: 9,
    title: 'Department Statistics Snapshot',
    scenario: `For the annual report, create summary statistics: "Show each department with their course count, total enrolled students, and average credits per course."`,
    hint: 'Join courses with enrollments, group by department.',
    expectedColumns: ['department', 'course_count', 'total_enrollments', 'avg_credits'],
    validateFn: `return rows.length > 0;`,
    solution: `SELECT
  c.department,
  COUNT(DISTINCT c.id) AS course_count,
  COUNT(e.id) AS total_enrollments,
  ROUND(AVG(c.credits), 1) AS avg_credits
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
GROUP BY c.department
ORDER BY total_enrollments DESC;`,
    starterCode: `-- Department statistics\nSELECT \n  c.department,\n  COUNT(DISTINCT c.id) AS course_count,\n  `,
    xpReward: 50,
  },
  'database-objects/schema-design': {
    id: 'pc-8-5',
    threadId: 'school-analytics',
    stepNumber: 10,
    title: 'Teacher Workload Analysis',
    scenario: `HR needs workload data: "Show each teacher with their course count and total enrolled students. Identify who might be overloaded."`,
    hint: 'Join teachers to courses to enrollments, aggregate by teacher.',
    expectedColumns: ['teacher_name', 'course_count', 'total_students'],
    validateFn: `return rows.length > 0;`,
    solution: `SELECT
  t.name AS teacher_name,
  COUNT(DISTINCT c.id) AS course_count,
  COUNT(e.id) AS total_students
FROM teachers t
LEFT JOIN courses c ON t.id = c.teacher_id
LEFT JOIN enrollments e ON c.id = e.course_id
GROUP BY t.id, t.name
ORDER BY total_students DESC;`,
    starterCode: `-- Teacher workload analysis\nSELECT \n  t.name AS teacher_name,\n  COUNT(DISTINCT c.id) AS course_count,\n  `,
    xpReward: 50,
  },

  // Module 9: SQL Server Advanced
  'advanced/stored-procedures': {
    id: 'pc-9-1',
    threadId: 'school-analytics',
    stepNumber: 11,
    title: 'Grade Distribution Report',
    scenario: `The academic committee needs a report: "Show the distribution of grades across all courses. Count how many A's, B's, C's, etc. were given."`,
    hint: 'Group by grade and count occurrences.',
    expectedColumns: ['grade', 'count'],
    validateFn: `return rows.length > 0 && rows.every(r => r.count > 0);`,
    solution: `SELECT
  grade,
  COUNT(*) AS count
FROM enrollments
WHERE grade IS NOT NULL
GROUP BY grade
ORDER BY grade;`,
    starterCode: `-- Grade distribution across all courses\nSELECT \n  grade,\n  COUNT(*) AS count\nFROM enrollments\n`,
    xpReward: 50,
  },
  'advanced/triggers': {
    id: 'pc-9-2',
    threadId: 'school-analytics',
    stepNumber: 12,
    title: 'Enrollment Audit Trail Prep',
    scenario: `Before implementing triggers, we need baseline data: "Show the most recent enrollments with student and course details. This helps us design the audit trail."`,
    hint: 'Join all three tables and order by enrollment ID descending.',
    expectedColumns: ['enrollment_id', 'student_name', 'course_name', 'grade'],
    validateFn: `return rows.length > 0;`,
    solution: `SELECT
  e.id AS enrollment_id,
  s.name AS student_name,
  c.name AS course_name,
  e.grade
FROM enrollments e
JOIN students s ON e.student_id = s.id
JOIN courses c ON e.course_id = c.id
ORDER BY e.id DESC
LIMIT 10;`,
    starterCode: `-- Recent enrollments for audit design\nSELECT \n  e.id AS enrollment_id,\n  s.name AS student_name,\n  c.name AS course_name,\n  `,
    xpReward: 50,
  },
  'advanced/optimization': {
    id: 'pc-9-3',
    threadId: 'school-analytics',
    stepNumber: 13,
    title: 'Complete Analytics: Performance Dashboard',
    scenario: `Final project! Build the complete performance dashboard showing: student rankings by GPA with percentile, course popularity, and whether each student is above or below average."`,
    hint: 'Use window functions for ranking and comparison to average.',
    expectedColumns: ['student_name', 'gpa', 'rank', 'percentile', 'vs_average'],
    validateFn: `return rows.length > 0 && rows[0].rank === 1;`,
    solution: `SELECT
  name AS student_name,
  gpa,
  ROW_NUMBER() OVER(ORDER BY gpa DESC) AS rank,
  ROUND(PERCENT_RANK() OVER(ORDER BY gpa) * 100, 1) AS percentile,
  CASE
    WHEN gpa > (SELECT AVG(gpa) FROM students) THEN 'Above Average'
    WHEN gpa < (SELECT AVG(gpa) FROM students) THEN 'Below Average'
    ELSE 'Average'
  END AS vs_average
FROM students
ORDER BY rank;`,
    starterCode: `-- Complete student performance dashboard\nSELECT \n  name AS student_name,\n  gpa,\n  ROW_NUMBER() OVER(ORDER BY gpa DESC) AS rank,\n  `,
    xpReward: 50,
  },
  'advanced/security': {
    id: 'pc-9-4',
    threadId: 'school-analytics',
    stepNumber: 13,
    title: 'Student Privacy Report',
    scenario: `For FERPA compliance, create a report that masks sensitive data: "Show students with their grade level and GPA tier (High/Medium/Low) but NOT their actual GPA values."`,
    hint: 'Use CASE to convert GPA to tiers, hiding the raw number.',
    expectedColumns: ['name', 'grade', 'gpa_tier'],
    validateFn: `return rows.length > 0 && rows.every(r => ['High', 'Medium', 'Low'].includes(r.gpa_tier));`,
    solution: `SELECT
  name,
  grade,
  CASE
    WHEN gpa >= 3.5 THEN 'High'
    WHEN gpa >= 2.5 THEN 'Medium'
    ELSE 'Low'
  END AS gpa_tier
FROM students
ORDER BY grade, name;`,
    starterCode: `-- Privacy-compliant student report (no raw GPA)\nSELECT \n  name,\n  grade,\n  CASE \n    `,
    xpReward: 50,
  },
};

// Helper functions

/**
 * Get a project thread by ID
 */
export function getProjectThread(threadId: string): ProjectThread | null {
  return projectThreads.find(t => t.id === threadId) || null;
}

/**
 * Get project thread by module number
 */
export function getThreadForModule(moduleNumber: number): ProjectThread | null {
  return projectThreads.find(t => t.modules.includes(moduleNumber)) || null;
}

/**
 * Get project challenge for a lesson
 */
export function getProjectChallengeForLesson(moduleSlug: string, lessonSlug: string): ProjectChallenge | null {
  const key = `${moduleSlug}/${lessonSlug}`;
  return projectChallenges[key] || null;
}

/**
 * Get all challenges for a thread
 */
export function getThreadChallenges(threadId: string): ProjectChallenge[] {
  return Object.values(projectChallenges)
    .filter(c => c.threadId === threadId)
    .sort((a, b) => a.stepNumber - b.stepNumber);
}

/**
 * Get thread color classes
 */
export function getThreadColors(color: string): { bg: string; border: string; text: string; accent: string } {
  const colorMap: Record<string, { bg: string; border: string; text: string; accent: string }> = {
    blue: { bg: 'bg-blue-900/20', border: 'border-blue-700/50', text: 'text-blue-400', accent: 'bg-blue-500' },
    emerald: { bg: 'bg-emerald-900/20', border: 'border-emerald-700/50', text: 'text-emerald-400', accent: 'bg-emerald-500' },
    amber: { bg: 'bg-amber-900/20', border: 'border-amber-700/50', text: 'text-amber-400', accent: 'bg-amber-500' },
  };
  return colorMap[color] || colorMap.blue;
}
