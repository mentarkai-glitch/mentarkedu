import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

const DOCGEN_API_URL = process.env.DOCGEN_API_URL || "http://localhost:8000";

/**
 * List all documents for the current student
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const documentType = searchParams.get("type");
    const format = searchParams.get("format");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("student_documents")
      .select("*")
      .eq("student_id", user.id)
      .eq("is_active", true)
      .order("generated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (documentType) {
      query = query.eq("document_type", documentType);
    }

    const { data: documents, error } = await query;

    if (error) {
      return errorResponse(error.message, 500);
    }

    // Filter by format if specified
    let filteredDocuments = documents || [];
    if (format) {
      filteredDocuments = filteredDocuments.filter(
        (doc: any) => doc.metadata?.format === format
      );
    }

    return successResponse({
      documents: filteredDocuments,
      total: filteredDocuments.length,
      limit,
      offset,
    });
  } catch (error) {
    return handleApiError(error, "Failed to list documents");
  }
}

