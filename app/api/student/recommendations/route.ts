import { NextRequest } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/ai/models/openai";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

let pineconeClient: Pinecone | null = null;

function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    if (!process.env.PINECONE_API_KEY) {
      throw new Error("PINECONE_API_KEY not configured");
    }
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
  }
  return pineconeClient;
}

const INDEX_NAME = process.env.PINECONE_INDEX_NAME || "mentark-memory";
const QUESTIONS_NAMESPACE = "questions";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Get student
    const { data: student } = await supabase
      .from("students")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (!student) {
      return errorResponse("Student not found", 404);
    }

    // Get student's weak areas from test attempts
    const { data: testAttempts } = await supabase
      .from("test_attempt_answers")
      .select(`
        question_id,
        is_correct,
        test_questions!inner (
          subject,
          topic,
          difficulty
        )
      `)
      .eq("is_correct", false)
      .limit(100);

    // Analyze weak concepts
    const weakConcepts = new Map<string, number>();
    (testAttempts || []).forEach((attempt: any) => {
      const topic = attempt.test_questions?.topic || "general";
      weakConcepts.set(topic, (weakConcepts.get(topic) || 0) + 1);
    });

    // Get top 3 weak concepts
    const topWeakConcepts = Array.from(weakConcepts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic);

    if (topWeakConcepts.length === 0) {
      // If no weak areas, recommend based on syllabus progress
      return successResponse({
        recommendations: [],
        message: "No weak areas detected. Keep up the great work!",
      });
    }

    // Generate query from weak concepts
    const queryText = `Practice questions on ${topWeakConcepts.join(", ")} for improvement`;

    // Generate embedding
    const queryEmbedding = await generateEmbedding(queryText);

    // Search Pinecone for recommended questions
    const client = getPineconeClient();
    const index = client.index(INDEX_NAME);

    // Get questions for each weak concept, starting with easier difficulty
    const allRecommendations: any[] = [];

    for (const concept of topWeakConcepts) {
      const results = await index.namespace(QUESTIONS_NAMESPACE).query({
        vector: queryEmbedding,
        topK: 5,
        includeMetadata: true,
        filter: {
          topic: { $eq: concept },
          difficulty: { $in: ["easy", "medium"] }, // Start with easier questions
        },
      });

      (results.matches || []).forEach((match) => {
        allRecommendations.push({
          id: match.id,
          relevance_score: match.score || 0,
          question_text: match.metadata?.question_text as string,
          subject: match.metadata?.subject as string,
          exam_type: match.metadata?.exam_type as string,
          difficulty: match.metadata?.difficulty as string,
          topic: match.metadata?.topic as string,
          recommended_reason: `Based on your performance in ${concept}`,
        });
      });
    }

    // Sort by relevance and remove duplicates
    const uniqueRecommendations = Array.from(
      new Map(allRecommendations.map((q) => [q.id, q])).values()
    )
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, 15); // Top 15 recommendations

    return successResponse({
      recommendations: uniqueRecommendations,
      weak_concepts: topWeakConcepts,
      total: uniqueRecommendations.length,
    });
  } catch (error: any) {
    console.error("Recommendations error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

