'use client';

import { useEffect, useState, type ReactNode } from 'react';

export type DockTool = 'schema' | 'cheatsheet' | 'tutor';

interface LessonToolDockProps {
  tools: DockTool[];
  open: DockTool | null;
  onOpen: (tool: DockTool | null) => void;
  children: ReactNode;
}

const LABELS: Record<DockTool, string> = {
  schema: '$ schema',
  cheatsheet: '$ cheatsheet.sql',
  tutor: '$ ./ai-tutor',
};

const PULSE_SEEN_KEY = 'sql-mastery-tutor-seen';

export default function LessonToolDock({ tools, open, onOpen, children }: LessonToolDockProps) {
  const [expanded, setExpanded] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(PULSE_SEEN_KEY) === "1") return;
    } catch {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot attention pulse on first visit, gated by localStorage
    setPulse(true);
    const t = setTimeout(() => {
      setPulse(false);
      try {
        localStorage.setItem(PULSE_SEEN_KEY, "1");
      } catch {
        // ignore
      }
    }, 8000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {children}

      {open === null && (
        <div
          data-tour-target="tutor"
          className={`fixed bottom-4 right-4 z-40 font-mono text-xs border bg-slate-950/95 backdrop-blur rounded shadow-2xl overflow-hidden ${
            pulse ? 'border-indigo-400 ring-2 ring-indigo-400/60 animate-pulse motion-reduce:animate-none' : 'border-slate-800'
          }`}
          role="region"
          aria-label="lesson tools"
        >
          <button
            type="button"
            onClick={() => {
              setExpanded((e) => !e);
              setPulse(false);
              try {
                localStorage.setItem(PULSE_SEEN_KEY, '1');
              } catch {
                // ignore
              }
            }}
            className="w-full flex items-center justify-between gap-3 px-3 py-1.5 hover:bg-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            aria-expanded={expanded}
            aria-controls="lesson-tool-dock-list"
            aria-label={expanded ? 'collapse tools' : 'expand tools'}
          >
            <span className="text-indigo-400">$</span>
            <span className="text-slate-300">tools</span>
            <span className="text-slate-500" aria-hidden="true">{expanded ? '▾' : '▸'}</span>
          </button>

          {expanded && (
            <ul id="lesson-tool-dock-list" className="border-t border-slate-800 divide-y divide-slate-800/60">
              {tools.map((t) => (
                <li key={t}>
                  <button
                    type="button"
                    onClick={() => {
                      onOpen(t);
                      setExpanded(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  >
                    {LABELS[t]}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
