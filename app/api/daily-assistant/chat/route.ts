import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";
import { callClaude } from "@/lib/ai/models/claude";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Get student
    const { data: student } = await supabase
      .from("students")
      .select("user_id, goals, interests")
      .eq("user_id", user.id)
      .single();

    if (!student) {
      return errorResponse("Student not found", 404);
    }

    const body = await request.json();
    const { message, conversation_history = [] } = body;

    if (!message) {
      return errorResponse("Message is required", 400);
    }

    // Get student context
    const { data: checkins } = await supabase
      .from("daily_checkins")
      .select("mood, energy, stress, focus")
      .eq("student_id", student.user_id)
      .order("date", { ascending: false })
      .limit(7);

    const { data: activeArks } = await supabase
      .from("arks")
      .select("summary, progress, status")
      .eq("student_id", student.user_id)
      .eq("status", "active")
      .limit(3);

    // Build context-aware prompt
    const contextPrompt = `You are a supportive AI mentor for a student preparing for competitive exams (JEE/NEET) in India.

Student Context:
- Goals: ${student.goals?.join(", ") || "Not specified"}
- Interests: ${student.interests?.join(", ") || "Not specified"}
- Recent Mood/Energy: ${checkins && checkins.length > 0 ? `Avg mood ${Math.round(checkins.reduce((s: number, c: any) => s + (c.mood || 3), 0) / checkins.length)}/5, energy ${Math.round(checkins.reduce((s: number, c: any) => s + (c.energy || 3), 0) / checkins.length)}/5` : "No recent check-ins"}
- Active ARKs: ${activeArks?.map((a: any) => `${a.summary} (${Math.round(a.progress || 0)}%)`).join(", ") || "None"}

Conversation History:
${conversation_history.slice(-5).map((msg: any) => `${msg.role}: ${msg.content}`).join("\n")}

Student Message: ${message}

Respond in a friendly, supportive, and context-aware manner. Be encouraging but realistic. If they're struggling, offer specific study tips. Keep responses concise (2-4 sentences).`;

    try {
      const aiResponse = await callClaude(contextPrompt);
      
      return successResponse({
        response: aiResponse || "I'm here to help! How can I assist you today?",
        timestamp: new Date().toISOString(),
      });
    } catch (aiError) {
      console.error("AI chat error:", aiError);
      return errorResponse("Failed to generate response. Please try again.", 500);
    }
  } catch (error: any) {
    console.error("Daily assistant chat error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

