'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useProgressStore } from '@/lib/progress';
import type { ModuleInfo } from '@/lib/lessons';

interface ModuleCardProps {
  module: ModuleInfo;
  lessonCount: number;
  firstLessonSlug: string;
}

const colorClasses: Record<string, { bg: string; border: string; text: string; progress: string }> = {
  blue: { bg: 'bg-blue-900/20', border: 'border-blue-700/50', text: 'text-blue-400', progress: 'bg-blue-500' },
  green: { bg: 'bg-green-900/20', border: 'border-green-700/50', text: 'text-green-400', progress: 'bg-green-500' },
  purple: { bg: 'bg-purple-900/20', border: 'border-purple-700/50', text: 'text-purple-400', progress: 'bg-purple-500' },
  orange: { bg: 'bg-orange-900/20', border: 'border-orange-700/50', text: 'text-orange-400', progress: 'bg-orange-500' },
  red: { bg: 'bg-red-900/20', border: 'border-red-700/50', text: 'text-red-400', progress: 'bg-red-500' },
  teal: { bg: 'bg-teal-900/20', border: 'border-teal-700/50', text: 'text-teal-400', progress: 'bg-teal-500' },
  pink: { bg: 'bg-pink-900/20', border: 'border-pink-700/50', text: 'text-pink-400', progress: 'bg-pink-500' },
  indigo: { bg: 'bg-indigo-900/20', border: 'border-indigo-700/50', text: 'text-indigo-400', progress: 'bg-indigo-500' },
  yellow: { bg: 'bg-yellow-900/20', border: 'border-yellow-700/50', text: 'text-yellow-400', progress: 'bg-yellow-500' },
};

export default function ModuleCard({ module, lessonCount, firstLessonSlug }: ModuleCardProps) {
  const getModuleProgress = useProgressStore((state) => state.getModuleProgress);
  const progress = getModuleProgress(module.slug, lessonCount);
  const colors = colorClasses[module.color] || colorClasses.blue;

  return (
    <Link
      href={`/learn/${module.slug}/${firstLessonSlug}`}
      className={`block rounded-xl border ${colors.border} ${colors.bg} p-6 hover:border-slate-600 transition-all group`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className={`text-xs font-medium ${colors.text} uppercase tracking-wider`}>
            Module {module.lessons[0] <= 5 ? 1 : Math.ceil(module.lessons[0] / 5)}
          </span>
          <h3 className="text-xl font-bold text-white mt-1 group-hover:text-slate-200 transition-colors">
            {module.name}
          </h3>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-colors" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">{lessonCount} lessons</span>
          <span className={colors.text}>{progress}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${colors.progress} rounded-full transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
