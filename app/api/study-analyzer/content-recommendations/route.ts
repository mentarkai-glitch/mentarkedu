import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import { aiOrchestrator } from "@/lib/ai/orchestrator";
import type { AIContext } from "@/lib/types";
import { safeParseJSON } from "@/lib/utils/json-repair";

async function requireStudentId(supabase: any): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: student } = await supabase
    .from("students")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  return student?.user_id ?? null;
}

/**
 * GET /api/study-analyzer/content-recommendations
 * Get AI-powered content recommendations (videos, articles) based on student performance and topics
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const studentId = await requireStudentId(supabase);

    if (!studentId) {
      return errorResponse("Student profile not found", 404);
    }

    const { searchParams } = new URL(request.url);
    const topic = searchParams.get("topic");
    const subject = searchParams.get("subject");
    const difficulty = searchParams.get("difficulty") || "medium";
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Get student profile for context
    const { data: student } = await supabase
      .from("students")
      .select("onboarding_profile, grade, interests, goals")
      .eq("user_id", studentId)
      .single();

    const studentProfile = student?.onboarding_profile as any;

    // Get recent practice performance for the topic/subject
    let performanceData = null;
    if (topic || subject) {
      const { data: attempts } = await supabase
        .from("practice_attempts")
        .select(`
          *,
          practice_questions (
            topic,
            subject,
            difficulty
          )
        `)
        .eq("student_id", studentId)
        .gte("attempted_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order("attempted_at", { ascending: false })
        .limit(50);

      if (attempts && attempts.length > 0) {
        const filtered = attempts.filter((a: any) => {
          if (topic && a.practice_questions?.topic !== topic) return false;
          if (subject && a.practice_questions?.subject !== subject) return false;
          return true;
        });

        const total = filtered.length;
        const correct = filtered.filter((a: any) => a.is_correct).length;
        const accuracy = total > 0 ? (correct / total) * 100 : 0;

        performanceData = {
          totalAttempts: total,
          accuracy: Math.round(accuracy * 100) / 100,
          weakAreas: filtered
            .filter((a: any) => !a.is_correct)
            .map((a: any) => a.practice_questions?.topic || topic)
            .filter(Boolean)
            .slice(0, 3),
        };
      }
    }

    // Build AI prompt for content recommendations
    const context = [];
    if (topic) context.push(`Topic: ${topic}`);
    if (subject) context.push(`Subject: ${subject}`);
    if (student?.grade) context.push(`Grade Level: ${student.grade}`);
    if (performanceData) {
      context.push(`Performance: ${performanceData.accuracy}% accuracy, ${performanceData.totalAttempts} attempts`);
      if (performanceData.weakAreas.length > 0) {
        context.push(`Weak Areas: ${performanceData.weakAreas.join(", ")}`);
      }
    }
    if (difficulty) context.push(`Difficulty Level: ${difficulty}`);

    const prompt = `Generate ${limit} high-quality educational content recommendations for a student.

Context:
${context.join("\n")}

Student Profile:
- Grade: ${student?.grade || "Not specified"}
- Interests: ${(student?.interests || []).join(", ") || "General"}
- Goals: ${(student?.goals || []).join(", ") || "General"}

Requirements:
- Mix of videos (YouTube, Khan Academy, educational channels) and articles/blogs
- Content should be relevant to the topic/subject and difficulty level
- Include diverse sources and formats
- Prioritize content that addresses weak areas if performance data is provided
- Content should be appropriate for ${student?.grade || "high school"} level

For each recommendation, provide:
1. title: Content title
2. type: "video" or "article"
3. url: Direct URL (for videos: YouTube URL format, for articles: article URL)
4. source: Source name (e.g., "Khan Academy", "Coursera", "Medium")
5. description: Brief description (1-2 sentences)
6. duration: For videos in minutes, for articles in "X min read"
7. difficulty: "easy", "medium", or "hard"
8. tags: Array of relevant tags
9. thumbnailUrl: For videos, YouTube thumbnail URL pattern (optional)
10. language: Language of content (default: "English")

Return ONLY a valid JSON array with this structure:
[
  {
    "title": "Example Title",
    "type": "video",
    "url": "https://www.youtube.com/watch?v=...",
    "source": "Khan Academy",
    "description": "Clear explanation of...",
    "duration": "15 min",
    "difficulty": "medium",
    "tags": ["concept1", "concept2"],
    "thumbnailUrl": "https://img.youtube.com/vi/VIDEO_ID/hqdefault.jpg",
    "language": "English"
  }
]

Return ONLY the JSON array, no markdown formatting or additional text.`;

    // Use AI orchestrator to generate recommendations
    const aiContext: AIContext = {
      task: "content_recommendation",
      user_id: studentId,
      metadata: {
        topic,
        subject,
        difficulty,
        student_profile: studentProfile,
        performance: performanceData,
        grade: student?.grade,
      },
    };

    const aiResponse = await aiOrchestrator(aiContext, prompt);

    // Parse AI response
    let recommendations: any[] = [];

    try {
      // Try to extract JSON from response
      const jsonMatch = aiResponse.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        recommendations = safeParseJSON(jsonMatch[0]);
      } else {
        recommendations = safeParseJSON(aiResponse.content);
      }

      // Validate and clean recommendations
      if (!Array.isArray(recommendations)) {
        throw new Error("Invalid recommendations format");
      }

      recommendations = recommendations
        .map((rec) => ({
          id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: rec.title || "Untitled",
          type: rec.type || "article",
          url: rec.url || "",
          source: rec.source || "Unknown",
          description: rec.description || "",
          duration: rec.duration || "N/A",
          difficulty: rec.difficulty || difficulty,
          tags: Array.isArray(rec.tags) ? rec.tags : [],
          thumbnailUrl: rec.thumbnailUrl || null,
          language: rec.language || "English",
          createdAt: new Date().toISOString(),
        }))
        .filter((rec) => rec.url && rec.title)
        .slice(0, limit);

    } catch (parseError: any) {
      console.error("Failed to parse AI response:", parseError);
      // Return fallback recommendations
      recommendations = [];
    }

    // If no recommendations from AI, return empty array (frontend can handle this)
    return successResponse({
      recommendations,
      context: {
        topic,
        subject,
        difficulty,
        performance: performanceData,
      },
      generatedAt: new Date().toISOString(),
      modelUsed: aiResponse.model,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/study-analyzer/content-recommendations/bookmark
 * Bookmark a content recommendation for later viewing
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const studentId = await requireStudentId(supabase);

    if (!studentId) {
      return errorResponse("Student profile not found", 404);
    }

    const body = await request.json();
    const { recommendation } = body;

    if (!recommendation || !recommendation.url || !recommendation.title) {
      return errorResponse("Invalid recommendation data", 400);
    }

    // Store bookmark in student's metadata or a separate bookmarks table
    // For now, we'll store it in a JSONB field in students table
    // In production, you might want a separate bookmarks table

    const { data: student } = await supabase
      .from("students")
      .select("onboarding_profile")
      .eq("user_id", studentId)
      .single();

    const profile = (student?.onboarding_profile as any) || {};
    const bookmarks = profile.content_bookmarks || [];

    // Check if already bookmarked
    const exists = bookmarks.some((b: any) => b.url === recommendation.url);

    if (exists) {
      return errorResponse("Content already bookmarked", 400);
    }

    // Add bookmark
    const newBookmark = {
      ...recommendation,
      bookmarkedAt: new Date().toISOString(),
    };

    bookmarks.push(newBookmark);

    // Update profile
    const { error: updateError } = await supabase
      .from("students")
      .update({
        onboarding_profile: {
          ...profile,
          content_bookmarks: bookmarks,
        },
      })
      .eq("user_id", studentId);

    if (updateError) throw updateError;

    return successResponse({
      bookmarked: true,
      bookmark: newBookmark,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/study-analyzer/content-recommendations/bookmark
 * Remove a bookmark
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const studentId = await requireStudentId(supabase);

    if (!studentId) {
      return errorResponse("Student profile not found", 404);
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return errorResponse("URL is required", 400);
    }

    const { data: student } = await supabase
      .from("students")
      .select("onboarding_profile")
      .eq("user_id", studentId)
      .single();

    const profile = (student?.onboarding_profile as any) || {};
    const bookmarks = profile.content_bookmarks || [];

    // Remove bookmark
    const filtered = bookmarks.filter((b: any) => b.url !== url);

    // Update profile
    const { error: updateError } = await supabase
      .from("students")
      .update({
        onboarding_profile: {
          ...profile,
          content_bookmarks: filtered,
        },
      })
      .eq("user_id", studentId);

    if (updateError) throw updateError;

    return successResponse({
      removed: true,
    });
  } catch (error) {
    return handleApiError(error);
  }
}





