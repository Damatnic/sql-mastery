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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/60">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-mono text-sm font-medium hover:text-indigo-400 transition-colors">
            sql-mastery
          </Link>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/learn" className="text-indigo-400 font-medium">Lessons</Link>
            <Link href="/projects" className="text-slate-400 hover:text-slate-100 transition-colors">Projects</Link>
            <Link href="/playground" className="text-slate-400 hover:text-slate-100 transition-colors">Playground</Link>
            <XPBadge />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <section className="mb-8">
          <h1 className="font-mono text-xl">lessons</h1>
          <p className="mt-2 text-sm text-slate-400">
            {completedCount} of {totalLessons} done across {modules.length} modules.
          </p>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </section>
      </main>
    </div>
  );
}
