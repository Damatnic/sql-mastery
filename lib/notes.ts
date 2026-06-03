// Builds a clean Markdown study sheet for a module (theory + examples +
// practice prompts/hints + SQL quick reference). Read-only: identical in
// showcase and learn mode, mutates nothing.
import type { Lesson, ModuleInfo } from "@/lib/lessons";
import { CHEAT_SHEET_DATA } from "@/components/SQLCheatSheet";

export function moduleNotesMarkdown(
  moduleInfo: ModuleInfo,
  lessons: Lesson[],
): string {
  const out: string[] = [];
  out.push(`# ${moduleInfo.name}`);
  out.push(`\n> sql-mastery notes · module \`${moduleInfo.slug}\` · ${lessons.length} lessons`);

  lessons.forEach((lesson, i) => {
    out.push(`\n---\n`);
    out.push(`## ${String(i + 1).padStart(2, "0")}. ${lesson.title}`);
    if (lesson.theory?.content?.trim()) out.push(`\n${lesson.theory.content.trim()}`);

    if (lesson.examples.length) {
      out.push(`\n### Examples`);
      for (const ex of lesson.examples) {
        out.push(`\n**${ex.title}**`);
        if (ex.explanation?.trim()) out.push(`\n${ex.explanation.trim()}`);
        if (ex.sql?.trim()) out.push(`\n\`\`\`sql\n${ex.sql.trim()}\n\`\`\``);
      }
    }

    if (lesson.challenges.length) {
      out.push(`\n### Practice`);
      for (const c of lesson.challenges) {
        out.push(`\n- **${c.prompt}**`);
        if (c.hint?.trim()) out.push(`  \n  _tip:_ ${c.hint.trim()}`);
      }
    }
  });

  if (CHEAT_SHEET_DATA.length) {
    out.push(`\n---\n`);
    out.push(`## SQL quick reference`);
    for (const section of CHEAT_SHEET_DATA) {
      out.push(`\n**${section.title}**`);
      for (const it of section.items) {
        out.push(`\n- \`${it.syntax}\`: ${it.description}`);
      }
    }
  }

  out.push(`\n`);
  return out.join("\n");
}

export function downloadMarkdown(filename: string, content: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
