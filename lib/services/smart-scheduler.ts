/**
 * Smart Scheduler - AI-powered time blocking and task optimization
 * Uses energy levels, task dependencies, and productivity patterns
 */

import { aiOrchestrator } from '@/lib/ai/orchestrator';
import type { AIContext } from '@/lib/types';

export interface Task {
  id: string;
  title: string;
  description?: string;
  estimatedMinutes: number;
  priority: number; // 1-5, 5 being highest
  energyRequired: 'low' | 'medium' | 'high';
  category: string;
  dependencies?: string[]; // Task IDs this depends on
  deadline?: string;
  flexible: boolean; // Can be rescheduled
}

export interface EnergyProfile {
  morning: number; // 1-10
  afternoon: number; // 1-10
  evening: number; // 1-10
  night: number; // 1-10
}

export interface TimeBlock {
  startTime: string; // ISO string
  endTime: string; // ISO string
  taskId: string;
  taskTitle: string;
  energyLevel: 'low' | 'medium' | 'high';
  category: string;
  estimatedMinutes: number;
}

export interface ScheduleResult {
  timeBlocks: TimeBlock[];
  totalScheduledMinutes: number;
  totalAvailableMinutes: number;
  conflicts: string[];
  recommendations: string[];
  energyOptimization: {
    morningTasks: number;
    afternoonTasks: number;
    eveningTasks: number;
    nightTasks: number;
  };
}

/**
 * Get optimal time slots based on energy profile and task requirements
 */
function getOptimalTimeSlots(
  energyProfile: EnergyProfile,
  taskEnergy: 'low' | 'medium' | 'high',
  availableHours: { start: string; end: string }[]
): { start: string; end: string; score: number }[] {
  const energyMap = {
    low: { min: 1, max: 4 },
    medium: { min: 5, max: 7 },
    high: { min: 8, max: 10 }
  };

  const targetEnergy = energyMap[taskEnergy];
  
  return availableHours.map(slot => {
    const hour = new Date(slot.start).getHours();
    let energyLevel: number;
    
    if (hour >= 6 && hour < 12) {
      energyLevel = energyProfile.morning;
    } else if (hour >= 12 && hour < 17) {
      energyLevel = energyProfile.afternoon;
    } else if (hour >= 17 && hour < 22) {
      energyLevel = energyProfile.evening;
    } else {
      energyLevel = energyProfile.night;
    }

    // Score: how well this time slot matches task energy requirement
    const score = energyLevel >= targetEnergy.min && energyLevel <= targetEnergy.max
      ? 10 - Math.abs(energyLevel - (targetEnergy.min + targetEnergy.max) / 2)
      : 0;

    return { ...slot, score };
  }).sort((a, b) => b.score - a.score);
}

/**
 * Create smart schedule using AI-powered optimization
 */
export async function createSmartSchedule(
  tasks: Task[],
  energyProfile: EnergyProfile,
  availableHours: { start: string; end: string }[],
  existingEvents: { start: string; end: string }[] = [],
  userId?: string
): Promise<ScheduleResult> {
  // Sort tasks by priority and dependencies
  const sortedTasks = sortTasksByPriority(tasks);
  
  const timeBlocks: TimeBlock[] = [];
  const conflicts: string[] = [];
  const recommendations: string[] = [];
  
  let totalScheduledMinutes = 0;
  const totalAvailableMinutes = availableHours.reduce((sum, slot) => {
    const start = new Date(slot.start).getTime();
    const end = new Date(slot.end).getTime();
    return sum + (end - start) / (1000 * 60);
  }, 0);

  // Track scheduled time slots
  const scheduledSlots: { start: Date; end: Date }[] = existingEvents.map(evt => ({
    start: new Date(evt.start),
    end: new Date(evt.end)
  }));

  // Schedule each task
  for (const task of sortedTasks) {
    // Check dependencies
    if (task.dependencies && task.dependencies.length > 0) {
      const unmetDeps = task.dependencies.filter(depId => 
        !timeBlocks.some(block => block.taskId === depId)
      );
      
      if (unmetDeps.length > 0) {
        conflicts.push(`Task "${task.title}" depends on unscheduled tasks`);
        continue;
      }
    }

    // Find optimal time slot
    const optimalSlots = getOptimalTimeSlots(energyProfile, task.energyRequired, availableHours);
    
    let scheduled = false;
    for (const slot of optimalSlots) {
      if (slot.score < 3) continue; // Skip poor matches
      
      const slotStart = new Date(slot.start);
      const slotEnd = new Date(slot.end);
      const taskEnd = new Date(slotStart.getTime() + task.estimatedMinutes * 60000);
      
      // Check if task fits in slot
      if (taskEnd > slotEnd) continue;
      
      // Check for conflicts with existing events
      const hasConflict = scheduledSlots.some(existing => {
        return (slotStart < existing.end && taskEnd > existing.start);
      });
      
      if (hasConflict) continue;
      
      // Schedule the task
      timeBlocks.push({
        startTime: slotStart.toISOString(),
        endTime: taskEnd.toISOString(),
        taskId: task.id,
        taskTitle: task.title,
        energyLevel: task.energyRequired,
        category: task.category,
        estimatedMinutes: task.estimatedMinutes
      });
      
      scheduledSlots.push({
        start: slotStart,
        end: taskEnd
      });
      
      totalScheduledMinutes += task.estimatedMinutes;
      scheduled = true;
      break;
    }
    
    if (!scheduled) {
      conflicts.push(`Could not schedule "${task.title}" - no suitable time slot found`);
      
      // Generate AI recommendation
      if (userId) {
        try {
          const recommendation = await generateSchedulingRecommendation(task, energyProfile, userId);
          if (recommendation) {
            recommendations.push(recommendation);
          }
        } catch (error) {
          console.error('Failed to generate scheduling recommendation:', error);
        }
      }
    }
  }

  // Calculate energy optimization stats
  const energyOptimization = {
    morningTasks: timeBlocks.filter(block => {
      const hour = new Date(block.startTime).getHours();
      return hour >= 6 && hour < 12;
    }).length,
    afternoonTasks: timeBlocks.filter(block => {
      const hour = new Date(block.startTime).getHours();
      return hour >= 12 && hour < 17;
    }).length,
    eveningTasks: timeBlocks.filter(block => {
      const hour = new Date(block.startTime).getHours();
      return hour >= 17 && hour < 22;
    }).length,
    nightTasks: timeBlocks.filter(block => {
      const hour = new Date(block.startTime).getHours();
      return hour >= 22 || hour < 6;
    }).length
  };

  return {
    timeBlocks,
    totalScheduledMinutes,
    totalAvailableMinutes,
    conflicts,
    recommendations,
    energyOptimization
  };
}

/**
 * Sort tasks by priority, dependencies, and deadlines
 */
function sortTasksByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // First, prioritize by deadline
    if (a.deadline && !b.deadline) return -1;
    if (!a.deadline && b.deadline) return 1;
    if (a.deadline && b.deadline) {
      const deadlineDiff = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      if (deadlineDiff !== 0) return deadlineDiff;
    }
    
    // Then by priority
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    
    // Then by dependencies (tasks with no dependencies first)
    if (a.dependencies?.length && !b.dependencies?.length) return 1;
    if (!a.dependencies?.length && b.dependencies?.length) return -1;
    
    // Finally by estimated time (shorter tasks first for better packing)
    return a.estimatedMinutes - b.estimatedMinutes;
  });
}

/**
 * Generate AI-powered scheduling recommendation
 */
async function generateSchedulingRecommendation(
  task: Task,
  energyProfile: EnergyProfile,
  userId: string
): Promise<string | null> {
  try {
    const prompt = `A student needs to schedule a task but couldn't find a suitable time slot.

Task: ${task.title}
Description: ${task.description || 'No description'}
Estimated Time: ${task.estimatedMinutes} minutes
Priority: ${task.priority}/5
Energy Required: ${task.energyRequired}
Category: ${task.category}
${task.deadline ? `Deadline: ${task.deadline}` : ''}

Student's Energy Profile:
- Morning (6am-12pm): ${energyProfile.morning}/10
- Afternoon (12pm-5pm): ${energyProfile.afternoon}/10
- Evening (5pm-10pm): ${energyProfile.evening}/10
- Night (10pm-6am): ${energyProfile.night}/10

Provide a brief, actionable recommendation (1-2 sentences) on how to schedule this task or what adjustments could be made.`;

    const context: AIContext = {
      task: 'mentor_chat',
      user_id: userId,
      metadata: {
        user_tier: 'free'
      }
    };

    const response = await aiOrchestrator(context, prompt);
    
    return response.content || null;
  } catch (error) {
    console.error('Error generating scheduling recommendation:', error);
    return null;
  }
}

/**
 * Optimize existing schedule using AI
 */
export async function optimizeSchedule(
  currentSchedule: TimeBlock[],
  tasks: Task[],
  energyProfile: EnergyProfile,
  userId?: string
): Promise<{ optimized: TimeBlock[]; improvements: string[] }> {
  // Analyze current schedule
  const analysis = analyzeSchedule(currentSchedule, energyProfile);
  
  // Generate optimization suggestions
  const improvements: string[] = [];
  
  if (analysis.poorEnergyMatches.length > 0) {
    improvements.push(`Found ${analysis.poorEnergyMatches.length} tasks scheduled during low-energy periods. Consider rescheduling.`);
  }
  
  if (analysis.longGaps.length > 0) {
    improvements.push(`Found ${analysis.longGaps.length} long gaps in schedule. Consider adding short tasks or breaks.`);
  }
  
  if (analysis.backToBackHighEnergy > 3) {
    improvements.push('Multiple high-energy tasks scheduled back-to-back. Consider adding breaks to prevent burnout.');
  }
  
  // Re-optimize schedule
  const availableHours = extractAvailableHours(currentSchedule);
  const optimized = await createSmartSchedule(
    tasks,
    energyProfile,
    availableHours,
    [],
    userId
  );
  
  return {
    optimized: optimized.timeBlocks,
    improvements
  };
}

/**
 * Analyze schedule quality
 */
function analyzeSchedule(schedule: TimeBlock[], energyProfile: EnergyProfile) {
  const poorEnergyMatches: string[] = [];
  const longGaps: { start: string; end: string; minutes: number }[] = [];
  let backToBackHighEnergy = 0;
  
  // Sort by time
  const sorted = [...schedule].sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
  
  for (let i = 0; i < sorted.length; i++) {
    const block = sorted[i];
    const hour = new Date(block.startTime).getHours();
    
    // Check energy match
    let currentEnergy: number;
    if (hour >= 6 && hour < 12) {
      currentEnergy = energyProfile.morning;
    } else if (hour >= 12 && hour < 17) {
      currentEnergy = energyProfile.afternoon;
    } else if (hour >= 17 && hour < 22) {
      currentEnergy = energyProfile.evening;
    } else {
      currentEnergy = energyProfile.night;
    }
    
    const requiredEnergy = block.energyLevel === 'high' ? 8 : block.energyLevel === 'medium' ? 5 : 3;
    
    if (currentEnergy < requiredEnergy) {
      poorEnergyMatches.push(block.taskTitle);
    }
    
    // Check for gaps
    if (i < sorted.length - 1) {
      const currentEnd = new Date(block.endTime).getTime();
      const nextStart = new Date(sorted[i + 1].startTime).getTime();
      const gapMinutes = (nextStart - currentEnd) / (1000 * 60);
      
      if (gapMinutes > 60) {
        longGaps.push({
          start: block.endTime,
          end: sorted[i + 1].startTime,
          minutes: gapMinutes
        });
      }
    }
    
    // Check back-to-back high energy
    if (block.energyLevel === 'high' && i > 0 && sorted[i - 1].energyLevel === 'high') {
      backToBackHighEnergy++;
    }
  }
  
  return {
    poorEnergyMatches,
    longGaps,
    backToBackHighEnergy
  };
}

/**
 * Extract available hours from schedule gaps
 */
function extractAvailableHours(schedule: TimeBlock[]): { start: string; end: string }[] {
  // This would extract free time slots
  // For now, return empty - would need day boundaries
  return [];
}


