import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { aiOrchestrator } from "@/lib/ai/orchestrator";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";
import type { AIContext } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { student_id } = body;

    if (!student_id) {
      return errorResponse("student_id is required", 400);
    }

    // Get teacher info
    const { data: teacher } = await supabase
      .from("teachers")
      .select("assigned_batches")
      .eq("user_id", user.id)
      .single();

    if (!teacher) {
      return errorResponse("Teacher not found", 404);
    }

    // Fetch comprehensive student data
    const { data: student } = await supabase
      .from("students")
      .select(`
        user_id,
        grade,
        batch,
        risk_score,
        interests,
        goals,
        users (
          id,
          email,
          profile_data
        )
      `)
      .eq("user_id", student_id)
      .single();

    if (!student) {
      return errorResponse("Student not found", 404);
    }

    // Get recent ARKs
    const { data: arks } = await supabase
      .from("arks")
      .select("*")
      .eq("student_id", student_id)
      .order("created_at", { ascending: false })
      .limit(10);

    // Get check-ins (last 30 days)
    const { data: checkIns } = await supabase
      .from("daily_checkins")
      .select("*")
      .eq("student_id", student_id)
      .order("date", { ascending: false })
      .limit(30);

    // Get recent chat activity
    const { data: chats } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("user_id", student_id)
      .order("created_at", { ascending: false })
      .limit(5);

    // Build AI prompt for insights
    const prompt = `As a student support specialist, analyze this student's performance and generate actionable insights for their teacher.

**Student Profile:**
- Name: ${(student.users as any)?.profile_data?.first_name || "Unknown"}
- Grade: ${student.grade}, Batch: ${student.batch}
- Risk Score: ${student.risk_score}/100 (${student.risk_score >= 70 ? "High" : student.risk_score >= 40 ? "Medium" : "Low"} Risk)
- Interests: ${student.interests?.join(", ") || "Not specified"}
- Goals: ${student.goals?.join(", ") || "Not specified"}

**Activity Summary:**
- Active ARKs: ${arks?.filter((a: any) => a.status === "active").length || 0}
- Completed ARKs: ${arks?.filter((a: any) => a.status === "completed").length || 0}
- Check-ins (30 days): ${checkIns?.length || 0}
- Chat sessions: ${chats?.length || 0}
- Avg ARK Progress: ${
  arks && arks.length > 0
    ? Math.round(arks.reduce((acc: number, a: any) => acc + a.progress, 0) / arks.length)
    : 0
}%

**Recent Activity:**
${checkIns?.slice(0, 5).map((ci: any) => `- ${new Date(ci.date).toLocaleDateString()}: Energy ${ci.energy}/5, Focus ${ci.focus}/5`).join("\n") || "No recent check-ins"}

**Task:**
Generate 3-5 actionable insights and recommendations for the teacher, focusing on:
1. Student's strengths and achievements
2. Areas needing attention or support
3. Specific recommended actions for this week
4. Risk factors (if any)
5. Celebrating wins (if student is doing well)

Return ONLY a JSON array:
[
  {
    "type": "strength|concern|recommendation|celebration|alert",
    "title": "Brief title",
    "content": "Detailed insight",
    "priority": "high|medium|low",
    "action": "Specific recommended action"
  },
  ...
]`;

    try {
      const aiContext: AIContext = {
        task: "insights",
        user_id: user.id,
        session_id: `teacher_insights_${Date.now()}`,
        metadata: {
          system_prompt: "You are an educational insights specialist helping teachers support their students effectively.",
          user_tier: "premium",
        },
      };

      const response = await aiOrchestrator(aiContext, prompt);

      // Parse AI response
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      let insights = [];
      if (jsonMatch) {
        try {
          insights = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error("Failed to parse AI insights:", e);
        }
      }

      // Fallback insights if AI fails
      if (insights.length === 0) {
        const arksArray = arks || [];
        const checkInsArray = checkIns || [];
        insights = generateFallbackInsights(student, arksArray, checkInsArray);
      }

      return successResponse({
        student_id,
        insights,
        generated_at: new Date().toISOString(),
        context: {
          total_arks: arks?.length || 0,
          total_checkins: checkIns?.length || 0,
          risk_score: student.risk_score,
        },
      });
    } catch (error: any) {
      console.error("AI insights generation error:", error);
      
      // Return fallback insights
      const arksArray = arks || [];
      const checkInsArray = checkIns || [];
      const fallbackInsights = generateFallbackInsights(student, arksArray, checkInsArray);
      
      return successResponse({
        student_id,
        insights: fallbackInsights,
        generated_at: new Date().toISOString(),
        note: "Generated fallback insights due to AI service issue",
      });
    }
  } catch (error: any) {
    console.error("Insights generation error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

function generateFallbackInsights(student: any, arks: any[], checkIns: any[]): any[] {
  const insights = [];

  // Check-ins insight
  if (checkIns.length >= 20) {
    insights.push({
      type: "strength",
      title: "Excellent Engagement",
      content: "Student has maintained consistent check-ins, showing strong engagement with the platform.",
      priority: "low",
      action: "Continue encouraging this behavior and celebrate the consistency.",
    });
  } else if (checkIns.length < 10) {
    insights.push({
      type: "concern",
      title: "Low Check-in Frequency",
      content: "Student has fewer than 10 check-ins in the last 30 days. This affects our ability to track well-being.",
      priority: "high",
      action: "Remind student about the importance of daily check-ins and set up a check-in reminder.",
    });
  }

  // ARK progress insight
  const avgProgress = arks && arks.length > 0
    ? arks.reduce((acc: number, a: any) => acc + a.progress, 0) / arks.length
    : 0;

  if (avgProgress >= 75 && arks.length > 0) {
    insights.push({
      type: "celebration",
      title: "Great ARK Progress",
      content: `Student shows strong progress with an average of ${Math.round(avgProgress)}% completion across ARKs.`,
      priority: "low",
      action: "Acknowledge this achievement and consider suggesting more challenging ARKs.",
    });
  } else if (avgProgress < 30 && arks.length > 0) {
    insights.push({
      type: "concern",
      title: "Low ARK Completion",
      content: `Average ARK progress is ${Math.round(avgProgress)}%. Student may be struggling or needs more support.`,
      priority: "high",
      action: "Schedule a one-on-one to identify blockers and provide additional guidance.",
    });
  }

  // Risk-based insights
  if (student.risk_score >= 70) {
    insights.push({
      type: "alert",
      title: "High Risk Detected",
      content: "Student's risk score indicates they may need immediate attention or intervention.",
      priority: "high",
      action: "Contact student and consider involving parents or counselors.",
    });
  }

  // First ARK insight
  if (arks && arks.length === 0) {
    insights.push({
      type: "recommendation",
      title: "Get Started with ARKs",
      content: "Student hasn't started any ARKs yet. Help them select their first learning path.",
      priority: "medium",
      action: "Recommend an ARK based on their interests and goals.",
    });
  }

  return insights;
}

