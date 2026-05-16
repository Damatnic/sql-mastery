import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { isShowcase } from '@/lib/mode';

// Spaced repetition: a completed lesson is due immediately, then the gap
// widens each time it's reviewed: +1d -> +3d -> +7d -> +16d -> +35d.
const DAY = 86_400_000;
export const SRS_INTERVALS_DAYS = [1, 3, 7, 16, 35];

export interface ReviewState {
  at: string;
  box: number;
}

function normalizeReview(v: ReviewState | string | undefined): ReviewState | null {
  if (!v) return null;
  if (typeof v === 'string') return { at: v, box: 0 };
  if (typeof v.at === 'string' && typeof v.box === 'number') return v;
  return null;
}

export function isLessonDue(
  slug: string,
  reviewedAt: Record<string, ReviewState | string>,
): boolean {
  const r = normalizeReview(reviewedAt[slug]);
  if (!r) return true;
  return Date.now() >= new Date(r.at).getTime() + SRS_INTERVALS_DAYS[r.box] * DAY;
}

export function getDueLessons(
  completed: string[],
  reviewedAt: Record<string, ReviewState | string>,
): string[] {
  return completed.filter((s) => isLessonDue(s, reviewedAt));
}

interface ProgressState {
  completedLessons: string[];
  xp: number;
  streak: number;
  maxStreak: number;
  lastActivity: string;
  reviewedAt: Record<string, ReviewState>;

  completeLesson: (slug: string) => void;
  addXP: (amount: number) => void;
  markReviewed: (slug: string) => void;
  isLessonCompleted: (slug: string) => boolean;
  getModuleProgress: (moduleSlug: string, totalLessons: number) => number;
  resetProgress: () => void;
}

const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};

const calculateStreak = (lastActivity: string, currentStreak: number): number => {
  const today = getToday();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastActivity === today) {
    return currentStreak;
  } else if (lastActivity === yesterdayStr) {
    return currentStreak + 1;
  } else if (!lastActivity) {
    return 1;
  } else {
    return 1;
  }
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedLessons: [],
      xp: 0,
      streak: 0,
      maxStreak: 0,
      lastActivity: '',
      reviewedAt: {},

      completeLesson: (slug: string) => {
        if (isShowcase()) return;
        const state = get();

        if (state.completedLessons.includes(slug)) {
          return;
        }

        const newStreak = calculateStreak(state.lastActivity, state.streak);

        set({
          completedLessons: [...state.completedLessons, slug],
          xp: state.xp + 10,
          streak: newStreak,
          maxStreak: Math.max(state.maxStreak, newStreak),
          lastActivity: getToday(),
        });
      },

      addXP: (amount: number) => {
        if (isShowcase()) return;
        const state = get();
        const newStreak = calculateStreak(state.lastActivity, state.streak);

        set({
          xp: state.xp + amount,
          streak: newStreak,
          maxStreak: Math.max(state.maxStreak, newStreak),
          lastActivity: getToday(),
        });
      },

      markReviewed: (slug: string) => {
        if (isShowcase()) return;
        const state = get();
        const cur = normalizeReview(state.reviewedAt[slug]);
        // Don't inflate the interval by reopening a lesson that isn't due yet.
        if (cur && !isLessonDue(slug, state.reviewedAt)) return;
        const nextBox = cur
          ? Math.min(cur.box + 1, SRS_INTERVALS_DAYS.length - 1)
          : 0;
        set({
          reviewedAt: {
            ...state.reviewedAt,
            [slug]: { at: new Date().toISOString(), box: nextBox },
          },
        });
      },

      isLessonCompleted: (slug: string) => {
        if (isShowcase()) return true;
        return get().completedLessons.includes(slug);
      },

      getModuleProgress: (moduleSlug: string, totalLessons: number) => {
        if (isShowcase()) return 100;
        const completedInModule = get().completedLessons.filter(
          slug => slug.startsWith(`${moduleSlug}/`)
        ).length;

        if (totalLessons === 0) return 0;
        return Math.round((completedInModule / totalLessons) * 100);
      },

      resetProgress: () => {
        set({
          completedLessons: [],
          xp: 0,
          streak: 0,
          maxStreak: 0,
          lastActivity: '',
          reviewedAt: {},
        });
      },
    }),
    {
      name: 'sql-mastery-progress',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const XP_VALUES = {
  LESSON_COMPLETE: 10,
  CHALLENGE_COMPLETE: 25,
  FIRST_TRY_CHALLENGE: 40,
  STREAK_BONUS: 5,
} as const;

export interface Rank {
  name: string;
  threshold: number;
  next: number | null;
  blurb: string;
}

const RANKS: Rank[] = [
  { name: 'select novice', threshold: 0, next: 100, blurb: 'SELECT, WHERE, ORDER BY. you can read a table.' },
  { name: 'data analyst', threshold: 100, next: 500, blurb: 'GROUP BY, HAVING, aggregates. you can answer a question without exporting to excel.' },
  { name: 'bi developer', threshold: 500, next: 1500, blurb: 'JOINs, subqueries, CTEs. you can stitch tables together without flattening to a giant view.' },
  { name: 'query architect', threshold: 1500, next: 4000, blurb: 'window functions, optimization, ranking. you reach for PARTITION BY before a self-join.' },
  { name: 'database engineer', threshold: 4000, next: null, blurb: 'all 52 lessons cleared. you ship sql other people read.' },
];

export function getRank(xp: number): Rank {
  let current = RANKS[0];
  for (const r of RANKS) {
    if (xp >= r.threshold) current = r;
  }
  return current;
}

export function getRankLadder(): Rank[] {
  return RANKS;
}
