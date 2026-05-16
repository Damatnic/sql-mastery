"use client";

import Link from "next/link";
import { useState } from "react";
import HomeTerminal from "@/components/HomeTerminal";

const modules = [
  { num: "01", slug: "getting-started", firstLesson: "select-basics", title: "getting-started", desc: "SELECT, WHERE, ORDER BY.", lessons: 5 },
  { num: "02", slug: "data-analysis", firstLesson: "aggregate-functions", title: "data-analysis", desc: "Aggregates, GROUP BY, HAVING.", lessons: 5 },
  { num: "03", slug: "joining-tables", firstLesson: "inner-join", title: "joining-tables", desc: "INNER, LEFT, self-joins.", lessons: 5 },
  { num: "04", slug: "subqueries-ctes", firstLesson: "subqueries-where", title: "subqueries-ctes", desc: "Nested queries and WITH clauses.", lessons: 4 },
  { num: "05", slug: "modifying-data", firstLesson: "insert", title: "modifying-data", desc: "INSERT, UPDATE, DELETE.", lessons: 4 },
  { num: "06", slug: "functions", firstLesson: "string-functions", title: "functions", desc: "String, date, math.", lessons: 5 },
  { num: "07", slug: "window-functions", firstLesson: "ranking-functions", title: "window-functions", desc: "RANK, LAG, running totals.", lessons: 5 },
  { num: "08", slug: "database-objects", firstLesson: "views", title: "database-objects", desc: "Views, indexes, constraints.", lessons: 5 },
  { num: "09", slug: "advanced", firstLesson: "recursive-ctes", title: "advanced", desc: "Recursive CTEs, pivot, optimization.", lessons: 4 },
  { num: "10", slug: "school-advanced", firstLesson: "stored-procedures", title: "school-advanced", desc: "Course notes: procs, dynamic SQL, JSON.", lessons: 10 },
];

interface PersistedProgress {
  state?: { completedLessons?: string[] };
}

function loadCompletedLessons(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem("sql-mastery-progress");
    if (!raw) return new Set();
    const parsed: PersistedProgress = JSON.parse(raw);
    return new Set(parsed.state?.completedLessons ?? []);
  } catch {
    return new Set();
  }
}

export default function HomePage() {
  const [completed] = useState(loadCompletedLessons);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-mono text-sm">
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 sm:py-16">
        <section className="flex flex-wrap items-baseline justify-between gap-3">
          <div className="flex-1 min-w-0">
            <HomeTerminal modules={modules} />
          </div>
          <p className="text-xs text-muted-foreground">
            {'// type '}
            <span className="text-foreground/80">help</span>
            {' · ↑↓ history · tab completes'}
          </p>
        </section>

        <section className="mt-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground"># modules</p>
          <ul className="mt-3 border-y border-border/60 divide-y divide-border/40">
            {modules.map((m) => {
              const doneCount = Array.from(completed).filter((k) =>
                k === m.slug || k.startsWith(`${m.slug}/`)
              ).length;
              const status = doneCount === 0
                ? "─"
                : doneCount >= m.lessons
                ? "✓ complete"
                : `${doneCount}/${m.lessons}`;
              const statusClass = doneCount >= m.lessons
                ? "text-success"
                : doneCount > 0
                ? "text-accent"
                : "text-muted-foreground";
              return (
                <li key={m.slug}>
                  <Link
                    href={`/learn/${m.slug}/${m.firstLesson}`}
                    className="group grid grid-cols-[2.5rem_minmax(0,1fr)_5rem_7rem_1rem] gap-3 items-center py-2 px-2 -mx-2 rounded hover:bg-card/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    aria-label={`Open module ${m.title}`}
                  >
                    <span className="text-muted-foreground">{m.num}</span>
                    <span className="min-w-0 truncate">
                      <span className="text-foreground">modules/{m.title}/</span>
                      <span className="text-muted-foreground hidden md:inline">  {m.desc}</span>
                    </span>
                    <span className="text-muted-foreground text-xs">{m.lessons} lessons</span>
                    <span className={`text-xs ${statusClass}`}>{status}</span>
                    <span className="text-muted-foreground group-hover:text-accent transition-colors">→</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-10 grid sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground"># playground</p>
            <Link
              href="/playground"
              className="mt-3 block py-2 px-2 -mx-2 rounded hover:bg-card/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="text-foreground">playground/</span>
              <span className="ml-3 text-muted-foreground">→</span>
            </Link>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground"># projects</p>
            <Link
              href="/projects"
              className="mt-3 block py-2 px-2 -mx-2 rounded hover:bg-card/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="text-foreground">projects/</span>
              <span className="ml-3 text-muted-foreground">→</span>
            </Link>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground"># stats</p>
            <Link
              href="/stats"
              className="mt-3 block py-2 px-2 -mx-2 rounded hover:bg-card/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="text-foreground">stats/</span>
              <span className="ml-3 text-muted-foreground">→</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-5 text-xs">
        <div className="max-w-3xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3 text-muted-foreground">
          <span>
            <span className="text-success">exit 0</span> · personal use · next.js + sql.js
          </span>
          <Link href="/playground" className="hover:text-foreground transition-colors">playground/</Link>
        </div>
      </footer>
    </div>
  );
}
