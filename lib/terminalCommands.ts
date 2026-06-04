// Shared command engine for the terminal UIs (the homepage HomeTerminal and the
// site-wide CommandPalette). Keeping the switch here means both surfaces stay in
// perfect sync: a command added once works everywhere.

import { lessons as allLessons, getAllModules, getModuleLessons } from "@/lib/lessons";

export interface TerminalModule {
  slug: string;
  firstLesson: string;
  title: string;
  desc: string;
}

export interface TerminalResult {
  out: string[];
  clear?: boolean;
}

export interface TerminalContext {
  modules: TerminalModule[];
  navigate: (path: string) => void;
}

export const TERMINAL_COMMANDS = [
  "help",
  "ls",
  "stats",
  "projects",
  "playground",
  "whoami",
  "cd ",
  "search ",
  "review ",
  "cat readme",
  "clear",
];

// Build the module list the terminal needs (slug + first lesson) directly from
// the lesson data so it can never go stale.
export function getTerminalModules(): TerminalModule[] {
  return getAllModules().map((m) => {
    const ls = getModuleLessons(m.slug);
    return {
      slug: m.slug,
      firstLesson: ls[0]?.lessonSlug ?? "",
      title: m.slug,
      desc: "",
    };
  });
}

export function readProgress(): { xp: number; streak: number; completed: string[] } {
  try {
    const raw = localStorage.getItem("sql-mastery-progress");
    if (!raw) return { xp: 0, streak: 0, completed: [] };
    const parsed = JSON.parse(raw);
    const state = parsed?.state ?? {};
    return {
      xp: state.xp ?? 0,
      streak: state.streak ?? 0,
      completed: (state.completedLessons ?? []) as string[],
    };
  } catch {
    return { xp: 0, streak: 0, completed: [] };
  }
}

export function completeCommand(value: string, modules: TerminalModule[]): string | null {
  const lower = value.toLowerCase();
  if (lower.startsWith("cd ")) {
    const partial = lower.slice(3).trim();
    const match = modules.find((m) => m.slug.startsWith(partial));
    return match ? `cd ${match.slug}` : null;
  }
  if (lower) {
    const match = TERMINAL_COMMANDS.find((c) => c.startsWith(lower));
    return match ?? null;
  }
  return null;
}

export function runTerminalCommand(raw: string, ctx: TerminalContext): TerminalResult {
  const { modules, navigate } = ctx;
  const cmd = raw.trim();
  const parts = cmd.split(/\s+/);
  const head = parts[0]?.toLowerCase() ?? "";
  const arg = parts.slice(1).join(" ");
  const out: string[] = [];

  if (cmd === "") return { out: [] };

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
      out.push("review            interleaved mixed review (recall-gated SRS)");
      out.push("review <module>   revisit a random completed lesson in <module>");
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
      navigate("/stats");
      break;
    case "projects":
      out.push("opening /projects…");
      navigate("/projects");
      break;
    case "playground":
      out.push("opening /playground…");
      navigate("/playground");
      break;
    case "whoami": {
      const p = readProgress();
      out.push(`damato · xp ${p.xp} · streak ${p.streak}d · ${p.completed.length} lessons done`);
      break;
    }
    case "review": {
      if (!arg) {
        out.push("opening mixed review…");
        navigate("/review");
        break;
      }
      const validKeys = new Set(allLessons.map((l) => `${l.moduleSlug}/${l.lessonSlug}`));
      const p = readProgress();
      const pool = p.completed.filter(
        (k) => validKeys.has(k) && k.startsWith(`${arg}/`),
      );
      if (pool.length === 0) {
        out.push(`review: no completed lessons in module "${arg}". try \`ls\`.`);
        break;
      }
      const pick = pool[Math.floor(Math.random() * pool.length)];
      out.push(`opening ${pick} (review)…`);
      navigate(`/learn/${pick}`);
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
        navigate(`/learn/${target.slug}/${target.firstLesson}`);
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
      return { out: [], clear: true };
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
    default:
      out.push(`${head}: command not found · type \`help\``);
  }

  return { out };
}
