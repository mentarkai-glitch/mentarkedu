/**
 * ARK Question Orchestrator
 * Manages progressive question flow, unlock conditions, and dynamic question sequencing
 */

import { 
  getCategoryQuestions, 
  getCoreQuestions, 
  getProgressiveQuestions,
  type ARKQuestion,
  type QuestionCondition
} from '@/lib/data/ark-questions';

export interface AnswerData {
  [questionId: string]: any;
}

export interface UnlockResult {
  unlocked: string[];
  locked: string[];
}

/**
 * Evaluate if a condition is met based on answers
 */
function evaluateCondition(
  condition: QuestionCondition,
  answers: AnswerData
): boolean {
  const { field, operator, value } = condition;
  const fieldValue = answers[field];

  switch (operator) {
    case 'equals':
      return fieldValue === value;
    
    case 'not_empty':
      return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
    
    case 'contains':
      if (typeof fieldValue === 'string') {
        return fieldValue.toLowerCase().includes(String(value).toLowerCase());
      }
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(value);
      }
      return false;
    
    case 'greater_than':
      return Number(fieldValue) > Number(value);
    
    case 'less_than':
      return Number(fieldValue) < Number(value);
    
    default:
      return false;
  }
}

/**
 * Check if a progressive question should be shown
 */
export function shouldShowQuestion(
  question: ARKQuestion,
  answers: AnswerData
): boolean {
  if (!question.condition) {
    return true; // Show if no condition
  }

  return evaluateCondition(question.condition, answers);
}

/**
 * Get all questions that should be shown based on current answers
 */
export function getActiveQuestions(
  categoryId: string,
  answers: AnswerData
): ARKQuestion[] {
  const core = getCoreQuestions(categoryId);
  const progressive = getProgressiveQuestions(categoryId);

  // Core questions are always shown
  const activeCore = core.filter(q => {
    // If not required and not answered, we can skip
    return q.required || answers[q.id] !== undefined;
  });

  // Progressive questions shown based on conditions
  const activeProgressive = progressive.filter(q => shouldShowQuestion(q, answers));

  return [...activeCore, ...activeProgressive];
}

/**
 * Get questions that are currently unlocked (ready to answer)
 */
export function getUnlockedQuestions(
  categoryId: string,
  answers: AnswerData,
  completedQuestionIds: string[]
): ARKQuestion[] {
  const all = getActiveQuestions(categoryId, answers);
  
  // Filter out already completed
  const remaining = all.filter(q => !completedQuestionIds.includes(q.id));
  
  // Check unlock dependencies
  const unlocked: ARKQuestion[] = [];
  
  for (const question of remaining) {
    let canShow = true;
    
    // Check if any required unlocking questions are answered
    if (question.id && answers) {
      // Core questions are always available
      const core = getCoreQuestions(categoryId);
      if (core.some(q => q.id === question.id)) {
        canShow = true;
      } else {
        // Progressive questions: check if condition is met
        canShow = shouldShowQuestion(question, answers);
      }
    }
    
    if (canShow) {
      unlocked.push(question);
    }
  }
  
  return unlocked;
}

/**
 * Check what questions get unlocked when a specific question is answered
 */
export function checkUnlocks(
  categoryId: string,
  questionId: string,
  answers: AnswerData
): UnlockResult {
  const question = getActiveQuestions(categoryId, answers).find(q => q.id === questionId);
  
  if (!question || !question.unlocks || question.unlocks.length === 0) {
    return { unlocked: [], locked: [] };
  }

  const allProgressive = getProgressiveQuestions(categoryId);
  const unlocked: string[] = [];
  const locked: string[] = [];

  // Check each potentially unlockable question
  for (const unlockableId of question.unlocks) {
    const unlockableQuestion = allProgressive.find(q => q.id === unlockableId);
    
    if (unlockableQuestion) {
      if (shouldShowQuestion(unlockableQuestion, answers)) {
        unlocked.push(unlockableId);
      } else {
        locked.push(unlockableId);
      }
    }
  }

  return { unlocked, locked };
}

/**
 * Get next question to show to user
 */
export function getNextQuestion(
  categoryId: string,
  answers: AnswerData,
  completedQuestionIds: string[]
): ARKQuestion | null {
  const unlocked = getUnlockedQuestions(categoryId, answers, completedQuestionIds);
  
  if (unlocked.length === 0) {
    return null;
  }

  // Priority: required questions first
  const required = unlocked.filter(q => q.required);
  if (required.length > 0) {
    return required[0];
  }

  // Then any question with unlocks (to progress flow)
  const withUnlocks = unlocked.filter(q => q.unlocks && q.unlocks.length > 0);
  if (withUnlocks.length > 0) {
    return withUnlocks[0];
  }

  // Finally, any other question
  return unlocked[0];
}

/**
 * Get progress percentage for a category
 */
export function getProgress(
  categoryId: string,
  completedQuestionIds: string[]
): number {
  const core = getCoreQuestions(categoryId);
  const progressive = getProgressiveQuestions(categoryId);
  const total = core.length + progressive.length;
  const completed = completedQuestionIds.length;

  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Validate that all required questions are answered
 */
export function validateRequired(
  categoryId: string,
  answers: AnswerData
): { valid: boolean; missing: string[] } {
  const core = getCoreQuestions(categoryId);
  const progressive = getProgressiveQuestions(categoryId);
  const allRequired = [...core, ...progressive].filter(q => q.required);

  const missing: string[] = [];

  for (const question of allRequired) {
    if (!shouldShowQuestion(question, answers)) {
      continue; // Skip if condition not met
    }

    if (answers[question.id] === undefined || 
        answers[question.id] === null || 
        answers[question.id] === '') {
      missing.push(question.id);
    }
  }

  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Get question sequence for displaying
 */
export function getQuestionSequence(
  categoryId: string,
  answers: AnswerData
): ARKQuestion[] {
  const core = getCoreQuestions(categoryId);
  const progressive = getProgressiveQuestions(categoryId);

  // Core questions first, then progressive
  const activeProgressive = progressive.filter(q => shouldShowQuestion(q, answers));
  
  return [...core, ...activeProgressive];
}

/**
 * Estimate how many questions will be asked
 */
export function estimateQuestionCount(
  categoryId: string,
  answers: AnswerData
): { min: number; max: number } {
  const core = getCoreQuestions(categoryId);
  const progressive = getProgressiveQuestions(categoryId);

  const min = core.length;
  const max = core.length + progressive.length;

  // Can be refined based on answer patterns
  return { min, max };
}

