import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { errorResponse, handleApiError } from "@/lib/utils/api-helpers";

const DOCGEN_API_URL = process.env.DOCGEN_API_URL || "http://localhost:8000";

/**
 * Download document by ID
 * Proxies to mentark-docgen download endpoint
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = params;

    // Verify document belongs to user
    const { data: document, error: docError } = await supabase
      .from("student_documents")
      .select("docgen_file_id")
      .eq("id", id)
      .eq("student_id", user.id)
      .single();

    if (docError || !document) {
      return errorResponse("Document not found", 404);
    }

    // Proxy to mentark-docgen download endpoint
    const response = await fetch(
      `${DOCGEN_API_URL}/download/${document.docgen_file_id}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      return errorResponse("Failed to download document", response.status);
    }

    // Get file content
    const fileBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "application/pdf";

    // Return file
    return new Response(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="document-${id}.${contentType.includes('pdf') ? 'pdf' : 'docx'}"`,
      },
    });
  } catch (error) {
    return handleApiError(error, "Failed to download document");
  }
}

