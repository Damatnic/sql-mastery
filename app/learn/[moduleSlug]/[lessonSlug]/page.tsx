'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import {
  Database, ChevronLeft, ChevronRight,
  BookOpen, Code2, Target, CheckCircle2,
} from 'lucide-react';
import ExampleBlock from '@/components/ExampleBlock';
import ResultsTable from '@/components/ResultsTable';
import TheoryBlock from '@/components/TheoryBlock';
import ChallengeBlock from '@/components/ChallengeBlock';
import LessonNav from '@/components/LessonNav';
import AITutor from '@/components/AITutor';
import XPBadge from '@/components/XPBadge';
import { createDatabase, runQuery, type QueryResponse } from '@/lib/db';
import { COMPANY_DB, STORE_DB, SCHOOL_DB } from '@/lib/databases';
import {
  getLessonBySlug,
  getModuleLessons,
  getModuleBySlug,
  getNextLesson,
  getPreviousLesson,
} from '@/lib/lessons';
import { useProgressStore, XP_VALUES } from '@/lib/progress';
import type { Database as SqlJsDatabase } from 'sql.js';

const databases = {
  company: COMPANY_DB,
  store: STORE_DB,
  school: SCHOOL_DB,
};

const badgeColors = {
  concept: { bg: 'bg-blue-900/50', text: 'text-blue-400', border: 'border-blue-700/50' },
  practice: { bg: 'bg-green-900/50', text: 'text-green-400', border: 'border-green-700/50' },
  challenge: { bg: 'bg-purple-900/50', text: 'text-purple-400', border: 'border-purple-700/50' },
};

interface LessonPageProps {
  params: Promise<{ moduleSlug: string; lessonSlug: string }>;
}

export default function LessonPage({ params }: LessonPageProps) {
  const resolvedParams = use(params);
  const { moduleSlug, lessonSlug } = resolvedParams;

  const [database, setDatabase] = useState<SqlJsDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Track the most recently active query (examples or challenges) for the AI tutor
  const [activeQuery, setActiveQuery] = useState('');
  const [activeError, setActiveError] = useState<string | undefined>();

  const lesson = getLessonBySlug(moduleSlug, lessonSlug);
  const moduleInfo = getModuleBySlug(moduleSlug);
  const moduleLessons = getModuleLessons(moduleSlug);
  const nextLesson = lesson ? getNextLesson(lesson) : null;
  const prevLesson = lesson ? getPreviousLesson(lesson) : null;

  const completeLesson = useProgressStore((state) => state.completeLesson);
  const addXP = useProgressStore((state) => state.addXP);
  const completedLessons = useProgressStore((state) => state.completedLessons);

  const lessonKey = lesson ? `${lesson.moduleSlug}/${lesson.lessonSlug}` : '';
  const isAlreadyComplete = completedLessons.includes(lessonKey);

  // Initialize database
  useEffect(() => {
    if (!lesson) return;
    const currentLesson = lesson;
    let mounted = true;

    async function initDb() {
      setIsLoading(true);
      try {
        const dbSchema = databases[currentLesson.database];
        const db = await createDatabase(dbSchema);
        if (mounted) setDatabase(db);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initDb();
    return () => { mounted = false; };
  }, [lesson]);

  const handleChallengeComplete = useCallback(() => {
    if (!lesson) return;
    completeLesson(lessonKey);
    addXP(XP_VALUES.CHALLENGE_COMPLETE);
  }, [lesson, lessonKey, completeLesson, addXP]);

  const handleMarkComplete = useCallback(() => {
    if (!lesson || isAlreadyComplete) return;
    completeLesson(lessonKey);
    addXP(XP_VALUES.LESSON_COMPLETE ?? 10);
  }, [lesson, lessonKey, isAlreadyComplete, completeLesson, addXP]);

  if (!lesson || !moduleInfo) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Lesson Not Found</h1>
          <p className="text-slate-400 mb-6">This lesson does not exist or the URL is incorrect.</p>
          <Link href="/learn" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const badge = badgeColors[lesson.badge];
  const hasChallenges = lesson.challenges.length > 0;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 sticky top-0 z-40 bg-slate-950/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/learn" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <Database className="w-6 h-6 text-indigo-500" />
              <span className="font-bold text-white">SQL Mastery</span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">{moduleInfo.name}</span>
            <span className="text-slate-600">/</span>
            <span className="text-white font-medium">{lesson.title}</span>
          </div>
          <XPBadge />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-72 border-r border-slate-800 p-4 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <LessonNav currentLesson={lesson} moduleLessons={moduleLessons} moduleInfo={moduleInfo} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl mx-auto px-6 py-8">
          {/* Lesson Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${badge.bg} ${badge.text} ${badge.border} border`}>
                {lesson.badge.charAt(0).toUpperCase() + lesson.badge.slice(1)}
              </span>
              <span className="text-slate-500 text-sm">Lesson {lesson.lesson}</span>
              {isAlreadyComplete && (
                <span className="flex items-center gap-1 px-2 py-0.5 text-xs text-emerald-400 bg-emerald-900/30 border border-emerald-700/50 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Complete
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-white">{lesson.title}</h1>
          </div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-slate-400">Loading database...</div>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Theory */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <h2 className="text-xl font-semibold text-white">Theory</h2>
                </div>
                <TheoryBlock content={lesson.theory.content} />
              </section>

              {/* Examples — each one independent */}
              {lesson.examples.length > 0 && database && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Code2 className="w-5 h-5 text-green-400" />
                    <h2 className="text-xl font-semibold text-white">Examples</h2>
                  </div>
                  <div className="space-y-6">
                    {lesson.examples.map((example, idx) => (
                      <ExampleBlock
                        key={idx}
                        example={example}
                        database={database}
                        index={idx}
                        onQueryChange={setActiveQuery}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Challenges */}
              {hasChallenges && database && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-purple-400" />
                    <h2 className="text-xl font-semibold text-white">Challenges</h2>
                  </div>
                  <div className="space-y-6">
                    {lesson.challenges.map((challenge) => (
                      <ChallengeBlock
                        key={challenge.id}
                        challenge={challenge}
                        database={database}
                        runQuery={runQuery}
                        onComplete={handleChallengeComplete}
                        onQueryChange={(q, err) => {
                          setActiveQuery(q);
                          setActiveError(err);
                        }}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Mark as Learned — for lessons without challenges */}
              {!hasChallenges && (
                <div className="flex items-center justify-end pt-2">
                  {isAlreadyComplete ? (
                    <div className="flex items-center gap-2 px-4 py-2 text-emerald-400 bg-emerald-900/20 border border-emerald-700/40 rounded-lg text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      Marked as complete
                    </div>
                  ) : (
                    <button
                      onClick={handleMarkComplete}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark as Learned
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Navigation Footer */}
          <div className="mt-12 pt-8 border-t border-slate-800 flex items-center justify-between">
            {prevLesson ? (
              <Link
                href={`/learn/${prevLesson.moduleSlug}/${prevLesson.lessonSlug}`}
                className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>{prevLesson.title}</span>
              </Link>
            ) : <div />}

            {nextLesson ? (
              <Link
                href={`/learn/${nextLesson.moduleSlug}/${nextLesson.lessonSlug}`}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <span>Next: {nextLesson.title}</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                href="/learn"
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                <span>Complete Module</span>
              </Link>
            )}
          </div>
        </main>
      </div>

      {/* AI Tutor — now sees whichever query was last active */}
      <AITutor
        lessonTitle={lesson.title}
        database={lesson.database}
        currentQuery={activeQuery}
        errorMessage={activeError}
      />
    </div>
  );
}
