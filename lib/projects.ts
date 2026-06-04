// Project definitions for guided SQL projects

export interface ProjectStep {
  id: string;
  title: string;
  description: string;
  context: string;
  hint: string;
  expectedColumns: string[];
  validateFn: string;
  solution: string;
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  database: 'company' | 'store' | 'school';
  databaseLabel: string;
  color: string;
  steps: ProjectStep[];
}

export const projects: Project[] = [
  {
    slug: 'hr-analytics',
    title: 'HR Analytics Report',
    description: 'Write queries to analyze employee salaries, department payroll, and who earns above average in their own department. The last two steps use window functions (the Window Functions module), so save this one for after you reach them.',
    difficulty: 'Advanced',
    estimatedTime: '~30 min',
    database: 'company',
    databaseLabel: 'COMPANY_DB',
    color: 'indigo',
    steps: [
      {
        id: 'hr-step-1',
        title: 'List Employees with Departments',
        description: 'Start by retrieving all employees along with their department information.',
        context: 'Start simple: pull every employee with their department. You\'ll build on this result in later steps.',
        hint: 'Use SELECT to retrieve the name and department columns from the employees table.',
        expectedColumns: ['name', 'department'],
        validateFn: `
          if (values.length < 15) return false;
          const hasRequiredCols = columns.map(c => c.toLowerCase()).includes('name') &&
                                   columns.map(c => c.toLowerCase()).includes('department');
          return hasRequiredCols;
        `,
        solution: 'SELECT name, department FROM employees;',
      },
      {
        id: 'hr-step-2',
        title: 'Average Salary by Department',
        description: 'Calculate the average salary for each department to understand compensation across the organization.',
        context: 'How much does the average Engineering employee make vs. Sales? Group by department and calculate the average. Round the numbers so they\'re readable.',
        hint: 'Use GROUP BY with AVG() function. Consider using ROUND() for cleaner numbers.',
        expectedColumns: ['department', 'avg_salary'],
        validateFn: `
          if (values.length !== 5) return false;
          const deptIdx = columns.map(c => c.toLowerCase()).indexOf('department');
          const avgIdx = columns.findIndex(c => c.toLowerCase().includes('avg') || c.toLowerCase().includes('salary'));
          if (deptIdx === -1 || avgIdx === -1) return false;
          const engRow = values.find(r => r[deptIdx] === 'Engineering');
          return engRow && engRow[avgIdx] > 90000;
        `,
        solution: 'SELECT department, ROUND(AVG(salary), 2) AS avg_salary FROM employees GROUP BY department;',
      },
      {
        id: 'hr-step-3',
        title: 'Employees Above Department Average',
        description: 'Find employees who earn more than their department average.',
        context: 'Find employees who out-earn their own department\'s average, not the company average. A correlated subquery works here: for each employee, compare their salary to the average of rows with the same department.',
        hint: 'Use a subquery in the WHERE clause that calculates the average salary for the same department as each employee.',
        expectedColumns: ['name', 'department', 'salary'],
        validateFn: `
          if (values.length < 5) return false;
          const nameIdx = columns.map(c => c.toLowerCase()).indexOf('name');
          const names = values.map(r => r[nameIdx]);
          return names.includes('Sarah Chen') && names.includes('Kevin Moore');
        `,
        solution: `SELECT name, department, salary
FROM employees e1
WHERE salary > (
  SELECT AVG(salary)
  FROM employees e2
  WHERE e2.department = e1.department
)
ORDER BY department, salary DESC;`,
      },
      {
        id: 'hr-step-4',
        title: 'Rank Employees by Salary Within Department',
        description: 'Use window functions to rank employees by salary within their department.',
        context: 'Rank each employee within their department by salary. ROW_NUMBER() gives unique ranks even for ties. RANK() gives tied employees the same number and skips the next. Pick whichever makes sense.',
        hint: 'Use ROW_NUMBER() or RANK() with PARTITION BY department and ORDER BY salary DESC.',
        expectedColumns: ['name', 'department', 'salary', 'rank'],
        validateFn: `
          const rankIdx = columns.findIndex(c => c.toLowerCase().includes('rank') || c.toLowerCase().includes('row'));
          if (rankIdx === -1) return false;
          const deptIdx = columns.map(c => c.toLowerCase()).indexOf('department');
          const engRows = values.filter(r => r[deptIdx] === 'Engineering');
          return engRows.length >= 6 && engRows.some(r => r[rankIdx] === 1);
        `,
        solution: `SELECT
  name,
  department,
  salary,
  RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS rank
FROM employees
ORDER BY department, rank;`,
      },
      {
        id: 'hr-step-5',
        title: 'Top Earner in Each Department',
        description: 'Find the highest-paid employee in each department.',
        context: 'One row per department, showing the highest-paid person in each. Take your ranking query from the previous step and filter it down to rank = 1.',
        hint: 'Wrap your ranking query in a CTE or subquery, then filter WHERE rank = 1.',
        expectedColumns: ['name', 'department', 'salary'],
        validateFn: `
          if (values.length !== 5) return false;
          const deptIdx = columns.map(c => c.toLowerCase()).indexOf('department');
          const nameIdx = columns.map(c => c.toLowerCase()).indexOf('name');
          const departments = values.map(r => r[deptIdx]);
          const uniqueDepts = [...new Set(departments)];
          if (uniqueDepts.length !== 5) return false;
          const names = values.map(r => r[nameIdx]);
          return names.includes('Sarah Chen') && names.includes('Robert Taylor');
        `,
        solution: `WITH ranked AS (
  SELECT
    name,
    department,
    salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS rank
  FROM employees
)
SELECT name, department, salary
FROM ranked
WHERE rank = 1
ORDER BY salary DESC;`,
      },
    ],
  },
  {
    slug: 'sales-dashboard',
    title: 'E-Commerce Sales Dashboard',
    description: 'Analyze customer orders, revenue by month, top spenders, and products that never sold. Covers JOINs, aggregation, date functions, and LEFT JOIN patterns.',
    difficulty: 'Intermediate',
    estimatedTime: '~35 min',
    database: 'store',
    databaseLabel: 'STORE_DB',
    color: 'emerald',
    steps: [
      {
        id: 'sales-step-1',
        title: 'List Orders with Customer Names',
        description: 'Join orders with customers to see who placed each order.',
        context: 'The orders table has customer IDs but no names. Join it to the customers table to get readable output. Order by date descending so the most recent show first.',
        hint: 'Use JOIN to connect orders and customers tables on customer_id.',
        expectedColumns: ['order_id', 'customer_name', 'order_date', 'total'],
        validateFn: `
          if (values.length < 20) return false;
          const hasId = columns.some(c => c.toLowerCase().includes('order') && c.toLowerCase().includes('id'));
          const hasName = columns.some(c => c.toLowerCase().includes('name') || c.toLowerCase().includes('customer'));
          return hasId && hasName;
        `,
        solution: `SELECT
  o.id AS order_id,
  c.name AS customer_name,
  o.order_date,
  o.total
FROM orders o
JOIN customers c ON o.customer_id = c.id
ORDER BY o.order_date DESC;`,
      },
      {
        id: 'sales-step-2',
        title: 'Total Revenue per Customer',
        description: 'Calculate the total amount each customer has spent.',
        context: 'Sum up each customer\'s total spending across all orders. You\'ll need to join and aggregate. Who\'s spending the most?',
        hint: 'Use GROUP BY customer with SUM() on the order totals.',
        expectedColumns: ['customer_name', 'total_spent'],
        validateFn: `
          if (values.length < 10) return false;
          const nameIdx = columns.findIndex(c => c.toLowerCase().includes('name') || c.toLowerCase().includes('customer'));
          const totalIdx = columns.findIndex(c => c.toLowerCase().includes('total') || c.toLowerCase().includes('spent') || c.toLowerCase().includes('revenue'));
          if (nameIdx === -1 || totalIdx === -1) return false;
          const johnRow = values.find(r => r[nameIdx] && r[nameIdx].includes('John Smith'));
          return johnRow && johnRow[totalIdx] > 1500;
        `,
        solution: `SELECT
  c.name AS customer_name,
  SUM(o.total) AS total_spent
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
ORDER BY total_spent DESC;`,
      },
      {
        id: 'sales-step-3',
        title: 'Top 5 Customers by Revenue',
        description: 'Find the top 5 customers who have spent the most.',
        context: 'Same query as before, but cut it to just the top 5 spenders. Sort descending and LIMIT.',
        hint: 'Add ORDER BY total_spent DESC and LIMIT 5 to your query.',
        expectedColumns: ['customer_name', 'total_spent'],
        validateFn: `
          if (values.length !== 5) return false;
          const nameIdx = columns.findIndex(c => c.toLowerCase().includes('name'));
          const totalIdx = columns.findIndex(c => c.toLowerCase().includes('total') || c.toLowerCase().includes('spent'));
          if (nameIdx === -1 || totalIdx === -1) return false;
          // top 5, sorted descending: first row's spend is the highest
          return values[0][totalIdx] >= values[values.length - 1][totalIdx];
        `,
        solution: `SELECT
  c.name AS customer_name,
  SUM(o.total) AS total_spent
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
ORDER BY total_spent DESC
LIMIT 5;`,
      },
      {
        id: 'sales-step-4',
        title: 'Monthly Revenue Trend',
        description: 'Show revenue grouped by month to identify trends.',
        context: 'Group all orders by year-month and sum the revenue for each. Use strftime to pull the year-month out of order_date.',
        hint: 'Use strftime to extract year-month from order_date, then GROUP BY that value.',
        expectedColumns: ['month', 'revenue'],
        validateFn: `
          if (values.length < 4) return false;
          const monthIdx = columns.findIndex(c => c.toLowerCase().includes('month') || c.toLowerCase().includes('date'));
          const revIdx = columns.findIndex(c => c.toLowerCase().includes('rev') || c.toLowerCase().includes('total'));
          if (monthIdx === -1 || revIdx === -1) return false;
          return values.every(r => r[monthIdx] && r[revIdx] > 0);
        `,
        solution: `SELECT
  strftime('%Y-%m', order_date) AS month,
  SUM(total) AS revenue
FROM orders
GROUP BY strftime('%Y-%m', order_date)
ORDER BY month;`,
      },
      {
        id: 'sales-step-5',
        title: 'Lowest-Selling Products',
        description: 'Find the 5 products with the fewest total units sold.',
        context: 'A LEFT JOIN from products to order_items keeps products that have no sales at all; COALESCE the summed quantity to 0 so they count as zero, then sort ascending to surface the weakest sellers.',
        hint: 'LEFT JOIN order_items, COALESCE(SUM(quantity), 0) AS units_sold, GROUP BY the product, ORDER BY units_sold ASC, LIMIT 5.',
        expectedColumns: ['product_name', 'units_sold'],
        validateFn: `
          const nameIdx = columns.findIndex(c => c.toLowerCase().includes('name') || c.toLowerCase().includes('product'));
          if (nameIdx === -1) return false;
          return values.length === 5;
        `,
        solution: `SELECT p.name AS product_name, COALESCE(SUM(oi.quantity), 0) AS units_sold
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name
ORDER BY units_sold ASC
LIMIT 5;`,
      },
      {
        id: 'sales-step-6',
        title: 'Category Revenue Share',
        description: 'Calculate what percentage of total revenue each product category generates.',
        context: 'Calculate total revenue per category, then divide by company-wide revenue to get each category\'s share as a percentage. A subquery in the SELECT or a CTE both work.',
        hint: 'Use a subquery or window function to get total revenue, then divide each category\'s revenue by it.',
        expectedColumns: ['category', 'revenue', 'percentage'],
        validateFn: `
          if (values.length < 2) return false;
          const catIdx = columns.findIndex(c => c.toLowerCase().includes('cat'));
          const pctIdx = columns.findIndex(c => c.toLowerCase().includes('pct') || c.toLowerCase().includes('percent') || c.toLowerCase().includes('share'));
          if (catIdx === -1) return false;
          const revIdx = columns.findIndex(c => c.toLowerCase().includes('rev'));
          return revIdx !== -1 && values.every(r => r[revIdx] > 0);
        `,
        solution: `SELECT
  cat.name AS category,
  SUM(oi.quantity * oi.unit_price) AS revenue,
  ROUND(
    100.0 * SUM(oi.quantity * oi.unit_price) /
    (SELECT SUM(quantity * unit_price) FROM order_items),
    2
  ) AS percentage
FROM categories cat
JOIN products p ON p.category_id = cat.id
JOIN order_items oi ON oi.product_id = p.id
GROUP BY cat.id, cat.name
ORDER BY revenue DESC;`,
      },
    ],
  },
  {
    slug: 'academic-review',
    title: 'Academic Performance Review',
    description: 'Query a school database to look at enrollment, GPA by teacher, and courses where no one got an A. Good practice for multi-table JOINs.',
    difficulty: 'Beginner',
    estimatedTime: '~25 min',
    database: 'school',
    databaseLabel: 'SCHOOL_DB',
    color: 'amber',
    steps: [
      {
        id: 'academic-step-1',
        title: 'Students with Enrolled Courses',
        description: 'List all students along with the courses they are enrolled in.',
        context: 'Enrollments is the junction table between students and courses. Join all three to get student names alongside course names.',
        hint: 'Join students -> enrollments -> courses using the foreign keys student_id and course_id.',
        expectedColumns: ['student_name', 'course_name'],
        validateFn: `
          if (values.length < 30) return false;
          const studentIdx = columns.findIndex(c => c.toLowerCase().includes('student'));
          const courseIdx = columns.findIndex(c => c.toLowerCase().includes('course'));
          return studentIdx !== -1 && courseIdx !== -1;
        `,
        solution: `SELECT
  s.name AS student_name,
  c.name AS course_name
FROM students s
JOIN enrollments e ON s.id = e.student_id
JOIN courses c ON e.course_id = c.id
ORDER BY s.name, c.name;`,
      },
      {
        id: 'academic-step-2',
        title: 'Course Count per Student',
        description: 'Count how many courses each student is taking.',
        context: 'Count how many courses each student is taking. GROUP BY student and COUNT enrollments.',
        hint: 'Use GROUP BY student with COUNT() on the enrollments.',
        expectedColumns: ['student_name', 'course_count'],
        validateFn: `
          if (values.length !== 20) return false;
          const countIdx = columns.findIndex(c => c.toLowerCase().includes('count') || c.toLowerCase().includes('courses'));
          if (countIdx === -1) return false;
          return values.every(r => r[countIdx] >= 1 && r[countIdx] <= 5);
        `,
        solution: `SELECT
  s.name AS student_name,
  COUNT(e.course_id) AS course_count
FROM students s
JOIN enrollments e ON s.id = e.student_id
GROUP BY s.id, s.name
ORDER BY course_count DESC;`,
      },
      {
        id: 'academic-step-3',
        title: 'High-GPA Students in CS Courses',
        description: 'Find students with GPA above 3.5 who are taking Computer Science courses.',
        context: 'Filter students two ways at once: GPA above 3.5, and only courses in the Computer Science department. Both conditions need to be true.',
        hint: 'Filter students by GPA in WHERE, and filter courses by department in a JOIN condition or WHERE.',
        expectedColumns: ['student_name', 'gpa', 'course_name'],
        validateFn: `
          const gpaIdx = columns.findIndex(c => c.toLowerCase().includes('gpa'));
          const courseIdx = columns.findIndex(c => c.toLowerCase().includes('course'));
          if (gpaIdx === -1 || courseIdx === -1) return false;
          return values.every(r => r[gpaIdx] > 3.5) && values.some(r => r[courseIdx] && r[courseIdx].toLowerCase().includes('programming'));
        `,
        solution: `SELECT
  s.name AS student_name,
  s.gpa,
  c.name AS course_name
FROM students s
JOIN enrollments e ON s.id = e.student_id
JOIN courses c ON e.course_id = c.id
WHERE s.gpa > 3.5 AND c.department = 'Computer Science'
ORDER BY s.gpa DESC;`,
      },
      {
        id: 'academic-step-4',
        title: 'Teacher with Highest Student GPA Average',
        description: 'Find which teacher has students with the highest average GPA.',
        context: 'Walk the chain: teachers to courses to enrollments to students. GROUP BY teacher and average the GPAs of every student in their classes.',
        hint: 'Join teachers -> courses -> enrollments -> students, then GROUP BY teacher and calculate AVG(gpa).',
        expectedColumns: ['teacher_name', 'avg_student_gpa'],
        validateFn: `
          if (values.length < 1) return false;
          const nameIdx = columns.findIndex(c => c.toLowerCase().includes('teacher') || c.toLowerCase().includes('name'));
          const avgIdx = columns.findIndex(c => c.toLowerCase().includes('avg') || c.toLowerCase().includes('gpa'));
          if (nameIdx === -1 || avgIdx === -1) return false;
          return values[0][avgIdx] > 3;
        `,
        solution: `SELECT
  t.name AS teacher_name,
  ROUND(AVG(s.gpa), 2) AS avg_student_gpa
FROM teachers t
JOIN courses c ON t.id = c.teacher_id
JOIN enrollments e ON c.id = e.course_id
JOIN students s ON e.student_id = s.id
GROUP BY t.id, t.name
ORDER BY avg_student_gpa DESC
LIMIT 1;`,
      },
      {
        id: 'academic-step-5',
        title: 'Courses Without A Grades',
        description: 'Find courses where no student received an A.',
        context: 'Find courses where nobody got an A. NOT IN with a subquery that returns all course IDs that do have an A grade will work.',
        hint: 'Use NOT IN or NOT EXISTS to find courses without any A grades in enrollments.',
        expectedColumns: ['course_name'],
        validateFn: `
          const nameIdx = columns.findIndex(c => c.toLowerCase().includes('course') || c.toLowerCase().includes('name'));
          if (nameIdx === -1) return false;
          return values.length >= 1 && values.every(r => r[nameIdx]);
        `,
        solution: `SELECT c.name AS course_name
FROM courses c
WHERE c.id NOT IN (
  SELECT course_id
  FROM enrollments
  WHERE grade = 'A'
)
ORDER BY c.name;`,
      },
    ],
  },
];

/**
 * Get all projects
 */
export function getAllProjects(): Project[] {
  return projects;
}

/**
 * Get a project by slug
 */
export function getProjectBySlug(slug: string): Project | null {
  return projects.find((p) => p.slug === slug) || null;
}

/**
 * Get project step count
 */
export function getProjectStepCount(slug: string): number {
  const project = getProjectBySlug(slug);
  return project?.steps.length || 0;
}

/**
 * Get difficulty color classes
 */
export function getDifficultyColors(difficulty: Project['difficulty']): { bg: string; text: string; border: string } {
  switch (difficulty) {
    case 'Beginner':
      return { bg: 'bg-green-900/30', text: 'text-green-400', border: 'border-green-700/50' };
    case 'Intermediate':
      return { bg: 'bg-amber-900/30', text: 'text-amber-400', border: 'border-amber-700/50' };
    case 'Advanced':
      return { bg: 'bg-red-900/30', text: 'text-red-400', border: 'border-red-700/50' };
  }
}

/**
 * Get project color classes
 */
export function getProjectColors(color: string): { bg: string; border: string; text: string; progress: string } {
  const colorMap: Record<string, { bg: string; border: string; text: string; progress: string }> = {
    indigo: { bg: 'bg-indigo-900/20', border: 'border-indigo-700/50', text: 'text-indigo-400', progress: 'bg-indigo-500' },
    emerald: { bg: 'bg-emerald-900/20', border: 'border-emerald-700/50', text: 'text-emerald-400', progress: 'bg-emerald-500' },
    amber: { bg: 'bg-amber-900/20', border: 'border-amber-700/50', text: 'text-amber-400', progress: 'bg-amber-500' },
    purple: { bg: 'bg-purple-900/20', border: 'border-purple-700/50', text: 'text-purple-400', progress: 'bg-purple-500' },
    blue: { bg: 'bg-blue-900/20', border: 'border-blue-700/50', text: 'text-blue-400', progress: 'bg-blue-500' },
  };
  return colorMap[color] || colorMap.indigo;
}
