/**
 * Generate timeline tasks programmatically from milestones
 * Used when AI doesn't provide timeline data
 */

import type { Milestone } from "@/lib/types";

export interface TimelineTask {
  task_date: string;
  task_title: string;
  task_description?: string;
  task_type: 'learning' | 'practice' | 'assessment' | 'review' | 'rest' | 'checkpoint' | 'celebration';
  estimated_hours: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  milestone_order?: number; // 1-based order (milestone 1, 2, 3, etc.)
}

/**
 * Generate timeline tasks from milestones
 */
export function generateTimelineFromMilestones(
  milestones: any[],
  startDate: Date,
  totalWeeks: number
): TimelineTask[] {
  const tasks: TimelineTask[] = [];
  const start = new Date(startDate);
  
  // Calculate weeks per milestone
  const weeksPerMilestone = Math.max(1, Math.floor(totalWeeks / milestones.length));
  
  milestones.forEach((milestone, milestoneIdx) => {
    const milestoneStartWeek = milestoneIdx * weeksPerMilestone;
    const milestoneWeeks = milestone.estimatedWeeks || 
                          parseInt(milestone.estimated_duration?.match(/\d+/)?.[0] || String(weeksPerMilestone));
    
    // Generate tasks for each week of the milestone
    for (let week = 0; week < milestoneWeeks; week++) {
      const weekStartDate = new Date(start);
      weekStartDate.setDate(weekStartDate.getDate() + (milestoneStartWeek + week) * 7);
      
      // Week 1: Learning tasks (Mon, Wed, Fri)
      if (week === 0) {
        tasks.push({
          task_date: addDays(weekStartDate, 1).toISOString().split('T')[0], // Monday
          task_title: `Start: ${milestone.title}`,
          task_description: milestone.description || `Begin working on ${milestone.title}`,
          task_type: 'learning',
          estimated_hours: 1,
          priority: 'high',
          milestone_order: (milestone.order || milestoneIdx + 1) // Use milestone.order if available, otherwise index+1
        });
        
        tasks.push({
          task_date: addDays(weekStartDate, 3).toISOString().split('T')[0], // Wednesday
          task_title: `Study: ${milestone.title}`,
          task_description: `Continue learning about ${milestone.title}`,
          task_type: 'learning',
          estimated_hours: 1.5,
          priority: 'medium',
          milestone_order: (milestone.order || milestoneIdx + 1) // Use milestone.order if available, otherwise index+1
        });
        
        tasks.push({
          task_date: addDays(weekStartDate, 5).toISOString().split('T')[0], // Friday
          task_title: `Practice: ${milestone.title}`,
          task_description: `Apply what you've learned about ${milestone.title}`,
          task_type: 'practice',
          estimated_hours: 2,
          priority: 'medium',
          milestone_order: (milestone.order || milestoneIdx + 1) // Use milestone.order if available, otherwise index+1
        });
      }
      // Middle weeks: Regular practice
      else if (week < milestoneWeeks - 1) {
        tasks.push({
          task_date: addDays(weekStartDate, 1).toISOString().split('T')[0], // Monday
          task_title: `Practice: ${milestone.title}`,
          task_description: `Continue working on ${milestone.title}`,
          task_type: 'practice',
          estimated_hours: 1.5,
          priority: 'medium',
          milestone_order: (milestone.order || milestoneIdx + 1) // Use milestone.order if available, otherwise index+1
        });
        
        tasks.push({
          task_date: addDays(weekStartDate, 4).toISOString().split('T')[0], // Thursday
          task_title: `Review: ${milestone.title}`,
          task_description: `Review your progress on ${milestone.title}`,
          task_type: 'review',
          estimated_hours: 1,
          priority: 'low',
          milestone_order: (milestone.order || milestoneIdx + 1) // Use milestone.order if available, otherwise index+1
        });
      }
      // Last week: Assessment and checkpoint
      else {
        tasks.push({
          task_date: addDays(weekStartDate, 2).toISOString().split('T')[0], // Tuesday
          task_title: `Checkpoint: ${milestone.title}`,
          task_description: milestone.checkpointQuestions?.[0] || `Complete checkpoint for ${milestone.title}`,
          task_type: 'checkpoint',
          estimated_hours: 2,
          priority: 'high',
          milestone_order: (milestone.order || milestoneIdx + 1) // Use milestone.order if available, otherwise index+1
        });
        
        tasks.push({
          task_date: addDays(weekStartDate, 5).toISOString().split('T')[0], // Friday
          task_title: `Celebrate: ${milestone.title} Complete!`,
          task_description: milestone.celebrationMessage || `🎉 You've completed ${milestone.title}!`,
          task_type: 'celebration',
          estimated_hours: 0.5,
          priority: 'low',
          milestone_order: (milestone.order || milestoneIdx + 1) // Use milestone.order if available, otherwise index+1
        });
      }
      
      // Add weekend rest day every 2 weeks
      if (week % 2 === 1) {
        tasks.push({
          task_date: addDays(weekStartDate, 6).toISOString().split('T')[0], // Sunday
          task_title: 'Rest Day',
          task_description: 'Take a break and recharge',
          task_type: 'rest',
          estimated_hours: 0,
          priority: 'low'
        });
      }
    }
  });
  
  return tasks.sort((a, b) => a.task_date.localeCompare(b.task_date));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}


