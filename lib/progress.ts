import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ProgressState {
  completedLessons: string[];
  xp: number;
  streak: number;
  maxStreak: number;
  lastActivity: string;
  reviewedAt: Record<string, string>;

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
        const state = get();
        set({
          reviewedAt: { ...state.reviewedAt, [slug]: new Date().toISOString() },
        });
      },

      isLessonCompleted: (slug: string) => {
        return get().completedLessons.includes(slug);
      },

      getModuleProgress: (moduleSlug: string, totalLessons: number) => {
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
}

const RANKS: Rank[] = [
  { name: 'user', threshold: 0, next: 100 },
  { name: 'apprentice', threshold: 100, next: 500 },
  { name: 'contributor', threshold: 500, next: 1500 },
  { name: 'engineer', threshold: 1500, next: 4000 },
  { name: 'architect', threshold: 4000, next: null },
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
