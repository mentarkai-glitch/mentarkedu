/**
 * ARK Smart Reminder & Notification System
 * Value-based reminders with multi-channel support
 */

import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "./email";
import { sendWhatsAppMessage } from "./whatsapp";
import { calculateTaskValue, getNotificationChannels, getReminderSchedule } from "@/lib/utils/task-value-calculator";

// Optional Firebase import - dynamically loaded when needed
async function getPushNotificationSender() {
  try {
    const notificationModule = await import("./notification");
    return notificationModule.sendPushNotification;
  } catch (error) {
    console.warn("Firebase Admin not available - push notifications disabled");
    return async () => ({ success: false, error: "Firebase not configured" });
  }
}

export interface ReminderTask {
  id: string;
  ark_id: string;
  milestone_id?: string;
  task_id?: string;
  title: string;
  description?: string;
  task_date: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimated_hours: number;
  milestone_order?: number;
  total_milestones?: number;
  user_id: string;
  user_email?: string;
  user_phone?: string;
  fcm_token?: string;
}

export interface ReminderResult {
  success: boolean;
  reminder_id?: string;
  channel: 'email' | 'push' | 'sms' | 'whatsapp' | 'in_app';
  sent_at: string;
  error?: string;
}

/**
 * Schedule reminders for a task based on its value
 */
export async function scheduleTaskReminders(task: ReminderTask): Promise<ReminderResult[]> {
  const results: ReminderResult[] = [];
  
  // Calculate task value
  const taskValue = calculateTaskValue({
    priority: task.priority,
    milestoneOrder: task.milestone_order || 1,
    totalMilestones: task.total_milestones || 1,
    deadlineProximityHours: getHoursUntilDeadline(task.task_date),
    estimatedHours: task.estimated_hours
  });

  // Get notification channels based on value
  const channels = getNotificationChannels(taskValue);
  
  // Get reminder schedule
  const deadlineHours = getHoursUntilDeadline(task.task_date);
  const reminderHours = getReminderSchedule(taskValue, deadlineHours);

  // Create reminders in database
  const supabase = await createClient();
  
  for (const hoursBefore of reminderHours) {
    const reminderTime = new Date(new Date(task.task_date).getTime() - hoursBefore * 60 * 60 * 1000);
    
    // Skip if reminder time has passed
    if (reminderTime < new Date()) continue;

    // Create reminder record
    const { data: reminder, error } = await supabase
      .from('ark_reminders')
      .insert({
        ark_id: task.ark_id,
        milestone_id: task.milestone_id,
        task_id: task.task_id,
        user_id: task.user_id,
        reminder_type: 'task_reminder',
        title: task.title,
        message: generateReminderMessage(task, hoursBefore, taskValue),
        scheduled_for: reminderTime.toISOString(),
        channels: channels,
        priority: task.priority,
        value_score: taskValue.score,
        status: 'scheduled'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating reminder:', error);
      continue;
    }

    results.push({
      success: true,
      reminder_id: reminder.id,
      channel: 'in_app',
      sent_at: reminderTime.toISOString()
    });
  }

  return results;
}

/**
 * Send scheduled reminders (called by cron job)
 */
export async function processScheduledReminders(): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> {
  const supabase = await createClient();
  const now = new Date();
  
  // Fetch reminders due to be sent
  const { data: reminders, error } = await supabase
    .from('ark_reminders')
    .select('*')
    .eq('status', 'scheduled')
    .lte('scheduled_for', now.toISOString())
    .limit(100);

  if (error || !reminders) {
    console.error('Error fetching reminders:', error);
    return { processed: 0, sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;

  for (const reminder of reminders) {
    try {
      // Fetch user details
      const { data: user } = await supabase
        .from('users')
        .select('email, phone_number')
        .eq('id', reminder.user_id)
        .single();

      // Fetch FCM token if available
      const { data: fcmToken } = await supabase
        .from('user_devices')
        .select('fcm_token')
        .eq('user_id', reminder.user_id)
        .eq('active', true)
        .single();

      const channels = reminder.channels || {};
      const results: ReminderResult[] = [];

      // Send email if enabled
      if (channels.email && user?.email) {
        try {
          await sendEmail({
            to: user.email,
            subject: reminder.title,
            html: generateEmailTemplate(reminder),
          });
          results.push({
            success: true,
            channel: 'email',
            sent_at: new Date().toISOString()
          });
        } catch (error) {
          results.push({
            success: false,
            channel: 'email',
            sent_at: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Send push notification if enabled
      if (channels.push && fcmToken?.fcm_token) {
        try {
          const sendPush = await getPushNotificationSender();
          await sendPush({
            user_id: reminder.user_id,
            fcm_token: fcmToken.fcm_token,
            title: reminder.title,
            body: reminder.message,
            type: 'ark_reminder',
            data: {
              ark_id: reminder.ark_id,
              reminder_id: reminder.id,
            }
          });
          results.push({
            success: true,
            channel: 'push',
            sent_at: new Date().toISOString()
          });
        } catch (error) {
          results.push({
            success: false,
            channel: 'push',
            sent_at: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Send SMS/WhatsApp if enabled (high value tasks only)
      if (channels.sms && user?.phone_number && reminder.value_score >= 0.6) {
        try {
          await sendWhatsAppMessage({
            to: user.phone_number,
            message: `🚀 Mentark Reminder: ${reminder.title}\n\n${reminder.message}\n\nView: [Link]`
          });
          results.push({
            success: true,
            channel: 'whatsapp',
            sent_at: new Date().toISOString()
          });
        } catch (error) {
          results.push({
            success: false,
            channel: 'whatsapp',
            sent_at: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Update reminder status
      const allSuccessful = results.every(r => r.success);
      await supabase
        .from('ark_reminders')
        .update({
          status: allSuccessful ? 'sent' : 'failed',
          sent_at: new Date().toISOString(),
          delivery_results: results
        })
        .eq('id', reminder.id);

      if (allSuccessful) sent++;
      else failed++;

    } catch (error) {
      console.error(`Error processing reminder ${reminder.id}:`, error);
      failed++;
      
      await supabase
        .from('ark_reminders')
        .update({
          status: 'failed',
          delivery_results: [{ success: false, error: error instanceof Error ? error.message : 'Unknown error' }]
        })
        .eq('id', reminder.id);
    }
  }

  return {
    processed: reminders.length,
    sent,
    failed
  };
}

/**
 * Send daily summary email
 */
export async function sendDailySummary(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Fetch user details
    const { data: user } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    if (!user?.email) {
      return { success: false, error: 'User email not found' };
    }

    // Fetch today's tasks
    const today = new Date().toISOString().split('T')[0];
    const { data: tasks } = await supabase
      .from('ark_timeline')
      .select(`
        *,
        arks!inner(id, title, student_id)
      `)
      .eq('arks.student_id', userId)
      .eq('task_date', today);

    // Fetch completed tasks from yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const { data: completedTasks } = await supabase
      .from('ark_timeline')
      .select(`
        *,
        arks!inner(id, title, student_id)
      `)
      .eq('arks.student_id', userId)
      .eq('task_date', yesterdayStr)
      .eq('is_completed', true);

    // Generate summary
    const summary = {
      todayTasks: tasks?.length || 0,
      completedYesterday: completedTasks?.length || 0,
      upcomingDeadlines: tasks?.filter(t => !t.is_completed && t.priority === 'critical').length || 0
    };

    // Send email
    await sendEmail({
      to: user.email,
      subject: `📊 Your Daily Mentark Summary - ${new Date().toLocaleDateString()}`,
      html: generateDailySummaryTemplate(user.full_name || 'Student', summary)
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending daily summary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Generate reminder message based on hours before deadline
 */
function generateReminderMessage(
  task: ReminderTask,
  hoursBefore: number,
  value: { score: number; category: string }
): string {
  const urgency = hoursBefore <= 1 ? 'urgent' : hoursBefore <= 24 ? 'soon' : 'upcoming';
  
  const messages = {
    urgent: `🚨 ${task.title} is due in ${Math.round(hoursBefore * 60)} minutes!`,
    soon: `⏰ Reminder: ${task.title} is due in ${Math.round(hoursBefore)} hours`,
    upcoming: `📅 ${task.title} is scheduled for ${new Date(task.task_date).toLocaleDateString()}`
  };

  return messages[urgency] || messages.upcoming;
}

/**
 * Generate email template for reminder
 */
function generateEmailTemplate(reminder: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 Mentark Reminder</h1>
        </div>
        <div class="content">
          <h2>${reminder.title}</h2>
          <p>${reminder.message}</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://mentark-quantum.vercel.app'}/ark/${reminder.ark_id}" class="button">View ARK</a>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate daily summary email template
 */
function generateDailySummaryTemplate(userName: string, summary: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .stat { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #f59e0b; }
        .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Your Daily Mentark Summary</h1>
          <p>Good morning, ${userName}!</p>
        </div>
        <div class="content">
          <div class="stat">
            <h3>✅ Yesterday's Progress</h3>
            <p>You completed ${summary.completedYesterday} task${summary.completedYesterday !== 1 ? 's' : ''}!</p>
          </div>
          <div class="stat">
            <h3>📅 Today's Tasks</h3>
            <p>You have ${summary.todayTasks} task${summary.todayTasks !== 1 ? 's' : ''} scheduled for today.</p>
          </div>
          ${summary.upcomingDeadlines > 0 ? `
          <div class="stat" style="border-left-color: #ef4444;">
            <h3>🚨 High Priority</h3>
            <p>${summary.upcomingDeadlines} critical task${summary.upcomingDeadlines !== 1 ? 's' : ''} need your attention!</p>
          </div>
          ` : ''}
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://mentark-quantum.vercel.app'}/dashboard/student" class="button">View Dashboard</a>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Helper function to calculate hours until deadline
 */
function getHoursUntilDeadline(dateString: string): number {
  const deadline = new Date(dateString);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  return Math.max(0, diffMs / (1000 * 60 * 60));
}


