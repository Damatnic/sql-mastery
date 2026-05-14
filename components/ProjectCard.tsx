'use client';

import Link from 'next/link';
import { useProjectProgressStore } from '@/lib/project-progress';
import { type Project } from '@/lib/projects';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const getProjectProgress = useProjectProgressStore((state) => state.getProjectProgress);
  const progress = getProjectProgress(project.slug, project.steps.length);
  const isComplete = progress === 100;

  const statusText = isComplete ? '✓ complete' : progress > 0 ? `${progress}%` : '─';
  const statusClass = isComplete
    ? 'text-emerald-400'
    : progress > 0
    ? 'text-indigo-400'
    : 'text-slate-500';

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block font-mono p-4 rounded border border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-indigo-400/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      aria-label={`Open project ${project.title}`}
    >
      <div className="text-sm">
        <span className="text-slate-100">projects/{project.slug}/</span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-400 line-clamp-2">{project.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
        <span>[{project.difficulty}]</span>
        <span>·</span>
        <span>{project.estimatedTime}</span>
        <span>·</span>
        <span>{project.databaseLabel}</span>
        <span>·</span>
        <span>{project.steps.length} steps</span>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="text-slate-500">progress</span>
        <span className={statusClass}>{statusText}</span>
      </div>
    </Link>
  );
}
