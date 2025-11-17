/**
 * SMART Goals Service
 * Handles SMART goal creation, tracking, and analytics
 */

export interface SMARTGoal {
  id: string;
  title: string;
  description: string;
  specific: string; // What exactly needs to be accomplished
  measurable: string; // How will success be measured
  achievable: string; // Is this goal realistic
  relevant: string; // Why is this goal important
  timebound: string; // When will this be completed
  targetDate: Date;
  currentProgress: number; // 0-100
  milestones: Array<{
    id: string;
    title: string;
    targetDate: Date;
    completed: boolean;
    completedAt?: Date;
  }>;
  metrics: Array<{
    name: string;
    value: number;
    target: number;
    unit: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a SMART goal from natural language
 */
export function parseSMARTGoal(text: string): Partial<SMARTGoal> {
  // This would use AI to parse natural language into SMART components
  // For now, return placeholder
  return {
    title: text,
    description: text,
    specific: '',
    measurable: '',
    achievable: '',
    relevant: '',
    timebound: ''
  };
}

/**
 * Validate if a goal meets SMART criteria
 */
export function validateSMARTGoal(goal: Partial<SMARTGoal>): {
  isValid: boolean;
  missing: string[];
  suggestions: string[];
} {
  const missing: string[] = [];
  const suggestions: string[] = [];

  if (!goal.specific || goal.specific.length < 10) {
    missing.push('specific');
    suggestions.push('Be more specific about what you want to achieve');
  }

  if (!goal.measurable || goal.measurable.length < 10) {
    missing.push('measurable');
    suggestions.push('Define clear metrics to track progress');
  }

  if (!goal.achievable || goal.achievable.length < 10) {
    missing.push('achievable');
    suggestions.push('Ensure the goal is realistic given your resources');
  }

  if (!goal.relevant || goal.relevant.length < 10) {
    missing.push('relevant');
    suggestions.push('Explain why this goal matters to you');
  }

  if (!goal.timebound || goal.timebound.length < 10) {
    missing.push('timebound');
    suggestions.push('Set a clear deadline or timeline');
  }

  return {
    isValid: missing.length === 0,
    missing,
    suggestions
  };
}

/**
 * Calculate goal completion percentage
 */
export function calculateGoalProgress(goal: SMARTGoal): number {
  if (goal.milestones.length === 0) {
    return goal.currentProgress;
  }

  const completedMilestones = goal.milestones.filter(m => m.completed).length;
  const milestoneProgress = (completedMilestones / goal.milestones.length) * 100;
  
  // Average of milestone progress and current progress
  return Math.round((milestoneProgress + goal.currentProgress) / 2);
}

/**
 * Generate milestone suggestions based on goal
 */
export function generateMilestones(goal: SMARTGoal): Array<{
  title: string;
  targetDate: Date;
  description: string;
}> {
  // This would use AI to generate milestones
  // For now, return placeholder
  const daysDiff = Math.ceil((goal.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const milestoneCount = Math.max(3, Math.min(6, Math.ceil(daysDiff / 30)));
  
  const milestones = [];
  for (let i = 1; i <= milestoneCount; i++) {
    const daysOffset = Math.floor((daysDiff / milestoneCount) * i);
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysOffset);
    
    milestones.push({
      title: `Milestone ${i}`,
      targetDate,
      description: `Progress checkpoint ${i}`
    });
  }
  
  return milestones;
}

