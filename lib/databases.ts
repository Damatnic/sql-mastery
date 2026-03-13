// Full SQLite database schemas with realistic seed data

export const COMPANY_DB = `
-- Departments table
CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  budget REAL NOT NULL,
  location TEXT NOT NULL
);

INSERT INTO departments (id, name, budget, location) VALUES
(1, 'Engineering', 2500000, 'Building A'),
(2, 'Sales', 1800000, 'Building B'),
(3, 'Marketing', 1200000, 'Building B'),
(4, 'Human Resources', 800000, 'Building C'),
(5, 'Finance', 950000, 'Building C');

-- Employees table
CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  salary REAL NOT NULL,
  hire_date TEXT NOT NULL,
  manager_id INTEGER
);

INSERT INTO employees (id, name, department, salary, hire_date, manager_id) VALUES
(1, 'Sarah Chen', 'Engineering', 120000, '2018-03-15', NULL),
(2, 'Marcus Johnson', 'Engineering', 95000, '2019-06-01', 1),
(3, 'Emily Rodriguez', 'Engineering', 88000, '2020-01-10', 1),
(4, 'David Kim', 'Engineering', 92000, '2019-09-22', 1),
(5, 'Jessica Patel', 'Sales', 78000, '2020-04-05', NULL),
(6, 'Michael Brown', 'Sales', 72000, '2021-02-14', 5),
(7, 'Amanda Foster', 'Sales', 68000, '2021-07-20', 5),
(8, 'Christopher Lee', 'Sales', 75000, '2020-11-03', 5),
(9, 'Rachel Martinez', 'Marketing', 85000, '2019-05-18', NULL),
(10, 'Daniel Thompson', 'Marketing', 62000, '2022-01-25', 9),
(11, 'Lauren Williams', 'Marketing', 58000, '2022-06-12', 9),
(12, 'James Wilson', 'Human Resources', 70000, '2018-08-30', NULL),
(13, 'Ashley Davis', 'Human Resources', 55000, '2021-03-08', 12),
(14, 'Robert Taylor', 'Finance', 95000, '2018-11-15', NULL),
(15, 'Nicole Anderson', 'Finance', 78000, '2020-02-28', 14),
(16, 'Kevin Moore', 'Engineering', 105000, '2019-01-07', 1),
(17, 'Stephanie Garcia', 'Engineering', 98000, '2020-08-19', 1),
(18, 'Brian Jackson', 'Sales', 82000, '2019-12-02', 5),
(19, 'Michelle White', 'Marketing', 45000, '2023-01-15', 9),
(20, 'William Harris', 'Finance', 65000, '2022-04-10', 14);

-- Projects table
CREATE TABLE projects (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  dept_id INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  budget REAL NOT NULL,
  FOREIGN KEY (dept_id) REFERENCES departments(id)
);

INSERT INTO projects (id, name, dept_id, start_date, budget) VALUES
(1, 'Cloud Migration', 1, '2023-01-15', 500000),
(2, 'Mobile App Redesign', 1, '2023-03-01', 350000),
(3, 'Q4 Sales Campaign', 2, '2023-09-01', 200000),
(4, 'Brand Refresh', 3, '2023-06-15', 150000),
(5, 'HR Portal Upgrade', 4, '2023-04-01', 100000),
(6, 'Financial Dashboard', 5, '2023-02-20', 175000);

-- Employee Projects junction table
CREATE TABLE employee_projects (
  employee_id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  PRIMARY KEY (employee_id, project_id),
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

INSERT INTO employee_projects (employee_id, project_id, role) VALUES
(1, 1, 'Project Lead'),
(2, 1, 'Developer'),
(3, 1, 'Developer'),
(4, 2, 'Project Lead'),
(16, 2, 'Developer'),
(17, 2, 'Developer'),
(5, 3, 'Project Lead'),
(6, 3, 'Sales Rep'),
(7, 3, 'Sales Rep'),
(8, 3, 'Sales Rep'),
(9, 4, 'Project Lead'),
(10, 4, 'Designer'),
(11, 4, 'Content Writer'),
(12, 5, 'Project Lead'),
(13, 5, 'HR Specialist'),
(14, 6, 'Project Lead'),
(15, 6, 'Analyst'),
(20, 6, 'Analyst');
`;

export const STORE_DB = `
-- Categories table
CREATE TABLE categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id INTEGER,
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);

INSERT INTO categories (id, name, parent_id) VALUES
(1, 'Electronics', NULL),
(2, 'Clothing', NULL),
(3, 'Home & Garden', NULL),
(4, 'Phones', 1),
(5, 'Laptops', 1),
(6, 'Men''s Clothing', 2);

-- Products table
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category_id INTEGER NOT NULL,
  price REAL NOT NULL,
  stock INTEGER NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

INSERT INTO products (id, name, category_id, price, stock) VALUES
(1, 'iPhone 15 Pro', 4, 999.99, 45),
(2, 'Samsung Galaxy S24', 4, 899.99, 62),
(3, 'Google Pixel 8', 4, 699.99, 38),
(4, 'MacBook Pro 14"', 5, 1999.99, 23),
(5, 'Dell XPS 15', 5, 1499.99, 31),
(6, 'ThinkPad X1 Carbon', 5, 1399.99, 18),
(7, 'Men''s Casual Shirt', 6, 49.99, 150),
(8, 'Men''s Jeans', 6, 79.99, 200),
(9, 'Men''s Sneakers', 6, 129.99, 85),
(10, 'Wireless Earbuds', 1, 149.99, 120),
(11, 'Smart Watch', 1, 299.99, 55),
(12, 'Tablet Stand', 1, 39.99, 200),
(13, 'Garden Hose', 3, 34.99, 75),
(14, 'Plant Pots Set', 3, 24.99, 90),
(15, 'Outdoor Chair', 3, 89.99, 40);

-- Customers table
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  joined_date TEXT NOT NULL
);

INSERT INTO customers (id, name, email, city, state, joined_date) VALUES
(1, 'John Smith', 'john.smith@email.com', 'New York', 'NY', '2022-01-15'),
(2, 'Emma Wilson', 'emma.w@email.com', 'Los Angeles', 'CA', '2022-02-20'),
(3, 'James Brown', 'jbrown@email.com', 'Chicago', 'IL', '2022-03-10'),
(4, 'Olivia Davis', 'olivia.d@email.com', 'Houston', 'TX', '2022-04-05'),
(5, 'William Johnson', 'will.j@email.com', 'Phoenix', 'AZ', '2022-05-12'),
(6, 'Sophia Miller', 'sophia.m@email.com', 'Philadelphia', 'PA', '2022-06-18'),
(7, 'Benjamin Taylor', 'ben.taylor@email.com', 'San Antonio', 'TX', '2022-07-22'),
(8, 'Isabella Anderson', 'isa.a@email.com', 'San Diego', 'CA', '2022-08-30'),
(9, 'Lucas Thomas', 'lucas.t@email.com', 'Dallas', 'TX', '2022-09-14'),
(10, 'Mia Jackson', 'mia.j@email.com', 'San Jose', 'CA', '2022-10-25'),
(11, 'Henry White', 'henry.w@email.com', 'Austin', 'TX', '2022-11-08'),
(12, 'Charlotte Harris', 'charlotte.h@email.com', 'Jacksonville', 'FL', '2022-12-01'),
(13, 'Alexander Martin', 'alex.m@email.com', 'Fort Worth', 'TX', '2023-01-17'),
(14, 'Amelia Garcia', 'amelia.g@email.com', 'Columbus', 'OH', '2023-02-22'),
(15, 'Sebastian Rodriguez', 'seb.r@email.com', 'Charlotte', 'NC', '2023-03-30'),
(16, 'Harper Martinez', 'harper.m@email.com', 'San Francisco', 'CA', '2023-04-11'),
(17, 'Jack Robinson', 'jack.r@email.com', 'Indianapolis', 'IN', '2023-05-19'),
(18, 'Evelyn Clark', 'evelyn.c@email.com', 'Seattle', 'WA', '2023-06-27'),
(19, 'Daniel Lewis', 'dan.lewis@email.com', 'Denver', 'CO', '2023-07-08'),
(20, 'Aria Walker', 'aria.w@email.com', 'Boston', 'MA', '2023-08-15');

-- Orders table
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  order_date TEXT NOT NULL,
  total REAL NOT NULL,
  status TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

INSERT INTO orders (id, customer_id, order_date, total, status) VALUES
(1, 1, '2023-06-15', 1049.98, 'Delivered'),
(2, 2, '2023-06-18', 899.99, 'Delivered'),
(3, 3, '2023-06-20', 129.98, 'Delivered'),
(4, 4, '2023-07-02', 1999.99, 'Delivered'),
(5, 5, '2023-07-10', 449.97, 'Delivered'),
(6, 1, '2023-07-15', 299.99, 'Delivered'),
(7, 6, '2023-07-22', 1499.99, 'Delivered'),
(8, 7, '2023-08-01', 179.97, 'Delivered'),
(9, 8, '2023-08-05', 699.99, 'Delivered'),
(10, 9, '2023-08-12', 89.99, 'Delivered'),
(11, 10, '2023-08-18', 999.99, 'Delivered'),
(12, 2, '2023-08-25', 149.99, 'Delivered'),
(13, 11, '2023-09-02', 2099.98, 'Shipped'),
(14, 12, '2023-09-08', 259.97, 'Shipped'),
(15, 13, '2023-09-15', 1399.99, 'Shipped'),
(16, 3, '2023-09-20', 79.99, 'Processing'),
(17, 14, '2023-09-25', 599.98, 'Processing'),
(18, 15, '2023-09-28', 174.97, 'Processing'),
(19, 16, '2023-10-01', 999.99, 'Pending'),
(20, 17, '2023-10-03', 39.99, 'Pending'),
(21, 18, '2023-10-05', 1899.98, 'Pending'),
(22, 4, '2023-10-06', 329.97, 'Pending'),
(23, 19, '2023-10-07', 699.99, 'Pending'),
(24, 20, '2023-10-08', 149.99, 'Pending'),
(25, 5, '2023-10-09', 89.99, 'Pending'),
(26, 1, '2023-10-10', 449.98, 'Pending'),
(27, 8, '2023-10-10', 1999.99, 'Pending'),
(28, 11, '2023-10-11', 79.99, 'Pending'),
(29, 14, '2023-10-11', 299.99, 'Pending'),
(30, 20, '2023-10-12', 129.99, 'Pending');

-- Order Items table
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 1, 999.99),
(2, 1, 7, 1, 49.99),
(3, 2, 2, 1, 899.99),
(4, 3, 7, 1, 49.99),
(5, 3, 8, 1, 79.99),
(6, 4, 4, 1, 1999.99),
(7, 5, 10, 1, 149.99),
(8, 5, 11, 1, 299.99),
(9, 6, 11, 1, 299.99),
(10, 7, 5, 1, 1499.99),
(11, 8, 7, 2, 49.99),
(12, 8, 8, 1, 79.99),
(13, 9, 3, 1, 699.99),
(14, 10, 15, 1, 89.99),
(15, 11, 1, 1, 999.99),
(16, 12, 10, 1, 149.99),
(17, 13, 4, 1, 1999.99),
(18, 13, 12, 2, 39.99),
(19, 14, 9, 2, 129.99),
(20, 15, 6, 1, 1399.99),
(21, 16, 8, 1, 79.99),
(22, 17, 10, 2, 149.99),
(23, 17, 11, 1, 299.99),
(24, 18, 13, 2, 34.99),
(25, 18, 14, 3, 24.99),
(26, 18, 12, 1, 39.99),
(27, 19, 1, 1, 999.99),
(28, 20, 12, 1, 39.99),
(29, 21, 4, 1, 1999.99),
(30, 22, 9, 1, 129.99),
(31, 22, 14, 4, 24.99),
(32, 22, 13, 2, 34.99),
(33, 23, 3, 1, 699.99),
(34, 24, 10, 1, 149.99),
(35, 25, 15, 1, 89.99),
(36, 26, 10, 1, 149.99),
(37, 26, 11, 1, 299.99),
(38, 27, 4, 1, 1999.99),
(39, 28, 8, 1, 79.99),
(40, 29, 11, 1, 299.99),
(41, 30, 9, 1, 129.99);
`;

export const SCHOOL_DB = `
-- Teachers table
CREATE TABLE teachers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  hire_date TEXT NOT NULL,
  salary REAL NOT NULL
);

INSERT INTO teachers (id, name, department, hire_date, salary) VALUES
(1, 'Dr. Patricia Adams', 'Mathematics', '2015-08-15', 85000),
(2, 'Prof. Robert Chen', 'Computer Science', '2012-01-10', 92000),
(3, 'Dr. Maria Santos', 'Physics', '2018-08-20', 78000),
(4, 'Prof. James Miller', 'English', '2010-08-15', 75000),
(5, 'Dr. Lisa Wang', 'Chemistry', '2016-01-05', 82000),
(6, 'Prof. David Thompson', 'History', '2014-08-18', 72000),
(7, 'Dr. Jennifer Brown', 'Biology', '2019-08-12', 76000),
(8, 'Prof. Michael Lee', 'Mathematics', '2011-01-15', 88000);

-- Courses table
CREATE TABLE courses (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  credits INTEGER NOT NULL,
  teacher_id INTEGER NOT NULL,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

INSERT INTO courses (id, name, department, credits, teacher_id) VALUES
(1, 'Calculus I', 'Mathematics', 4, 1),
(2, 'Introduction to Programming', 'Computer Science', 3, 2),
(3, 'General Physics', 'Physics', 4, 3),
(4, 'English Composition', 'English', 3, 4),
(5, 'Organic Chemistry', 'Chemistry', 4, 5),
(6, 'World History', 'History', 3, 6),
(7, 'Biology 101', 'Biology', 4, 7),
(8, 'Linear Algebra', 'Mathematics', 3, 8),
(9, 'Data Structures', 'Computer Science', 4, 2),
(10, 'American Literature', 'English', 3, 4);

-- Students table
CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  grade_level INTEGER NOT NULL,
  gpa REAL NOT NULL,
  enrolled_date TEXT NOT NULL
);

INSERT INTO students (id, name, grade_level, gpa, enrolled_date) VALUES
(1, 'Alice Johnson', 12, 3.85, '2020-08-25'),
(2, 'Bob Williams', 11, 3.42, '2021-08-23'),
(3, 'Carol Martinez', 12, 3.95, '2020-08-25'),
(4, 'David Lee', 10, 2.98, '2022-08-22'),
(5, 'Emma Thompson', 11, 3.67, '2021-08-23'),
(6, 'Frank Garcia', 12, 2.75, '2020-08-25'),
(7, 'Grace Kim', 10, 3.88, '2022-08-22'),
(8, 'Henry Wilson', 11, 3.15, '2021-08-23'),
(9, 'Ivy Chen', 12, 4.00, '2020-08-25'),
(10, 'Jack Brown', 10, 2.55, '2022-08-22'),
(11, 'Karen Davis', 11, 3.72, '2021-08-23'),
(12, 'Leo Anderson', 12, 3.28, '2020-08-25'),
(13, 'Mia Robinson', 10, 3.91, '2022-08-22'),
(14, 'Noah Taylor', 11, 2.88, '2021-08-23'),
(15, 'Olivia White', 12, 3.55, '2020-08-25'),
(16, 'Peter Harris', 10, 3.12, '2022-08-22'),
(17, 'Quinn Martin', 11, 3.78, '2021-08-23'),
(18, 'Rachel Clark', 12, 1.95, '2020-08-25'),
(19, 'Samuel Lewis', 10, 3.45, '2022-08-22'),
(20, 'Tina Walker', 11, 2.68, '2021-08-23');

-- Enrollments table
CREATE TABLE enrollments (
  id INTEGER PRIMARY KEY,
  student_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  grade TEXT,
  semester TEXT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

INSERT INTO enrollments (id, student_id, course_id, grade, semester) VALUES
(1, 1, 1, 'A', 'Fall 2023'),
(2, 1, 2, 'A-', 'Fall 2023'),
(3, 2, 3, 'B+', 'Fall 2023'),
(4, 2, 4, 'B', 'Fall 2023'),
(5, 3, 1, 'A', 'Fall 2023'),
(6, 3, 5, 'A', 'Fall 2023'),
(7, 4, 6, 'C+', 'Fall 2023'),
(8, 4, 7, 'B-', 'Fall 2023'),
(9, 5, 2, 'A-', 'Fall 2023'),
(10, 5, 8, 'B+', 'Fall 2023'),
(11, 6, 4, 'C', 'Fall 2023'),
(12, 6, 6, 'C+', 'Fall 2023'),
(13, 7, 1, 'A', 'Fall 2023'),
(14, 7, 3, 'A-', 'Fall 2023'),
(15, 8, 9, 'B', 'Fall 2023'),
(16, 8, 10, 'B+', 'Fall 2023'),
(17, 9, 1, 'A', 'Fall 2023'),
(18, 9, 5, 'A', 'Fall 2023'),
(19, 10, 7, 'C-', 'Fall 2023'),
(20, 10, 6, 'D+', 'Fall 2023'),
(21, 11, 2, 'A-', 'Fall 2023'),
(22, 11, 4, 'A', 'Fall 2023'),
(23, 12, 8, 'B', 'Fall 2023'),
(24, 12, 3, 'B-', 'Fall 2023'),
(25, 13, 1, 'A', 'Fall 2023'),
(26, 13, 7, 'A', 'Fall 2023'),
(27, 14, 9, 'C+', 'Fall 2023'),
(28, 14, 10, 'B-', 'Fall 2023'),
(29, 15, 5, 'B+', 'Fall 2023'),
(30, 15, 2, 'B', 'Fall 2023'),
(31, 16, 3, 'B', 'Fall 2023'),
(32, 16, 4, 'B+', 'Fall 2023'),
(33, 17, 1, 'A-', 'Fall 2023'),
(34, 17, 9, 'A', 'Fall 2023'),
(35, 18, 6, 'D', 'Fall 2023'),
(36, 18, 10, 'D+', 'Fall 2023'),
(37, 19, 7, 'B+', 'Fall 2023'),
(38, 19, 8, 'B', 'Fall 2023'),
(39, 20, 4, 'C', 'Fall 2023'),
(40, 20, 6, 'C-', 'Fall 2023');

-- Assignments table
CREATE TABLE assignments (
  id INTEGER PRIMARY KEY,
  course_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  due_date TEXT NOT NULL,
  max_points INTEGER NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

INSERT INTO assignments (id, course_id, title, due_date, max_points) VALUES
(1, 1, 'Derivatives Practice', '2023-09-15', 100),
(2, 1, 'Integration Exam', '2023-10-20', 150),
(3, 2, 'Hello World Program', '2023-09-08', 50),
(4, 2, 'Calculator Project', '2023-10-15', 100),
(5, 3, 'Lab Report: Motion', '2023-09-22', 75),
(6, 3, 'Midterm Exam', '2023-10-18', 200),
(7, 4, 'Essay 1: Personal Narrative', '2023-09-29', 100),
(8, 4, 'Research Paper', '2023-11-10', 150),
(9, 5, 'Lab: Organic Compounds', '2023-09-25', 80),
(10, 5, 'Synthesis Project', '2023-11-01', 120);
`;

// Schema descriptions for AI context
export const SCHEMA_DESCRIPTIONS = {
  company: `
Database: Company
Tables:
- employees (id, name, department, salary, hire_date, manager_id) - 20 employees across 5 departments
- departments (id, name, budget, location) - 5 departments
- projects (id, name, dept_id, start_date, budget) - 6 active projects
- employee_projects (employee_id, project_id, role) - employee assignments to projects
Relationships: employees.manager_id references employees.id, projects.dept_id references departments.id
  `.trim(),

  store: `
Database: Store (E-commerce)
Tables:
- customers (id, name, email, city, state, joined_date) - 20 customers
- orders (id, customer_id, order_date, total, status) - 30 orders with various statuses
- products (id, name, category_id, price, stock) - 15 products
- order_items (id, order_id, product_id, quantity, unit_price) - line items for orders
- categories (id, name, parent_id) - 6 product categories (some hierarchical)
Relationships: orders.customer_id references customers.id, order_items references both orders and products
  `.trim(),

  school: `
Database: School
Tables:
- students (id, name, grade_level, gpa, enrolled_date) - 20 students grades 10-12
- teachers (id, name, department, hire_date, salary) - 8 teachers
- courses (id, name, department, credits, teacher_id) - 10 courses
- enrollments (id, student_id, course_id, grade, semester) - 40 enrollment records
- assignments (id, course_id, title, due_date, max_points) - 10 assignments
Relationships: enrollments links students and courses, courses.teacher_id references teachers
  `.trim()
};

export type DatabaseName = 'company' | 'store' | 'school';
