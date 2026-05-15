'use client';

import { useState, useEffect, useCallback, useRef, use } from 'react';
import Link from 'next/link';
import ExampleBlock from '@/components/ExampleBlock';
import TheoryBlock from '@/components/TheoryBlock';
import ChallengeBlock from '@/components/ChallengeBlock';
import ProjectChallengeBlock from '@/components/ProjectChallengeBlock';
import LessonNav from '@/components/LessonNav';
import AITutor from '@/components/AITutor';
import XPBadge from '@/components/XPBadge';
import SchemaViewer from '@/components/SchemaViewer';
import SQLCheatSheet from '@/components/SQLCheatSheet';
import LessonToolDock, { type DockTool } from '@/components/LessonToolDock';
import LessonAnchorNav, { type AnchorSection } from '@/components/LessonAnchorNav';
import MobileModuleNav from '@/components/MobileModuleNav';
import NextLessonCard from '@/components/NextLessonCard';
import InterfaceOnboarding from '@/components/InterfaceOnboarding';
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

interface LessonPageProps {
  params: Promise<{ moduleSlug: string; lessonSlug: string }>;
}

export default function LessonPage({ params }: LessonPageProps) {
  const resolvedParams = use(params);
  const { moduleSlug, lessonSlug } = resolvedParams;

  const [database, setDatabase] = useState<SqlJsDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [activeQuery, setActiveQuery] = useState('');
  const [activeError, setActiveError] = useState<string | undefined>();
  const [dockOpen, setDockOpen] = useState<DockTool | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [tutorPrompt, setTutorPrompt] = useState<string | null>(null);
  const [completedChallengeIds, setCompletedChallengeIds] = useState<Set<string>>(new Set());

  const handleAskTutor = useCallback((prompt: string) => {
    setTutorPrompt(prompt);
    setDockOpen('tutor');
  }, []);

  const lesson = getLessonBySlug(moduleSlug, lessonSlug);
  const moduleInfo = getModuleBySlug(moduleSlug);
  const moduleLessons = getModuleLessons(moduleSlug);
  const nextLesson = lesson ? getNextLesson(lesson) : null;
  const prevLesson = lesson ? getPreviousLesson(lesson) : null;

  const completeLesson = useProgressStore((state) => state.completeLesson);
  const addXP = useProgressStore((state) => state.addXP);
  const completedLessons = useProgressStore((state) => state.completedLessons);
  const markReviewed = useProgressStore((state) => state.markReviewed);

  const lessonKey = lesson ? `${lesson.moduleSlug}/${lesson.lessonSlug}` : '';
  const isAlreadyComplete = completedLessons.includes(lessonKey);

  // Track when a completed lesson is revisited (drives the review queue on /stats)
  useEffect(() => {
    if (isAlreadyComplete && lessonKey) {
      markReviewed(lessonKey);
    }
  }, [isAlreadyComplete, lessonKey, markReviewed]);

  const projectChallenge = lesson ? getProjectChallengeForLesson(lesson.moduleSlug, lesson.lessonSlug) : null;
  const projectThread = projectChallenge ? getProjectThread(projectChallenge.threadId) : null;

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
        if (mounted) setDbError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initDb();
    return () => { mounted = false; };
  }, [lesson]);

  const markCompleteFiredRef = useRef(false);

  const handleChallengeComplete = useCallback(
    (challengeId: string) => {
      if (!lesson) return;
      setCompletedChallengeIds((prev) => {
        if (prev.has(challengeId)) return prev;
        const next = new Set(prev);
        next.add(challengeId);
        addXP(XP_VALUES.CHALLENGE_COMPLETE);
        const allDone =
          lesson.challenges.length > 0 &&
          lesson.challenges.every((c) => next.has(c.id));
        if (allDone) {
          completeLesson(lessonKey);
        }
        return next;
      });
    },
    [lesson, lessonKey, completeLesson, addXP],
  );

  const handleMarkComplete = useCallback(() => {
    if (!lesson || isAlreadyComplete) return;
    if (markCompleteFiredRef.current) return;
    markCompleteFiredRef.current = true;
    completeLesson(lessonKey);
    addXP(XP_VALUES.LESSON_COMPLETE ?? 10);
  }, [lesson, lessonKey, isAlreadyComplete, completeLesson, addXP]);

  if (!lesson || !moduleInfo) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-mono text-sm flex flex-col items-start justify-center px-6 max-w-2xl mx-auto">
        <p>
          <span className="text-indigo-400">damato@sql</span>
          <span className="text-slate-500">:</span>
          <span className="text-slate-500">~$</span> cat /learn/{moduleSlug}/{lessonSlug}
        </p>
        <p className="mt-2 text-rose-400">cat: no such lesson</p>
        <Link
          href="/learn"
          className="mt-6 inline-flex items-center gap-2 px-3 py-2 rounded border border-slate-800 hover:border-indigo-400 hover:text-indigo-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <span className="text-indigo-400">→</span> back to ~/lessons
        </Link>
      </div>
    );
  }

  const hasChallenges = lesson.challenges.length > 0;
  const totalChallenges = lesson.challenges.length;

  const anchorSections: AnchorSection[] = (() => {
    const s: AnchorSection[] = [{ id: 'theory', label: 'theory' }];
    if (lesson.examples.length > 0) s.push({ id: 'examples', label: 'examples', badge: String(lesson.examples.length) });
    if (hasChallenges) {
      s.push({
        id: 'challenges',
        label: 'challenges',
        badge: `${completedChallengeIds.size}/${totalChallenges}`,
      });
    }
    if (projectChallenge) s.push({ id: 'project', label: 'project' });
    return s;
  })();

  const allChallengesDoneThisSession =
    hasChallenges && completedChallengeIds.size === totalChallenges;
  const showNextLessonCard =
    allChallengesDoneThisSession || (hasChallenges && isAlreadyComplete);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 sticky top-0 z-40 bg-slate-950/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden px-2 py-1 rounded border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              aria-label="open module nav"
            >
              ☰
            </button>
            <Link
              href="/learn"
              className="text-slate-400 hover:text-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
            >
              <span className="text-indigo-400">$</span> cd ../lessons
            </Link>
          </div>
          <XPBadge />
        </div>
      </header>

      <MobileModuleNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        currentLesson={lesson}
        moduleLessons={moduleLessons}
        moduleInfo={moduleInfo}
      />

      <div className="border-b border-slate-800/60 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-6 py-2 font-mono text-xs text-slate-400">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 truncate">
            <Link
              href="/"
              className="hover:text-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
            >
              ~
            </Link>
            <span>/</span>
            <Link
              href="/learn"
              className="hover:text-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
            >
              lessons
            </Link>
            <span>/</span>
            <span className="text-slate-300 truncate">{lesson.moduleSlug}</span>
            <span>/</span>
            <span className="text-slate-100 truncate">{lesson.lessonSlug}</span>
          </nav>
        </div>
      </div>

      <div className="flex">
        <aside className="hidden lg:block w-72 border-r border-slate-800 p-4 sticky top-[88px] h-[calc(100vh-88px)] overflow-y-auto">
          <LessonNav currentLesson={lesson} moduleLessons={moduleLessons} moduleInfo={moduleInfo} />
        </aside>

        <main className="flex-1 max-w-4xl mx-auto px-6 py-8">
          <section className="mb-4">
            <p className="font-mono text-xs text-slate-400">
              <span className="text-indigo-400">[{lesson.badge}]</span>
              <span className="ml-2 text-slate-500">lesson {String(lesson.lesson).padStart(2, '0')}</span>
              {isAlreadyComplete && <span className="ml-2 text-emerald-400">· done</span>}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-100">{lesson.title}</h1>
          </section>

          <LessonAnchorNav sections={anchorSections} />

          {isLoading ? (
            <p className="h-32 flex items-center justify-center font-mono text-xs text-slate-500">
              loading {lesson.database}.db…
            </p>
          ) : dbError ? (
            <div className="h-32 flex flex-col items-start justify-center font-mono text-sm">
              <p>
                <span className="text-indigo-400">damato@sql</span>
                <span className="text-slate-500">:</span>
                <span className="text-slate-500">~$</span> sqlite3 {lesson.database}.db
              </p>
              <p className="mt-2 text-rose-400">error: failed to load sql engine. likely a slow or restricted network.</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-3 py-2 rounded border border-rose-400 text-rose-400 hover:bg-rose-400/10 transition-colors text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                → refresh &amp; retry
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              <section id="theory" className="scroll-mt-32">
                <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-3"># theory</p>
                <TheoryBlock content={lesson.theory.content} />
              </section>

              {lesson.examples.length > 0 && database && (
                <section id="examples" className="scroll-mt-32">
                  <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-3">
                    # examples <span className="text-slate-600">[{lesson.examples.length}]</span>
                  </p>
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

              {hasChallenges && database && (
                <section id="challenges" className="scroll-mt-32">
                  <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-3">
                    # challenges <span className="text-slate-600">[{totalChallenges}]</span>
                  </p>
                  <div className="space-y-6">
                    {lesson.challenges.map((challenge, idx) => (
                      <ChallengeBlock
                        key={challenge.id}
                        challenge={challenge}
                        database={database}
                        runQuery={runQuery}
                        onComplete={() => handleChallengeComplete(challenge.id)}
                        onQueryChange={(q, err) => {
                          setActiveQuery(q);
                          setActiveError(err);
                        }}
                        challengeNumber={idx + 1}
                        totalChallenges={totalChallenges}
                        onAskTutor={handleAskTutor}
                      />
                    ))}
                  </div>
                </section>
              )}

              {projectChallenge && projectThread && database && (
                <section id="project" className="pt-2 scroll-mt-32">
                  <div className="mb-3 px-3 py-2 rounded border border-amber-400/30 bg-amber-400/[0.04] font-mono text-xs">
                    <p>
                      <span className="text-amber-400">✦ project thread</span>
                      <span className="text-slate-500"> · </span>
                      <Link
                        href={`/projects/thread/${projectThread.id}`}
                        className="text-slate-200 hover:text-amber-300 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
                      >
                        {projectThread.title}
                      </Link>
                    </p>
                    <p className="mt-1 text-slate-500">
                      step {String(projectChallenge.stepNumber).padStart(2, "0")} of {String(projectThread.totalSteps).padStart(2, "0")} · {projectChallenge.title}
                    </p>
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

              {!hasChallenges && (
                <div className="flex items-center justify-end pt-2 font-mono text-xs">
                  {isAlreadyComplete ? (
                    <span className="text-emerald-400">
                      <span className="text-emerald-400">exit 0</span> · marked as complete
                    </span>
                  ) : (
                    <button
                      onClick={handleMarkComplete}
                      className="px-3 py-2 rounded border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    >
                      mark as done
                    </button>
                  )}
                </div>
              )}

              {showNextLessonCard && nextLesson && (
                <NextLessonCard
                  nextLesson={{
                    lessonSlug: nextLesson.lessonSlug,
                    moduleSlug: nextLesson.moduleSlug,
                    title: nextLesson.title,
                  }}
                />
              )}
              {showNextLessonCard && !nextLesson && <NextLessonCard nextLesson={null} />}
            </div>
          )}

          <nav className="mt-12 pt-6 border-t border-slate-800 font-mono text-xs flex items-center justify-between gap-3" aria-label="Lesson navigation">
            {prevLesson ? (
              <Link
                href={`/learn/${prevLesson.moduleSlug}/${prevLesson.lessonSlug}`}
                className="flex items-baseline gap-2 px-3 py-2 rounded border border-slate-800 hover:border-indigo-400/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 min-w-0"
              >
                <span className="text-slate-500">← prev:</span>
                <span className="text-slate-200 truncate max-w-[220px]">{prevLesson.title}</span>
              </Link>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Link
                href={`/learn/${nextLesson.moduleSlug}/${nextLesson.lessonSlug}`}
                className="flex items-baseline gap-2 px-3 py-2 rounded border border-indigo-400 text-indigo-400 hover:bg-indigo-400/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 min-w-0"
              >
                <span className="text-slate-500">next:</span>
                <span className="truncate max-w-[220px]">{nextLesson.title}</span>
                <span>→</span>
              </Link>
            ) : (
              <Link
                href="/learn"
                className="flex items-baseline gap-2 px-3 py-2 rounded border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                <span>exit 0</span>
                <span className="text-slate-500">·</span>
                <span>back to ~/lessons</span>
              </Link>
            )}
          </nav>
        </main>
      </div>

      <LessonToolDock
        tools={['schema', 'cheatsheet', 'tutor']}
        open={dockOpen}
        onOpen={setDockOpen}
      >
        <SchemaViewer
          database={database}
          databaseName={lesson.database}
          hideTrigger
          open={dockOpen === 'schema'}
          onOpenChange={(v) => setDockOpen(v ? 'schema' : null)}
        />
        <SQLCheatSheet
          hideTrigger
          open={dockOpen === 'cheatsheet'}
          onOpenChange={(v) => setDockOpen(v ? 'cheatsheet' : null)}
        />
        <AITutor
          lessonTitle={lesson.title}
          database={lesson.database}
          currentQuery={activeQuery}
          errorMessage={activeError}
          hideTrigger
          open={dockOpen === 'tutor'}
          onOpenChange={(v) => setDockOpen(v ? 'tutor' : null)}
          initialPrompt={tutorPrompt}
          onPromptConsumed={() => setTutorPrompt(null)}
        />
      </LessonToolDock>

      <InterfaceOnboarding />
    </div>
  );
}
