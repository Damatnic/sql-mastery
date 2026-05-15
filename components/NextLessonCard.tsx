'use client';

import Link from 'next/link';

interface NextLessonCardProps {
  nextLesson?: { lessonSlug: string; moduleSlug: string; title: string } | null;
}

export default function NextLessonCard({ nextLesson }: NextLessonCardProps) {
  if (!nextLesson) {
    return (
      <div className="mt-8 rounded border border-emerald-500/40 bg-emerald-500/[0.04] p-5 font-mono">
        <p className="text-xs text-emerald-400">✓ lesson done</p>
        <p className="mt-2 text-sm text-slate-100">
          you finished the last lesson in this module.
        </p>
        <Link
          href="/learn"
          className="mt-4 inline-flex items-baseline gap-2 px-3 py-2 rounded border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 transition-colors text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <span>exit 0</span>
          <span className="text-slate-500">·</span>
          <span>back to ~/lessons</span>
        </Link>
      </div>
    );
  }
  return (
    <div className="mt-8 rounded border border-emerald-500/40 bg-emerald-500/[0.04] p-5 font-mono">
      <p className="text-xs text-emerald-400">✓ lesson done</p>
      <p className="mt-2 text-sm text-slate-100">
        next up:{' '}
        <span className="text-indigo-400">{nextLesson.title}</span>
      </p>
      <Link
        href={`/learn/${nextLesson.moduleSlug}/${nextLesson.lessonSlug}`}
        className="mt-4 inline-flex items-baseline gap-2 px-3 py-2 rounded border border-indigo-400 text-indigo-400 hover:bg-indigo-400/10 transition-colors text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        <span>go to next lesson</span>
        <span>→</span>
      </Link>
    </div>
  );
}
