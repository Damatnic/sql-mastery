'use client';

import { useEffect, useRef } from 'react';
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
  const panelRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    const focusTimer = setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>('a[href], button')?.focus();
    }, 50);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      clearTimeout(focusTimer);
      restoreFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  // Close the drawer when a lesson link inside is clicked (event delegation).
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('a[href]')) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden motion-reduce:transition-none ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="close navigation overlay"
        tabIndex={open ? 0 : -1}
        className={`absolute inset-0 w-full h-full bg-black/60 transition-opacity motion-reduce:transition-none focus-visible:outline-none ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="module navigation"
        className={`absolute left-0 top-0 bottom-0 w-[85vw] max-w-xs bg-slate-950 border-r border-slate-800 shadow-2xl transition-transform motion-reduce:transition-none overflow-y-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        onClick={handleContainerClick}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 font-mono text-xs">
          <span className="text-slate-500"># lessons</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-slate-400 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            aria-label="close navigation"
          >
            close
          </button>
        </div>
        <div className="p-3">
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
