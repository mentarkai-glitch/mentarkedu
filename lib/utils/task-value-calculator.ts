interface TaskValueInput {
  priority: string;
  milestoneOrder: number;
  totalMilestones: number;
  deadlineProximityHours: number;
  estimatedHours: number;
}

export function calculateTaskValue(input: TaskValueInput): number {
  let value = 0;
  
  // Priority-based value
  const priorityValues: Record<string, number> = {
    critical: 10,
    high: 7,
    medium: 4,
    low: 1
  };
  value += priorityValues[input.priority] || 1;
  
  // Hours-based value
  value += (input.estimatedHours || 0) * 0.5;
  
  // Milestone order (earlier milestones are more important)
  value += (input.totalMilestones - input.milestoneOrder + 1) * 0.3;
  
  // Deadline proximity (closer deadlines = higher value)
  if (input.deadlineProximityHours < 24) {
    value += 5;
  } else if (input.deadlineProximityHours < 72) {
    value += 3;
  }
  
  return Math.min(20, value);
}

export function getNotificationChannels(taskValue: number): string[] {
  const channels: string[] = [];
  
  if (taskValue >= 10) {
    channels.push('push', 'email', 'whatsapp');
  } else if (taskValue >= 7) {
    channels.push('push', 'email');
  } else if (taskValue >= 4) {
    channels.push('push');
  } else {
    channels.push('in-app');
  }
  
  return channels;
}

export function getReminderSchedule(taskValue: number, deadlineHours: number): number[] {
  const reminderHours: number[] = [];
  
  if (taskValue >= 10) {
    // Critical: 72 hours (3 days), 24 hours (1 day), 2 hours before
    if (deadlineHours > 72) reminderHours.push(72);
    if (deadlineHours > 24) reminderHours.push(24);
    if (deadlineHours > 2) reminderHours.push(2);
  } else if (taskValue >= 7) {
    // High: 24 hours (1 day), 2 hours before
    if (deadlineHours > 24) reminderHours.push(24);
    if (deadlineHours > 2) reminderHours.push(2);
  } else if (taskValue >= 4) {
    // Medium: 2 hours before
    if (deadlineHours > 2) reminderHours.push(2);
  }
  
  return reminderHours;
}

