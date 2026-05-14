'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useProgressStore, getRank, getRankLadder } from '@/lib/progress';
import { useProjectProgressStore } from '@/lib/project-progress';
import { useThreadProgressStore } from '@/lib/thread-progress';
import { lessons, modules } from '@/lib/lessons';
import { getAllProjects } from '@/lib/projects';
import { projectThreads, projectChallenges } from '@/lib/project-threads';

function bar(pct: number, width = 12): string {
  const filled = Math.round((pct / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(Math.max(0, width - filled));
}

function daysAgo(iso: string): string {
  if (!iso) return 'never';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last = new Date(iso);
  last.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - last.getTime()) / 86_400_000);
  if (diff <= 0) return 'today';
  if (diff === 1) return 'yesterday';
  return `${diff} days ago`;
}

export default function StatsPage() {
  const [mounted, setMounted] = useState(false);

  const xp = useProgressStore((s) => s.xp);
  const streak = useProgressStore((s) => s.streak);
  const maxStreak = useProgressStore((s) => s.maxStreak);
  const lastActivity = useProgressStore((s) => s.lastActivity);
  const completedLessons = useProgressStore((s) => s.completedLessons);
  const completedSteps = useProjectProgressStore((s) => s.completedSteps);
  const completedChallenges = useThreadProgressStore((s) => s.completedChallenges);

  useEffect(() => setMounted(true), []);

  const rank = getRank(xp);
  const ladder = getRankLadder();
  const nextRank = ladder.find((r) => r.threshold > xp);
  const xpToNext = nextRank ? nextRank.threshold - xp : 0;
  const rankProgress = nextRank
    ? Math.min(
        100,
        Math.round(
          ((xp - rank.threshold) / (nextRank.threshold - rank.threshold)) * 100,
        ),
      )
    : 100;

  const allProjects = getAllProjects();
  const totalLessons = lessons.length;
  const totalProjectSteps = allProjects.reduce((s, p) => s + p.steps.length, 0);
  const totalChallenges = Object.keys(projectChallenges).length;
  const completedChallengeCount = Object.keys(projectChallenges).filter((k) =>
    completedChallenges[k],
  ).length;
  const completedProjectSteps = allProjects.reduce(
    (sum, p) => sum + (completedSteps[p.slug]?.length ?? 0),
    0,
  );

  const moduleRows = modules.map((m) => {
    const moduleLessons = lessons.filter((l) => l.moduleSlug === m.slug);
    const done = moduleLessons.filter((l) =>
      completedLessons.includes(`${l.moduleSlug}/${l.lessonSlug}`),
    ).length;
    const total = moduleLessons.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { slug: m.slug, name: m.name, done, total, pct };
  });

  const projectRows = allProjects.map((p) => {
    const done = completedSteps[p.slug]?.length ?? 0;
    const total = p.steps.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { slug: p.slug, title: p.title, done, total, pct };
  });

  const threadRows = projectThreads.map((t) => {
    const keys = Object.entries(projectChallenges)
      .filter(([, c]) => c.threadId === t.id)
      .map(([k]) => k);
    const done = keys.filter((k) => completedChallenges[k]).length;
    const total = keys.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { id: t.id, title: t.title, done, total, pct };
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/60">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between text-xs font-mono">
          <Link
            href="/"
            className="text-slate-400 hover:text-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
          >
            <span className="text-indigo-400">$</span> cd ~
          </Link>
          <div className="flex items-center gap-5">
            <Link
              href="/learn"
              className="text-slate-400 hover:text-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
            >
              lessons
            </Link>
            <Link
              href="/projects"
              className="text-slate-400 hover:text-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
            >
              projects
            </Link>
            <Link
              href="/playground"
              className="text-slate-400 hover:text-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
            >
              playground
            </Link>
            <span className="text-slate-100">&gt; stats</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 font-mono">
        <section className="text-sm">
          <p>
            <span className="text-indigo-400">damato@sql</span>
            <span className="text-slate-500">:</span>
            <span className="text-slate-500">~$</span>{' '}
            <span>stats --all</span>
            <span className="ml-1 inline-block w-2 h-4 align-text-bottom bg-slate-100 terminal-cursor" aria-hidden="true" />
          </p>
        </section>

        {!mounted ? (
          <p className="mt-8 text-xs text-slate-500">loading state from localstorage…</p>
        ) : (
          <>
            <section className="mt-8">
              <p className="text-xs uppercase tracking-widest text-slate-500"># profile</p>
              <div className="mt-3 grid sm:grid-cols-2 gap-x-10 gap-y-2 text-sm">
                <p>
                  <span className="text-slate-500">rank</span>
                  {'  '}
                  <span className="text-indigo-400">[{rank.name}]</span>
                </p>
                <p>
                  <span className="text-slate-500">xp</span>
                  {'    '}
                  <span className="text-slate-100">{xp.toLocaleString()}</span>
                  {nextRank && (
                    <span className="text-slate-500">
                      {' · '}
                      {xpToNext} to <span className="text-indigo-400">{nextRank.name}</span>
                    </span>
                  )}
                </p>
                <p>
                  <span className="text-slate-500">streak</span>
                  {' '}
                  <span className="text-amber-400">{streak}d</span>
                  <span className="text-slate-500"> · max </span>
                  <span className="text-slate-300">{maxStreak}d</span>
                </p>
                <p>
                  <span className="text-slate-500">last seen</span>
                  {' '}
                  <span className="text-slate-300">{daysAgo(lastActivity)}</span>
                </p>
              </div>

              {nextRank && (
                <div className="mt-4 max-w-md">
                  <p className="text-[11px] text-slate-500 mb-1">
                    progress to {nextRank.name}: {rankProgress}%
                  </p>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-400 rounded-full transition-all duration-300"
                      style={{ width: `${rankProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </section>

            <section className="mt-10">
              <p className="text-xs uppercase tracking-widest text-slate-500"># totals</p>
              <div className="mt-2 text-sm text-slate-300 space-y-1">
                <p>
                  lessons{'    '}
                  <span className="text-slate-100">{completedLessons.length}</span>
                  <span className="text-slate-500"> / {totalLessons}</span>
                </p>
                <p>
                  project steps{'  '}
                  <span className="text-slate-100">{completedProjectSteps}</span>
                  <span className="text-slate-500"> / {totalProjectSteps}</span>
                </p>
                <p>
                  thread challenges{'  '}
                  <span className="text-slate-100">{completedChallengeCount}</span>
                  <span className="text-slate-500"> / {totalChallenges}</span>
                </p>
              </div>
            </section>

            <section className="mt-10">
              <p className="text-xs uppercase tracking-widest text-slate-500"># lessons by module</p>
              <ul className="mt-3 text-xs space-y-1">
                {moduleRows.map((m) => (
                  <li key={m.slug} className="grid grid-cols-[1fr_auto_auto] gap-4 items-baseline">
                    <span className="text-slate-300 truncate">{m.slug}</span>
                    <span className={`tabular-nums ${m.pct === 100 ? 'text-emerald-400' : 'text-indigo-300'}`}>
                      {bar(m.pct)}
                    </span>
                    <span className="text-slate-500 tabular-nums">
                      {m.done}/{m.total}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-10">
              <p className="text-xs uppercase tracking-widest text-slate-500"># projects</p>
              {projectRows.length === 0 ? (
                <p className="mt-2 text-xs text-slate-500">no projects yet</p>
              ) : (
                <ul className="mt-3 text-xs space-y-1">
                  {projectRows.map((p) => (
                    <li key={p.slug} className="grid grid-cols-[1fr_auto_auto] gap-4 items-baseline">
                      <Link
                        href={`/projects/${p.slug}`}
                        className="text-slate-300 hover:text-slate-100 truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
                      >
                        {p.slug}
                      </Link>
                      <span className={`tabular-nums ${p.pct === 100 ? 'text-emerald-400' : 'text-indigo-300'}`}>
                        {bar(p.pct)}
                      </span>
                      <span className="text-slate-500 tabular-nums">
                        {p.done}/{p.total}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mt-10">
              <p className="text-xs uppercase tracking-widest text-slate-500"># threads</p>
              <ul className="mt-3 text-xs space-y-1">
                {threadRows.map((t) => (
                  <li key={t.id} className="grid grid-cols-[1fr_auto_auto] gap-4 items-baseline">
                    <Link
                      href={`/projects/thread/${t.id}`}
                      className="text-slate-300 hover:text-slate-100 truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
                    >
                      {t.id}
                    </Link>
                    <span className={`tabular-nums ${t.pct === 100 ? 'text-emerald-400' : 'text-indigo-300'}`}>
                      {bar(t.pct)}
                    </span>
                    <span className="text-slate-500 tabular-nums">
                      {t.done}/{t.total}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-10">
              <p className="text-xs uppercase tracking-widest text-slate-500"># rank ladder</p>
              <ul className="mt-3 text-xs space-y-1">
                {ladder.map((r) => {
                  const reached = xp >= r.threshold;
                  return (
                    <li key={r.name} className="grid grid-cols-[auto_1fr_auto] gap-4 items-baseline">
                      <span className={reached ? 'text-emerald-400' : 'text-slate-600'}>
                        {reached ? '✓' : '·'}
                      </span>
                      <span className={reached ? 'text-slate-200' : 'text-slate-500'}>
                        {r.name}
                      </span>
                      <span className="text-slate-500 tabular-nums">
                        {r.threshold} xp
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}
      </main>

      <footer className="border-t border-slate-800/60 py-5 text-xs">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3 text-slate-500 font-mono">
          <span>
            <span className="text-emerald-400">exit 0</span> · personal use · all state lives in your browser
          </span>
          <Link
            href="/"
            className="hover:text-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
          >
            ~ home
          </Link>
        </div>
      </footer>
    </div>
  );
}
