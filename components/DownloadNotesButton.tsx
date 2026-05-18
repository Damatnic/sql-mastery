'use client';

import { useState } from 'react';
import type { Lesson, ModuleInfo } from '@/lib/lessons';
import { moduleNotesMarkdown, downloadMarkdown } from '@/lib/notes';

interface DownloadNotesButtonProps {
  moduleInfo: ModuleInfo;
  lessons: Lesson[];
}

export default function DownloadNotesButton({
  moduleInfo,
  lessons,
}: DownloadNotesButtonProps) {
  const [done, setDone] = useState(false);

  const handle = () => {
    downloadMarkdown(
      `sql-mastery-${moduleInfo.slug}-notes.md`,
      moduleNotesMarkdown(moduleInfo, lessons),
    );
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handle}
      className="mt-2 block w-full text-left px-2 py-1.5 rounded text-[11px] text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      aria-label={`Download notes for ${moduleInfo.name} as Markdown`}
    >
      {done ? (
        <span className="text-emerald-400">✓ notes.md downloaded</span>
      ) : (
        <span>⤓ download notes (.md)</span>
      )}
    </button>
  );
}
