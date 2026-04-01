'use client';

import { useState, useEffect, useCallback, use, useMemo } from 'react';
import Link from 'next/link';
import {
  Database, ChevronLeft, ChevronRight,
  BookOpen, Code2, Target, CheckCircle2, Hammer, GraduationCap, Home, ArrowRight
} from 'lucide-react';
import ExampleBlock from '@/components/ExampleBlock';
import TheoryBlock from '@/components/TheoryBlock';
import ChallengeBlock from '@/components/ChallengeBlock';
import ProjectChallengeBlock from '@/components/ProjectChallengeBlock';
import LessonNav from '@/components/LessonNav';
import AITutor from '@/components/AITutor';
import XPBadge from '@/components/XPBadge';
import SchemaViewer from '@/components/SchemaViewer';
import SQLCheatSheet from '@/components/SQLCheatSheet';
import { createDatabase, runQuery } from '@/lib/db';
import { COMPANY_DB, STORE_DB, SCHOOL_DB } from '@/lib/databases';
import {
  getLessonBySlug,
  getModuleLessons,
  getModuleBySlug,
  getNextLesson,
  getPreviousLesson,
} from '@/lib/lessons';
import { useProgressStore, XP_VALUES } from '@/lib/progress';
import { getProjectChallengeForLesson, getProjectThread } from '@/lib/project-threads';
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

// Extract learning objectives from theory content
function extractLearningObjectives(theoryContent: string): string[] {
  const objectives: string[] = [];

  // Look for section headers that indicate what will be learned
  const sectionHeaders = theoryContent.match(/^## (Mental Model|Syntax|How It Works|When To Use This|Operators|Key Rules)/gm);
  if (sectionHeaders) {
    if (sectionHeaders.some(h => h.includes('Mental Model'))) {
      objectives.push('Understand the core concept and when to use it');
    }
    if (sectionHeaders.some(h => h.includes('Syntax'))) {
      objectives.push('Learn the SQL syntax and structure');
    }
    if (sectionHeaders.some(h => h.includes('Operators'))) {
      objectives.push('Master the available operators and their usage');
    }
    if (sectionHeaders.some(h => h.includes('How It Works'))) {
      objectives.push('See how the command works in practice');
    }
    if (sectionHeaders.some(h => h.includes('When To Use This'))) {
      objectives.push('Know when to apply this in real queries');
    }
  }

  // Add objectives based on lesson content
  if (theoryContent.includes('JOIN')) {
    objectives.push('Combine data from multiple tables');
  }
  if (theoryContent.includes('GROUP BY')) {
    objectives.push('Aggregate and summarize data');
  }
  if (theoryContent.includes('subquer')) {
    objectives.push('Write nested queries for complex logic');
  }

  // Ensure we have at least some objectives
  if (objectives.length === 0) {
    objectives.push('Master this SQL concept');
    objectives.push('Practice with real database queries');
  }

  return objectives.slice(0, 4); // Limit to 4 objectives
}

interface LessonPageProps {
  params: Promise<{ moduleSlug: string; lessonSlug: string }>;
}

export default function LessonPage({ params }: LessonPageProps) {
  const resolvedParams = use(params);
  const { moduleSlug, lessonSlug } = resolvedParams;

  const [database, setDatabase] = useState<SqlJsDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  const projectChallenge = lesson ? getProjectChallengeForLesson(lesson.moduleSlug, lesson.lessonSlug) : null;
  const projectThread = projectChallenge ? getProjectThread(projectChallenge.threadId) : null;

  // Extract learning objectives
  const learningObjectives = useMemo(() => {
    if (!lesson) return [];
    return extractLearningObjectives(lesson.theory.content);
  }, [lesson]);

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
  const totalChallenges = lesson.challenges.length;

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
          </div>
          <XPBadge />
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="border-b border-slate-800/50 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 py-2">
          <nav className="lesson-breadcrumbs">
            <Link href="/" className="lesson-breadcrumb-link flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="lesson-breadcrumb-separator w-4 h-4" />
            <Link href="/learn" className="lesson-breadcrumb-link">
              Learn
            </Link>
            <ChevronRight className="lesson-breadcrumb-separator w-4 h-4" />
            <Link href={`/learn#module-${lesson.module}`} className="lesson-breadcrumb-link">
              Module {lesson.module}: {moduleInfo.name}
            </Link>
            <ChevronRight className="lesson-breadcrumb-separator w-4 h-4" />
            <span className="lesson-breadcrumb-current font-medium">
              {lesson.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-72 border-r border-slate-800 p-4 sticky top-28 h-[calc(100vh-112px)] overflow-y-auto">
          <LessonNav currentLesson={lesson} moduleLessons={moduleLessons} moduleInfo={moduleInfo} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl mx-auto px-6 py-8">
          {/* Lesson Header */}
          <div className="mb-6">
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

          {/* Learning Objectives */}
          <div className="lesson-objectives mb-8">
            <h2 className="lesson-objectives-title">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
              What you&apos;ll learn
            </h2>
            <ul className="lesson-objectives-list">
              {learningObjectives.map((objective, idx) => (
                <li key={idx} className="lesson-objectives-item">
                  <ArrowRight className="lesson-objectives-bullet w-4 h-4 mt-0.5" />
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-slate-400">Loading database...</span>
              </div>
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

              {/* Examples */}
              {lesson.examples.length > 0 && database && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Code2 className="w-5 h-5 text-green-400" />
                    <h2 className="text-xl font-semibold text-white">Examples</h2>
                    <span className="text-xs text-slate-500 ml-2">
                      {lesson.examples.length} example{lesson.examples.length !== 1 ? 's' : ''}
                    </span>
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

              {/* What You Learned Recap (before challenges) */}
              {hasChallenges && (
                <section className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                  <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Quick recap before the challenges
                  </h3>
                  <p className="text-sm text-slate-400">
                    You&apos;ve learned about {lesson.title.toLowerCase()}. Now it&apos;s time to practice!
                    {lesson.examples.length > 0 && ` Review the ${lesson.examples.length} example${lesson.examples.length !== 1 ? 's' : ''} above if you need a refresher.`}
                  </p>
                </section>
              )}

              {/* Challenges */}
              {hasChallenges && database && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-purple-400" />
                    <h2 className="text-xl font-semibold text-white">Challenges</h2>
                    <span className="text-xs text-slate-500 ml-2">
                      {totalChallenges} challenge{totalChallenges !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-6">
                    {lesson.challenges.map((challenge, idx) => (
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
                        challengeNumber={idx + 1}
                        totalChallenges={totalChallenges}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Project Challenge */}
              {projectChallenge && projectThread && database && (
                <section className="pt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Hammer className="w-5 h-5 text-amber-400" />
                    <h2 className="text-xl font-semibold text-white">Project Challenge</h2>
                  </div>
                  <ProjectChallengeBlock
                    challenge={projectChallenge}
                    thread={projectThread}
                    lessonKey={lessonKey}
                    database={database}
                    runQuery={runQuery}
                    onQueryChange={(q, err) => {
                      setActiveQuery(q);
                      setActiveError(err);
                    }}
                  />
                </section>
              )}

              {/* Mark as Learned */}
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
          <nav className="lesson-nav">
            {prevLesson ? (
              <Link
                href={`/learn/${prevLesson.moduleSlug}/${prevLesson.lessonSlug}`}
                className="lesson-nav-button lesson-nav-button-prev"
              >
                <ChevronLeft className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <div>
                  <span className="lesson-nav-label">Previous</span>
                  <span className="lesson-nav-title">{prevLesson.title}</span>
                </div>
              </Link>
            ) : <div />}

            {nextLesson ? (
              <Link
                href={`/learn/${nextLesson.moduleSlug}/${nextLesson.lessonSlug}`}
                className="lesson-nav-button lesson-nav-button-next bg-indigo-600 hover:bg-indigo-700 border-indigo-500"
              >
                <div className="text-right">
                  <span className="lesson-nav-label text-indigo-200">Next lesson</span>
                  <span className="lesson-nav-title text-white">{nextLesson.title}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-white flex-shrink-0" />
              </Link>
            ) : (
              <Link
                href="/learn"
                className="lesson-nav-button lesson-nav-button-next bg-emerald-600 hover:bg-emerald-700 border-emerald-500"
              >
                <div className="text-right">
                  <span className="lesson-nav-label text-emerald-200">Module complete</span>
                  <span className="lesson-nav-title text-white">Back to Dashboard</span>
                </div>
                <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
              </Link>
            )}
          </nav>
        </main>
      </div>

      {/* Schema Viewer */}
      <SchemaViewer database={database} databaseName={lesson.database} />

      {/* SQL Cheat Sheet */}
      <SQLCheatSheet />

      {/* AI Tutor */}
      <AITutor
        lessonTitle={lesson.title}
        database={lesson.database}
        currentQuery={activeQuery}
        errorMessage={activeError}
      />
    </div>
  );
}
