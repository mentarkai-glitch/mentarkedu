import { NextRequest, NextResponse } from "next/server";
import { analyzeImage } from "@/lib/services/vision";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // Get user from Supabase
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { imageBase64, imageUrl, features } = body;

    if (!imageBase64 && !imageUrl) {
      return NextResponse.json(
        { success: false, error: "No image provided" },
        { status: 400 }
      );
    }

    // Validate image size (max 5MB for base64)
    if (imageBase64) {
      const sizeInBytes = (imageBase64.length * 3) / 4;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      
      if (sizeInMB > 5) {
        return NextResponse.json(
          { success: false, error: "Image too large. Maximum size is 5MB." },
          { status: 400 }
        );
      }
    }

    // Analyze image using Vision API
    const result = await analyzeImage({
      imageBase64,
      imageUrl,
      features: features || ["text", "labels"],
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        extracted_text: result.extracted_text,
        full_text: result.full_text,
        labels: result.labels,
        objects: result.objects,
      },
    });

  } catch (error) {
    console.error("Image analysis error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      },
      { status: 500 }
    );
  }
}

