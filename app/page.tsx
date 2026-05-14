import Link from "next/link";

const modules = [
  { num: "01", slug: "getting-started", firstLesson: "select-basics", title: "Getting Started", desc: "SELECT, WHERE, ORDER BY.", lessons: 5 },
  { num: "02", slug: "data-analysis", firstLesson: "aggregate-functions", title: "Data Analysis", desc: "Aggregates, GROUP BY, HAVING.", lessons: 5 },
  { num: "03", slug: "joining-tables", firstLesson: "inner-join", title: "Joining Tables", desc: "INNER, LEFT, self-joins.", lessons: 5 },
  { num: "04", slug: "subqueries-ctes", firstLesson: "subqueries-where", title: "Subqueries & CTEs", desc: "Nested queries and WITH clauses.", lessons: 4 },
  { num: "05", slug: "modifying-data", firstLesson: "insert", title: "Modifying Data", desc: "INSERT, UPDATE, DELETE.", lessons: 4 },
  { num: "06", slug: "functions", firstLesson: "string-functions", title: "Functions", desc: "String, date, math.", lessons: 5 },
  { num: "07", slug: "window-functions", firstLesson: "ranking-functions", title: "Window Functions", desc: "RANK, LAG, running totals.", lessons: 5 },
  { num: "08", slug: "database-objects", firstLesson: "views", title: "Database Objects", desc: "Views, indexes, constraints.", lessons: 5 },
  { num: "09", slug: "advanced", firstLesson: "recursive-ctes", title: "Advanced SQL", desc: "Recursive CTEs, pivot, optimization.", lessons: 4 },
  { num: "10", slug: "school-advanced", firstLesson: "stored-procedures", title: "SQL Server (WCTC)", desc: "Course notes: procs, dynamic SQL, JSON.", lessons: 10 },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/60">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-mono text-sm font-medium">sql-mastery</span>
          <nav className="flex items-center gap-5 text-sm text-slate-400">
            <Link href="/learn" className="hover:text-slate-100 transition-colors">Lessons</Link>
            <Link href="/projects" className="hover:text-slate-100 transition-colors">Projects</Link>
            <Link href="/playground" className="hover:text-slate-100 transition-colors">Playground</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 sm:py-16">
        <section className="max-w-2xl">
          <h1 className="font-mono text-xl text-slate-100">sql-mastery</h1>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            SQL lessons I built while taking Advanced SQL at WCTC. Three
            SQLite databases run in the browser via sql.js so I can drill
            queries without standing anything up. An AI tutor is wired in
            for when I get stuck on a lesson.
          </p>
          <p className="mt-3 text-base leading-relaxed text-slate-400">
            Ten modules, fifty-two lessons, plus a free-form playground
            and a few longer guided projects. Kept here as personal
            reference and warm-up practice.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-4">
            Modules
          </h2>
          <ul className="divide-y divide-slate-800/60 border-y border-slate-800/60">
            {modules.map((m) => (
              <li key={m.slug}>
                <Link
                  href={`/learn/${m.slug}/${m.firstLesson}`}
                  className="grid grid-cols-[3rem_1fr_auto] gap-4 py-3 items-baseline hover:bg-slate-900/40 -mx-3 px-3 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <span className="font-mono text-xs text-indigo-400">{m.num}</span>
                  <div className="min-w-0">
                    <p className="text-slate-100 font-medium">{m.title}</p>
                    <p className="text-sm text-slate-400">{m.desc}</p>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{m.lessons} lessons</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 grid sm:grid-cols-2 gap-4">
          <div className="rounded-lg border border-slate-800/60 bg-slate-900/30 p-4">
            <h2 className="font-mono text-xs uppercase tracking-widest text-slate-500">
              Playground
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Same SQLite engine as the lessons, no scaffolding. Drop in,
              run whatever.
            </p>
            <Link
              href="/playground"
              className="mt-3 inline-block text-sm text-indigo-400 hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
            >
              Open the playground →
            </Link>
          </div>
          <div className="rounded-lg border border-slate-800/60 bg-slate-900/30 p-4">
            <h2 className="font-mono text-xs uppercase tracking-widest text-slate-500">
              Projects
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Longer-form guided projects that reuse what the modules
              cover. Useful when I want a less-structured exercise.
            </p>
            <Link
              href="/projects"
              className="mt-3 inline-block text-sm text-indigo-400 hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
            >
              Open the project list →
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800/60 py-6">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span className="font-mono">sql-mastery</span>
          <span>Personal practice. Next.js + sql.js.</span>
        </div>
      </footer>
    </div>
  );
}
