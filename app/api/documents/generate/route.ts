import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

const DOCGEN_API_URL = process.env.DOCGEN_API_URL || "http://localhost:8000";

/**
 * Universal document generation endpoint
 * Wraps the mentark-docgen API
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { doc_type, format, data, template_id, branding, options } = body;

    if (!doc_type || !format) {
      return errorResponse("doc_type and format are required", 400);
    }

    // Call mentark-docgen API
    const response = await fetch(`${DOCGEN_API_URL}/generate/document`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        doc_type,
        format,
        template_id: template_id || null,
        data: data || {},
        branding: branding || {},
        options: options || { compress: true, s3_upload: false },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Document generation failed" }));
      return errorResponse(error.detail || "Document generation failed", response.status);
    }

    const result = await response.json();

    // Get student_id
    const { data: student } = await supabase
      .from("students")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (student) {
      // Save document metadata to database
      await supabase.from("student_documents").insert({
        student_id: user.id,
        document_type: doc_type,
        docgen_file_id: result.id,
        template_used: template_id || "default",
        metadata: {
          format,
          branding,
          source: "api",
        },
      });
    }

    return successResponse(result);
  } catch (error) {
    return handleApiError(error, "Failed to generate document");
  }
}

