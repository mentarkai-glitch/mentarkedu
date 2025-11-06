import { NextRequest } from "next/server";
import { aiOrchestrator } from "@/lib/ai/orchestrator";
import { getMentorSystemPrompt } from "@/lib/ai/prompts/mentor-personas";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import { createClient } from "@/lib/supabase/server";
import { storeMemory, retrieveMemories, buildContextFromMemories } from "@/lib/ai/memory";
import type { AIContext, MentorPersona, StudentProfile } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, session_id, user_id, persona } = body;

    if (!message) {
      return errorResponse("Message is required", 400);
    }

    // Get student profile for personalized mentoring
    let studentProfile: StudentProfile | undefined;
    if (user_id) {
      try {
        const supabase = await createClient();
        const { data: student, error } = await supabase
          .from('students')
          .select('onboarding_profile')
          .eq('user_id', user_id)
          .single();

        if (!error && student?.onboarding_profile) {
          studentProfile = student.onboarding_profile as StudentProfile;
        }
      } catch (error) {
        console.warn('Failed to fetch student profile:', error);
        // Continue without profile - don't fail the request
      }
    }

    // Generate personalized system prompt
    const systemPrompt = getMentorSystemPrompt(
      (persona as MentorPersona) || "friendly",
      undefined,
      studentProfile
    );

    // Build AI context
    const context: AIContext = {
      task: "mentor_chat",
      user_id,
      session_id,
      metadata: {
        persona: persona || "friendly",
        system_prompt: systemPrompt,
        user_tier: studentProfile?.tier || 'free',
        complexity: 5, // Default complexity
      },
    };

    // Retrieve relevant memories for context if user_id is provided
    let memoryContext = "";
    if (user_id && user_id !== "demo-session") {
      try {
        memoryContext = await buildContextFromMemories(user_id, message, 1000);
      } catch (error) {
        console.warn('Failed to retrieve memories:', error);
        // Continue without memory context
      }
    }

    // Enhance prompt with memory context
    const enhancedPrompt = memoryContext 
      ? `${message}\n\nRelevant context from previous conversations:\n${memoryContext}`
      : message;

    // Get AI response with personalized context and memory
    const aiResponse = await aiOrchestrator(context, enhancedPrompt);

    // Store conversation in memory if user_id is provided (async, don't wait)
    if (user_id && user_id !== "demo-session") {
      // Don't await these - run them in background
      Promise.all([
        // Store user message
        storeMemory({
          id: crypto.randomUUID(),
          student_id: user_id,
          content: message,
          metadata: {
            type: "conversation",
            timestamp: new Date().toISOString(),
            session_id,
          },
        }).catch(error => console.warn('Failed to store user message:', error)),

        // Store AI response
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
        }).catch(error => console.warn('Failed to store AI response:', error))
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
    console.error('Chat API Error:', error);
    return errorResponse(
      "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
      500
    );
  }
}