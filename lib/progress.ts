// Progress tracking store with localStorage persistence
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ProgressState {
  completedLessons: string[];
  xp: number;
  streak: number;
  lastActivity: string;

  // Actions
  completeLesson: (slug: string) => void;
  addXP: (amount: number) => void;
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
    // Already active today, keep streak
    return currentStreak;
  } else if (lastActivity === yesterdayStr) {
    // Active yesterday, increment streak
    return currentStreak + 1;
  } else if (!lastActivity) {
    // First activity
    return 1;
  } else {
    // Streak broken, start fresh
    return 1;
  }
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedLessons: [],
      xp: 0,
      streak: 0,
      lastActivity: '',

      completeLesson: (slug: string) => {
        const state = get();

        // Don't add duplicate completions
        if (state.completedLessons.includes(slug)) {
          return;
        }

        const newStreak = calculateStreak(state.lastActivity, state.streak);

        set({
          completedLessons: [...state.completedLessons, slug],
          xp: state.xp + 10, // Base XP for completing a lesson
          streak: newStreak,
          lastActivity: getToday(),
        });
      },

      addXP: (amount: number) => {
        const state = get();
        const newStreak = calculateStreak(state.lastActivity, state.streak);

        set({
          xp: state.xp + amount,
          streak: newStreak,
          lastActivity: getToday(),
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
          lastActivity: '',
        });
      },
    }),
    {
      name: 'sql-mastery-progress',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// XP amounts for different achievements
export const XP_VALUES = {
  LESSON_COMPLETE: 10,
  CHALLENGE_COMPLETE: 25,
  FIRST_TRY_CHALLENGE: 40, // Bonus for getting challenge right first try
  STREAK_BONUS: 5, // Per day of streak
} as const;
