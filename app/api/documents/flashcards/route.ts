import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

const DOCGEN_API_URL = process.env.DOCGEN_API_URL || "http://localhost:8000";

/**
 * Generate flashcards endpoint
 * Creates flashcards from practice questions, notes, or custom content
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { source, source_id, questions, format, template } = body;

    let flashcardData: any;

    // Build flashcard data based on source
    if (source === "practice_questions" && source_id) {
      // Fetch practice questions
      const { data: practiceSession } = await supabase
        .from("practice_sessions")
        .select("*, practice_attempts(*)")
        .eq("id", source_id)
        .eq("student_id", user.id)
        .single();

      if (practiceSession) {
        flashcardData = {
          flashcards: (practiceSession.practice_attempts || []).map((attempt: any) => ({
            front: attempt.question_text || attempt.question,
            back: attempt.correct_answer || attempt.answer,
            topic: attempt.topic,
            difficulty: attempt.difficulty,
          })),
        };
      }
    } else if (questions && Array.isArray(questions)) {
      // Use provided questions
      flashcardData = {
        flashcards: questions.map((q: any) => ({
          front: q.question || q.front,
          back: q.answer || q.back,
          topic: q.topic,
          difficulty: q.difficulty,
        })),
      };
    } else {
      return errorResponse("Invalid source or questions data", 400);
    }

    // For XLSX format, use summary_sheet document type
    // For PDF format, use custom template
    const docType = format === "xlsx" ? "summary_sheet" : "resume"; // Will need custom template
    const templateId = format === "xlsx" ? "flashcards" : template || "default";

    const response = await fetch(`${DOCGEN_API_URL}/generate/document`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        doc_type: docType,
        format: format || "pdf",
        template_id: templateId,
        data: flashcardData,
        options: {
          compress: false, // Flashcards don't need compression
          s3_upload: false,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Flashcard generation failed" }));
      return errorResponse(error.detail || "Flashcard generation failed", response.status);
    }

    const result = await response.json();

    // Save flashcard metadata
    await supabase.from("student_documents").insert({
      student_id: user.id,
      document_type: "flashcards",
      docgen_file_id: result.id,
      template_used: templateId,
      format: format || "pdf",
      metadata: {
        source,
        source_id,
        flashcard_count: flashcardData.flashcards.length,
      },
    });

    return successResponse(result);
  } catch (error) {
    return handleApiError(error, "Failed to generate flashcards");
  }
}

