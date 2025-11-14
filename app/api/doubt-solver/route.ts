import { NextRequest } from "next/server";
import { doubtSolverService } from "@/lib/services/doubt-solver";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";
import { createClient } from "@/lib/supabase/server";
import { searchYouTubeVideos } from "@/lib/services/youtube";

/**
 * Doubt Solver Endpoint
 * POST /api/doubt-solver
 * 
 * Hybrid GPT + Wolfram Alpha for verified academic answers + YouTube video recommendations
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { question, subject, difficulty, category } = body;

    if (!question || typeof question !== "string") {
      return errorResponse("Question is required", 400);
    }

    // Solve the doubt
    const solution = await doubtSolverService.solve({
      question,
      userId: user?.id,
      subject,
      difficulty,
    });

    // Search for relevant YouTube videos based on question and category
    let videos: any[] = [];
    try {
      // Build search query based on question and category
      const searchQuery = buildYouTubeSearchQuery(question, category, subject);
      
      const youtubeResult = await searchYouTubeVideos(searchQuery, {
        maxResults: 5,
        order: "relevance",
        videoDuration: "medium", // Prefer medium-length educational videos (4-20 min)
      });

      if (youtubeResult.success && youtubeResult.videos.length > 0) {
        videos = youtubeResult.videos.map((vid) => ({
          id: vid.id,
          title: vid.title,
          description: vid.description,
          thumbnail_url: vid.thumbnail_url,
          channel_title: vid.channel_title,
          duration: vid.duration,
          view_count: vid.view_count,
          url: vid.url,
          embed_url: `https://www.youtube.com/embed/${vid.id}`,
        }));
      }
    } catch (videoError) {
      console.warn("YouTube video search failed (non-critical):", videoError);
      // Don't fail the entire request if video search fails
    }

    return successResponse({
      ...solution,
      videos, // Include videos in response
    });
  } catch (error: any) {
    console.error("Doubt solver error:", error);
    return errorResponse(error.message || "Failed to solve doubt", 500);
  }
}

/**
 * Build optimized YouTube search query from doubt question
 */
function buildYouTubeSearchQuery(question: string, category?: string, subject?: string): string {
  // Clean question - remove common question words for better search
  let query = question
    .toLowerCase()
    .replace(/^(explain|what is|how to|how does|why|solve|help me with)\s+/i, "")
    .replace(/\?/g, "")
    .trim();

  // Add category-specific terms for better search results
  if (category) {
    const categoryTerms: Record<string, string> = {
      math: "mathematics tutorial",
      science: "science explanation",
      programming: "programming tutorial",
      exam: "exam preparation",
    };
    if (categoryTerms[category]) {
      query = `${query} ${categoryTerms[category]}`;
    }
  }

  // Add subject if available
  if (subject) {
    query = `${subject} ${query}`;
  }

  // Add educational keywords
  query = `${query} tutorial explanation`;

  return query.trim();
}

