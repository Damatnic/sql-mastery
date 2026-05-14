'use client';

import Link from 'next/link';
import XPBadge from '@/components/XPBadge';
import ProjectCard from '@/components/ProjectCard';
import { getAllProjects } from '@/lib/projects';
import { useProjectProgressStore } from '@/lib/project-progress';
import { projectThreads, projectChallenges } from '@/lib/project-threads';
import { useThreadProgressStore } from '@/lib/thread-progress';

export default function ProjectsPage() {
  const projects = getAllProjects();
  const getProjectProgress = useProjectProgressStore((state) => state.getProjectProgress);
  const { isChallengeCompleted } = useThreadProgressStore();

  const totalSteps = projects.reduce((sum, p) => sum + p.steps.length, 0);
  const completedSteps = projects.reduce((sum, p) => {
    const progress = getProjectProgress(p.slug, p.steps.length);
    return sum + Math.round((progress / 100) * p.steps.length);
  }, 0);

  const getThreadProgress = (threadId: string) => {
    const threadChallengeKeys = Object.entries(projectChallenges)
      .filter(([, c]) => c.threadId === threadId)
      .map(([key]) => key);
    const completed = threadChallengeKeys.filter((key) => isChallengeCompleted(key)).length;
    return { completed, total: threadChallengeKeys.length };
  };

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
            <span className="text-slate-100">&gt; projects</span>
            <Link
              href="/playground"
              className="text-slate-400 hover:text-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
            >
              playground
            </Link>
            <Link
              href="/stats"
              className="text-slate-400 hover:text-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
            >
              stats
            </Link>
            <XPBadge />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <section className="font-mono text-sm">
          <p>
            <span className="text-indigo-400">damato@sql</span>
            <span className="text-slate-500">:</span>
            <span className="text-slate-500">~/projects$</span>{' '}
            <span>ls</span>
            <span className="ml-1 inline-block w-2 h-4 align-text-bottom bg-slate-100 terminal-cursor" aria-hidden="true" />
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {completedSteps} of {totalSteps} steps done across {projects.length} standalone projects
          </p>
        </section>

        <section className="mt-10">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-mono"># threads</p>
          <p className="mt-1 text-xs text-slate-500 font-mono">
            longer running scenarios that span multiple modules.
          </p>
          <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectThreads.map((thread) => {
              const { completed, total } = getThreadProgress(thread.id);
              const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
              const done = percent === 100;
              const statusText = done ? '✓ complete' : percent > 0 ? `${percent}%` : '─';
              const statusClass = done
                ? 'text-emerald-400'
                : percent > 0
                ? 'text-indigo-400'
                : 'text-slate-500';

              return (
                <Link
                  key={thread.id}
                  href={`/projects/thread/${thread.id}`}
                  className="group block font-mono p-4 rounded border border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-indigo-400/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  aria-label={`Open thread ${thread.title}`}
                >
                  <p className="text-sm text-slate-100">threads/{thread.id}/</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400 line-clamp-2">
                    {thread.description}
                  </p>
                  <p className="mt-3 text-[11px] text-slate-500">
                    [{thread.databaseLabel}] · modules {thread.modules[0]}-{thread.modules[thread.modules.length - 1]}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-500">{completed} of {total} done</span>
                    <span className={statusClass}>{statusText}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-10">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-mono"># projects</p>
          <p className="mt-1 text-xs text-slate-500 font-mono">
            standalone guided projects against a real sqlite database.
          </p>
          <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800/60 py-5 font-mono text-xs">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3 text-slate-500">
          <span>
            <span className="text-emerald-400">exit 0</span> · personal use · next.js + sql.js
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
