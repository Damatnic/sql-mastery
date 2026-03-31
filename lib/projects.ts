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
    description: 'Build an HR analytics dashboard by writing SQL queries to analyze employee salaries, department costs, and identify top performers across the organization.',
    difficulty: 'Intermediate',
    estimatedTime: '~30 min',
    database: 'company',
    databaseLabel: 'COMPANY_DB',
    color: 'indigo',
    steps: [
      {
        id: 'hr-step-1',
        title: 'List Employees with Departments',
        description: 'Start by retrieving all employees along with their department information.',
        context: 'Your HR team wants a comprehensive list of all employees showing their names and which department they work in. This is the foundation for further analysis.',
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
        context: 'Leadership wants to see how salaries compare across departments. Calculate the average salary grouped by department and round the results for readability.',
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
        context: 'HR wants to identify high earners within each department for performance review purposes. Use a subquery or CTE to compare individual salaries against department averages.',
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
        context: 'For the annual review, managers need to see how each employee ranks salary-wise within their department. Use ROW_NUMBER() or RANK() to create this ranking.',
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
        context: 'The executive team wants a quick view of who the top earner is in each department. Use your window function knowledge to filter for only rank 1 employees.',
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
    description: 'Create a sales analytics dashboard by analyzing customer orders, revenue trends, and product performance for an e-commerce store.',
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
        context: 'The sales team needs a report showing all orders with customer information. Start by joining the orders and customers tables to show order details alongside customer names.',
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
        context: 'Marketing wants to identify our highest-value customers. Calculate the total revenue generated by each customer across all their orders.',
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
        context: 'For our VIP program, we need to identify our top 5 customers by total spend. Limit your previous query to show only the top performers.',
        hint: 'Add ORDER BY total_spent DESC and LIMIT 5 to your query.',
        expectedColumns: ['customer_name', 'total_spent'],
        validateFn: `
          if (values.length !== 5) return false;
          const nameIdx = columns.findIndex(c => c.toLowerCase().includes('name'));
          const totalIdx = columns.findIndex(c => c.toLowerCase().includes('total') || c.toLowerCase().includes('spent'));
          if (nameIdx === -1 || totalIdx === -1) return false;
          const topName = values[0][nameIdx];
          return topName && (topName.includes('John') || topName.includes('Henry'));
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
        context: 'Finance needs to see how revenue has trended over time. Group orders by month and calculate the total revenue for each month.',
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
        title: 'Products Never Ordered',
        description: 'Find products that have never been purchased.',
        context: 'Inventory wants to identify products that have never sold so they can plan promotions or discontinue them. Find all products with zero orders.',
        hint: 'Use LEFT JOIN with order_items and filter WHERE the order_id IS NULL.',
        expectedColumns: ['product_name'],
        validateFn: `
          const nameIdx = columns.findIndex(c => c.toLowerCase().includes('name') || c.toLowerCase().includes('product'));
          if (nameIdx === -1) return false;
          return values.length === 0 || (values.length <= 5 && values.every(r => r[nameIdx]));
        `,
        solution: `SELECT p.name AS product_name
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
WHERE oi.id IS NULL;`,
      },
      {
        id: 'sales-step-6',
        title: 'Category Revenue Share',
        description: 'Calculate what percentage of total revenue each product category generates.',
        context: 'The merchandising team wants to understand which product categories drive the most revenue. Calculate each category\'s share of total revenue.',
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
    description: 'Analyze student performance, course enrollment, and teacher effectiveness using data from a school database.',
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
        context: 'The registrar needs a report showing which students are enrolled in which courses. Join the students, enrollments, and courses tables to create this list.',
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
        context: 'Academic advisors want to see the course load for each student. Calculate how many courses each student is enrolled in.',
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
        context: 'The CS department wants to identify high-performing students for research opportunities. Find students with GPA > 3.5 enrolled in Computer Science courses.',
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
        context: 'Administration wants to recognize effective teaching. Find the teacher whose enrolled students have the highest average GPA.',
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
        context: 'The curriculum committee wants to review courses that might be too difficult. Find all courses where no enrollment has a grade of A.',
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
