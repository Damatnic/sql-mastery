<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# sql-mastery maintainer notes

**Stack:** Next.js 16 · TypeScript · Tailwind · SQL.js · shadcn/ui

**Key files:**
- `lib/lessons.ts` — all 52 lessons in one file (~2500 lines)
- Components follow shadcn/ui patterns (Card, Button, etc.)
- AI tutor calls OpenAI — needs `OPENAI_API_KEY` in Vercel env

**Lessons:** 10 modules, 52 total. Module 10 is the WCTC advanced SQL module (stored procs, triggers, UDFs, XML/JSON, temporal tables).

**Deployment:** `vercel --prod` from project root. Live at https://damato-sql.vercel.app. Vercel project: astral-productions/sql-mastery.

**Common tasks:**
- Adding a lesson: add entry to `lib/lessons.ts` in the right module section, matching existing shape
- Module structure: each module starts with a `// ─── MODULE N: TITLE ───` comment
- OG image: generated automatically by Next.js file conventions at build time
- TypeScript: run `npx tsc --noEmit` to check

**Env vars needed in Vercel:**
- `OPENAI_API_KEY` — for the AI tutor feature (site works without it)
