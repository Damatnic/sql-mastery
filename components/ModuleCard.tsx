'use client';

import Link from 'next/link';
import { ChevronRight, CheckCircle2, Hammer } from 'lucide-react';
import { useProgressStore } from '@/lib/progress';
import { useThreadProgressStore } from '@/lib/thread-progress';
import { getThreadForModule, projectChallenges } from '@/lib/project-threads';
import type { ModuleInfo } from '@/lib/lessons';

interface ModuleCardProps {
  module: ModuleInfo;
  lessonCount: number;
  firstLessonSlug: string;
}

const colorClasses: Record<string, { bg: string; border: string; text: string; progress: string; icon: string }> = {
  blue: { bg: 'bg-blue-900/20', border: 'border-blue-700/50', text: 'text-blue-400', progress: 'bg-blue-500', icon: 'bg-blue-500/20' },
  green: { bg: 'bg-green-900/20', border: 'border-green-700/50', text: 'text-green-400', progress: 'bg-green-500', icon: 'bg-green-500/20' },
  purple: { bg: 'bg-purple-900/20', border: 'border-purple-700/50', text: 'text-purple-400', progress: 'bg-purple-500', icon: 'bg-purple-500/20' },
  orange: { bg: 'bg-orange-900/20', border: 'border-orange-700/50', text: 'text-orange-400', progress: 'bg-orange-500', icon: 'bg-orange-500/20' },
  red: { bg: 'bg-red-900/20', border: 'border-red-700/50', text: 'text-red-400', progress: 'bg-red-500', icon: 'bg-red-500/20' },
  teal: { bg: 'bg-teal-900/20', border: 'border-teal-700/50', text: 'text-teal-400', progress: 'bg-teal-500', icon: 'bg-teal-500/20' },
  pink: { bg: 'bg-pink-900/20', border: 'border-pink-700/50', text: 'text-pink-400', progress: 'bg-pink-500', icon: 'bg-pink-500/20' },
  indigo: { bg: 'bg-indigo-900/20', border: 'border-indigo-700/50', text: 'text-indigo-400', progress: 'bg-indigo-500', icon: 'bg-indigo-500/20' },
  yellow: { bg: 'bg-amber-900/20', border: 'border-amber-700/50', text: 'text-amber-400', progress: 'bg-amber-500', icon: 'bg-amber-500/20' },
};

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
};

export default function ModuleCard({ module, lessonCount, firstLessonSlug }: ModuleCardProps) {
  const getModuleProgress = useProgressStore((state) => state.getModuleProgress);
  const { isChallengeCompleted } = useThreadProgressStore();
  const progress = getModuleProgress(module.slug, lessonCount);
  const colors = colorClasses[module.color] || colorClasses.blue;
  const moduleNumber = moduleNumbers[module.slug] || 1;
  const isComplete = progress === 100;

  // Get project thread for this module
  const thread = getThreadForModule(moduleNumber);

  // Calculate project thread progress for this module
  const threadProgress = (() => {
    if (!thread) return { completed: 0, total: 0 };
    const moduleThreadChallenges = Object.entries(projectChallenges)
      .filter(([key, c]) => {
        const moduleSlug = key.split('/')[0];
        return c.threadId === thread.id && moduleSlug === module.slug;
      });
    return {
      total: moduleThreadChallenges.length,
      completed: moduleThreadChallenges.filter(([key]) => isChallengeCompleted(key)).length,
    };
  })();

  return (
    <Link
      href={`/learn/${module.slug}/${firstLessonSlug}`}
      className={`block rounded-xl border ${colors.border} ${colors.bg} p-6 hover:border-slate-600 transition-all duration-200 group hover:-translate-y-1`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg ${colors.icon} flex items-center justify-center shrink-0`}>
            {isComplete ? (
              <CheckCircle2 className={`w-5 h-5 ${colors.text}`} />
            ) : (
              <span className={`text-lg font-bold ${colors.text}`}>{moduleNumber}</span>
            )}
          </div>
          <div>
            <span className={`text-xs font-medium ${colors.text} uppercase tracking-wider`}>
              Module {moduleNumber}
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5 group-hover:text-slate-200 transition-colors">
              {module.name}
            </h3>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">{lessonCount} lessons</span>
          <span className={`font-medium ${isComplete ? 'text-emerald-400' : colors.text}`}>
            {isComplete ? 'Complete' : `${progress}%`}
          </span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${isComplete ? 'bg-emerald-500' : colors.progress} rounded-full transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Project Thread Progress */}
        {thread && threadProgress.total > 0 && (
          <div className="pt-2 mt-2 border-t border-slate-700/50">
            <div className="flex items-center gap-2">
              <Hammer className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-slate-500">Project</span>
              <span className="text-xs text-amber-400 ml-auto">
                {threadProgress.completed}/{threadProgress.total}
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
