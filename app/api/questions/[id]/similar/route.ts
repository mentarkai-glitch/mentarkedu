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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const questionId = params.id;

    // Get question from Supabase
    const { data: question, error: questionError } = await supabase
      .from("pyqs")
      .select("*")
      .eq("id", questionId)
      .single();

    if (questionError || !question) {
      return errorResponse("Question not found", 404);
    }

    // Create text representation for embedding
    const questionText = `${question.question_text} ${question.options ? JSON.stringify(question.options) : ""} ${question.topic || ""}`;

    // Generate embedding
    const questionEmbedding = await generateEmbedding(questionText);

    // Search Pinecone for similar questions
    const client = getPineconeClient();
    const index = client.index(INDEX_NAME);

    const results = await index.namespace(QUESTIONS_NAMESPACE).query({
      vector: questionEmbedding,
      topK: 6, // Get 6 (5 similar + 1 might be the same question)
      includeMetadata: true,
      filter: {
        id: { $ne: questionId }, // Exclude the same question
      },
    });

    // Transform results
    const similarQuestions = (results.matches || [])
      .slice(0, 5) // Take top 5
      .map((match) => ({
        id: match.id,
        similarity_score: match.score || 0,
        question_text: match.metadata?.question_text as string,
        subject: match.metadata?.subject as string,
        exam_type: match.metadata?.exam_type as string,
        year: match.metadata?.year as number,
        difficulty: match.metadata?.difficulty as string,
        topic: match.metadata?.topic as string,
      }));

    return successResponse({
      question_id: questionId,
      similar_questions: similarQuestions,
      total: similarQuestions.length,
    });
  } catch (error: any) {
    console.error("Similar questions error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

