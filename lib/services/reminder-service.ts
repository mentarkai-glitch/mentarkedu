/**
 * Reminder Service
 * Handles proactive notifications and reminders for ARKs
 */

import { createClient } from "@/lib/supabase/server";

export interface ReminderConfig {
  arkId: string;
  milestoneId?: string;
  reminderType: 'task_due' | 'task_start' | 'checkpoint' | 'milestone_due' | 'celebration' | 'check_in' | 'motivational';
  title: string;
  message: string;
  scheduledAt: Date;
  deliveryChannel?: 'in_app' | 'email' | 'sms' | 'push' | 'whatsapp';
  metadata?: Record<string, any>;
}

/**
 * Create a reminder
 */
export async function createReminder(config: ReminderConfig, userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ark_reminders')
    .insert({
      ark_id: config.arkId,
      milestone_id: config.milestoneId,
      user_id: userId,
      reminder_type: config.reminderType,
      title: config.title,
      message: config.message,
      scheduled_at: config.scheduledAt.toISOString(),
      delivery_channel: config.deliveryChannel || 'in_app',
      metadata: config.metadata || {}
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Get upcoming reminders for a user
 */
export async function getUpcomingReminders(userId: string, limit = 10) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ark_reminders')
    .select(`
      *,
      ark:arks!inner(title, category, status),
      milestone:ark_milestones(title)
    `)
    .eq('user_id', userId)
    .eq('is_sent', false)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(limit);

  return { data, error };
}

/**
 * Generate automatic reminders from timeline entries
 */
export async function generateTimelineReminders(arkId: string, userId: string) {
  const supabase = await createClient();

  // Get ARK details
  const { data: ark } = await supabase
    .from('arks')
    .select('title, category')
    .eq('id', arkId)
    .single();

  if (!ark) return { error: 'ARK not found' };

  // Get upcoming timeline tasks
  const { data: timelineTasks } = await supabase
    .from('ark_timeline')
    .select(`
      *,
      milestone:ark_milestones(title, order_index)
    `)
    .eq('ark_id', arkId)
    .eq('is_completed', false)
    .gte('task_date', new Date().toISOString().split('T')[0])
    .order('task_date', { ascending: true })
    .limit(30); // Next 30 days

  if (!timelineTasks || timelineTasks.length === 0) {
    return { data: [], error: null };
  }

  // Create reminders for each task
  const reminders = timelineTasks.map(task => ({
    ark_id: arkId,
    milestone_id: task.milestone_id,
    user_id: userId,
    reminder_type: getReminderTypeForTaskType(task.task_type) as any,
    title: getReminderTitle(task.task_type, task.task_title),
    message: getReminderMessage(ark.title, task, task.milestone),
    scheduled_at: new Date(`${task.task_date}T09:00:00Z`).toISOString(), // Remind at 9 AM on task day
    delivery_channel: 'in_app' as any,
    metadata: {
      task_type: task.task_type,
      estimated_hours: task.estimated_hours,
      priority: task.priority
    }
  }));

  // Batch insert reminders
  const { data, error } = await supabase
    .from('ark_reminders')
    .insert(reminders)
    .select();

  return { data, error };
}

/**
 * Helper: Get reminder type based on task type
 */
function getReminderTypeForTaskType(taskType: string): string {
  switch (taskType) {
    case 'celebration':
      return 'celebration';
    case 'checkpoint':
      return 'checkpoint';
    case 'assessment':
      return 'task_due';
    case 'review':
      return 'task_due';
    default:
      return 'task_start';
  }
}

/**
 * Helper: Generate reminder title
 */
function getReminderTitle(taskType: string, taskTitle: string): string {
  const prefixes: Record<string, string> = {
    learning: '🎓 Study Time',
    practice: '💪 Practice Session',
    assessment: '📝 Assessment Due',
    review: '📚 Review Time',
    rest: '☕ Break Time',
    checkpoint: '✅ Checkpoint',
    celebration: '🎉 Celebrate!'
  };

  return `${prefixes[taskType] || '⏰ Task'}: ${taskTitle}`;
}

/**
 * Helper: Generate reminder message
 */
function getReminderMessage(arkTitle: string, task: any, milestone?: any): string {
  const milestoneText = milestone ? ` from "${milestone.title}"` : '';
  const hourText = task.estimated_hours > 1 
    ? `${task.estimated_hours} hours` 
    : '30 minutes';

  return `Ready to work on "${task.task_title}"${milestoneText} in your ${arkTitle} ARK? Estimated time: ${hourText}. Let's do this! 💪`;
}

/**
 * Mark reminder as sent
 */
export async function markReminderSent(reminderId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ark_reminders')
    .update({ is_sent: true, sent_at: new Date().toISOString() })
    .eq('id', reminderId)
    .select()
    .single();

  return { data, error };
}

/**
 * Mark reminder as read
 */
export async function markReminderRead(reminderId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ark_reminders')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', reminderId)
    .select()
    .single();

  return { data, error };
}

/**
 * Create a motivational reminder
 */
export async function createMotivationalReminder(arkId: string, userId: string, milestoneId?: string) {
  const supabase = await createClient();

  // Get progress data
  const { data: ark } = await supabase
    .from('arks')
    .select('title, progress')
    .eq('id', arkId)
    .single();

  if (!ark) return { error: 'ARK not found' };

  // Choose motivational message based on progress
  const messages = [
    "You're doing amazing! Keep up the great work on your learning journey! 🌟",
    "Every step forward counts. You're building something incredible! 💪",
    "Remember why you started. You've got this! 🚀",
    "Small progress is still progress. Celebrate every win! 🎉",
    "Your future self will thank you for the effort you're putting in today! 🙏"
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  const { data, error } = await supabase
    .from('ark_reminders')
    .insert({
      ark_id: arkId,
      milestone_id: milestoneId,
      user_id: userId,
      reminder_type: 'motivational',
      title: '💫 Keep Going!',
      message: randomMessage,
      scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      delivery_channel: 'in_app',
      metadata: {
        ark_progress: ark.progress
      }
    })
    .select()
    .single();

  return { data, error };
}


