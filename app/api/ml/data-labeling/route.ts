/**
 * Data Labeling API
 * Endpoints for labeling student outcomes for ML training
 */

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

/**
 * GET /api/ml/data-labeling
 * Get students needing labels or labeled data
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Verify admin
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (adminError || !admin) {
      return errorResponse("Admin access required", 403);
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all"; // 'all', 'needs_labeling', 'labeled'
    const outcomeType = searchParams.get("outcome_type"); // 'dropout', 'burnout', 'success', etc.
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("student_outcomes")
      .select(`
        *,
        students!inner(
          user_id,
          users(
            id,
            profile_data
          )
        )
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (type === "needs_labeling") {
      query = query.eq("confirmed", false);
    } else if (type === "labeled") {
      query = query.eq("confirmed", true);
    }

    if (outcomeType) {
      query = query.eq("outcome_type", outcomeType);
    }

    const { data: outcomes, error } = await query;

    if (error) {
      return errorResponse(error.message, 500);
    }

    // Transform data to include student names
    const transformedOutcomes = outcomes?.map((outcome: any) => {
      const student = Array.isArray(outcome.students?.users)
        ? outcome.students.users[0]
        : outcome.students?.users;
      const firstName = student?.profile_data?.first_name || "";
      const lastName = student?.profile_data?.last_name || "";

      return {
        ...outcome,
        student_name: `${firstName} ${lastName}`.trim() || "Unknown",
      };
    });

    // Get counts
    const { count: totalCount } = await supabase
      .from("student_outcomes")
      .select("*", { count: "exact", head: true });

    const { count: needsLabelingCount } = await supabase
      .from("student_outcomes")
      .select("*", { count: "exact", head: true })
      .eq("confirmed", false);

    const { count: labeledCount } = await supabase
      .from("student_outcomes")
      .select("*", { count: "exact", head: true })
      .eq("confirmed", true);

    return successResponse({
      outcomes: transformedOutcomes || [],
      pagination: {
        total: totalCount || 0,
        needs_labeling: needsLabelingCount || 0,
        labeled: labeledCount || 0,
        limit,
        offset,
      },
    });
  } catch (error: any) {
    console.error("Data labeling fetch error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

/**
 * POST /api/ml/data-labeling
 * Create or update a student outcome label
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Verify admin
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (adminError || !admin) {
      return errorResponse("Admin access required", 403);
    }

    const body = await request.json();
    const {
      student_id,
      outcome_type,
      outcome_value,
      outcome_date,
      notes,
      confirmed = false,
    } = body;

    if (!student_id || !outcome_type || !outcome_value) {
      return errorResponse(
        "student_id, outcome_type, and outcome_value are required",
        400
      );
    }

    // Check if outcome already exists
    const { data: existing } = await supabase
      .from("student_outcomes")
      .select("id")
      .eq("student_id", student_id)
      .eq("outcome_type", outcome_type)
      .single();

    let result;
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from("student_outcomes")
        .update({
          outcome_value,
          outcome_date: outcome_date || null,
          notes: notes || null,
          confirmed,
          confirmed_by: confirmed ? user.id : null,
          confirmed_at: confirmed ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        return errorResponse(error.message, 500);
      }
      result = data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from("student_outcomes")
        .insert({
          student_id,
          outcome_type,
          outcome_value,
          outcome_date: outcome_date || null,
          notes: notes || null,
          confirmed,
          confirmed_by: confirmed ? user.id : null,
          confirmed_at: confirmed ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) {
        return errorResponse(error.message, 500);
      }
      result = data;
    }

    return successResponse(result);
  } catch (error: any) {
    console.error("Data labeling create/update error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

/**
 * PUT /api/ml/data-labeling/[id]
 * Update a specific outcome label
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Verify admin
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (adminError || !admin) {
      return errorResponse("Admin access required", 403);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("id parameter is required", 400);
    }

    const body = await request.json();
    const { outcome_value, outcome_date, notes, confirmed } = body;

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (outcome_value !== undefined) updateData.outcome_value = outcome_value;
    if (outcome_date !== undefined) updateData.outcome_date = outcome_date;
    if (notes !== undefined) updateData.notes = notes;
    if (confirmed !== undefined) {
      updateData.confirmed = confirmed;
      updateData.confirmed_by = confirmed ? user.id : null;
      updateData.confirmed_at = confirmed ? new Date().toISOString() : null;
    }

    const { data, error } = await supabase
      .from("student_outcomes")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(data);
  } catch (error: any) {
    console.error("Data labeling update error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

/**
 * DELETE /api/ml/data-labeling/[id]
 * Delete an outcome label
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Verify admin
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (adminError || !admin) {
      return errorResponse("Admin access required", 403);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("id parameter is required", 400);
    }

    const { error } = await supabase
      .from("student_outcomes")
      .delete()
      .eq("id", id);

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse({ message: "Outcome deleted successfully" });
  } catch (error: any) {
    console.error("Data labeling delete error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}


