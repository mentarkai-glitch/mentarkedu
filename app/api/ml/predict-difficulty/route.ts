import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import { fetchWithRetry } from "@/lib/utils/fetch-with-retry";
import * as Sentry from "@sentry/nextjs";

// ML_SERVING_URL should be a full URL (e.g., https://ml-service.example.com)
// If not set or set to localhost, we'll use rule-based fallback
const ML_SERVING_URL = process.env.ML_SERVING_URL;
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
const isMLServiceAvailable = ML_SERVING_URL && 
  !ML_SERVING_URL.includes('localhost') && 
  !ML_SERVING_URL.includes('127.0.0.1') &&
  !ML_SERVING_URL.includes('0.0.0.0') &&
  ML_SERVING_URL.startsWith('http') &&
  // In production, never use localhost even if somehow set
  (!isProduction || (!ML_SERVING_URL.includes('localhost') && !ML_SERVING_URL.includes('127.0.0.1')));

type FeatureVector = {
  features: Record<string, any>;
  feature_version: string;
  extraction_timestamp: string | null;
};

function getNested<T>(source: Record<string, any>, path: string[], defaultValue: T): T {
  return path.reduce((acc: any, key) => (acc?.[key] ?? undefined), source) ?? defaultValue;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function coalesceFeature(features: Record<string, any>, candidates: (string | string[])[], fallback: number) {
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      const value = getNested(features, candidate, undefined);
      if (typeof value === "number") return value;
    } else if (typeof features[candidate] === "number") {
      return features[candidate];
    }
  }
  return fallback;
}

function buildRuleBasedDifficulty(featureVector: FeatureVector, reason: string) {
  const { features, feature_version, extraction_timestamp } = featureVector;

  const progressRate = coalesceFeature(
    features,
    [
      ["performance", "ark_progress_rate_30d"],
      ["performance", "ark_progress_velocity"],
      "ark_progress_velocity",
    ],
    0
  );
  const xpRate = coalesceFeature(
    features,
    [
      ["performance", "xp_earning_rate"],
      "xp_earning_rate",
    ],
    0
  );
  const motivation = coalesceFeature(
    features,
    [
      ["profile", "motivation_level"],
      "motivation_level",
    ],
    7
  );
  const confidence = coalesceFeature(
    features,
    [
      ["profile", "confidence_level"],
      "confidence_level",
    ],
    6
  );
  const timeCommitment = coalesceFeature(
    features,
    [
      ["profile", "hours_per_week"],
      "hours_per_week",
    ],
    8
  );

  const aptitude = progressRate * 2 + xpRate / 10 + motivation * 3 + confidence * 2;
  const workload = timeCommitment * 1.5;
  const normalized = clamp((aptitude + workload) / 10, 0.5, 5);

  let recommendedLevel: "ambitious" | "standard" | "foundational";
  if (normalized >= 4) {
    recommendedLevel = "ambitious";
  } else if (normalized >= 2.5) {
    recommendedLevel = "standard";
  } else {
    recommendedLevel = "foundational";
  }

  const recommendations =
    recommendedLevel === "ambitious"
      ? ["Introduce stretch goals and peer challenges"]
      : recommendedLevel === "standard"
      ? ["Maintain current ARK cadence"]
      : ["Break milestones into smaller weekly targets"];

  const confidenceScore = clamp(0.55 + Math.min(confidence, 10) / 25, 0.4, 0.95);

  return {
    difficulty_score: Number(normalized.toFixed(2)),
    recommended_level: recommendedLevel,
    confidence: Number(confidenceScore.toFixed(3)),
    recommendations,
    metadata: {
      model_name: "rule_based_difficulty",
      model_version: "fallback-js",
      feature_version,
      feature_timestamp: extraction_timestamp,
      used_fallback: true,
      fallback_reason: reason,
    },
  };
}

async function fetchFeatureVector(supabase: Awaited<ReturnType<typeof createClient>>, studentId: string) {
  const { data, error } = await supabase
    .from("ml_feature_store")
    .select("features, feature_version, extraction_timestamp")
    .eq("student_id", studentId)
    .order("extraction_timestamp", { ascending: false })
    .limit(1)
    .maybeSingle<FeatureVector>();

  if (error) {
    throw error;
  }
  return data;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { student_id } = body;

    if (!student_id) {
      return errorResponse("student_id is required", 400);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.id !== student_id) {
      const { data: student } = await supabase
        .from("students")
        .select("user_id")
        .eq("user_id", student_id)
        .single();

      if (!student) {
        return errorResponse("Unauthorized", 401);
      }
    }

    const featureVector = await fetchFeatureVector(supabase, student_id);
    if (!featureVector) {
      return errorResponse("No feature data available for difficulty prediction", 404);
    }

    // Only try ML service if it's properly configured (not localhost)
    // Double-check we're not trying to connect to localhost (safety check)
    // In production/Vercel, never try localhost even if somehow set
    const shouldTryMLService = isMLServiceAvailable && 
      ML_SERVING_URL && 
      !ML_SERVING_URL.includes('localhost') && 
      !ML_SERVING_URL.includes('127.0.0.1') &&
      !ML_SERVING_URL.includes('0.0.0.0') &&
      ML_SERVING_URL.startsWith('http') &&
      // Final safety check: in production, absolutely no localhost
      (!isProduction || (!ML_SERVING_URL.includes('localhost') && !ML_SERVING_URL.includes('127.0.0.1')));

    if (!shouldTryMLService) {
      // Skip ML service entirely if not properly configured
      console.log("ML service not configured or pointing to localhost, using rule-based prediction");
    } else {
      // Final safety check before making request
      const mlUrl = `${ML_SERVING_URL}/predict/difficulty`;
      if (isProduction && (mlUrl.includes('localhost') || mlUrl.includes('127.0.0.1'))) {
        console.log("Blocked localhost connection in production, using rule-based prediction");
      } else {
        try {
          const response = await fetchWithRetry(
            mlUrl,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ student_id }),
            },
            {
              attempts: 0, // No retries - fail immediately if ML service unavailable
              backoffMs: 0,
              timeout: 2000, // 2 second timeout - fail fast
              onRetry: (error, attempt) => {
                // Should not be called with attempts: 0
                console.log(`ML service retry #${attempt + 1} (should not happen)`);
              },
            }
          );

        if (response.ok) {
          const data = await response.json();
          return successResponse({ prediction: data });
        }

        const message = await response.text();
        // Only log to Sentry if it's not a connection error (expected when ML service unavailable)
        if (response.status !== 0 && typeof Sentry.captureMessage === "function") {
          Sentry.captureMessage("Difficulty prediction failed", {
            level: "warning",
            extra: { student_id, status: response.status, responseBody: message },
          });
        }
      } catch (error: any) {
        // Don't log connection refused errors to Sentry - they're expected when ML service is unavailable
        const isConnectionError = error?.message?.includes('ECONNREFUSED') || 
                                  error?.message?.includes('fetch failed') ||
                                  error?.message?.includes('ECONNREFUSED') ||
                                  error?.code === 'ECONNREFUSED' ||
                                  error?.cause?.code === 'ECONNREFUSED';
        
        if (!isConnectionError) {
          console.warn("Difficulty serving request failed; falling back to rule-based prediction", error);
          if (typeof Sentry.captureException === "function") {
            Sentry.captureException(error, {
              tags: { ml_prediction: "difficulty_fallback" },
              extra: { student_id },
            });
          }
        } else {
          // Silently fall back for connection errors (expected in production)
          console.log("ML service unavailable, using rule-based prediction");
        }
      }
      }
    }

    const fallbackPrediction = buildRuleBasedDifficulty(featureVector, ML_SERVING_URL ? "ML serving unavailable" : "ML serving not configured");
    return successResponse({ prediction: fallbackPrediction, fallback: true });
  } catch (error) {
    return handleApiError(error);
  }
}
