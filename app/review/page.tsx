'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ChallengeBlock from '@/components/ChallengeBlock';
import { createDatabase, runQuery } from '@/lib/db';
import { COMPANY_DB, STORE_DB, SCHOOL_DB } from '@/lib/databases';
import { useProgressStore, getDueLessons } from '@/lib/progress';
import { useShowcase } from '@/lib/mode';
import { buildReviewSet, type ReviewItem } from '@/lib/review';
import type { Database as SqlJsDatabase } from 'sql.js';

const SCHEMAS = { company: COMPANY_DB, store: STORE_DB, school: SCHOOL_DB };

function ReviewSession() {
  const showcase = useShowcase();
  const markReviewed = useProgressStore((s) => s.markReviewed);

  const [items, setItems] = useState<ReviewItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [reviewed, setReviewed] = useState(0);
  const [db, setDb] = useState<SqlJsDatabase | null>(null);
  const [dbError, setDbError] = useState(false);
  const dbCacheRef = useRef<Record<string, SqlJsDatabase>>({});
  const startedRef = useRef(false);

  useEffect(() => {
    if (showcase || startedRef.current) return;
    startedRef.current = true;
    // Read persisted progress directly (zustand persist hydrates async, so
    // the store slice can still be empty here on first paint).
    let completed: string[] = [];
    let reviewedAt: Record<string, unknown> = {};
    try {
      const raw = localStorage.getItem('sql-mastery-progress');
      if (raw) {
        const state = JSON.parse(raw)?.state ?? {};
        completed = state.completedLessons ?? [];
        reviewedAt = state.reviewedAt ?? {};
      }
    } catch {
      /* corrupt storage → empty session */
    }
    const due = getDueLessons(completed, reviewedAt as Parameters<typeof getDueLessons>[1]);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only data, resolve after mount
    setItems(buildReviewSet(completed, due));
  }, [showcase]);

  const item = items && index < items.length ? items[index] : null;

  useEffect(() => {
    if (!item) return;
    let cancelled = false;
    const cached = dbCacheRef.current[item.database];
    if (cached) {
      setDb(cached);
      return;
    }
    setDb(null);
    setDbError(false);
    createDatabase(SCHEMAS[item.database])
      .then((d) => {
        if (cancelled) return;
        dbCacheRef.current[item.database] = d;
        setDb(d);
      })
      .catch(() => !cancelled && setDbError(true));
    return () => {
      cancelled = true;
    };
  }, [item]);

  if (showcase) {
    return (
      <p className="font-mono text-sm text-slate-400">
        # mixed review is a local learning tool. run the site on localhost to use it.{' '}
        <Link href="/" className="text-indigo-400 hover:underline">~ home</Link>
      </p>
    );
  }

  if (items === null) {
    return <p className="font-mono text-xs text-slate-500">loading review set…</p>;
  }

  if (items.length === 0) {
    return (
      <p className="font-mono text-sm text-slate-400">
        # nothing to review yet. finish a lesson first.{' '}
        <Link href="/learn" className="text-indigo-400 hover:underline">cd ~/lessons</Link>
      </p>
    );
  }

  if (index >= items.length) {
    return (
      <div className="font-mono text-sm">
        <p className="text-emerald-400">exit 0 · review session complete</p>
        <p className="mt-2 text-xs text-slate-500">
          {reviewed} lesson{reviewed !== 1 ? 's' : ''} re-solved from memory · their next
          reviews were pushed further out.
        </p>
        <div className="mt-6 flex gap-4 text-xs">
          <Link href="/learn" className="text-indigo-400 hover:underline">cd ~/lessons</Link>
          <Link href="/stats" className="text-slate-400 hover:text-slate-100">stats/</Link>
        </div>
      </div>
    );
  }

  const advance = () => {
    setIndex((i) => i + 1);
  };
  const onComplete = () => {
    if (item) markReviewed(`${item.moduleSlug}/${item.lessonSlug}`);
    setReviewed((n) => n + 1);
    setTimeout(advance, 900);
  };

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4 font-mono text-xs">
        <p className="text-slate-500">
          <span className="text-indigo-400">review {index + 1}</span>/{items.length}
          <span className="ml-3 text-slate-600">interleaved · from memory</span>
        </p>
        <button
          type="button"
          onClick={advance}
          className="text-slate-400 hover:text-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded px-1"
        >
          skip →
        </button>
      </div>
      {item && (
        <p className="mb-2 font-mono text-[11px] text-slate-500">
          {item.moduleSlug}/{item.lessonSlug} ·{' '}
          <span className="text-slate-300">{item.lessonTitle}</span>
        </p>
      )}
      {dbError ? (
        <p className="font-mono text-xs text-rose-400">
          failed to load {item?.database}.db · refresh to retry.
        </p>
      ) : !db || !item ? (
        <p className="font-mono text-xs text-slate-500">loading {item?.database}.db…</p>
      ) : (
        <ChallengeBlock
          key={`${item.moduleSlug}/${item.lessonSlug}/${item.challenge.id}`}
          challenge={item.challenge}
          database={db}
          runQuery={runQuery}
          challengeNumber={index + 1}
          totalChallenges={items.length}
          reviewMode
          onComplete={onComplete}
        />
      )}
    </div>
  );
}

export default function ReviewPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/60">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between text-xs font-mono">
          <Link href="/learn" className="text-slate-400 hover:text-slate-100 transition-colors">
            <span className="text-indigo-400">$</span> cd ../lessons
          </Link>
        </div>
      </header>
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-1"># mixed review</p>
        <p className="font-mono text-[11px] text-slate-500 mb-6">
          spaced repetition across modules. solve from memory. each one re-solved
          pushes that lesson&apos;s next review further out.
        </p>
        <ReviewSession />
      </main>
    </div>
  );
}
