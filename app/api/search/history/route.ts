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
 * GET /api/search/history
 * Get search history for the authenticated student
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const studentId = await requireStudentId(supabase);

    if (!studentId) {
      return errorResponse("Student profile not found", 404);
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const days = parseInt(searchParams.get("days") || "30", 10);

    // Get student profile
    const { data: student } = await supabase
      .from("students")
      .select("onboarding_profile")
      .eq("user_id", studentId)
      .single();

    const profile = (student?.onboarding_profile as any) || {};
    const searchHistory = profile.search_history || [];

    // Filter by date if specified
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filteredHistory = searchHistory
      .filter((item: any) => {
        if (!item.searchedAt) return false;
        const searchDate = new Date(item.searchedAt);
        return searchDate >= cutoffDate;
      })
      .sort((a: any, b: any) => {
        const dateA = new Date(a.searchedAt || 0).getTime();
        const dateB = new Date(b.searchedAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, limit);

    // Group by date
    const groupedByDate: Record<string, any[]> = {};
    filteredHistory.forEach((item: any) => {
      const date = new Date(item.searchedAt).toLocaleDateString();
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(item);
    });

    // Count searches per day (last 7 days)
    const last7Days: Array<{ date: string; count: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString();
      const count = filteredHistory.filter((item: any) => {
        const itemDate = new Date(item.searchedAt).toLocaleDateString();
        return itemDate === dateStr;
      }).length;
      last7Days.push({ date: dateStr, count });
    }

    return successResponse({
      history: filteredHistory,
      groupedByDate,
      statistics: {
        total: filteredHistory.length,
        last7Days,
        averagePerDay: filteredHistory.length / Math.max(days, 1),
      },
      filters: {
        limit,
        days,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/search/history
 * Record a search in history
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const studentId = await requireStudentId(supabase);

    if (!studentId) {
      return errorResponse("Student profile not found", 404);
    }

    const body = await request.json();
    const { query, context, filters, resultsCount } = body;

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
    const searchHistory = profile.search_history || [];

    // Add search to history
    const searchEntry = {
      id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      query: query.trim(),
      context: context || null,
      filters: filters || {},
      resultsCount: resultsCount || 0,
      searchedAt: new Date().toISOString(),
    };

    // Remove duplicates (same query within last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const filtered = searchHistory.filter((item: any) => {
      if (item.query?.toLowerCase() === query.toLowerCase() && 
          item.searchedAt > oneHourAgo) {
        return false;
      }
      return true;
    });

    filtered.unshift(searchEntry); // Add to beginning

    // Keep only last 200 search history items
    const limitedHistory = filtered.slice(0, 200);

    // Update profile
    const { error: updateError } = await supabase
      .from("students")
      .update({
        onboarding_profile: {
          ...profile,
          search_history: limitedHistory,
        },
      })
      .eq("user_id", studentId);

    if (updateError) throw updateError;

    return successResponse({
      recorded: true,
      entry: searchEntry,
      totalHistory: limitedHistory.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/search/history
 * Clear search history
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const studentId = await requireStudentId(supabase);

    if (!studentId) {
      return errorResponse("Student profile not found", 404);
    }

    const { searchParams } = new URL(request.url);
    const clearAll = searchParams.get("all") === "true";

    const { data: student } = await supabase
      .from("students")
      .select("onboarding_profile")
      .eq("user_id", studentId)
      .single();

    const profile = (student?.onboarding_profile as any) || {};

    if (clearAll) {
      // Clear all history
      profile.search_history = [];
    } else {
      // Clear old history (older than 30 days)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);
      
      profile.search_history = (profile.search_history || []).filter((item: any) => {
        if (!item.searchedAt) return false;
        return new Date(item.searchedAt) >= cutoffDate;
      });
    }

    // Update profile
    const { error: updateError } = await supabase
      .from("students")
      .update({
        onboarding_profile: profile,
      })
      .eq("user_id", studentId);

    if (updateError) throw updateError;

    return successResponse({
      cleared: true,
      remaining: profile.search_history?.length || 0,
    });
  } catch (error) {
    return handleApiError(error);
  }
}





