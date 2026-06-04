"use client";

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import {
  runTerminalCommand,
  completeCommand,
  getTerminalModules,
} from "@/lib/terminalCommands";

interface HistoryEntry {
  cmd: string;
  out: string[];
}

const PROMPT_PATH = "~/lessons$";
// Computed once from static lesson data; safe at module scope.
const MODULES = getTerminalModules();

// True when keyboard focus is inside the Monaco code editor, where Cmd+K is a
// real chord prefix. We leave the shortcut to the editor in that case.
function focusInEditor(): boolean {
  const el = document.activeElement;
  return !!(el && el.closest && el.closest(".monaco-editor"));
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdIdx, setCmdIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const router = useRouter();

  // Global Cmd/Ctrl+K toggles the palette (unless the code editor owns focus).
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        if (!open && focusInEditor()) return; // let Monaco keep its chord
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Focus the input whenever the palette opens, and restore focus to the opener
  // (the bottom-left trigger, or wherever Cmd+K was pressed) on close.
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      cancelAnimationFrame(id);
      restoreFocusRef.current?.focus?.();
    };
  }, [open]);

  const runCommand = useCallback(
    (raw: string) => {
      const cmd = raw.trim();
      if (cmd === "") {
        setHistory((h) => [...h, { cmd: "", out: [] }]);
        return;
      }
      const res = runTerminalCommand(raw, {
        modules: MODULES,
        navigate: (p) => {
          router.push(p);
          setOpen(false);
        },
      });
      if (res.clear) {
        setHistory([]);
        return;
      }
      setHistory((h) => [...h, { cmd, out: res.out }]);
      setCmdHistory((h) => [...h, cmd]);
      setCmdIdx(-1);
    },
    [router],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runCommand(value);
      setValue("");
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const newIdx = cmdIdx === -1 ? cmdHistory.length - 1 : Math.max(0, cmdIdx - 1);
      setCmdIdx(newIdx);
      setValue(cmdHistory[newIdx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cmdIdx === -1) return;
      const newIdx = cmdIdx + 1;
      if (newIdx >= cmdHistory.length) {
        setCmdIdx(-1);
        setValue("");
      } else {
        setCmdIdx(newIdx);
        setValue(cmdHistory[newIdx]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const completed = completeCommand(value, MODULES);
      if (completed) setValue(completed);
    }
  };

  return (
    <>
      {/* Always-present, understated trigger. Dodges the bottom-right tutor dock. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open command menu (Command K)"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-1.5 rounded border border-slate-700 bg-slate-900/80 px-2.5 py-1.5 font-mono text-xs text-slate-400 backdrop-blur hover:text-slate-100 hover:border-indigo-400/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        <span className="text-indigo-400" aria-hidden="true">{">_"}</span>
        <span className="hidden sm:inline" aria-hidden="true">⌘K</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-950/80 backdrop-blur-sm px-4 pt-[14vh]"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded border border-slate-800 bg-slate-900 font-mono text-sm shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-3 py-1.5 text-xs text-slate-500">
              <span id="cmd-palette-hint">command · type <span className="text-slate-300">help</span></span>
              <span aria-hidden="true">esc to close</span>
            </div>

            <div
              className="max-h-[40vh] overflow-y-auto px-3 py-2 cursor-text"
              onClick={() => inputRef.current?.focus()}
            >
              <div role="log" aria-live="polite" aria-label="command output">
                {history.map((h, i) => (
                  <div key={i} className="mb-1">
                    <p>
                      <span className="text-indigo-400">damato@sql</span>
                      <span className="text-slate-500">:</span>
                      <span className="text-slate-500">{PROMPT_PATH}</span>{" "}
                      <span>{h.cmd}</span>
                    </p>
                    {h.out.length > 0 && (
                      <pre className="text-slate-300 text-xs leading-relaxed mt-1 mb-2 whitespace-pre-wrap">
                        {h.out.join("\n")}
                      </pre>
                    )}
                  </div>
                ))}
              </div>

              <p className="flex items-baseline flex-wrap">
                <span className="text-indigo-400">damato@sql</span>
                <span className="text-slate-500">:</span>
                <span className="text-slate-500">{PROMPT_PATH}</span>{" "}
                <span className="inline-flex items-baseline">
                  <span className="text-slate-100 whitespace-pre">{value}</span>
                  <span
                    className="ml-1 inline-block w-2 h-4 align-text-bottom bg-slate-100 terminal-cursor"
                    aria-hidden="true"
                  />
                </span>
              </p>
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKeyDown}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                autoComplete="off"
                aria-label="Command input"
                aria-describedby="cmd-palette-hint"
                className="sr-only"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
