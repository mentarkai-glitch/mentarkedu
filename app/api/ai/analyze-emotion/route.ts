import { NextRequest } from "next/server";
import { analyzeEmotion } from "@/lib/ai/models/gemini";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, energy_level, focus_level } = body;

    if (!text) {
      return errorResponse("Text is required for emotion analysis", 400);
    }

    // Use Gemini to analyze emotion
    const emotionResult = await analyzeEmotion(text);

    // Combine with energy and focus data
    const enhancedResult = {
      sentiment_score: emotionResult.score,
      primary_emotion: emotionResult.emotion,
      emotion_category: categorizeEmotion(emotionResult.score),
      intensity: Math.abs(emotionResult.score),
      energy_level,
      focus_level,
      key_themes: extractThemes(text),
      concerns: identifyConcerns(text, emotionResult.score),
      positive_aspects: identifyPositives(text, emotionResult.score),
      recommended_response: generateRecommendation(emotionResult.score, energy_level, focus_level),
      risk_flags: identifyRiskFlags(emotionResult.score, energy_level, focus_level),
    };

    return successResponse(enhancedResult);
  } catch (error) {
    return handleApiError(error);
  }
}

function categorizeEmotion(score: number): string {
  if (score >= 0.6) return "motivation_high";
  if (score >= 0.2) return "balanced_healthy";
  if (score >= -0.2) return "neutral_stable";
  if (score >= -0.6) return "academic_stress";
  return "burnout_risk";
}

function extractThemes(text: string): string[] {
  const themes: string[] = [];
  const lowerText = text.toLowerCase();

  if (lowerText.includes("exam") || lowerText.includes("test")) themes.push("exams");
  if (lowerText.includes("study") || lowerText.includes("learn")) themes.push("learning");
  if (lowerText.includes("stress") || lowerText.includes("pressure")) themes.push("stress");
  if (lowerText.includes("tired") || lowerText.includes("exhaust")) themes.push("fatigue");
  if (lowerText.includes("happy") || lowerText.includes("excited")) themes.push("motivation");
  if (lowerText.includes("friend") || lowerText.includes("family")) themes.push("relationships");

  return themes.length > 0 ? themes : ["general wellbeing"];
}

function identifyConcerns(text: string, score: number): string[] {
  const concerns: string[] = [];
  const lowerText = text.toLowerCase();

  if (score < -0.4) concerns.push("Low emotional state");
  if (lowerText.includes("can't") || lowerText.includes("impossible")) {
    concerns.push("Feeling overwhelmed");
  }
  if (lowerText.includes("sleep") && lowerText.includes("not")) {
    concerns.push("Sleep issues");
  }
  if (lowerText.includes("alone") || lowerText.includes("lonely")) {
    concerns.push("Social isolation");
  }

  return concerns;
}

function identifyPositives(text: string, score: number): string[] {
  const positives: string[] = ["Taking time for self-reflection"];
  const lowerText = text.toLowerCase();

  if (score > 0.2) positives.push("Positive mindset");
  if (lowerText.includes("learn") || lowerText.includes("grow")) {
    positives.push("Growth mindset");
  }
  if (lowerText.includes("focus") || lowerText.includes("concentrat")) {
    positives.push("Maintaining focus");
  }
  if (lowerText.includes("plan") || lowerText.includes("goal")) {
    positives.push("Goal-oriented");
  }

  return positives;
}

function generateRecommendation(
  score: number,
  energy?: number,
  focus?: number
): string {
  if (score < -0.6) {
    return "It seems you're going through a tough time. Consider taking a break, talking to someone you trust, or reaching out to a counselor. Remember, it's okay to ask for help.";
  }

  if (score < -0.2) {
    return "You might be feeling stressed. Try some relaxation techniques like deep breathing, take short breaks between study sessions, and ensure you're getting enough sleep.";
  }

  if (energy && energy < 2) {
    return "Your energy levels seem low. Make sure you're eating well, staying hydrated, and getting enough rest. Even a short walk can help boost your energy!";
  }

  if (focus && focus < 2) {
    return "Having trouble focusing? Try the Pomodoro technique: 25 minutes of focused work followed by a 5-minute break. Also, eliminate distractions from your study space.";
  }

  if (score > 0.4) {
    return "Great to see you're feeling positive! Keep up this momentum. Channel this energy into your studies and goals. You're doing amazing!";
  }

  return "You're doing well! Keep maintaining a balanced approach to your studies. Remember to take breaks and celebrate small wins along the way.";
}

function identifyRiskFlags(score: number, energy?: number, focus?: number): string[] {
  const flags: string[] = [];

  if (score < -0.7) flags.push("severe_emotional_distress");
  if (score < -0.5 && energy && energy < 2) flags.push("burnout_risk");
  if (focus && focus < 2 && energy && energy < 2) flags.push("requires_attention");

  return flags;
}

