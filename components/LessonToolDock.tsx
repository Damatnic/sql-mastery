"use client";

import { useState, type ReactNode } from "react";

export type DockTool = "schema" | "cheatsheet" | "tutor";

interface LessonToolDockProps {
  tools: DockTool[];
  open: DockTool | null;
  onOpen: (tool: DockTool | null) => void;
  children: ReactNode;
}

const LABELS: Record<DockTool, string> = {
  schema: "$ schema",
  cheatsheet: "$ cheatsheet.sql",
  tutor: "$ ./ai-tutor",
};

export default function LessonToolDock({ tools, open, onOpen, children }: LessonToolDockProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {children}

      {open === null && (
        <div
          className="fixed bottom-4 right-4 z-40 font-mono text-xs border border-slate-800 bg-slate-950/95 backdrop-blur rounded shadow-2xl overflow-hidden"
          role="region"
          aria-label="lesson tools"
        >
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="w-full flex items-center justify-between gap-3 px-3 py-1.5 hover:bg-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            aria-expanded={expanded}
            aria-label={expanded ? "collapse tools" : "expand tools"}
          >
            <span className="text-indigo-400">$</span>
            <span className="text-slate-300">tools</span>
            <span className="text-slate-500">{expanded ? "▾" : "▸"}</span>
          </button>

          {expanded && (
            <ul className="border-t border-slate-800 divide-y divide-slate-800/60">
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
