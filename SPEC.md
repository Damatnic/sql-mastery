# SQL Mastery — Full Build Spec

## What We're Building
A premium interactive SQL learning platform. Think DataCamp + SQLZoo + Mode Analytics 
but better, with real AI features and a slick dark UI. 

The target user is a student learning SQL from scratch → through advanced SQL Server topics.
Deploy to Vercel. GitHub: Damatnic/sql-mastery.

---

## Stack (already installed)
- Next.js 14 App Router + TypeScript
- Tailwind CSS
- sql.js (SQLite WASM — runs queries IN THE BROWSER, no backend needed)
- @monaco-editor/react (SQL editor)
- openai (AI tutor — gpt-4o)
- zustand (state management)
- lucide-react (icons)

---

## Routes
| Route | Page |
|-------|------|
| `/` | Landing page |
| `/learn` | Course dashboard |
| `/learn/[moduleSlug]/[lessonSlug]` | Individual lesson |
| `/playground` | Free SQL sandbox |
| `/api/ai` | AI tutor API endpoint |

---

## Curriculum — 9 Modules, 40 Lessons

### Module 1: Getting Started (color: blue)
1. What is SQL & Databases — What a database is, what SQL does, why it matters
2. Your First SELECT — SELECT *, SELECT specific columns, FROM
3. Filtering with WHERE — =, !=, >, <, >=, <=, text vs numbers
4. Sorting with ORDER BY — ASC, DESC, multiple columns
5. LIMIT and TOP — restricting result rows

### Module 2: Data Analysis Basics (color: green)
6. COUNT, SUM, AVG, MIN, MAX — aggregate functions
7. GROUP BY — grouping data for aggregation
8. HAVING — filtering groups (not WHERE!)
9. Working with NULLs — IS NULL, IS NOT NULL, ISNULL(), COALESCE()
10. DISTINCT — removing duplicates

### Module 3: Joining Tables (color: purple)
11. What Are Joins? — concept, foreign keys, visual diagrams  
12. INNER JOIN — only matching rows
13. LEFT JOIN and RIGHT JOIN — keep all rows from one side
14. FULL OUTER JOIN — keep everything
15. Joining Multiple Tables — chaining joins, aliases

### Module 4: Subqueries & CTEs (color: orange)
16. Subqueries in WHERE — IN, NOT IN, comparison subqueries
17. Subqueries in FROM — derived tables
18. Correlated Subqueries — row-by-row execution
19. CTEs with WITH — cleaner subqueries, readability

### Module 5: Modifying Data (color: red)
20. INSERT — single rows, multiple rows, INSERT SELECT
21. UPDATE — update with WHERE, update from join
22. DELETE — safe deletes, DELETE vs TRUNCATE
23. MERGE — upsert pattern, matched/not matched

### Module 6: Functions & Expressions (color: teal)
24. String Functions — LEN, UPPER, LOWER, SUBSTRING, REPLACE, CONCAT, TRIM
25. Date Functions — GETDATE, YEAR, MONTH, DAY, DATEDIFF, DATEADD, FORMAT
26. CASE Expressions — simple CASE, searched CASE, CASE in ORDER BY
27. Type Conversion — CAST, CONVERT, TRY_CAST, TRY_CONVERT
28. Math Functions — ROUND, FLOOR, CEILING, ABS, POWER, SQRT

### Module 7: Window Functions (color: pink)
29. What Are Window Functions? — OVER(), concept, why they're powerful
30. ROW_NUMBER, RANK, DENSE_RANK — ranking rows
31. LEAD and LAG — comparing to previous/next rows
32. Running Totals and Moving Averages — SUM/AVG OVER with frames
33. PARTITION BY — windowed aggregates per group

### Module 8: Database Objects (color: indigo)
34. Views — CREATE VIEW, benefits, updatable views
35. Stored Procedures — CREATE PROCEDURE, parameters, EXEC
36. Scalar Functions — CREATE FUNCTION, RETURNS, return values
37. Table-Valued Functions — inline TVF, multi-statement TVF
38. Triggers — AFTER INSERT/UPDATE/DELETE, inserted/deleted tables

### Module 9: SQL Server Advanced (color: yellow)
39. Variables & Temp Tables — DECLARE, SET, #temp, ##global, @table
40. TRY/CATCH & Error Handling — THROW, ERROR_MESSAGE(), transactions
41. Dynamic SQL — EXEC(), sp_executesql, parameterized dynamic
42. Transactions — BEGIN TRAN, COMMIT, ROLLBACK

---

## Sample Databases (loaded via sql.js — SQLite compatible)

### DB 1: "Company" (Modules 1-2, simple)
```sql
CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  salary REAL,
  hire_date TEXT,
  manager_id INTEGER
);
-- 20+ rows of realistic data
CREATE TABLE departments (id INTEGER PRIMARY KEY, name TEXT, budget REAL, location TEXT);
CREATE TABLE projects (id INTEGER PRIMARY KEY, name TEXT, dept_id INTEGER, start_date TEXT, budget REAL);
CREATE TABLE employee_projects (employee_id INTEGER, project_id INTEGER, role TEXT);
```

### DB 2: "Store" (Modules 3-5)
```sql
CREATE TABLE customers (id, name, email, city, state, joined_date);
CREATE TABLE orders (id, customer_id, order_date, total, status);
CREATE TABLE products (id, name, category, price, stock);
CREATE TABLE order_items (order_id, product_id, quantity, unit_price);
CREATE TABLE categories (id, name, parent_id);
```

### DB 3: "School" (Modules 6-7)
```sql
CREATE TABLE students (id, name, grade_level, gpa, enrolled_date);
CREATE TABLE courses (id, name, department, credits, teacher_id);
CREATE TABLE teachers (id, name, department, hire_date, salary);
CREATE TABLE enrollments (student_id, course_id, grade, semester);
CREATE TABLE assignments (id, course_id, title, due_date, max_points);
```

---

## Lesson Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: SQL Mastery logo | Module > Lesson | Progress bar  │
├──────────┬──────────────────────────────────────────────────┤
│          │  LESSON CONTENT                                  │
│  LEFT    │  Title + badge (concept/practice/challenge)      │
│  NAV     │  ─────────────────────────────────────────────── │
│          │  📖 THEORY: explanation with code snippets        │
│  All     │  ─────────────────────────────────────────────── │
│  lessons │  💡 EXAMPLES: interactive "Try It" blocks        │
│  in      │  ─────────────────────────────────────────────── │
│  module  │  🎯 CHALLENGE: write SQL to match expected output │
│  with ✓  │                                                  │
│  markers │  ┌────────────────────┬──────────────────────┐  │
│          │  │  MONACO EDITOR     │  RESULTS TABLE       │  │
│          │  │  (SQL input)       │  or error message    │  │
│          │  │                    │                      │  │
│          │  │  [Run ▶]  [Reset]  │  ✅ Correct! / ❌    │  │
│          │  └────────────────────┴──────────────────────┘  │
│          │  ─────────────────────────────────────────────── │
│          │  🤖 AI TUTOR: [Explain my query] [Hint] [Help]   │
├──────────┴──────────────────────────────────────────────────┤
│  FOOTER: Prev lesson | Next lesson button                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Lesson Data Structure

```typescript
interface Lesson {
  module: number;
  lesson: number;
  slug: string;
  title: string;
  badge: "concept" | "practice" | "challenge";
  database: "company" | "store" | "school";
  theory: {
    content: string; // markdown with code blocks
  };
  examples: Array<{
    title: string;
    explanation: string;
    sql: string; // pre-filled query user can run
  }>;
  challenges: Array<{
    id: string;
    prompt: string; // plain English task
    hint?: string;
    expectedColumns: string[]; // column names in result
    validateFn: string; // JS function body as string to validate results
    solution: string; // shown after 3 wrong attempts
  }>;
}
```

---

## AI Tutor Features

API route: `POST /api/ai`  
Body: `{ messages, context: { lessonTitle, currentQuery, errorMessage, database } }`  
Model: `gpt-4o`  
Key: `process.env.OPENAI_API_KEY`

**Buttons on each lesson:**
1. **"Explain my query"** — AI reads current editor content, explains in plain English what it does step by step
2. **"Help fix this"** — shown when error occurred, AI explains error + suggests fix  
3. **"Give me a hint"** — hints toward the challenge without spoiling it
4. **"Explain [concept]"** — contextual help about the current lesson topic

**AI chat panel:** collapsible sidebar, message history, code blocks rendered nicely

**System prompt to include:**
- You are an SQL tutor for a student learning from scratch
- Current lesson: {lessonTitle}
- Current database schema: {schemaDescription}  
- Be concise but thorough. Use examples. Explain errors in plain English.
- If they have a syntax error, quote the problematic part and fix it
- For hints: guide them to think, don't just give the answer

---

## Progress Tracking (Zustand + localStorage)

```typescript
interface Progress {
  completedLessons: Set<string>; // "module-1/select-basics"
  xp: number; // 10 XP per lesson, 25 XP per challenge
  streak: number; // days in a row
  lastActivity: string; // ISO date
}
```

---

## UI Design System

**Colors:**
- Background: `bg-slate-950` / `bg-slate-900`
- Cards: `bg-slate-800` border `border-slate-700`
- Primary: `#6366f1` (indigo-500) 
- Success: `#10B981` (emerald-500)
- Warning: `#F59E0B` (amber-500)
- Error: `#EF4444` (red-500)
- Text: `text-white` / `text-slate-300` / `text-slate-500`

**Components needed:**
- `<SQLEditor />` — Monaco editor with SQL language, dark theme, run button
- `<ResultsTable />` — renders query results as styled table, or error message
- `<TheoryBlock />` — renders lesson markdown with syntax-highlighted code
- `<ChallengeBlock />` — challenge prompt + editor + validation feedback
- `<AITutor />` — collapsible chat panel
- `<LessonNav />` — sidebar with all lessons, progress markers
- `<ModuleCard />` — dashboard module overview card with progress ring
- `<XPBadge />` — XP display in header

**Monaco Editor config:**
```typescript
{
  language: "sql",
  theme: "vs-dark",
  minimap: { enabled: false },
  fontSize: 14,
  lineNumbers: "on",
  scrollBeyondLastLine: false,
  automaticLayout: true,
}
```

---

## sql.js Setup (Important!)

sql.js runs SQLite in WASM in the browser. It needs the WASM binary served from `/public`.

```typescript
// lib/db.ts
import initSqlJs from 'sql.js';

let SQL: any = null;

export async function getSql() {
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: (file: string) => `/sql-wasm.wasm`,
    });
  }
  return SQL;
}

export async function createDatabase(schema: string): Promise<Database> {
  const SQL = await getSql();
  const db = new SQL.Database();
  db.run(schema);
  return db;
}

export function runQuery(db: Database, sql: string) {
  try {
    const results = db.exec(sql);
    return { success: true, results };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
```

**Copy WASM file:**
```bash
cp node_modules/sql.js/dist/sql-wasm.wasm public/
```

---

## Landing Page Sections

1. **Hero** — "Master SQL From Zero to Pro" + editor animation/demo + Start Learning CTA
2. **Features** — 6 cards: Interactive Editor, AI Tutor, Real Databases, Progress Tracking, 40+ Lessons, SQL Server Focus
3. **Curriculum** — accordion or grid showing all 9 modules with lesson counts
4. **How It Works** — 3 steps: Learn → Practice → Build (with icons)
5. **CTA** — "Start Learning for Free" button → /learn

---

## Environment Variables Needed
```
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
```
(already configured in Vercel for stats-final-prep — needs to be added to this project too)

---

## Key Files to Create

```
app/
  page.tsx                    — Landing page
  learn/
    page.tsx                  — Course dashboard
    [moduleSlug]/
      [lessonSlug]/
        page.tsx              — Lesson page
  playground/
    page.tsx                  — Free sandbox
  api/
    ai/
      route.ts                — AI tutor endpoint
lib/
  db.ts                       — sql.js helpers
  lessons.ts                  — All lesson data (THE BIG FILE)
  databases.ts                — Sample database schemas + seed data
  progress.ts                 — Zustand store
components/
  SQLEditor.tsx               — Monaco wrapper
  ResultsTable.tsx            — Query output display
  TheoryBlock.tsx             — Lesson content renderer
  ChallengeBlock.tsx          — Challenge with validation
  AITutor.tsx                 — Chat sidebar
  LessonNav.tsx               — Lesson navigation sidebar
  ModuleCard.tsx              — Dashboard card
public/
  sql-wasm.wasm               — Copy from node_modules
```

---

## Build Priority Order
1. lib/databases.ts — seed data for all 3 databases (needed by everything)
2. lib/lessons.ts — all 40 lesson definitions with full content
3. lib/db.ts — sql.js helpers
4. components/SQLEditor.tsx — Monaco editor wrapper
5. components/ResultsTable.tsx — results display
6. app/api/ai/route.ts — OpenAI endpoint
7. components/AITutor.tsx — chat UI
8. components/ChallengeBlock.tsx — challenge + validation
9. app/learn/[moduleSlug]/[lessonSlug]/page.tsx — lesson page (the main event)
10. app/learn/page.tsx — course dashboard
11. app/page.tsx — landing page
12. app/playground/page.tsx — sandbox

---

## Important Notes
- sql.js must be loaded client-side only (use dynamic import with ssr:false)
- Monaco Editor also client-side only
- Each lesson should have REAL, working SQL that actually runs on the SQLite schema
- Challenges should have reasonable validation — compare column names + row count + key values
- Make the AI tutor system prompt specifically aware of SQL dialects (SQLite for in-browser, SQL Server for real-world refs)
- The lesson content in lib/lessons.ts should be COMPREHENSIVE — real explanations, not filler
- Add `next.config.js` config to handle WASM files properly
