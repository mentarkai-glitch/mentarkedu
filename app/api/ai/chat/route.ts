import { NextRequest } from "next/server";
import { aiOrchestrator } from "@/lib/ai/orchestrator";
import { getMentorSystemPrompt } from "@/lib/ai/prompts/mentor-personas";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import { createClient } from "@/lib/supabase/server";
import { storeMemory, buildContextFromMemories } from "@/lib/ai/memory";
import type { AIContext, MentorPersona, StudentProfile } from "@/lib/types";

const BURNOUT_KEYWORDS = [
  "burnt",
  "burned",
  "burning out",
  "exhausted",
  "overwhelmed",
  "drained",
  "can't cope",
  "too much",
  "stressed",
  "stressful",
  "pressure",
];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { message, session_id, user_id, persona } = body;

    if (!message) {
      return errorResponse("Message is required", 400);
    }

    let studentProfile: StudentProfile | undefined;
    let userTier: "free" | "premium" | "enterprise" = "free";
    
    let studentLocation: string | undefined;

    if (user_id) {
      try {
        const { data: student, error } = await supabase
          .from("students")
          .select("onboarding_profile")
          .eq("user_id", user_id)
          .single();

        if (!error && student?.onboarding_profile) {
          studentProfile = student.onboarding_profile as StudentProfile;
          const profileLocation = (studentProfile as any)?.location || (studentProfile as any)?.city;
          if (typeof profileLocation === "string" && profileLocation.trim().length > 0) {
            studentLocation = profileLocation.trim();
          }
        }
        
        const { data: userData } = await supabase
          .from("users")
          .select("institute_id")
          .eq("id", user_id)
          .single();
        
        if (userData?.institute_id) {
          const { data: institute } = await supabase
            .from("institutes")
            .select("plan_type")
            .eq("id", userData.institute_id)
            .single();
          
          if (institute?.plan_type === "quantum") {
            userTier = "enterprise";
          } else if (institute?.plan_type === "neuro") {
            userTier = "premium";
          }
        }
      } catch (error) {
        console.warn("Failed to fetch student profile or tier:", error);
      }
    }

    const systemPrompt = getMentorSystemPrompt(
      (persona as MentorPersona) || "friendly",
      undefined,
      studentProfile
    );

    const context: AIContext = {
      task: "mentor_chat",
      user_id,
      session_id,
      metadata: {
        persona: persona || "friendly",
        system_prompt: systemPrompt,
        user_tier: userTier,
        complexity: 5,
        location: studentLocation,
      },
    };

    let memoryContext = "";
    if (user_id && user_id !== "demo-session") {
      try {
        memoryContext = await buildContextFromMemories(user_id, message, 1000);
      } catch (error) {
        console.warn("Failed to retrieve memories:", error);
      }
    }

    const locationPreface = studentLocation
      ? `Student location/context: ${studentLocation}. Respond with guidance grounded in this region of India.\n\n`
      : "";

    const enhancedPrompt = memoryContext 
      ? `${locationPreface}${message}\n\nRelevant context from previous conversations:\n${memoryContext}`
      : `${locationPreface}${message}`;

    const aiResponse = await aiOrchestrator(context, enhancedPrompt);

    if (user_id && user_id !== "demo-session") {
      Promise.all([
        storeMemory({
          id: crypto.randomUUID(),
          student_id: user_id,
          content: message,
          metadata: {
            type: "conversation",
            timestamp: new Date().toISOString(),
            session_id,
          },
        }).catch((error) => console.warn("Failed to store user message:", error)),
        storeMemory({
          id: crypto.randomUUID(),
          student_id: user_id,
          content: aiResponse.content,
          metadata: {
            type: "conversation",
            timestamp: new Date().toISOString(),
            session_id,
            emotion_score: aiResponse.emotion_score,
          },
        }).catch((error) => console.warn("Failed to store AI response:", error)),
        queueSentimentExample(supabase, user_id, message).catch((error) =>
          console.warn("Failed to queue sentiment example:", error)
        ),
        queueBurnoutSignal(supabase, user_id, message).catch((error) =>
          console.warn("Failed to queue burnout signal:", error)
        ),
      ]);
    }

    return successResponse({
      response: aiResponse.content,
      model: aiResponse.model,
      tokens_used: aiResponse.tokens_used,
      memory_context: memoryContext ? "included" : "none",
      persona: persona || "friendly",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return errorResponse(
      "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
      500
    );
  }
}

async function queueSentimentExample(supabase: any, studentId: string, text: string) {
  if (!text || text.trim().length < 16) return;

  await supabase
    .from("ml_training_data")
    .insert({
      student_id: studentId,
      label_type: "sentiment",
      label_value: {
        text: text.slice(0, 500),
        label: null,
        source: "chat",
        collected_at: new Date().toISOString(),
      },
      label_confidence: 0,
      labeled_by: "system",
    });
}

async function queueBurnoutSignal(supabase: any, studentId: string, text: string) {
  if (!text) return;
  const lowercase = text.toLowerCase();
  const matched = BURNOUT_KEYWORDS.some((keyword) => lowercase.includes(keyword));
  if (!matched) return;

  const recentWindow = new Date();
  recentWindow.setDate(recentWindow.getDate() - 7);

  const { data: existing } = await supabase
    .from("student_outcomes")
    .select("id")
    .eq("student_id", studentId)
    .eq("outcome_type", "burnout")
    .eq("outcome_value", "chat_signal")
    .gte("created_at", recentWindow.toISOString())
    .limit(1)
    .maybeSingle();

  if (!existing) {
    await supabase.from("student_outcomes").insert({
      student_id: studentId,
      outcome_type: "burnout",
      outcome_value: "chat_signal",
      notes: text.slice(0, 600),
      confirmed: false,
    });
  }
}