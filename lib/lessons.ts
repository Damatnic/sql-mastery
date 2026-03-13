// Lesson data structure and helpers
// NOTE: Full lesson content is being added by another agent

export interface Lesson {
  module: number;
  lesson: number;
  slug: string;
  title: string;
  badge: 'concept' | 'practice' | 'challenge';
  database: 'company' | 'store' | 'school';
  theory: {
    content: string;
  };
  examples: Array<{
    title: string;
    explanation: string;
    sql: string;
  }>;
  challenges: Array<{
    id: string;
    prompt: string;
    hint?: string;
    expectedColumns: string[];
    validateFn: string;
    solution: string;
  }>;
  moduleSlug: string;
  lessonSlug: string;
}

export interface ModuleInfo {
  slug: string;
  name: string;
  color: string;
  lessons: number[];
}

// Module metadata for navigation and dashboard
export const modules: ModuleInfo[] = [
  { slug: 'getting-started', name: 'Getting Started', color: 'blue', lessons: [1, 2, 3, 4, 5] },
  { slug: 'data-analysis', name: 'Data Analysis Basics', color: 'green', lessons: [6, 7, 8, 9, 10] },
  { slug: 'joining-tables', name: 'Joining Tables', color: 'purple', lessons: [11, 12, 13, 14, 15] },
  { slug: 'subqueries-ctes', name: 'Subqueries & CTEs', color: 'orange', lessons: [16, 17, 18, 19] },
  { slug: 'modifying-data', name: 'Modifying Data', color: 'red', lessons: [20, 21, 22, 23] },
  { slug: 'functions', name: 'Functions & Expressions', color: 'teal', lessons: [24, 25, 26, 27, 28] },
  { slug: 'window-functions', name: 'Window Functions', color: 'pink', lessons: [29, 30, 31, 32, 33] },
  { slug: 'database-objects', name: 'Database Objects', color: 'indigo', lessons: [34, 35, 36, 37, 38] },
  { slug: 'advanced', name: 'SQL Server Advanced', color: 'yellow', lessons: [39, 40, 41, 42] },
];

// Empty lessons array - will be populated by lesson content agent
export const lessons: Lesson[] = [];

/**
 * Get a lesson by its module and lesson slugs
 */
export function getLessonBySlug(moduleSlug: string, lessonSlug: string): Lesson | null {
  return lessons.find(
    l => l.moduleSlug === moduleSlug && l.lessonSlug === lessonSlug
  ) || null;
}

/**
 * Get all lessons in a module
 */
export function getModuleLessons(moduleSlug: string): Lesson[] {
  return lessons.filter(l => l.moduleSlug === moduleSlug);
}

/**
 * Get module info by slug
 */
export function getModuleBySlug(slug: string): ModuleInfo | null {
  return modules.find(m => m.slug === slug) || null;
}

/**
 * Get the next lesson in sequence
 */
export function getNextLesson(currentLesson: Lesson): Lesson | null {
  const currentIndex = lessons.findIndex(
    l => l.moduleSlug === currentLesson.moduleSlug && l.lessonSlug === currentLesson.lessonSlug
  );

  if (currentIndex === -1 || currentIndex === lessons.length - 1) {
    return null;
  }

  return lessons[currentIndex + 1];
}

/**
 * Get the previous lesson in sequence
 */
export function getPreviousLesson(currentLesson: Lesson): Lesson | null {
  const currentIndex = lessons.findIndex(
    l => l.moduleSlug === currentLesson.moduleSlug && l.lessonSlug === currentLesson.lessonSlug
  );

  if (currentIndex <= 0) {
    return null;
  }

  return lessons[currentIndex - 1];
}

/**
 * Get total lesson count
 */
export function getTotalLessonCount(): number {
  return lessons.length;
}

/**
 * Get lesson count for a module
 */
export function getModuleLessonCount(moduleSlug: string): number {
  return getModuleLessons(moduleSlug).length;
}

/**
 * Get all modules with metadata
 */
export function getAllModules(): ModuleInfo[] {
  return modules;
}
