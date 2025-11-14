import { NextRequest, NextResponse } from "next/server";
import { processDocument, extractTextFromDocument, parseFormFields } from "@/lib/services/document-ai";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

/**
 * Document Upload & OCR Endpoint
 * POST /api/vision/upload-document
 * 
 * Uploads a document and extracts text/form fields using Google Document AI
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Authentication required", 401);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const processorType = formData.get("processorType") as "form-parser" | "ocr" | null;

    if (!file) {
      return errorResponse("File is required", 400);
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/tiff",
      "image/bmp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return errorResponse(
        "Invalid file type. Supported: PDF, PNG, JPEG, TIFF, BMP",
        400
      );
    }

    // Validate file size (max 20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      return errorResponse("File size exceeds 20MB limit", 400);
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process document based on processor type
    let result;
    try {
      if (processorType === "form-parser") {
        result = await parseFormFields(buffer, file.type);
      } else {
        result = await extractTextFromDocument(buffer, file.type);
      }

      if (!result.success) {
        // Check if it's an OAuth error - provide helpful message
        if (result.error?.includes("OAuth")) {
          return errorResponse(
            "Document AI requires service account credentials. Please set up OAuth or use Google Cloud Vision API as an alternative.",
            401
          );
        }
        return errorResponse(result.error || "Failed to process document", 500);
      }
    } catch (error: any) {
      console.error("Document processing error:", error);
      return errorResponse(
        error.message || "Failed to process document. Please check Document AI configuration.",
        500
      );
    }

    // Store document in Supabase (optional)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(`${user.id}/${Date.now()}-${file.name}`, buffer, {
        contentType: file.type,
        upsert: false,
      });

    return successResponse({
      success: true,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      extracted_text: result.text,
      form_fields: (result as any).fields,
      storage_url: uploadData?.path || null,
      processed_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Document upload error:", error);
    return errorResponse(error.message || "Failed to upload document", 500);
  }
}

