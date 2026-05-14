'use client';

import { use, useMemo } from 'react';
import Link from 'next/link';
import XPBadge from '@/components/XPBadge';
import {
  projectThreads,
  getThreadChallenges,
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
      <div className="min-h-screen bg-slate-950 text-slate-100 font-mono text-sm flex flex-col items-start justify-center px-6 max-w-2xl mx-auto">
        <p>
          <span className="text-indigo-400">damato@sql</span>
          <span className="text-slate-500">:</span>
          <span className="text-slate-500">~$</span> cat /projects/thread/{id}
        </p>
        <p className="mt-2 text-rose-400">cat: no such thread</p>
        <Link
          href="/projects"
          className="mt-6 inline-flex items-center gap-2 px-3 py-2 rounded border border-slate-800 hover:border-indigo-400 hover:text-indigo-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <span className="text-indigo-400">→</span> back to ~/projects
        </Link>
      </div>
    );
  }

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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/60">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between text-xs font-mono">
          <Link
            href="/projects"
            className="text-slate-400 hover:text-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
          >
            <span className="text-indigo-400">$</span> cd ../projects
          </Link>
          <XPBadge />
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        <section className="font-mono text-sm">
          <p>
            <span className="text-indigo-400">damato@sql</span>
            <span className="text-slate-500">:</span>
            <span className="text-slate-500">~/projects/thread/{thread.id}$</span>{' '}
            <span>cat brief.md</span>
            <span className="ml-1 inline-block w-2 h-4 align-text-bottom bg-slate-100 terminal-cursor" aria-hidden="true" />
          </p>
        </section>

        <section className="mt-6">
          <p className="font-mono text-[11px] uppercase tracking-widest text-slate-500"># thread</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-100">{thread.title}</h1>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">{thread.description}</p>
          <p className="mt-3 font-mono text-[11px] text-slate-500">
            [{thread.databaseLabel}] · modules {thread.modules[0]}-{thread.modules[thread.modules.length - 1]} · {thread.totalSteps} steps
          </p>
        </section>

        <section className="mt-6 font-mono text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">
              <span className="text-indigo-400">progress: </span>
              {completedCount}/{challenges.length} steps
              {progress === 100 && <span className="ml-2 text-emerald-400">· done</span>}
            </span>
            <span className={progress === 100 ? 'text-emerald-400' : 'text-indigo-400'}>{progress}%</span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-400'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>

        <section className="mt-8">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-mono mb-2"># scenario</p>
          <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
            {thread.scenario}
          </p>
        </section>

        <section className="mt-8">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-mono mb-2"># build</p>
          <p className="text-sm text-slate-400">{thread.previewDescription}</p>
        </section>

        <section className="mt-8">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-mono mb-3"># steps</p>
          <ul className="space-y-2">
            {challengesWithLessons.map(({ challenge, lesson, isComplete }, index) => {
              const isLocked = index > 0 && !challengesWithLessons[index - 1].isComplete;
              const marker = isComplete ? '✓' : isLocked ? '·' : '>';
              const markerClass = isComplete
                ? 'text-emerald-400'
                : isLocked
                ? 'text-slate-600'
                : 'text-indigo-400';

              return (
                <li
                  key={challenge.id}
                  className={`rounded border ${
                    isComplete
                      ? 'border-emerald-700/40 bg-emerald-900/5'
                      : isLocked
                      ? 'border-slate-800/40 bg-slate-900/20 opacity-60'
                      : 'border-slate-800 bg-slate-900/40'
                  } p-3 font-mono`}
                >
                  <div className="flex items-start gap-3">
                    <span aria-hidden="true" className={`text-sm w-4 ${markerClass}`}>{marker}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500">
                        step {String(challenge.stepNumber).padStart(2, '0')}
                        {isLocked && <span className="ml-2 text-slate-600">[locked]</span>}
                      </p>
                      <p className={`text-sm ${isLocked ? 'text-slate-600' : 'text-slate-100'} truncate`}>
                        {challenge.title}
                      </p>
                      {lesson && (
                        <p className="mt-1 text-[11px] text-slate-500 truncate">
                          # from {lesson.moduleSlug}/{lesson.lessonSlug}
                        </p>
                      )}
                    </div>
                    {lesson && !isLocked && (
                      <Link
                        href={`/learn/${lesson.moduleSlug}/${lesson.lessonSlug}`}
                        className="shrink-0 px-2 py-1 rounded border border-slate-800 text-xs text-slate-300 hover:text-slate-100 hover:border-indigo-400/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                        aria-label={`Open lesson ${lesson.title}`}
                      >
                        open →
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </main>

      <footer className="border-t border-slate-800/60 py-5 font-mono text-xs">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3 text-slate-500">
          <span><span className="text-emerald-400">exit 0</span> · personal use · next.js + sql.js</span>
          <Link
            href="/projects"
            className="hover:text-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
          >
            cd ../projects
          </Link>
        </div>
      </footer>
    </div>
  );
}
