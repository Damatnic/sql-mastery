# SQL Mastery

Interactive SQL learning platform. Write real queries against real databases in the browser. 52 lessons across 10 modules, with an AI tutor that helps when you get stuck.

**Live site:** [damato-sql.vercel.app](https://damato-sql.vercel.app)

**Stack:** Next.js · TypeScript · Tailwind · SQL.js (SQLite in the browser)

## What it does

- **Run SQL in the browser.** SQLite via SQL.js, no setup, no signup.
- **Real practice databases.** Employees, orders, students, and other realistic schemas. Not toy data.
- **AI-powered tutor.** When you're stuck on a query, ask the tutor for a hint or an explanation. It's contextual to the lesson you're on.
- **Schema viewer.** See the tables and columns alongside the editor so you don't have to keep guessing what's available.
- **Progress + XP + streaks.** Standard gamification to keep momentum going.

## Curriculum (10 modules, 52 lessons)

| Module | Topic | Lessons |
|---|---|---|
| 1 | Getting Started, SELECT, WHERE, ORDER BY | 5 |
| 2 | Data Analysis, aggregates, GROUP BY, HAVING | 5 |
| 3 | Joining Tables: INNER, LEFT, self-joins | 5 |
| 4 | Subqueries and CTEs, WITH clause | 4 |
| 5 | Modifying Data: INSERT, UPDATE, DELETE | 4 |
| 6 | Functions: string, date, math | 5 |
| 7 | Window Functions: RANK, LAG, running totals | 5 |
| 8 | Database Objects: views, indexes, constraints | 5 |
| 9 | SQL Server Advanced: transactions, optimization | 4 |
| 10 | Advanced SQL (WCTC): stored procs, triggers, UDFs, XML/JSON, temporal tables | 10 |

## Why I built it

Same reason as [python-mastery](https://github.com/Damatnic/python-mastery). I'm in WCTC's AI Data Specialist program and I wanted a way to practice SQL that wasn't "read a textbook chapter then attempt a problem set." Browser-based, instant feedback, real schemas. Built for myself, free for anyone else.

The advanced SQL Server module matches what's being taught in the Advanced SQL class at WCTC. CTEs, window functions, partitioning, all of it.

## Local dev

```bash
git clone https://github.com/Damatnic/sql-mastery.git
cd sql-mastery
npm install
npm run dev
```

Open http://localhost:3000.

## Notable technical bits

- **SQL.js for in-browser SQLite.** Every user gets their own database instance, no shared state, no server load.
- **AI tutor uses streaming responses** so feedback feels responsive even on complex explanations.
- **Project system** lets you work through guided, multi-step projects with step unlocking so you can't skip ahead until your current step works.
- **Execution time displayed** with every query so you start building intuition for what's fast and what's not.
