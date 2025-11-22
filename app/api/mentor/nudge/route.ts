import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import { callClaude } from "@/lib/ai/models/claude";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { data: student } = await supabase
      .from("students")
      .select("id, target_exams")
      .eq("user_id", user.id)
      .single();

    if (!student) {
      return errorResponse("Student profile not found", 404);
    }

    // Get recent check-ins (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: checkins } = await supabase
      .from("daily_checkins")
      .select("*")
      .eq("student_id", student.id)
      .gte("date", sevenDaysAgo.toISOString().split("T")[0])
      .order("date", { ascending: false });

    // Get ARK progress
    const { data: activeArks } = await supabase
      .from("arks")
      .select("id, summary, status, progress")
      .eq("student_id", student.id)
      .eq("status", "active")
      .limit(3);

    // Get recent test performance
    const { data: recentTests } = await supabase
      .from("test_attempts")
      .select("score, percentage, mock_tests!inner(title)")
      .eq("student_id", student.id)
      .order("started_at", { ascending: false })
      .limit(3);

    // Get practice session stats
    const { data: recentPractice } = await supabase
      .from("practice_sessions")
      .select("accuracy, total_questions, correct_answers")
      .eq("student_id", student.id)
      .order("started_at", { ascending: false })
      .limit(5);

    // Get streak
    const { data: allCheckins } = await supabase
      .from("daily_checkins")
      .select("date")
      .eq("student_id", student.id)
      .order("date", { ascending: false });

    let streak = 0;
    if (allCheckins && allCheckins.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < allCheckins.length; i++) {
        const checkinDate = new Date(allCheckins[i].date);
        checkinDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((today.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === i) {
          streak++;
        } else {
          break;
        }
      }
    }

    // Generate nudge using AI Router
    const avgMood = checkins && checkins.length > 0
      ? checkins.reduce((sum: number, c: any) => sum + (c.mood || 3), 0) / checkins.length
      : 3;
    
    const avgEnergy = checkins && checkins.length > 0
      ? checkins.reduce((sum: number, c: any) => sum + (c.energy || 3), 0) / checkins.length
      : 3;

    const avgTestScore = recentTests && recentTests.length > 0
      ? recentTests.reduce((sum: number, t: any) => sum + (t.percentage || 0), 0) / recentTests.length
      : null;

    const avgPracticeAccuracy = recentPractice && recentPractice.length > 0
      ? recentPractice.reduce((sum: number, p: any) => {
          const acc = p.total_questions > 0 ? (p.correct_answers / p.total_questions) * 100 : 0;
          return sum + acc;
        }, 0) / recentPractice.length
      : null;

    const context = {
      streak,
      avgMood: Math.round(avgMood),
      avgEnergy: Math.round(avgEnergy),
      hasActiveArks: (activeArks?.length || 0) > 0,
      activeArksCount: activeArks?.length || 0,
      recentCheckinsCount: checkins?.length || 0,
      avgTestScore: avgTestScore ? Math.round(avgTestScore) : null,
      avgPracticeAccuracy: avgPracticeAccuracy ? Math.round(avgPracticeAccuracy) : null,
      recentTestCount: recentTests?.length || 0,
    };

    // Generate nudge using Claude with enhanced context
    const prompt = `Generate a personalized daily nudge message for a student preparing for competitive exams (JEE/NEET).

Context:
- Streak: ${streak} days
- Average Mood: ${Math.round(avgMood)}/5
- Average Energy: ${Math.round(avgEnergy)}/5
- Active ARKs: ${activeArks?.length || 0} (${activeArks?.map((a: any) => `${Math.round(a.progress || 0)}%`).join(", ") || "N/A"})
- Recent Check-ins: ${checkins?.length || 0} in last 7 days
${avgTestScore ? `- Recent Test Average: ${Math.round(avgTestScore)}%` : ""}
${avgPracticeAccuracy ? `- Practice Accuracy: ${Math.round(avgPracticeAccuracy)}%` : ""}

Generate a short, encouraging message (2-3 sentences) in a friendly, supportive tone. Include context about their progress. Suggest one specific actionable item. Return JSON:
{
  "message": "...",
  "actionItem": "...",
  "type": "motivation|reminder|support|celebration|improvement",
  "tone": "encouraging|celebratory|supportive|gentle"
}`;

    try {
      const aiResponse = await callClaude(prompt);
      const nudgeData = JSON.parse(aiResponse.content || '{}');
      
      return successResponse({
        id: `nudge-${Date.now()}`,
        message: nudgeData.message || "Keep up the great work! You're making progress every day.",
        actionItem: nudgeData.actionItem || "Complete today's 'THE ONE THING' to maintain your streak",
        type: nudgeData.type || "motivation",
        actionUrl: "/dashboard/student",
      });
    } catch (aiError) {
      // Fallback response
      const fallbackMessage = streak >= 7
        ? "You've been consistent this week! Your 7-day streak shows real dedication. Keep this momentum going."
        : "Every day you study is a step closer to your goal. Keep pushing forward!";
      
      return successResponse({
        id: `nudge-${Date.now()}`,
        message: fallbackMessage,
        actionItem: "Complete today's 'THE ONE THING' to maintain your streak",
        type: streak >= 7 ? "celebration" : "motivation",
        actionUrl: "/dashboard/student",
      });
    }
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/mentor/nudge",
      method: "POST",
    });
  }
}

