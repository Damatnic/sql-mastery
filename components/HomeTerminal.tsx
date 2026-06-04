"use client";

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { runTerminalCommand, completeCommand, type TerminalModule } from "@/lib/terminalCommands";

interface HomeTerminalProps {
  modules: TerminalModule[];
}

interface HistoryEntry {
  cmd: string;
  out: string[];
}

const PROMPT_PATH = "~/lessons$";

export default function HomeTerminal({ modules }: HomeTerminalProps) {
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdIdx, setCmdIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    focusInput();
  }, [focusInput]);

  const runCommand = useCallback(
    (raw: string) => {
      const cmd = raw.trim();
      if (cmd === "") {
        setHistory((h) => [...h, { cmd: "", out: [] }]);
        return;
      }
      const res = runTerminalCommand(raw, { modules, navigate: (p) => router.push(p) });
      if (res.clear) {
        setHistory([]);
        return;
      }
      setHistory((h) => [...h, { cmd, out: res.out }]);
      setCmdHistory((h) => [...h, cmd]);
      setCmdIdx(-1);
    },
    [modules, router],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runCommand(value);
      setValue("");
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
      const completed = completeCommand(value, modules);
      if (completed) setValue(completed);
    }
  };

  return (
    <div onClick={focusInput} className="cursor-text">
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

      <label className="block rounded has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-indigo-400 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-slate-950">
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
          aria-label="terminal command input. type help"
          className="sr-only"
        />
      </label>
    </div>
  );
}
