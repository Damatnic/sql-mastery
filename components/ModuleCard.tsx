'use client';

import Link from 'next/link';
import { useProgressStore } from '@/lib/progress';
import { useThreadProgressStore } from '@/lib/thread-progress';
import { getThreadForModule, projectChallenges } from '@/lib/project-threads';
import type { ModuleInfo } from '@/lib/lessons';

interface ModuleCardProps {
  module: ModuleInfo;
  lessonCount: number;
  firstLessonSlug: string;
}

const moduleNumbers: Record<string, number> = {
  'getting-started': 1,
  'data-analysis': 2,
  'joining-tables': 3,
  'subqueries-ctes': 4,
  'modifying-data': 5,
  'functions': 6,
  'window-functions': 7,
  'database-objects': 8,
  'advanced': 9,
  'school-advanced': 10,
};

export default function ModuleCard({ module, lessonCount, firstLessonSlug }: ModuleCardProps) {
  const getModuleProgress = useProgressStore((state) => state.getModuleProgress);
  const { isChallengeCompleted } = useThreadProgressStore();
  const progress = getModuleProgress(module.slug, lessonCount);
  const moduleNumber = moduleNumbers[module.slug] || 1;
  const isComplete = progress === 100;

  const thread = getThreadForModule(moduleNumber);
  const threadProgress = (() => {
    if (!thread) return { completed: 0, total: 0 };
    const moduleThreadChallenges = Object.entries(projectChallenges).filter(([key, c]) => {
      const moduleSlug = key.split('/')[0];
      return c.threadId === thread.id && moduleSlug === module.slug;
    });
    return {
      total: moduleThreadChallenges.length,
      completed: moduleThreadChallenges.filter(([key]) => isChallengeCompleted(key)).length,
    };
  })();

  const statusText = isComplete ? '✓ complete' : progress > 0 ? `${progress}%` : '─';
  const statusClass = isComplete
    ? 'text-emerald-400'
    : progress > 0
    ? 'text-indigo-400'
    : 'text-slate-500';

  return (
    <Link
      href={`/learn/${module.slug}/${firstLessonSlug}`}
      className="group block font-mono p-4 rounded border border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-indigo-400/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      aria-label={`Open module ${module.name}`}
    >
      <div className="flex items-baseline gap-2 text-sm">
        <span className="text-indigo-400">{String(moduleNumber).padStart(2, '0')}</span>
        <span className="text-slate-100">modules/{module.slug}/</span>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-slate-400 line-clamp-2">{module.name}</p>

      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="text-slate-500">
          {lessonCount} lessons
          {thread && threadProgress.total > 0 && (
            <span className="ml-2">· {threadProgress.completed}/{threadProgress.total} project</span>
          )}
        </span>
        <span className={statusClass}>{statusText}</span>
      </div>
    </Link>
  );
}
