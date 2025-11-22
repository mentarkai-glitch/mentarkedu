import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import { z } from "zod";

const predictRankSchema = z.object({
  exam_type: z.enum(["JEE_MAIN", "JEE_ADVANCED", "NEET"]),
  score: z.number().min(0),
  test_attempt_id: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { data: student } = await supabase
      .from("students")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (!student) {
      return errorResponse("Student profile not found", 404);
    }

    const body = await request.json();
    const validated = predictRankSchema.parse(body);

    // Get historical rank data for this exam type
    const { data: historicalAttempts } = await supabase
      .from("test_attempts")
      .select("score, rank, percentile")
      .eq("student_id", student.user_id)
      .in("test_id", (
        await supabase
          .from("mock_tests")
          .select("id")
          .eq("exam_type", validated.exam_type)
      ).data?.map((t) => t.id) || [])
      .eq("status", "completed")
      .not("rank", "is", null)
      .order("submitted_at", { ascending: false })
      .limit(10);

    // Simple rank prediction algorithm
    // In production, this would use ML model trained on historical data
    const predictedRank = predictRankFromScore(
      validated.exam_type,
      validated.score,
      historicalAttempts || []
    );

    const percentile = calculatePercentile(predictedRank.rank, validated.exam_type);

    // Save prediction
    const { data: prediction, error: saveError } = await supabase
      .from("rank_predictions")
      .insert({
        student_id: student.user_id,
        exam_type: validated.exam_type,
        test_attempt_id: validated.test_attempt_id || null,
        score: validated.score,
        predicted_rank: predictedRank.rank,
        predicted_percentile: percentile,
        confidence_level: predictedRank.confidence,
        factors: {
          historical_trend: historicalAttempts?.length || 0,
          score_range: predictedRank.scoreRange,
        },
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving prediction:", saveError);
      // Don't fail, just return prediction
    }

    return successResponse({
      predicted_rank: predictedRank.rank,
      predicted_percentile: percentile,
      confidence_level: predictedRank.confidence,
      score_range: predictedRank.scoreRange,
      historical_trend: historicalAttempts || [],
      factors: {
        score: validated.score,
        exam_type: validated.exam_type,
        historical_attempts: historicalAttempts?.length || 0,
      },
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/student/rank-predictor",
      method: "POST",
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { data: student } = await supabase
      .from("students")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (!student) {
      return errorResponse("Student profile not found", 404);
    }

    const { searchParams } = new URL(request.url);
    const examType = searchParams.get("exam_type");

    let query = supabase
      .from("rank_predictions")
      .select("*")
      .eq("student_id", student.user_id)
      .order("created_at", { ascending: false });

    if (examType) {
      query = query.eq("exam_type", examType);
    }

    const { data: predictions, error } = await query.limit(20);

    if (error) throw error;

    return successResponse(predictions || []);
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/student/rank-predictor",
      method: "GET",
    });
  }
}

// Simple rank prediction function
// In production, this would use ML model
function predictRankFromScore(
  examType: string,
  score: number,
  historicalAttempts: any[]
): { rank: number; confidence: string; scoreRange: string } {
  // Base rank estimates (simplified - would use actual historical data)
  const baseRanks: Record<string, { maxScore: number; rankAtMax: number }> = {
    JEE_MAIN: { maxScore: 360, rankAtMax: 1 },
    JEE_ADVANCED: { maxScore: 360, rankAtMax: 1 },
    NEET: { maxScore: 720, rankAtMax: 1 },
  };

  const base = baseRanks[examType] || baseRanks.JEE_MAIN;
  const maxScore = base.maxScore;
  const scorePercentage = (score / maxScore) * 100;

  // Simplified rank calculation (exponential curve)
  // Lower scores = exponentially higher ranks
  let estimatedRank: number;
  
  if (scorePercentage >= 95) {
    estimatedRank = Math.round(100 + (100 - scorePercentage) * 200);
  } else if (scorePercentage >= 85) {
    estimatedRank = Math.round(1000 + (95 - scorePercentage) * 2000);
  } else if (scorePercentage >= 75) {
    estimatedRank = Math.round(10000 + (85 - scorePercentage) * 5000);
  } else if (scorePercentage >= 65) {
    estimatedRank = Math.round(50000 + (75 - scorePercentage) * 10000);
  } else {
    estimatedRank = Math.round(150000 + (65 - scorePercentage) * 20000);
  }

  // Adjust based on historical trend
  if (historicalAttempts.length > 0) {
    const avgHistoricalRank = historicalAttempts.reduce((sum, a) => sum + (a.rank || 0), 0) / historicalAttempts.length;
    // Weighted average: 70% current prediction, 30% historical
    estimatedRank = Math.round(estimatedRank * 0.7 + avgHistoricalRank * 0.3);
  }

  // Determine confidence
  let confidence = "medium";
  if (historicalAttempts.length >= 5) {
    confidence = "high";
  } else if (historicalAttempts.length === 0) {
    confidence = "low";
  }

  // Score range
  const scoreRange = scorePercentage >= 90 ? "Top 10%" :
                    scorePercentage >= 80 ? "Top 20%" :
                    scorePercentage >= 70 ? "Top 30%" :
                    scorePercentage >= 60 ? "Top 50%" :
                    "Below 50%";

  return {
    rank: Math.max(1, estimatedRank),
    confidence,
    scoreRange,
  };
}

function calculatePercentile(rank: number, examType: string): number {
  // Estimated total candidates (simplified)
  const totalCandidates: Record<string, number> = {
    JEE_MAIN: 1200000,
    JEE_ADVANCED: 250000,
    NEET: 2000000,
  };

  const total = totalCandidates[examType] || totalCandidates.JEE_MAIN;
  const percentile = ((total - rank) / total) * 100;
  return Math.round(percentile * 100) / 100;
}

