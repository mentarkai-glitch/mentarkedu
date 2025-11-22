import { NextRequest } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { generateEmbedding } from "@/lib/ai/models/openai";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";
import { z } from "zod";

const searchSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(50).default(10),
  filters: z
    .object({
      subject: z.string().optional(),
      exam_type: z.string().optional(),
      difficulty: z.string().optional(),
    })
    .optional(),
});

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = searchSchema.parse(body);

    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(validated.query);

    // Initialize Pinecone
    const client = getPineconeClient();
    const index = client.index(INDEX_NAME);

    // Build filter if provided
    const filter: any = {};
    if (validated.filters?.subject) {
      filter.subject = { $eq: validated.filters.subject };
    }
    if (validated.filters?.exam_type) {
      filter.exam_type = { $eq: validated.filters.exam_type };
    }
    if (validated.filters?.difficulty) {
      filter.difficulty = { $eq: validated.filters.difficulty };
    }

    // Search Pinecone
    const results = await index.namespace(QUESTIONS_NAMESPACE).query({
      vector: queryEmbedding,
      topK: validated.limit,
      includeMetadata: true,
      ...(Object.keys(filter).length > 0 && { filter }),
    });

    // Transform results
    const questions = (results.matches || []).map((match) => ({
      id: match.id,
      score: match.score || 0,
      question_text: match.metadata?.question_text as string,
      subject: match.metadata?.subject as string,
      exam_type: match.metadata?.exam_type as string,
      year: match.metadata?.year as number,
      difficulty: match.metadata?.difficulty as string,
      options: match.metadata?.options as any,
      correct_answer: match.metadata?.correct_answer as string,
      explanation: match.metadata?.explanation as string,
      topic: match.metadata?.topic as string,
    }));

    return successResponse({
      query: validated.query,
      results: questions,
      total: questions.length,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return errorResponse(
        `Validation error: ${error.issues.map((e) => e.message).join(", ")}`,
        400
      );
    }
    console.error("Semantic search error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

