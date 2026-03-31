// Project progress tracking store with localStorage persistence
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ProjectProgressState {
  // Map of projectSlug -> array of completed step IDs
  completedSteps: Record<string, string[]>;

  // Actions
  completeStep: (projectSlug: string, stepId: string) => void;
  isStepCompleted: (projectSlug: string, stepId: string) => boolean;
  getProjectProgress: (projectSlug: string, totalSteps: number) => number;
  getCompletedStepCount: (projectSlug: string) => number;
  resetProject: (projectSlug: string) => void;
  resetAllProjects: () => void;
}

export const useProjectProgressStore = create<ProjectProgressState>()(
  persist(
    (set, get) => ({
      completedSteps: {},

      completeStep: (projectSlug: string, stepId: string) => {
        const state = get();
        const projectSteps = state.completedSteps[projectSlug] || [];

        // Don't add duplicate completions
        if (projectSteps.includes(stepId)) {
          return;
        }

        set({
          completedSteps: {
            ...state.completedSteps,
            [projectSlug]: [...projectSteps, stepId],
          },
        });
      },

      isStepCompleted: (projectSlug: string, stepId: string) => {
        const projectSteps = get().completedSteps[projectSlug] || [];
        return projectSteps.includes(stepId);
      },

      getProjectProgress: (projectSlug: string, totalSteps: number) => {
        const projectSteps = get().completedSteps[projectSlug] || [];
        if (totalSteps === 0) return 0;
        return Math.round((projectSteps.length / totalSteps) * 100);
      },

      getCompletedStepCount: (projectSlug: string) => {
        return (get().completedSteps[projectSlug] || []).length;
      },

      resetProject: (projectSlug: string) => {
        const state = get();
        const newCompleted = { ...state.completedSteps };
        delete newCompleted[projectSlug];
        set({ completedSteps: newCompleted });
      },

      resetAllProjects: () => {
        set({ completedSteps: {} });
      },
    }),
    {
      name: 'sql-mastery-project-progress',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// XP values for project completions
export const PROJECT_XP_VALUES = {
  STEP_COMPLETE: 20,
  PROJECT_COMPLETE: 100,
  FIRST_TRY_STEP: 35,
} as const;
