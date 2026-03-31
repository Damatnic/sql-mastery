'use client';

import Link from 'next/link';
import { ChevronRight, Clock, Database, Layers } from 'lucide-react';
import { useProjectProgressStore } from '@/lib/project-progress';
import { getDifficultyColors, getProjectColors, type Project } from '@/lib/projects';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const getProjectProgress = useProjectProgressStore((state) => state.getProjectProgress);
  const progress = getProjectProgress(project.slug, project.steps.length);
  const colors = getProjectColors(project.color);
  const difficultyColors = getDifficultyColors(project.difficulty);

  const isComplete = progress === 100;

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`block rounded-xl border ${colors.border} ${colors.bg} p-6 hover:border-slate-600 transition-all group`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${difficultyColors.bg} ${difficultyColors.text} border ${difficultyColors.border}`}
            >
              {project.difficulty}
            </span>
            {isComplete && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-900/30 text-emerald-400 border border-emerald-700/50">
                Complete
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-slate-200 transition-colors">
            {project.title}
          </h3>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-colors flex-shrink-0 mt-1" />
      </div>

      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{project.description}</p>

      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{project.estimatedTime}</span>
        </div>
        <div className="flex items-center gap-1">
          <Database className="w-3.5 h-3.5" />
          <span>{project.databaseLabel}</span>
        </div>
        <div className="flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" />
          <span>{project.steps.length} steps</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Progress</span>
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
