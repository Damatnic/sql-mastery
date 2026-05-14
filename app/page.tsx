"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

export default function HomePage() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sql-mastery-progress");
      if (raw) {
        const parsed: PersistedProgress = JSON.parse(raw);
        const list = parsed.state?.completedLessons ?? [];
        setCompleted(new Set(list));
      }
    } catch {}
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-mono text-sm">
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 sm:py-16">
        <section className="flex flex-wrap items-baseline justify-between gap-3">
          <p>
            <span className="text-indigo-400">damato@sql</span>
            <span className="text-slate-500">:</span>
            <span className="text-slate-500">~/lessons$</span>{" "}
            <span>ls</span>
            <span className="ml-1 inline-block w-2 h-4 align-text-bottom bg-slate-100 terminal-cursor" aria-hidden="true" />
          </p>
          <p className="text-xs text-slate-500">
            // personal practice. wctc advanced sql.
          </p>
        </section>

        <section className="mt-8">
          <p className="text-xs uppercase tracking-widest text-slate-500"># modules</p>
          <ul className="mt-3 border-y border-slate-800/60 divide-y divide-slate-800/40">
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
                ? "text-emerald-400"
                : doneCount > 0
                ? "text-indigo-400"
                : "text-slate-500";
              return (
                <li key={m.slug}>
                  <Link
                    href={`/learn/${m.slug}/${m.firstLesson}`}
                    className="group grid grid-cols-[2.5rem_minmax(0,1fr)_5rem_7rem_1rem] gap-3 items-center py-2 px-2 -mx-2 rounded hover:bg-slate-900/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    aria-label={`Open module ${m.title}`}
                  >
                    <span className="text-slate-500">{m.num}</span>
                    <span className="min-w-0 truncate">
                      <span className="text-slate-100">modules/{m.title}/</span>
                      <span className="text-slate-500 hidden md:inline">  {m.desc}</span>
                    </span>
                    <span className="text-slate-500 text-xs">{m.lessons} lessons</span>
                    <span className={`text-xs ${statusClass}`}>{status}</span>
                    <span className="text-slate-500 group-hover:text-indigo-400 transition-colors">→</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-10 grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500"># playground</p>
            <Link
              href="/playground"
              className="mt-3 block py-2 px-2 -mx-2 rounded hover:bg-slate-900/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <span className="text-slate-100">playground/</span>
              <span className="text-slate-500">  same sqlite engine, no scaffolding</span>
              <span className="ml-3 text-slate-500">→</span>
            </Link>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500"># projects</p>
            <Link
              href="/projects"
              className="mt-3 block py-2 px-2 -mx-2 rounded hover:bg-slate-900/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <span className="text-slate-100">projects/</span>
              <span className="text-slate-500">  longer-form guided practice</span>
              <span className="ml-3 text-slate-500">→</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800/60 py-5 text-xs">
        <div className="max-w-3xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3 text-slate-500">
          <span>
            <span className="text-emerald-400">exit 0</span> · personal use · next.js + sql.js
          </span>
          <Link href="/playground" className="hover:text-slate-100 transition-colors">playground/</Link>
        </div>
      </footer>
    </div>
  );
}
