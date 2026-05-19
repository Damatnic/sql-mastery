// Builds an interleaved cumulative-review set from completed lessons.
// Due lessons first, then other completed; no two consecutive items from
// the same module (interleaving aids retention). One challenge per lesson.
import { getLessonBySlug, type Lesson } from "@/lib/lessons";

type SqlChallenge = Lesson["challenges"][number];

export interface ReviewItem {
  moduleSlug: string;
  lessonSlug: string;
  lessonTitle: string;
  database: Lesson["database"];
  challenge: SqlChallenge;
}

function splitKey(key: string): [string, string] {
  const i = key.indexOf("/");
  return [key.slice(0, i), key.slice(i + 1)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function toItem(key: string): ReviewItem | null {
  const [moduleSlug, lessonSlug] = splitKey(key);
  if (!moduleSlug || !lessonSlug) return null;
  const lesson = getLessonBySlug(moduleSlug, lessonSlug);
  if (!lesson || lesson.challenges.length === 0) return null;
  return {
    moduleSlug,
    lessonSlug,
    lessonTitle: lesson.title,
    database: lesson.database,
    challenge: lesson.challenges[Math.floor(Math.random() * lesson.challenges.length)],
  };
}

function interleave(items: ReviewItem[]): ReviewItem[] {
  const out: ReviewItem[] = [];
  const pool = [...items];
  while (pool.length) {
    let idx = pool.findIndex(
      (it) => out.length === 0 || it.moduleSlug !== out[out.length - 1].moduleSlug,
    );
    if (idx === -1) idx = 0;
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

export function buildReviewSet(
  completed: string[],
  due: string[],
  max = 6,
): ReviewItem[] {
  const dueSet = new Set(due);
  const dueKeys = shuffle(completed.filter((k) => dueSet.has(k)));
  const restKeys = shuffle(completed.filter((k) => !dueSet.has(k)));
  const picked = [...dueKeys, ...restKeys].slice(0, max);
  const items = picked.map(toItem).filter((x): x is ReviewItem => x !== null);
  return interleave(items);
}
