// Project Thread progress tracking store with localStorage persistence
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ThreadProgressState {
  // Map of lessonKey (moduleSlug/lessonSlug) to boolean (completed)
  completedChallenges: Record<string, boolean>;
  // Track attempts per challenge for hints
  challengeAttempts: Record<string, number>;

  // Actions
  completeChallenge: (lessonKey: string) => void;
  incrementAttempts: (lessonKey: string) => void;
  isChallengeCompleted: (lessonKey: string) => boolean;
  getAttemptCount: (lessonKey: string) => number;
  getThreadProgress: (threadId: string, challengeKeys: string[]) => { completed: number; total: number; percentage: number };
  resetThread: (challengeKeys: string[]) => void;
  resetAllThreads: () => void;
}

export const useThreadProgressStore = create<ThreadProgressState>()(
  persist(
    (set, get) => ({
      completedChallenges: {},
      challengeAttempts: {},

      completeChallenge: (lessonKey: string) => {
        const state = get();
        if (state.completedChallenges[lessonKey]) return;

        set({
          completedChallenges: {
            ...state.completedChallenges,
            [lessonKey]: true,
          },
        });
      },

      incrementAttempts: (lessonKey: string) => {
        const state = get();
        const currentAttempts = state.challengeAttempts[lessonKey] || 0;
        set({
          challengeAttempts: {
            ...state.challengeAttempts,
            [lessonKey]: currentAttempts + 1,
          },
        });
      },

      isChallengeCompleted: (lessonKey: string) => {
        return get().completedChallenges[lessonKey] || false;
      },

      getAttemptCount: (lessonKey: string) => {
        return get().challengeAttempts[lessonKey] || 0;
      },

      getThreadProgress: (threadId: string, challengeKeys: string[]) => {
        const state = get();
        const completed = challengeKeys.filter(key => state.completedChallenges[key]).length;
        const total = challengeKeys.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { completed, total, percentage };
      },

      resetThread: (challengeKeys: string[]) => {
        const state = get();
        const newCompleted = { ...state.completedChallenges };
        const newAttempts = { ...state.challengeAttempts };

        challengeKeys.forEach(key => {
          delete newCompleted[key];
          delete newAttempts[key];
        });

        set({
          completedChallenges: newCompleted,
          challengeAttempts: newAttempts,
        });
      },

      resetAllThreads: () => {
        set({
          completedChallenges: {},
          challengeAttempts: {},
        });
      },
    }),
    {
      name: 'sql-mastery-thread-progress',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// XP values for project thread challenges
export const THREAD_XP_VALUES = {
  CHALLENGE_COMPLETE: 50,
  FIRST_TRY_BONUS: 25,
  THREAD_COMPLETE_BONUS: 150,
} as const;
