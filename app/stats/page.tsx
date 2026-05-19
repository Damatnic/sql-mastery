'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useProgressStore, getRank, getRankLadder, isLessonDue } from '@/lib/progress';
import { useShowcase } from '@/lib/mode';
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
  // Captured once (lazy init) so relative-time labels stay pure across renders.
  const [now] = useState(() => Date.now());
  const showcase = useShowcase();

  const xp = useProgressStore((s) => s.xp);
  const streak = useProgressStore((s) => s.streak);
  const maxStreak = useProgressStore((s) => s.maxStreak);
  const lastActivity = useProgressStore((s) => s.lastActivity);
  const completedLessons = useProgressStore((s) => s.completedLessons);
  const reviewedAt = useProgressStore((s) => s.reviewedAt);
  const completedSteps = useProjectProgressStore((s) => s.completedSteps);
  const completedChallenges = useThreadProgressStore((s) => s.completedChallenges);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- mount flag to avoid SSR/hydration mismatch
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
  const completedChallengeCount = showcase
    ? totalChallenges
    : Object.keys(projectChallenges).filter((k) => completedChallenges[k]).length;
  const completedProjectSteps = showcase
    ? totalProjectSteps
    : allProjects.reduce(
        (sum, p) => sum + (completedSteps[p.slug]?.length ?? 0),
        0,
      );

  // Filter stale slugs from localStorage that no longer match current lesson data
  const validLessonKeys = new Set(lessons.map((l) => `${l.moduleSlug}/${l.lessonSlug}`));
  const effectiveCompleted = showcase
    ? [...validLessonKeys]
    : completedLessons.filter((k) => validLessonKeys.has(k));
  const liveCompletedLessonCount = effectiveCompleted.length;

  const moduleRows = modules.map((m) => {
    const moduleLessons = lessons.filter((l) => l.moduleSlug === m.slug);
    const done = showcase
      ? moduleLessons.length
      : moduleLessons.filter((l) =>
          completedLessons.includes(`${l.moduleSlug}/${l.lessonSlug}`),
        ).length;
    const total = moduleLessons.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { slug: m.slug, name: m.name, done, total, pct };
  });

  // Review queue: spaced repetition. Due lessons (never reviewed since
  // completion, or past their interval) float to the top.
  const reviewItems = (showcase ? [] : completedLessons)
    .filter((k) => validLessonKeys.has(k))
    .map((k) => {
      const [moduleSlug, lessonSlug] = k.split("/");
      const lesson = lessons.find((l) => l.moduleSlug === moduleSlug && l.lessonSlug === lessonSlug);
      const entry = reviewedAt[k];
      const ts = typeof entry === "string" ? entry : entry?.at ?? "";
      return {
        key: k,
        moduleSlug,
        lessonSlug,
        title: lesson?.title ?? k,
        ts,
        due: isLessonDue(k, reviewedAt),
      };
    });
  const dueCount = reviewItems.filter((r) => r.due).length;
  const reviewQueue = reviewItems
    .sort((a, b) => {
      if (a.due !== b.due) return a.due ? -1 : 1;
      return a.ts.localeCompare(b.ts);
    })
    .slice(0, 8);

  const weakModules = moduleRows.filter((m) => m.pct < 50 && m.total > 0).slice(0, 5);

  const daysSince = (iso: string): string => {
    if (!iso) return "never";
    const days = Math.round(
      (now - new Date(iso).getTime()) / 86_400_000,
    );
    if (days <= 0) return "today";
    if (days === 1) return "1d ago";
    return `${days}d ago`;
  };

  const projectRows = allProjects.map((p) => {
    const total = p.steps.length;
    const done = showcase ? total : (completedSteps[p.slug]?.length ?? 0);
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { slug: p.slug, title: p.title, done, total, pct };
  });

  const threadRows = projectThreads.map((t) => {
    const keys = Object.entries(projectChallenges)
      .filter(([, c]) => c.threadId === t.id)
      .map(([k]) => k);
    const total = keys.length;
    const done = showcase ? total : keys.filter((k) => completedChallenges[k]).length;
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
            {showcase && (
              <section className="mt-8">
                <p className="text-xs uppercase tracking-widest text-slate-500"># status</p>
                <p className="mt-3 text-sm">
                  <span className="text-emerald-400">course complete</span>
                  <span className="text-slate-500">
                    {' '}· {totalLessons} / {totalLessons} lessons · {totalProjectSteps} /{' '}
                    {totalProjectSteps} project steps · {totalChallenges} / {totalChallenges}{' '}
                    challenges
                  </span>
                </p>
              </section>
            )}
            {!showcase && (
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
            )}

            <section className="mt-10">
              <p className="text-xs uppercase tracking-widest text-slate-500"># totals</p>
              <div className="mt-2 text-sm text-slate-300 space-y-1">
                <p>
                  lessons{'    '}
                  <span className="text-slate-100">{liveCompletedLessonCount}</span>
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

            {!showcase && (
            <section className="mt-10">
              <p className="text-xs uppercase tracking-widest text-slate-500">
                # review queue
                {dueCount > 0 && (
                  <span className="ml-2 text-amber-400 normal-case tracking-normal">
                    {dueCount} due
                  </span>
                )}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                spaced repetition. re-solving a query in a due lesson from
                memory (not just opening it) records the review and pushes the
                next one further out. due ones are first.
              </p>
              {reviewQueue.length === 0 ? (
                <p className="mt-3 text-xs text-slate-500">no completed lessons yet</p>
              ) : (
                <ul className="mt-3 text-xs space-y-1">
                  {reviewQueue.map((r) => (
                    <li key={r.key} className="grid grid-cols-[1fr_auto_auto] gap-4 items-baseline">
                      <Link
                        href={`/learn/${r.moduleSlug}/${r.lessonSlug}`}
                        className="text-slate-300 hover:text-slate-100 truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
                      >
                        {r.moduleSlug}/{r.lessonSlug}
                      </Link>
                      <span className="text-slate-500 truncate hidden md:inline">{r.title}</span>
                      <span className={`tabular-nums ${r.due ? "text-amber-400" : "text-slate-500"}`}>
                        {r.due ? "due now" : daysSince(r.ts)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-[11px] text-slate-600">
                <Link href="/review" className="text-indigo-400 hover:underline">
                  start mixed review →
                </Link>{' '}
                · interleaved across modules, due first. or type{' '}
                <span className="text-slate-400">review</span> in the home shell.
              </p>
            </section>
            )}

            {weakModules.length > 0 && (
              <section className="mt-10">
                <p className="text-xs uppercase tracking-widest text-slate-500"># weak modules</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  under 50% complete. worth a pass.
                </p>
                <ul className="mt-3 text-xs space-y-1">
                  {weakModules.map((m) => (
                    <li key={m.slug} className="grid grid-cols-[1fr_auto] gap-4 items-baseline">
                      <span className="text-slate-300 truncate">{m.slug}</span>
                      <span className="text-rose-400 tabular-nums">{m.pct}%</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {!showcase && (
            <section className="mt-10">
              <p className="text-xs uppercase tracking-widest text-slate-500"># rank ladder</p>
              <ul className="mt-3 text-xs space-y-2">
                {ladder.map((r) => {
                  const reached = xp >= r.threshold;
                  return (
                    <li key={r.name} className="grid grid-cols-[1.25rem_1fr_auto] gap-3 items-baseline">
                      <span className={reached ? 'text-emerald-400' : 'text-slate-600'}>
                        {reached ? '✓' : '·'}
                      </span>
                      <span className={reached ? 'text-slate-200' : 'text-slate-500'}>
                        <span>{r.name}</span>
                        <span className="ml-2 text-slate-500">{r.blurb}</span>
                      </span>
                      <span className="text-slate-500 tabular-nums">
                        {r.threshold} xp
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
            )}
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
