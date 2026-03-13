'use client';

import Link from 'next/link';
import { CheckCircle2, Circle, BookOpen } from 'lucide-react';
import { useProgressStore } from '@/lib/progress';
import type { Lesson, ModuleInfo } from '@/lib/lessons';

interface LessonNavProps {
  currentLesson: Lesson;
  moduleLessons: Lesson[];
  moduleInfo: ModuleInfo;
  className?: string;
}

const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
  blue: { bg: 'bg-blue-900/30', border: 'border-blue-700/50', text: 'text-blue-400' },
  green: { bg: 'bg-green-900/30', border: 'border-green-700/50', text: 'text-green-400' },
  purple: { bg: 'bg-purple-900/30', border: 'border-purple-700/50', text: 'text-purple-400' },
  orange: { bg: 'bg-orange-900/30', border: 'border-orange-700/50', text: 'text-orange-400' },
  red: { bg: 'bg-red-900/30', border: 'border-red-700/50', text: 'text-red-400' },
  teal: { bg: 'bg-teal-900/30', border: 'border-teal-700/50', text: 'text-teal-400' },
  pink: { bg: 'bg-pink-900/30', border: 'border-pink-700/50', text: 'text-pink-400' },
  indigo: { bg: 'bg-indigo-900/30', border: 'border-indigo-700/50', text: 'text-indigo-400' },
  yellow: { bg: 'bg-yellow-900/30', border: 'border-yellow-700/50', text: 'text-yellow-400' },
};

export default function LessonNav({
  currentLesson,
  moduleLessons,
  moduleInfo,
  className = '',
}: LessonNavProps) {
  const completedLessons = useProgressStore((state) => state.completedLessons);
  const colors = colorClasses[moduleInfo.color] || colorClasses.blue;

  return (
    <nav className={`w-64 flex-shrink-0 ${className}`}>
      <div className={`rounded-lg border ${colors.border} ${colors.bg} p-4`}>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className={`w-5 h-5 ${colors.text}`} />
          <h2 className={`font-semibold ${colors.text}`}>{moduleInfo.name}</h2>
        </div>

        <ul className="space-y-1">
          {moduleLessons.map((lesson) => {
            const isCompleted = completedLessons.includes(
              `${lesson.moduleSlug}/${lesson.lessonSlug}`
            );
            const isCurrent =
              lesson.moduleSlug === currentLesson.moduleSlug &&
              lesson.lessonSlug === currentLesson.lessonSlug;

            return (
              <li key={lesson.lessonSlug}>
                <Link
                  href={`/learn/${lesson.moduleSlug}/${lesson.lessonSlug}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    isCurrent
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  )}
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
