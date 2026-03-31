'use client';

import Link from 'next/link';
import { Database, ArrowLeft, FolderKanban, Layers } from 'lucide-react';
import XPBadge from '@/components/XPBadge';
import ProjectCard from '@/components/ProjectCard';
import { getAllProjects } from '@/lib/projects';
import { useProjectProgressStore } from '@/lib/project-progress';

export default function ProjectsPage() {
  const projects = getAllProjects();
  const getProjectProgress = useProjectProgressStore((state) => state.getProjectProgress);

  // Calculate total progress
  const totalSteps = projects.reduce((sum, p) => sum + p.steps.length, 0);
  const completedSteps = projects.reduce((sum, p) => {
    const progress = getProjectProgress(p.slug, p.steps.length);
    return sum + Math.round((progress / 100) * p.steps.length);
  }, 0);
  const overallProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

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

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-400 mb-1">
              <FolderKanban className="w-4 h-4" />
              <span className="text-sm">Projects</span>
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
