import { Pinecone } from "@pinecone-database/pinecone";
import { generateEmbedding } from "./models/openai";

let pineconeClient: Pinecone | null = null;

/**
 * Initialize Pinecone client
 */
function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || "",
    });
  }
  return pineconeClient;
}

const INDEX_NAME = "mentark-memory";
const NAMESPACE_PREFIX = "student-";

export interface MemoryEntry {
  id: string;
  student_id: string;
  content: string;
  metadata: {
    type: "conversation" | "emotion" | "ark" | "achievement";
    timestamp: string;
    session_id?: string;
    emotion_score?: number;
    tags?: string[];
  };
}

/**
 * Store a memory in Pinecone
 */
export async function storeMemory(entry: MemoryEntry): Promise<void> {
  try {
    const client = getPineconeClient();
    const index = client.index(INDEX_NAME);

    // Generate embedding for the content
    const embedding = await generateEmbedding(entry.content);

    // Store in Pinecone
    await index.namespace(`${NAMESPACE_PREFIX}${entry.student_id}`).upsert([
      {
        id: entry.id,
        values: embedding,
        metadata: {
          content: entry.content,
          student_id: entry.student_id,
          ...entry.metadata,
        },
      },
    ]);

    console.log(`✓ Memory stored for student ${entry.student_id}`);
  } catch (error) {
    console.error("Error storing memory in Pinecone:", error);
    // Don't throw - memory storage failures shouldn't break the app
  }
}

/**
 * Retrieve relevant memories based on a query
 */
export async function retrieveMemories(
  student_id: string,
  query: string,
  options: {
    topK?: number;
    type?: MemoryEntry["metadata"]["type"];
  } = {}
): Promise<MemoryEntry[]> {
  try {
    const client = getPineconeClient();
    const index = client.index(INDEX_NAME);

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Search Pinecone
    const results = await index.namespace(`${NAMESPACE_PREFIX}${student_id}`).query({
      vector: queryEmbedding,
      topK: options.topK || 5,
      includeMetadata: true,
      ...(options.type && {
        filter: {
          type: { $eq: options.type },
        },
      }),
    });

    // Transform results
    return (
      results.matches?.map((match) => ({
        id: match.id,
        student_id,
        content: (match.metadata?.content as string) || "",
        metadata: {
          type: match.metadata?.type as MemoryEntry["metadata"]["type"],
          timestamp: match.metadata?.timestamp as string,
          session_id: match.metadata?.session_id as string | undefined,
          emotion_score: match.metadata?.emotion_score as number | undefined,
          tags: match.metadata?.tags as string[] | undefined,
        },
      })) || []
    );
  } catch (error) {
    console.error("Error retrieving memories from Pinecone:", error);
    return [];
  }
}

/**
 * Get recent memories for context (without semantic search)
 */
export async function getRecentMemories(
  student_id: string,
  limit: number = 10,
  type?: MemoryEntry["metadata"]["type"]
): Promise<MemoryEntry[]> {
  try {
    const client = getPineconeClient();
    const index = client.index(INDEX_NAME);

    // Fetch recent vectors (Pinecone doesn't have a built-in "get recent" so we use a dummy query)
    const dummyEmbedding = await generateEmbedding("recent context");
    const results = await index.namespace(`${NAMESPACE_PREFIX}${student_id}`).query({
      vector: dummyEmbedding,
      topK: limit,
      includeMetadata: true,
      ...(type && {
        filter: {
          type: { $eq: type },
        },
      }),
    });

    return (
      results.matches?.map((match) => ({
        id: match.id,
        student_id,
        content: (match.metadata?.content as string) || "",
        metadata: {
          type: match.metadata?.type as MemoryEntry["metadata"]["type"],
          timestamp: match.metadata?.timestamp as string,
          session_id: match.metadata?.session_id as string | undefined,
          emotion_score: match.metadata?.emotion_score as number | undefined,
          tags: match.metadata?.tags as string[] | undefined,
        },
      })) || []
    );
  } catch (error) {
    console.error("Error getting recent memories:", error);
    return [];
  }
}

/**
 * Delete all memories for a student (e.g., when they request data deletion)
 */
export async function deleteStudentMemories(student_id: string): Promise<void> {
  try {
    const client = getPineconeClient();
    const index = client.index(INDEX_NAME);

    await index.namespace(`${NAMESPACE_PREFIX}${student_id}`).deleteAll();

    console.log(`✓ All memories deleted for student ${student_id}`);
  } catch (error) {
    console.error("Error deleting student memories:", error);
    throw error;
  }
}

/**
 * Build context summary from memories for AI
 */
export async function buildContextFromMemories(
  student_id: string,
  currentQuery: string,
  maxTokens: number = 1000
): Promise<string> {
  // Retrieve relevant memories
  const relevantMemories = await retrieveMemories(student_id, currentQuery, {
    topK: 5,
  });

  if (relevantMemories.length === 0) {
    return "";
  }

  // Build context string
  let context = "**Relevant Previous Context:**\n\n";

  for (const memory of relevantMemories) {
    const memoryText = `[${memory.metadata.type}] ${memory.content}\n`;

    // Rough token estimation check
    if ((context + memoryText).length / 4 > maxTokens) {
      break;
    }

    context += memoryText;
  }

  return context;
}

