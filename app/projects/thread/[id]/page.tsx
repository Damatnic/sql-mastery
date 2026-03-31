'use client';

import { use, useMemo } from 'react';
import Link from 'next/link';
import {
  Database, ArrowLeft, Hammer, CheckCircle2, Lock, ChevronRight,
  BookOpen, Sparkles,
} from 'lucide-react';
import XPBadge from '@/components/XPBadge';
import {
  projectThreads,
  getThreadChallenges,
  getThreadColors,
  projectChallenges,
} from '@/lib/project-threads';
import { useThreadProgressStore } from '@/lib/thread-progress';
import { lessons } from '@/lib/lessons';

interface ThreadPageProps {
  params: Promise<{ id: string }>;
}

export default function ThreadPage({ params }: ThreadPageProps) {
  const { id } = use(params);
  const thread = projectThreads.find((t) => t.id === id);

  const { isChallengeCompleted } = useThreadProgressStore();

  // Get challenges for this thread
  const challenges = useMemo(() => (thread ? getThreadChallenges(thread.id) : []), [thread]);

  // Calculate progress
  const completedCount = useMemo(() => {
    return challenges.filter((c) => {
      const lessonKey = Object.keys(projectChallenges).find(
        (key) => projectChallenges[key].id === c.id
      );
      return lessonKey && isChallengeCompleted(lessonKey);
    }).length;
  }, [challenges, isChallengeCompleted]);

  const progress = challenges.length > 0 ? Math.round((completedCount / challenges.length) * 100) : 0;

  if (!thread) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Thread Not Found</h1>
          <p className="text-slate-400 mb-6">This project thread does not exist.</p>
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

  const colors = getThreadColors(thread.color);

  // Find lesson for each challenge
  const challengesWithLessons = challenges.map((challenge) => {
    const lessonKey = Object.keys(projectChallenges).find(
      (key) => projectChallenges[key].id === challenge.id
    );
    const [moduleSlug, lessonSlug] = lessonKey?.split('/') || [];
    const lesson = lessons.find(
      (l) => l.moduleSlug === moduleSlug && l.lessonSlug === lessonSlug
    );
    const isComplete = lessonKey ? isChallengeCompleted(lessonKey) : false;

    return {
      challenge,
      lesson,
      lessonKey,
      isComplete,
    };
  });

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/projects"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <Database className="w-6 h-6 text-indigo-500" />
            <span className="font-bold text-white text-lg">SQL Mastery</span>
          </Link>
          <XPBadge />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Thread Header */}
        <div className={`rounded-xl ${colors.bg} border ${colors.border} p-6 mb-8`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${colors.bg} border ${colors.border}`}>
              <Hammer className={`w-8 h-8 ${colors.text}`} />
            </div>
            <div className="flex-1">
              <p className={`text-xs font-bold ${colors.text} uppercase tracking-wider mb-1`}>
                Project Thread
              </p>
              <h1 className="text-2xl font-bold text-white mb-2">{thread.title}</h1>
              <p className="text-slate-400 mb-4">{thread.description}</p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-400">
                    {completedCount} of {challenges.length} steps complete
                  </span>
                  <span className={`font-semibold ${progress === 100 ? 'text-emerald-400' : colors.text}`}>
                    {progress}%
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${progress === 100 ? 'bg-emerald-500' : colors.accent} rounded-full transition-all duration-500`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-1 text-xs bg-slate-800 text-slate-300 rounded">
                  {thread.databaseLabel}
                </span>
                <span className="px-2 py-1 text-xs bg-slate-800 text-slate-300 rounded">
                  Modules {thread.modules[0]}-{thread.modules[thread.modules.length - 1]}
                </span>
                <span className="px-2 py-1 text-xs bg-slate-800 text-slate-300 rounded">
                  {thread.totalSteps} steps
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scenario */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">The Scenario</h2>
          <p className="text-slate-300 whitespace-pre-line leading-relaxed">
            {thread.scenario}
          </p>
        </div>

        {/* Final Product Preview */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">What You&apos;ll Build</h2>
          </div>
          <p className="text-slate-400 text-sm">{thread.previewDescription}</p>
        </div>

        {/* Challenge Steps */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Project Steps</h2>
          <div className="space-y-3">
            {challengesWithLessons.map(({ challenge, lesson, isComplete }, index) => {
              const isLocked = index > 0 && !challengesWithLessons[index - 1].isComplete;

              return (
                <div
                  key={challenge.id}
                  className={`rounded-lg border ${
                    isComplete
                      ? 'bg-emerald-900/20 border-emerald-700/50'
                      : isLocked
                      ? 'bg-slate-900/50 border-slate-700/30 opacity-60'
                      : 'bg-slate-800/50 border-slate-700'
                  } overflow-hidden`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Step Number / Status */}
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isComplete
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : isLocked
                            ? 'bg-slate-700/50 text-slate-500'
                            : `${colors.bg} ${colors.text}`
                        }`}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : isLocked ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <span className="text-sm font-bold">{challenge.stepNumber}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className={`font-semibold ${
                              isComplete ? 'text-emerald-300' : isLocked ? 'text-slate-500' : 'text-white'
                            }`}
                          >
                            {challenge.title}
                          </h3>
                        </div>
                        {lesson && (
                          <p className="text-xs text-slate-500 mb-2">
                            From: {lesson.title}
                          </p>
                        )}
                        <p className={`text-sm ${isLocked ? 'text-slate-600' : 'text-slate-400'}`}>
                          {challenge.scenario.length > 80 ? `${challenge.scenario.substring(0, 77)}...` : challenge.scenario}
                        </p>
                      </div>

                      {/* Action */}
                      {lesson && !isLocked && (
                        <Link
                          href={`/learn/${lesson.moduleSlug}/${lesson.lessonSlug}`}
                          className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors shrink-0 ${
                            isComplete
                              ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50'
                              : `${colors.bg} ${colors.text} hover:bg-opacity-50`
                          }`}
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>{isComplete ? 'Review' : 'Go to Lesson'}</span>
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/learn"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Back to Lessons
          </Link>
          <Link
            href="/projects"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            All Projects
          </Link>
        </div>
      </main>
    </div>
  );
}
