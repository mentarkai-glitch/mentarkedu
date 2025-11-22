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
 * GET /api/search/analytics
 * Get search analytics and insights
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const studentId = await requireStudentId(supabase);

    if (!studentId) {
      return errorResponse("Student profile not found", 404);
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);

    // Get student profile
    const { data: student } = await supabase
      .from("students")
      .select("onboarding_profile")
      .eq("user_id", studentId)
      .single();

    const profile = (student?.onboarding_profile as any) || {};
    const searchHistory = profile.search_history || [];
    const savedSearches = profile.saved_searches || [];

    // Filter by date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentHistory = searchHistory.filter((item: any) => {
      if (!item.searchedAt) return false;
      return new Date(item.searchedAt) >= cutoffDate;
    });

    // Calculate statistics
    const totalSearches = recentHistory.length;
    const uniqueQueries = new Set(recentHistory.map((item: any) => item.query?.toLowerCase())).size;
    const averageResultsPerSearch = recentHistory.length > 0
      ? recentHistory.reduce((sum: number, item: any) => sum + (item.resultsCount || 0), 0) / recentHistory.length
      : 0;

    // Most searched queries
    const queryCounts: Record<string, number> = {};
    recentHistory.forEach((item: any) => {
      const query = item.query?.toLowerCase() || "";
      if (query) {
        queryCounts[query] = (queryCounts[query] || 0) + 1;
      }
    });

    const topQueries = Object.entries(queryCounts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Search frequency by day of week
    const dayOfWeekCounts: Record<string, number> = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    };

    recentHistory.forEach((item: any) => {
      if (item.searchedAt) {
        const day = new Date(item.searchedAt).toLocaleDateString('en-US', { weekday: 'long' });
        dayOfWeekCounts[day] = (dayOfWeekCounts[day] || 0) + 1;
      }
    });

    // Search frequency by hour of day
    const hourOfDayCounts: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      hourOfDayCounts[i] = 0;
    }

    recentHistory.forEach((item: any) => {
      if (item.searchedAt) {
        const hour = new Date(item.searchedAt).getHours();
        hourOfDayCounts[hour] = (hourOfDayCounts[hour] || 0) + 1;
      }
    });

    // Search trends (last 7 days)
    const last7Days: Array<{ date: string; count: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString();
      const count = recentHistory.filter((item: any) => {
        const itemDate = new Date(item.searchedAt).toLocaleDateString();
        return itemDate === dateStr;
      }).length;
      last7Days.push({ date: dateStr, count });
    }

    // Most active search topics (simple keyword extraction)
    const keywords: Record<string, number> = {};
    recentHistory.forEach((item: any) => {
      const words = (item.query || "").toLowerCase().split(/\s+/);
      words.forEach((word: string) => {
        if (word.length > 3) {
          keywords[word] = (keywords[word] || 0) + 1;
        }
      });
    });

    const topKeywords = Object.entries(keywords)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    return successResponse({
      overview: {
        totalSearches: totalSearches,
        uniqueQueries: uniqueQueries,
        savedSearches: savedSearches.length,
        averageResultsPerSearch: Math.round(averageResultsPerSearch * 100) / 100,
        period: days,
      },
      topQueries,
      trends: {
        last7Days,
        dayOfWeekCounts,
        hourOfDayCounts: Object.entries(hourOfDayCounts).map(([hour, count]) => ({
          hour: parseInt(hour),
          count,
        })),
      },
      topics: {
        topKeywords,
      },
      insights: {
        mostActiveDay: Object.entries(dayOfWeekCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
        mostActiveHour: Object.entries(hourOfDayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
        searchFrequency: totalSearches > 0 ? `${Math.round((totalSearches / days) * 100) / 100} per day` : "No searches",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}





