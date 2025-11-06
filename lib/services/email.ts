import axios from "axios";

export interface EmailPayload {
  to: string[];
  subject: string;
  html: string;
  from?: string;
  reply_to?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: string; // base64 encoded
  }>;
}

/**
 * Send email via Resend API
 */
export async function sendEmail(
  payload: EmailPayload
): Promise<{ success: boolean; email_id?: string; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️  RESEND_API_KEY not configured - email not sent");
      return {
        success: false,
        error: "Email service not configured",
      };
    }

    const response = await axios.post(
      "https://api.resend.com/emails",
      {
        from: payload.from || "Mentark Quantum <noreply@mentark.ai>",
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        ...(payload.reply_to && { reply_to: payload.reply_to }),
        ...(payload.cc && { cc: payload.cc }),
        ...(payload.bcc && { bcc: payload.bcc }),
        ...(payload.attachments && { attachments: payload.attachments }),
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`✓ Email sent to ${payload.to.join(", ")}`);

    return {
      success: true,
      email_id: response.data.id,
    };
  } catch (error: any) {
    console.error("Email send error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to send email",
    };
  }
}

/**
 * Send daily check-in reminder email
 */
export async function sendDailyCheckInReminder(
  studentEmail: string,
  studentName: string
): Promise<{ success: boolean }> {
  const result = await sendEmail({
    to: [studentEmail],
    subject: "🌟 Your Daily Mentark Check-in",
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0A0A0A; color: #FFFFFF;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #00E6FF; font-size: 28px; margin-bottom: 10px;">Good Morning, ${studentName}!</h1>
          <p style="color: #9CA3AF; font-size: 16px;">Time for your daily check-in 🌅</p>
        </div>
        
        <div style="background: #1A1A1A; border-radius: 12px; padding: 25px; margin-bottom: 20px;">
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
            Taking a moment each day to reflect helps you stay connected with yourself. 
            Let's check in on how you're feeling today!
          </p>
          
          <a href="https://mentark-quantum.vercel.app/dashboard/student" 
             style="display: inline-block; background: linear-gradient(135deg, #00E6FF 0%, #0099FF 100%); 
                    color: #000; padding: 12px 30px; border-radius: 8px; text-decoration: none; 
                    font-weight: 600; margin-top: 10px;">
            Complete Check-in
          </a>
        </div>
        
        <p style="color: #6B7280; font-size: 14px; text-align: center; margin-top: 30px;">
          Beyond marks. Toward meaning. 💙
        </p>
      </div>
    `,
  });

  return { success: result.success };
}

/**
 * Send parent weekly report email
 */
export async function sendParentReport(
  parentEmail: string,
  studentName: string,
  reportContent: string
): Promise<{ success: boolean }> {
  const result = await sendEmail({
    to: [parentEmail],
    subject: `📊 Weekly Progress Report - ${studentName}`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #F9FAFB; color: #1F2937;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #00E6FF; font-size: 24px;">Mentark Quantum</h1>
          <p style="color: #6B7280;">Weekly Progress Report</p>
        </div>
        
        <div style="background: white; border-radius: 12px; padding: 25px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="color: #1F2937; font-size: 20px; margin-bottom: 15px;">${studentName}'s Weekly Summary</h2>
          <div style="color: #4B5563; line-height: 1.6;">
            ${reportContent}
          </div>
        </div>
        
        <p style="color: #9CA3AF; font-size: 13px; text-align: center; margin-top: 30px;">
          This is an automated report from Mentark Quantum AI Mentorship System
        </p>
      </div>
    `,
  });

  return { success: result.success };
}

/**
 * Send achievement notification email
 */
export async function sendAchievementEmail(
  studentEmail: string,
  studentName: string,
  achievementTitle: string,
  achievementDescription: string
): Promise<{ success: boolean }> {
  const result = await sendEmail({
    to: [studentEmail],
    subject: `🎉 You Earned a New Badge: ${achievementTitle}!`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0A0A0A; color: #FFFFFF;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 48px; margin: 0;">🏆</h1>
          <h2 style="color: #00E6FF; font-size: 24px; margin: 10px 0;">Congratulations, ${studentName}!</h2>
          <p style="color: #9CA3AF;">You've unlocked a new achievement</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%); border-radius: 12px; padding: 25px; text-align: center;">
          <h3 style="color: #00E6FF; font-size: 20px; margin-bottom: 10px;">${achievementTitle}</h3>
          <p style="color: #D1D5DB; font-size: 16px; line-height: 1.6;">${achievementDescription}</p>
        </div>
        
        <p style="color: #6B7280; font-size: 14px; text-align: center; margin-top: 30px;">
          Keep up the amazing work! 🌟
        </p>
      </div>
    `,
  });

  return { success: result.success };
}

