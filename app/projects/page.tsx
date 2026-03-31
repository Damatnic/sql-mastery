'use client';

import Link from 'next/link';
import { Database, ArrowLeft, FolderKanban, Layers, Hammer, ChevronRight } from 'lucide-react';
import XPBadge from '@/components/XPBadge';
import ProjectCard from '@/components/ProjectCard';
import { getAllProjects } from '@/lib/projects';
import { useProjectProgressStore } from '@/lib/project-progress';
import { projectThreads, getThreadColors, projectChallenges } from '@/lib/project-threads';
import { useThreadProgressStore } from '@/lib/thread-progress';

export default function ProjectsPage() {
  const projects = getAllProjects();
  const getProjectProgress = useProjectProgressStore((state) => state.getProjectProgress);
  const { isChallengeCompleted } = useThreadProgressStore();

  // Calculate total progress for standalone projects
  const totalSteps = projects.reduce((sum, p) => sum + p.steps.length, 0);
  const completedSteps = projects.reduce((sum, p) => {
    const progress = getProjectProgress(p.slug, p.steps.length);
    return sum + Math.round((progress / 100) * p.steps.length);
  }, 0);
  const overallProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Calculate thread progress
  const getThreadProgress = (threadId: string) => {
    const threadChallengeKeys = Object.entries(projectChallenges)
      .filter(([, c]) => c.threadId === threadId)
      .map(([key]) => key);
    const completed = threadChallengeKeys.filter((key) => isChallengeCompleted(key)).length;
    return { completed, total: threadChallengeKeys.length };
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <Database className="w-6 h-6 text-indigo-500" />
            <span className="font-bold text-white text-lg">SQL Mastery</span>
          </Link>
          <XPBadge />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-900/50 border border-indigo-700/50 flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">SQL Projects</h1>
              <p className="text-slate-400">Build real-world SQL skills through guided projects</p>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-slate-400 text-sm">Overall Project Progress</p>
                <p className="text-2xl font-bold text-white">
                  {completedSteps} of {totalSteps} steps
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-indigo-400">{overallProgress}%</p>
                <p className="text-slate-500 text-sm">Complete</p>
              </div>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Project Description */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-2">What are Projects?</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Projects are guided, multi-step exercises that teach you SQL by building something real.
            Unlike individual lessons, projects take you through a complete workflow from start to finish.
            Each step builds on the previous one, helping you understand how SQL queries work together
            to solve real business problems.
          </p>
        </div>

        {/* Project Threads Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Hammer className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-semibold text-white">Project Threads</h2>
            <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded-full font-medium">
              Learn & Build
            </span>
          </div>
          <p className="text-slate-400 text-sm mb-6">
            Build real projects step-by-step as you complete lessons. Each thread spans multiple modules
            and guides you through building a complete solution.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {projectThreads.map((thread) => {
              const colors = getThreadColors(thread.color);
              const { completed, total } = getThreadProgress(thread.id);
              const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

              return (
                <Link
                  key={thread.id}
                  href={`/projects/thread/${thread.id}`}
                  className={`group rounded-xl border-2 ${colors.border} ${colors.bg} p-5 hover:border-opacity-80 transition-all duration-200 hover:-translate-y-1`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${colors.bg} border ${colors.border}`}>
                      <Hammer className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-slate-200">
                    {thread.title}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                    {thread.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <span className="px-2 py-0.5 bg-slate-800 rounded">{thread.databaseLabel}</span>
                    <span>Modules {thread.modules[0]}-{thread.modules[thread.modules.length - 1]}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{completed}/{total} steps</span>
                      <span className={`font-medium ${percent === 100 ? 'text-emerald-400' : colors.text}`}>
                        {percent}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${percent === 100 ? 'bg-emerald-500' : colors.accent} rounded-full transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700/50 my-8" />

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-400 mb-1">
              <FolderKanban className="w-4 h-4" />
              <span className="text-sm">Standalone Projects</span>
            </div>
            <p className="text-2xl font-bold text-white">{projects.length}</p>
          </div>
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-400 mb-1">
              <Layers className="w-4 h-4" />
              <span className="text-sm">Total Steps</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalSteps}</p>
          </div>
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-400 mb-1">
              <Database className="w-4 h-4" />
              <span className="text-sm">Databases</span>
            </div>
            <p className="text-2xl font-bold text-white">3</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-white mb-4">Standalone Projects</h2>

        {/* Project Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-12 flex items-center justify-center gap-4">
          <Link
            href="/learn"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            Back to Lessons
          </Link>
          <Link
            href="/playground"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            SQL Playground
          </Link>
        </div>
      </main>
    </div>
  );
}
