import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

/**
 * GET /api/job-recommendations
 * Fetch job recommendations for the authenticated student
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const arkId = searchParams.get("ark_id");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build query
    let query = supabase
      .from("job_recommendations")
      .select("*")
      .eq("student_id", user.id)
      .order("relevance_score", { ascending: false })
      .order("recommended_at", { ascending: false })
      .limit(limit);

    // Filter by status
    if (status !== "all") {
      query = query.eq("status", status);
    }

    // Filter by ARK
    if (arkId) {
      query = query.eq("ark_id", arkId);
    }

    const { data: recommendations, error } = await query;

    if (error) throw error;

    return successResponse({
      recommendations: recommendations || [],
      count: recommendations?.length || 0,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/job-recommendations
 * Update job recommendation status (viewed, applied, ignored, saved)
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { recommendation_id, status } = body;

    if (!recommendation_id || !status) {
      return errorResponse("Recommendation ID and status are required", 400);
    }

    if (!["recommended", "viewed", "applied", "ignored", "saved"].includes(status)) {
      return errorResponse("Invalid status", 400);
    }

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from("job_recommendations")
      .select("student_id")
      .eq("id", recommendation_id)
      .single();

    if (fetchError || !existing) {
      return errorResponse("Recommendation not found", 404);
    }

    if (existing.student_id !== user.id) {
      return errorResponse("Unauthorized", 403);
    }

    // Update status
    const updateData: any = { status };
    
    // Auto-update timestamps
    if (status === "viewed") {
      updateData.viewed_at = new Date().toISOString();
    } else if (status === "applied") {
      updateData.applied_at = new Date().toISOString();
      // Also mark as viewed if not already
      if (!existing.viewed_at) {
        updateData.viewed_at = new Date().toISOString();
      }
    }

    const { data: updated, error: updateError } = await supabase
      .from("job_recommendations")
      .update(updateData)
      .eq("id", recommendation_id)
      .select()
      .single();

    if (updateError) throw updateError;

    return successResponse({ recommendation: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/job-recommendations
 * Delete a job recommendation (permanent removal)
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const recommendationId = searchParams.get("id");

    if (!recommendationId) {
      return errorResponse("Recommendation ID is required", 400);
    }

    // Verify ownership and delete
    const { error: deleteError } = await supabase
      .from("job_recommendations")
      .delete()
      .eq("id", recommendationId)
      .eq("student_id", user.id);

    if (deleteError) throw deleteError;

    return successResponse({ message: "Recommendation deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

