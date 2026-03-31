'use client';

import Link from 'next/link';
import { Database, ArrowLeft } from 'lucide-react';
import XPBadge from '@/components/XPBadge';
import ModuleCard from '@/components/ModuleCard';
import { getAllModules, getModuleLessons } from '@/lib/lessons';
import { useProgressStore } from '@/lib/progress';

export default function LearnPage() {
  const modules = getAllModules();
  const completedLessons = useProgressStore((state) => state.completedLessons);

  // Calculate total progress
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedCount = completedLessons.length;
  const overallProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

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
          <div className="flex items-center gap-4">
            <Link
              href="/projects"
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              Projects
            </Link>
            <XPBadge />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Progress Overview */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-white mb-4">Your Learning Path</h1>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-slate-400 text-sm">Overall Progress</p>
                <p className="text-2xl font-bold text-white">
                  {completedCount} of {totalLessons} lessons
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

        {/* Module Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const moduleLessons = getModuleLessons(module.slug);
            const firstLesson = moduleLessons[0];
            const firstLessonSlug = firstLesson?.lessonSlug || 'introduction';

            return (
              <ModuleCard
                key={module.slug}
                module={module}
                lessonCount={module.lessons.length}
                firstLessonSlug={firstLessonSlug}
              />
            );
          })}
        </div>

        {/* Quick Links */}
        <div className="mt-12 flex items-center justify-center gap-4">
          <Link
            href="/projects"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Try Projects
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
