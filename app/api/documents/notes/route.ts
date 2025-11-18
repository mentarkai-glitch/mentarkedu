import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

const DOCGEN_API_URL = process.env.DOCGEN_API_URL || "http://localhost:8000";

/**
 * Generate study notes endpoint
 * Creates comprehensive study notes from topics, search results, or chat conversations
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { topic, content, source, source_id, format, template, depth } = body;

    if (!topic && !content) {
      return errorResponse("Topic or content is required", 400);
    }

    let notesData: any;

    // Build notes data based on source
    if (source === "search" && topic) {
      // Generate notes from topic (would need to fetch search results or use AI)
      notesData = {
        topic,
        content: content || `Study notes for ${topic}`,
        sections: [], // Will be populated by AI or from search
        key_points: [],
        examples: [],
      };
    } else if (source === "chat" && source_id) {
      // Generate notes from chat conversation
      // Would need to fetch chat history and summarize
      notesData = {
        topic: topic || "Chat Summary",
        content: content || "Notes from AI mentor conversation",
        sections: [],
      };
    } else if (content) {
      // Use provided content
      notesData = {
        topic: topic || "Study Notes",
        content,
        sections: [],
      };
    } else {
      return errorResponse("Invalid source or content", 400);
    }

    // Call mentark-docgen (using resume template structure for now, will need custom template)
    const response = await fetch(`${DOCGEN_API_URL}/generate/document`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        doc_type: "resume", // Will need custom "study_notes" type
        format: format || "pdf",
        template_id: template || "default",
        data: {
          profile: {
            name: "Study Notes",
            summary: notesData.content,
          },
        },
        options: {
          compress: true,
          s3_upload: false,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Notes generation failed" }));
      return errorResponse(error.detail || "Notes generation failed", response.status);
    }

    const result = await response.json();

    // Save notes metadata
    await supabase.from("student_documents").insert({
      student_id: user.id,
      document_type: "study_notes",
      docgen_file_id: result.id,
      template_used: template || "default",
      format: format || "pdf",
      metadata: {
        source,
        source_id,
        topic,
        depth: depth || "standard",
      },
    });

    return successResponse(result);
  } catch (error) {
    return handleApiError(error, "Failed to generate study notes");
  }
}

