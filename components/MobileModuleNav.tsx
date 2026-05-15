'use client';

import { useEffect } from 'react';
import LessonNav from './LessonNav';
import type { Lesson, ModuleInfo } from '@/lib/lessons';

interface MobileModuleNavProps {
  open: boolean;
  onClose: () => void;
  currentLesson: Lesson;
  moduleLessons: Lesson[];
  moduleInfo: ModuleInfo;
}

export default function MobileModuleNav({
  open,
  onClose,
  currentLesson,
  moduleLessons,
  moduleInfo,
}: MobileModuleNavProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 transition-opacity ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="module navigation"
        className={`absolute left-0 top-0 bottom-0 w-[85vw] max-w-xs bg-slate-950 border-r border-slate-800 shadow-2xl transition-transform overflow-y-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 font-mono text-xs">
          <span className="text-slate-500"># lessons</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-slate-400 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            aria-label="close navigation"
          >
            close
          </button>
        </div>
        <div className="p-3" onClick={onClose}>
          <LessonNav
            currentLesson={currentLesson}
            moduleLessons={moduleLessons}
            moduleInfo={moduleInfo}
          />
        </div>
      </div>
    </div>
  );
}
