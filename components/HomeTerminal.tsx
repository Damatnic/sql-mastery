"use client";

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { lessons as allLessons } from "@/lib/lessons";

interface ModuleTarget {
  slug: string;
  firstLesson: string;
  title: string;
  desc: string;
}

interface HomeTerminalProps {
  modules: ModuleTarget[];
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

  const readProgress = useCallback(() => {
    try {
      const raw = localStorage.getItem("sql-mastery-progress");
      if (!raw) return { xp: 0, streak: 0, completed: [] as string[] };
      const parsed = JSON.parse(raw);
      const state = parsed?.state ?? {};
      return {
        xp: state.xp ?? 0,
        streak: state.streak ?? 0,
        completed: (state.completedLessons ?? []) as string[],
      };
    } catch {
      return { xp: 0, streak: 0, completed: [] as string[] };
    }
  }, []);

  const runCommand = useCallback(
    (raw: string) => {
      const cmd = raw.trim();
      const parts = cmd.split(/\s+/);
      const head = parts[0]?.toLowerCase() ?? "";
      const arg = parts.slice(1).join(" ");
      const out: string[] = [];

      if (cmd === "") {
        setHistory((h) => [...h, { cmd: "", out: [] }]);
        return;
      }

      switch (head) {
        case "help":
          out.push("help              show this message");
          out.push("ls                list modules");
          out.push("stats             open /stats");
          out.push("projects          open /projects");
          out.push("playground        open /playground");
          out.push("whoami            rank · xp · streak");
          out.push("cd <module>       open module first lesson");
          out.push("search <keyword>  find a lesson by keyword");
          out.push("review [module]   open a random completed lesson (to revisit)");
          out.push("cat readme        project overview");
          out.push("clear             clear screen");
          break;
        case "ls":
          for (const m of modules) {
            out.push(`${m.slug}/`);
          }
          break;
        case "stats":
          out.push("opening /stats…");
          router.push("/stats");
          break;
        case "projects":
          out.push("opening /projects…");
          router.push("/projects");
          break;
        case "playground":
          out.push("opening /playground…");
          router.push("/playground");
          break;
        case "whoami": {
          const p = readProgress();
          out.push(`damato · xp ${p.xp} · streak ${p.streak}d · ${p.completed.length} lessons done`);
          break;
        }
        case "review": {
          const validKeys = new Set(allLessons.map((l) => `${l.moduleSlug}/${l.lessonSlug}`));
          const p = readProgress();
          const pool = arg
            ? p.completed.filter((k) => validKeys.has(k) && k.startsWith(`${arg}/`))
            : p.completed.filter((k) => validKeys.has(k));
          if (pool.length === 0) {
            out.push(
              arg
                ? `review: no completed lessons in module "${arg}". try \`ls\`.`
                : "review: nothing completed yet. finish a lesson first.",
            );
            break;
          }
          const pick = pool[Math.floor(Math.random() * pool.length)];
          out.push(`opening ${pick} (review)…`);
          router.push(`/learn/${pick}`);
          break;
        }
        case "search":
        case "find": {
          if (!arg) {
            out.push("search: missing keyword · usage: search <keyword>");
            break;
          }
          const needle = arg.toLowerCase();
          const matches = allLessons
            .filter((l) => {
              const haystack = [
                l.title,
                l.moduleSlug,
                l.lessonSlug,
                l.theory?.content?.slice(0, 400) ?? "",
              ]
                .join(" ")
                .toLowerCase();
              return haystack.includes(needle);
            })
            .slice(0, 8);
          if (matches.length === 0) {
            out.push(`search: no lesson matches "${arg}"`);
          } else {
            out.push(`# ${matches.length} match${matches.length === 1 ? "" : "es"} for "${arg}"`);
            for (const l of matches) {
              out.push(`  ${l.moduleSlug}/${l.lessonSlug}  · ${l.title}`);
            }
            out.push("tip: cd <module-slug> to open a module's first lesson");
          }
          break;
        }
        case "cd": {
          if (!arg) {
            out.push("cd: missing argument · try `ls`");
            break;
          }
          const target = modules.find((m) => m.slug === arg.replace(/\/$/, ""));
          if (!target) {
            out.push(`cd: no such module: ${arg}`);
          } else {
            out.push(`opening ${target.slug}…`);
            router.push(`/learn/${target.slug}/${target.firstLesson}`);
          }
          break;
        }
        case "cat":
          if (arg === "readme" || arg === "readme.md") {
            out.push("# sql-mastery");
            out.push("# personal practice site. wctc advanced sql.");
            out.push("# stack: next.js · sql.js · zustand · monaco");
          } else if (!arg) {
            out.push("cat: missing operand");
          } else {
            out.push(`cat: ${arg}: no such file`);
          }
          break;
        case "clear":
          setHistory([]);
          return;
        case "sudo":
          out.push("nice try.");
          break;
        case "rm":
          out.push("rm: refusing this one. your progress is safe.");
          break;
        case "exit":
          out.push("you cannot exit. just close the tab.");
          break;
        case "hello":
        case "hi":
        case "yo":
          out.push("yo.");
          break;
        case "coffee":
          out.push("brewing… ☕ (this is sql, you want caffeinated queries.)");
          break;
        case "42":
        case "answer":
          out.push("the answer.");
          break;
        case "make":
          out.push("make: nothing to do. you already started.");
          break;
        case "fortune": {
          const lines = [
            "premature optimization is the root of all evil. – knuth",
            "indexes are not free. neither is leaving them off.",
            "every JOIN you skip is a JOIN your future self will write.",
            "SELECT * is a smell, not a crime.",
            "WHERE 1=1 has saved more queries than any pattern.",
          ];
          out.push(lines[Math.floor(Math.random() * lines.length)]);
          break;
        }
        case "":
          break;
        default:
          out.push(`${head}: command not found · type \`help\``);
      }

      setHistory((h) => [...h, { cmd, out }]);
      setCmdHistory((h) => [...h, cmd]);
      setCmdIdx(-1);
    },
    [modules, router, readProgress],
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
      const lower = value.toLowerCase();
      const commands = ["help", "ls", "stats", "projects", "playground", "whoami", "cd ", "search ", "review ", "cat readme", "clear"];
      if (lower.startsWith("cd ")) {
        const partial = lower.slice(3).trim();
        const match = modules.find((m) => m.slug.startsWith(partial));
        if (match) setValue(`cd ${match.slug}`);
      } else if (lower) {
        const match = commands.find((c) => c.startsWith(lower));
        if (match) setValue(match);
      }
    }
  };

  return (
    <div onClick={focusInput} className="cursor-text">
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
