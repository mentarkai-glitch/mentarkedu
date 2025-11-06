import { NextRequest, NextResponse } from "next/server";
import { analyzeStudentJournal } from "@/lib/services/vision";
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
    const { imageBase64, title, imageUrl } = body;

    if (!imageBase64 && !imageUrl) {
      return NextResponse.json(
        { success: false, error: "No image provided" },
        { status: 400 }
      );
    }

    // Get student profile to verify access
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (studentError || !studentData) {
      return NextResponse.json(
        { success: false, error: "Student profile not found" },
        { status: 404 }
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

    // Analyze journal using Vision API and AI
    const result = await analyzeStudentJournal(
      imageBase64 || imageUrl,
      user.id
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Save journal entry to database
    const { error: dbError } = await supabase
      .from("student_journals")
      .insert({
        student_id: user.id,
        title: title || "Journal Entry",
        image_url: imageUrl || "base64_image", // For base64, we'll store a placeholder
        extracted_text: result.extracted_text,
        ai_insights: result.insights,
        emotion_detected: result.emotion_detected,
        confidence_score: result.confidence_score,
      });

    if (dbError) {
      console.error("Database error saving journal:", dbError);
      // Don't fail the request if DB save fails
    }

    return NextResponse.json({
      success: true,
      data: {
        extracted_text: result.extracted_text,
        insights: result.insights,
        emotion_detected: result.emotion_detected,
        confidence_score: result.confidence_score,
      },
    });

  } catch (error) {
    console.error("Journal analysis error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      },
      { status: 500 }
    );
  }
}

