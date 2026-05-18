'use client';

import Link from 'next/link';
import { useProgressStore } from '@/lib/progress';
import { useShowcase } from '@/lib/mode';
import type { Lesson, ModuleInfo } from '@/lib/lessons';

interface LessonNavProps {
  currentLesson: Lesson;
  moduleLessons: Lesson[];
  moduleInfo: ModuleInfo;
  className?: string;
}

export default function LessonNav({
  currentLesson,
  moduleLessons,
  moduleInfo,
  className = '',
}: LessonNavProps) {
  const completedLessons = useProgressStore((state) => state.completedLessons);
  const showcase = useShowcase();

  return (
    <nav
      className={`w-64 flex-shrink-0 font-mono text-sm ${className}`}
      aria-label="Module lessons"
    >
      <div className="rounded border border-slate-800 bg-slate-900/40 p-3">
        <p className="px-2 py-1 text-[10px] uppercase tracking-widest text-slate-500"># {moduleInfo.slug}</p>

        <ul className="mt-1 space-y-0.5">
          {moduleLessons.map((lesson, idx) => {
            const isCompleted =
              showcase ||
              completedLessons.includes(
                `${lesson.moduleSlug}/${lesson.lessonSlug}`,
              );
            const isCurrent =
              lesson.moduleSlug === currentLesson.moduleSlug &&
              lesson.lessonSlug === currentLesson.lessonSlug;
            const marker = isCompleted ? '✓' : isCurrent ? '>' : ' ';
            const markerClass = isCompleted
              ? 'text-emerald-400'
              : isCurrent
              ? 'text-indigo-400'
              : 'text-slate-600';

            return (
              <li key={lesson.lessonSlug}>
                <Link
                  href={`/learn/${lesson.moduleSlug}/${lesson.lessonSlug}`}
                  className={`flex items-baseline gap-2 px-2 py-1.5 rounded text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                    isCurrent
                      ? 'bg-indigo-400/10 text-indigo-400'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  <span aria-hidden="true" className={`w-3 ${markerClass}`}>
                    {marker}
                  </span>
                  <span className="text-[10px] text-slate-600">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="truncate">{lesson.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
