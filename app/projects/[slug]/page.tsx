'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import {
  Database,
  ChevronLeft,
  Clock,
  Layers,
  CheckCircle2,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import ProjectStep from '@/components/ProjectStep';
import AITutor from '@/components/AITutor';
import XPBadge from '@/components/XPBadge';
import { createDatabase, runQuery } from '@/lib/db';
import { COMPANY_DB, STORE_DB, SCHOOL_DB } from '@/lib/databases';
import { getProjectBySlug, getDifficultyColors, getProjectColors } from '@/lib/projects';
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
      } catch (error) {
        console.error('Failed to initialize database:', error);
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
    if (confirm('Are you sure you want to reset your progress on this project?')) {
      resetProject(project.slug);
    }
  }, [project, resetProject]);

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Project Not Found</h1>
          <p className="text-slate-400 mb-6">
            This project does not exist or the URL is incorrect.
          </p>
          <Link
            href="/projects"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const colors = getProjectColors(project.color);
  const difficultyColors = getDifficultyColors(project.difficulty);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 sticky top-0 z-40 bg-slate-950/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/projects"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <Database className="w-6 h-6 text-indigo-500" />
              <span className="font-bold text-white">SQL Mastery</span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">Projects</span>
            <span className="text-slate-600">/</span>
            <span className="text-white font-medium">{project.title}</span>
          </div>
          <XPBadge />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span
              className={`px-2.5 py-1 text-xs font-medium rounded-full ${difficultyColors.bg} ${difficultyColors.text} border ${difficultyColors.border}`}
            >
              {project.difficulty}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              {project.estimatedTime}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Database className="w-3.5 h-3.5" />
              {project.databaseLabel}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Layers className="w-3.5 h-3.5" />
              {totalSteps} steps
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
          <p className="text-slate-400">{project.description}</p>
        </div>

        {/* Progress Bar */}
        <div className={`rounded-xl border ${colors.border} ${colors.bg} p-4 mb-8`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {isProjectComplete ? (
                <div className="flex items-center gap-2 text-emerald-400">
                  <Trophy className="w-5 h-5" />
                  <span className="font-semibold">Project Complete!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-5 h-5 ${colors.text}`} />
                  <span className="text-white font-medium">
                    {completedCount} of {totalSteps} steps completed
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-2xl font-bold ${colors.text}`}>{progress}%</span>
              {completedCount > 0 && (
                <button
                  onClick={handleResetProject}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}
            </div>
          </div>
          <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${colors.progress} rounded-full transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-slate-400">Loading database...</div>
          </div>
        ) : database ? (
          <div className="space-y-4">
            {project.steps.map((step, idx) => {
              // A step is unlocked if all previous steps are completed
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
          <div className="h-64 flex items-center justify-center">
            <div className="text-red-400">Failed to load database</div>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex items-center justify-between">
          <Link
            href="/projects"
            className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Projects</span>
          </Link>

          {isProjectComplete && (
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 text-sm">
                Great work completing this project!
              </span>
              <Link
                href="/projects"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                Choose Another Project
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* AI Tutor */}
      <AITutor
        lessonTitle={project.title}
        database={project.database}
        currentQuery={activeQuery}
        errorMessage={activeError}
      />
    </div>
  );
}
