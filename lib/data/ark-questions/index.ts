/**
 * ARK Questions Index
 * Central export for all category-specific question sets
 */

export { academicQuestions } from './academic-excellence-questions';
export { careerQuestions } from './career-preparation-questions';
export { personalQuestions } from './personal-development-questions';
export { wellbeingQuestions } from './emotional-wellbeing-questions';
export { socialQuestions } from './social-relationships-questions';
export { lifeSkillsQuestions } from './life-skills-questions';

export type { ARKQuestion, QuestionCondition } from './academic-excellence-questions';

import { academicQuestions } from './academic-excellence-questions';
import { careerQuestions } from './career-preparation-questions';
import { personalQuestions } from './personal-development-questions';
import { wellbeingQuestions } from './emotional-wellbeing-questions';
import { socialQuestions } from './social-relationships-questions';
import { lifeSkillsQuestions } from './life-skills-questions';

// Master questions map
export const categoryQuestionsMap = {
  academic_excellence: academicQuestions,
  career_preparation: careerQuestions,
  personal_development: personalQuestions,
  emotional_wellbeing: wellbeingQuestions,
  social_relationships: socialQuestions,
  life_skills: lifeSkillsQuestions
};

/**
 * Get questions for a specific category
 */
export function getCategoryQuestions(categoryId: string) {
  return categoryQuestionsMap[categoryId as keyof typeof categoryQuestionsMap];
}

/**
 * Get all core questions for a category
 */
export function getCoreQuestions(categoryId: string) {
  const questions = getCategoryQuestions(categoryId);
  return questions?.core || [];
}

/**
 * Get all progressive questions for a category
 */
export function getProgressiveQuestions(categoryId: string) {
  const questions = getCategoryQuestions(categoryId);
  return questions?.progressive || [];
}

/**
 * Get a specific question by ID
 */
export function getQuestion(categoryId: string, questionId: string) {
  const core = getCoreQuestions(categoryId);
  const progressive = getProgressiveQuestions(categoryId);
  const all = [...core, ...progressive];
  return all.find(q => q.id === questionId);
}

