import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import { fetchWithRetry } from "@/lib/utils/fetch-with-retry";
import * as Sentry from "@sentry/nextjs";

const ML_SERVING_URL = process.env.ML_SERVING_URL;

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

    if (ML_SERVING_URL) {
      try {
        const response = await fetchWithRetry(
          `${ML_SERVING_URL}/predict/difficulty`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ student_id }),
          },
          {
            attempts: 2,
            backoffMs: 400,
            onRetry: (error, attempt) => {
              console.warn(`Difficulty prediction retry #${attempt + 1} for student ${student_id}`, error);
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          return successResponse({ prediction: data });
        }

        const message = await response.text();
        if (typeof Sentry.captureMessage === "function") {
          Sentry.captureMessage("Difficulty prediction failed", {
            level: "warning",
            extra: { student_id, status: response.status, responseBody: message },
          });
        }
      } catch (error) {
        console.warn("Difficulty serving request failed; falling back to rule-based prediction", error);
        if (typeof Sentry.captureException === "function") {
          Sentry.captureException(error, {
            tags: { ml_prediction: "difficulty_fallback" },
            extra: { student_id },
          });
        }
      }
    }

    const fallbackPrediction = buildRuleBasedDifficulty(featureVector, ML_SERVING_URL ? "ML serving unavailable" : "ML serving not configured");
    return successResponse({ prediction: fallbackPrediction, fallback: true });
  } catch (error) {
    return handleApiError(error);
  }
}
