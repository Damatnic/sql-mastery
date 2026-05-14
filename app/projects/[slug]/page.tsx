'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import ProjectStep from '@/components/ProjectStep';
import AITutor from '@/components/AITutor';
import LessonToolDock, { type DockTool } from '@/components/LessonToolDock';
import XPBadge from '@/components/XPBadge';
import SchemaViewer from '@/components/SchemaViewer';
import { createDatabase, runQuery } from '@/lib/db';
import { COMPANY_DB, STORE_DB, SCHOOL_DB } from '@/lib/databases';
import { getProjectBySlug } from '@/lib/projects';
import { useProjectProgressStore, PROJECT_XP_VALUES } from '@/lib/project-progress';
import { useProgressStore } from '@/lib/progress';
import type { Database as SqlJsDatabase } from 'sql.js';

const databases = {
  company: COMPANY_DB,
  store: STORE_DB,
  school: SCHOOL_DB,
};

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const [database, setDatabase] = useState<SqlJsDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeQuery, setActiveQuery] = useState('');
  const [activeError, setActiveError] = useState<string | undefined>();
  const [dockOpen, setDockOpen] = useState<DockTool | null>(null);

  const project = getProjectBySlug(slug);

  const isStepCompleted = useProjectProgressStore((state) => state.isStepCompleted);
  const completeStep = useProjectProgressStore((state) => state.completeStep);
  const getCompletedStepCount = useProjectProgressStore((state) => state.getCompletedStepCount);
  const resetProject = useProjectProgressStore((state) => state.resetProject);
  const addXP = useProgressStore((state) => state.addXP);

  const completedCount = project ? getCompletedStepCount(project.slug) : 0;
  const totalSteps = project?.steps.length || 0;
  const progress = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
  const isProjectComplete = completedCount === totalSteps && totalSteps > 0;

  // Initialize database
  useEffect(() => {
    if (!project) return;
    const currentProject = project;
    let mounted = true;

    async function initDb() {
      setIsLoading(true);
      try {
        const dbSchema = databases[currentProject.database];
        const db = await createDatabase(dbSchema);
        if (mounted) setDatabase(db);
      } catch {
        // database failed to init; UI falls back to "db unavailable" panel
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initDb();
    return () => {
      mounted = false;
    };
  }, [project]);

  const handleStepComplete = useCallback(
    (stepId: string) => {
      if (!project) return;
      completeStep(project.slug, stepId);
      addXP(PROJECT_XP_VALUES.STEP_COMPLETE);

      // Check if this completes the project
      const newCompletedCount = getCompletedStepCount(project.slug) + 1;
      if (newCompletedCount === project.steps.length) {
        addXP(PROJECT_XP_VALUES.PROJECT_COMPLETE);
      }
    },
    [project, completeStep, addXP, getCompletedStepCount]
  );

  const handleResetProject = useCallback(() => {
    if (!project) return;
    if (confirm('Reset progress on this project?')) {
      resetProject(project.slug);
    }
  }, [project, resetProject]);

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-mono text-sm flex flex-col items-start justify-center px-6 max-w-2xl mx-auto">
        <p>
          <span className="text-indigo-400">damato@sql</span>
          <span className="text-slate-500">:</span>
          <span className="text-slate-500">~$</span> cat /projects/{slug}
        </p>
        <p className="mt-2 text-rose-400">cat: no such project</p>
        <Link
          href="/projects"
          className="mt-6 inline-flex items-center gap-2 px-3 py-2 rounded border border-slate-800 hover:border-indigo-400 hover:text-indigo-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <span className="text-indigo-400">→</span> back to ~/projects
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 sticky top-0 z-40 bg-slate-950/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/projects"
              className="text-slate-400 hover:text-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
            >
              <span className="text-indigo-400">$</span> cd ../projects
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-slate-100 truncate">{project.slug}</span>
          </div>
          <XPBadge />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <section className="font-mono text-sm">
          <p>
            <span className="text-indigo-400">damato@sql</span>
            <span className="text-slate-500">:</span>
            <span className="text-slate-500">~/projects/{project.slug}$</span>{' '}
            <span>cat brief.md</span>
            <span className="ml-1 inline-block w-2 h-4 align-text-bottom bg-slate-100 terminal-cursor" aria-hidden="true" />
          </p>
        </section>

        <section className="mt-6">
          <h1 className="text-2xl font-semibold text-slate-100">{project.title}</h1>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">{project.description}</p>
          <p className="mt-3 font-mono text-[11px] text-slate-500">
            [{project.difficulty}] · {project.estimatedTime} · {project.databaseLabel} · {totalSteps} steps
          </p>
        </section>

        <section className="mt-8 font-mono text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">
              <span className="text-indigo-400">progress: </span>
              {completedCount}/{totalSteps} steps
              {isProjectComplete && <span className="ml-2 text-emerald-400">· done</span>}
            </span>
            {completedCount > 0 && (
              <button
                onClick={handleResetProject}
                className="px-2 py-1 rounded border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                reset
              </button>
            )}
          </div>
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${isProjectComplete ? 'bg-emerald-500' : 'bg-indigo-400'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>

        <section className="mt-8">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-mono mb-3"># steps</p>
          {isLoading ? (
            <p className="h-32 flex items-center justify-center font-mono text-xs text-slate-500">
              loading sqlite database…
            </p>
          ) : database ? (
            <div className="space-y-3">
              {project.steps.map((step, idx) => {
                const previousStepsCompleted = project.steps
                  .slice(0, idx)
                  .every((s) => isStepCompleted(project.slug, s.id));
                const isLocked = idx > 0 && !previousStepsCompleted;

                return (
                  <ProjectStep
                    key={step.id}
                    step={step}
                    stepIndex={idx}
                    totalSteps={totalSteps}
                    database={database}
                    runQuery={runQuery}
                    isCompleted={isStepCompleted(project.slug, step.id)}
                    isLocked={isLocked}
                    onComplete={() => handleStepComplete(step.id)}
                    onQueryChange={(q, err) => {
                      setActiveQuery(q);
                      setActiveError(err);
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <p className="h-32 flex items-center justify-center font-mono text-xs text-rose-400">
              # db unavailable
            </p>
          )}
        </section>

        <section className="mt-12 pt-6 border-t border-slate-800 font-mono text-xs flex items-center justify-between">
          <Link
            href="/projects"
            className="px-3 py-2 rounded border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            ← cd ../projects
          </Link>

          {isProjectComplete && (
            <Link
              href="/projects"
              className="px-3 py-2 rounded border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              exit 0 · pick another project →
            </Link>
          )}
        </section>
      </main>

      <LessonToolDock
        tools={['schema', 'tutor']}
        open={dockOpen}
        onOpen={setDockOpen}
      >
        <SchemaViewer
          database={database}
          databaseName={project.database}
          hideTrigger
          open={dockOpen === 'schema'}
          onOpenChange={(v) => setDockOpen(v ? 'schema' : null)}
        />
        <AITutor
          lessonTitle={project.title}
          database={project.database}
          currentQuery={activeQuery}
          errorMessage={activeError}
          hideTrigger
          open={dockOpen === 'tutor'}
          onOpenChange={(v) => setDockOpen(v ? 'tutor' : null)}
        />
      </LessonToolDock>
    </div>
  );
}
