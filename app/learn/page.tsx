'use client';

import Link from 'next/link';
import XPBadge from '@/components/XPBadge';
import ModuleCard from '@/components/ModuleCard';
import { getAllModules, getModuleLessons } from '@/lib/lessons';
import { useProgressStore } from '@/lib/progress';

export default function LearnPage() {
  const modules = getAllModules();
  const completedLessons = useProgressStore((state) => state.completedLessons);

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedCount = completedLessons.length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/60">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between text-xs font-mono">
          <Link href="/" className="text-slate-400 hover:text-slate-100 transition-colors">
            <span className="text-indigo-400">$</span> cd ~
          </Link>
          <div className="flex items-center gap-5">
            <span className="text-slate-100">&gt; lessons</span>
            <Link href="/projects" className="text-slate-400 hover:text-slate-100 transition-colors">projects</Link>
            <Link href="/playground" className="text-slate-400 hover:text-slate-100 transition-colors">playground</Link>
            <XPBadge />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <section className="font-mono text-sm">
          <p>
            <span className="text-indigo-400">damato@sql</span>
            <span className="text-slate-500">:</span>
            <span className="text-slate-500">~/lessons$</span>{' '}
            <span>status</span>
            <span className="ml-1 inline-block w-2 h-4 align-text-bottom bg-slate-100 terminal-cursor" aria-hidden="true" />
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {completedCount} of {totalLessons} lessons done across {modules.length} modules
          </p>
        </section>

        <section className="mt-8">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-mono"># modules</p>
          <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => {
              const moduleLessons = getModuleLessons(module.slug);
              const firstLesson = moduleLessons[0];
              const firstLessonSlug = firstLesson?.lessonSlug || 'introduction';

              return (
                <ModuleCard
                  key={module.slug}
                  module={module}
                  lessonCount={module.lessons.length}
                  firstLessonSlug={firstLessonSlug}
                />
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800/60 py-5 font-mono text-xs">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3 text-slate-500">
          <span><span className="text-emerald-400">exit 0</span> · personal use · next.js + sql.js</span>
          <Link href="/" className="hover:text-slate-100 transition-colors">~ home</Link>
        </div>
      </footer>
    </div>
  );
}
