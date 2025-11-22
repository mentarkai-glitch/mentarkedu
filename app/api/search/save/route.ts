import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

async function requireStudentId(supabase: any): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: student } = await supabase
    .from("students")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  return student?.user_id ?? null;
}

/**
 * GET /api/search/save
 * Get all saved searches for the authenticated student
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const studentId = await requireStudentId(supabase);

    if (!studentId) {
      return errorResponse("Student profile not found", 404);
    }

    // Get student profile
    const { data: student } = await supabase
      .from("students")
      .select("onboarding_profile")
      .eq("user_id", studentId)
      .single();

    const profile = (student?.onboarding_profile as any) || {};
    const savedSearches = profile.saved_searches || [];

    return successResponse({
      savedSearches,
      total: savedSearches.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/search/save
 * Save a search query for later
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const studentId = await requireStudentId(supabase);

    if (!studentId) {
      return errorResponse("Student profile not found", 404);
    }

    const body = await request.json();
    const { query, context, filters } = body;

    if (!query || !query.trim()) {
      return errorResponse("Search query is required", 400);
    }

    // Get student profile
    const { data: student } = await supabase
      .from("students")
      .select("onboarding_profile")
      .eq("user_id", studentId)
      .single();

    const profile = (student?.onboarding_profile as any) || {};
    const savedSearches = profile.saved_searches || [];

    // Check if already saved
    const exists = savedSearches.some((s: any) => s.query?.toLowerCase() === query.toLowerCase());

    if (exists) {
      return errorResponse("Search already saved", 400);
    }

    // Add saved search
    const newSearch = {
      id: `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      query: query.trim(),
      context: context || null,
      filters: filters || {},
      savedAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
      useCount: 1,
    };

    savedSearches.unshift(newSearch); // Add to beginning

    // Keep only last 50 saved searches
    const limitedSearches = savedSearches.slice(0, 50);

    // Update profile
    const { error: updateError } = await supabase
      .from("students")
      .update({
        onboarding_profile: {
          ...profile,
          saved_searches: limitedSearches,
        },
      })
      .eq("user_id", studentId);

    if (updateError) throw updateError;

    return successResponse({
      saved: true,
      search: newSearch,
      totalSaved: limitedSearches.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/search/save
 * Remove a saved search
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const studentId = await requireStudentId(supabase);

    if (!studentId) {
      return errorResponse("Student profile not found", 404);
    }

    const { searchParams } = new URL(request.url);
    const searchId = searchParams.get("id");

    if (!searchId) {
      return errorResponse("Search ID is required", 400);
    }

    const { data: student } = await supabase
      .from("students")
      .select("onboarding_profile")
      .eq("user_id", studentId)
      .single();

    const profile = (student?.onboarding_profile as any) || {};
    const savedSearches = profile.saved_searches || [];

    // Remove search
    const filtered = savedSearches.filter((s: any) => s.id !== searchId);

    // Update profile
    const { error: updateError } = await supabase
      .from("students")
      .update({
        onboarding_profile: {
          ...profile,
          saved_searches: filtered,
        },
      })
      .eq("user_id", studentId);

    if (updateError) throw updateError;

    return successResponse({
      removed: true,
      totalSaved: filtered.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

