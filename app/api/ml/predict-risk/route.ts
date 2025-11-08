import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import { calculateDropoutRisk } from "@/lib/ml/risk-predictor";
import type { BehavioralPattern } from "@/lib/types";
import { fetchWithRetry } from "@/lib/utils/fetch-with-retry";
import * as Sentry from "@sentry/nextjs";

const ML_SERVING_URL = process.env.ML_SERVING_URL;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { student_id } = body;

    if (!student_id) {
      return errorResponse("student_id is required", 400);
    }

    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("*, users!inner ( full_name, email )")
      .eq("user_id", student_id)
      .single();

    if (studentError || !student) throw studentError;

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const { data: patterns, error: patternsError } = await supabase
      .from("behavioral_patterns")
      .select("*")
      .eq("student_id", student_id)
      .gte("pattern_date", sixtyDaysAgo.toISOString().split("T")[0])
      .order("pattern_date", { ascending: false });

    if (patternsError) throw patternsError;

    if (!patterns || patterns.length === 0) {
      await backfillRecentPatterns(supabase, student_id);
      const { data: refreshedPatterns } = await supabase
        .from("behavioral_patterns")
        .select("*")
        .eq("student_id", student_id)
        .order("pattern_date", { ascending: false });

      return await generatePrediction(student_id, refreshedPatterns || [], student, supabase);
    }

    return await generatePrediction(student_id, patterns, student, supabase);
  } catch (error) {
    return handleApiError(error);
  }
}

async function backfillRecentPatterns(supabase: any, studentId: string) {
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    await supabase.rpc("calculate_daily_behavioral_pattern", {
      p_student_id: studentId,
      p_date: dateStr,
    });
  }
}

interface NormalizedRisk {
  dropout_risk_score: number;
  burnout_risk_score: number;
  disengagement_risk_score: number;
  risk_level: "critical" | "high" | "medium" | "low";
  primary_risk_factors: string[];
  protective_factors: string[];
  recommended_interventions: any[];
  early_warning_flags: string[];
  model_version: string;
  model_source: string;
  confidence_score: number;
  metadata: Record<string, any>;
  expires_at: string | null;
}

async function generatePrediction(
  studentId: string,
  patterns: BehavioralPattern[],
  student: any,
  supabase: any
) {
  const protectiveFactors = deriveProtectiveFactors(patterns);
  const servingPrediction = await callModelServing(studentId);

  let normalized: NormalizedRisk | null = null;
  if (servingPrediction) {
    normalized = mapServingPrediction(servingPrediction, protectiveFactors);
  }

  if (!normalized) {
    const fallback = await calculateDropoutRisk(studentId, patterns, student);
    normalized = {
      dropout_risk_score: fallback.dropout_risk_score,
      burnout_risk_score: fallback.burnout_risk_score,
      disengagement_risk_score: fallback.disengagement_risk_score,
      risk_level: fallback.risk_level,
      primary_risk_factors: fallback.primary_risk_factors,
      protective_factors: fallback.protective_factors,
      recommended_interventions: fallback.recommended_interventions,
      early_warning_flags: fallback.early_warning_flags,
      model_version: fallback.model_version,
      model_source: "rule_based_ai_orchestrator",
      confidence_score: fallback.confidence_score,
      metadata: {
        source: "rule_based",
        fallback_reason: "ML serving unavailable",
      },
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  await supabase
    .from("risk_predictions")
    .update({ is_active: false })
    .eq("student_id", studentId)
    .eq("is_active", true);

  const { data: savedPrediction, error: saveError } = await supabase
    .from("risk_predictions")
    .insert({
      student_id: studentId,
      prediction_date: new Date().toISOString(),
      dropout_risk_score: normalized.dropout_risk_score,
      burnout_risk_score: normalized.burnout_risk_score,
      disengagement_risk_score: normalized.disengagement_risk_score,
      risk_level: normalized.risk_level,
      primary_risk_factors: normalized.primary_risk_factors,
      protective_factors: normalized.protective_factors,
      recommended_interventions: normalized.recommended_interventions,
      early_warning_flags: normalized.early_warning_flags,
      model_version: normalized.model_version,
      model_source: normalized.model_source,
      confidence_score: normalized.confidence_score,
      metadata: normalized.metadata,
      expires_at: normalized.expires_at,
      is_active: true,
    })
    .select()
    .single();

  if (saveError) throw saveError;

  await supabase
    .from("students")
    .update({ risk_score: normalized.dropout_risk_score })
    .eq("user_id", studentId);

  const alertCreated = await maybeCreateRiskAlert(
    supabase,
    student,
    normalized,
    studentId
  );

  return successResponse({
    prediction: savedPrediction,
    behavioral_patterns_analyzed: patterns.length,
    alert_created: alertCreated,
    source: normalized.model_source,
  });
}

async function callModelServing(studentId: string) {
  if (!ML_SERVING_URL) return null;

  try {
    const response = await fetchWithRetry(
      `${ML_SERVING_URL}/predict/risk`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId }),
      },
      {
        attempts: 2,
        backoffMs: 500,
        onRetry: (error, attempt) => {
          console.warn(`ML serving retry #${attempt + 1} for student ${studentId}`, error);
        },
      }
    );

    if (!response.ok) {
      const message = `ML serving risk prediction failed with status ${response.status}`;
      if (typeof Sentry.captureMessage === "function") {
        Sentry.captureMessage(message, {
          level: "warning",
          extra: { studentId, status: response.status },
        });
      }
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn("ML serving request failed", error);
    return null;
  }
}

function mapServingPrediction(response: any, protectiveFactors: string[]): NormalizedRisk {
  const dropout = response?.dropout;
  const burnout = response?.burnout;

  if (!dropout || !burnout) {
    return {
      dropout_risk_score: 0,
      burnout_risk_score: 0,
      disengagement_risk_score: 0,
      risk_level: "low",
      primary_risk_factors: [],
      protective_factors: protectiveFactors,
      recommended_interventions: [],
      early_warning_flags: [],
      model_version: "ml-serving",
      model_source: "ml-serving",
      confidence_score: 0.75,
      metadata: response,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  const combinedFlags = Array.from(
    new Set([...(dropout.factors || []), ...(burnout.factors || [])])
  );

  const recommendations = Array.from(
    new Set([...(dropout.recommendations || []), ...(burnout.recommendations || [])])
  );

  const modelVersion = dropout?.metadata?.model_version || "ml-serving";
  const modelSource = dropout?.metadata?.model_name || "ml-serving";
  const fallbackReason = dropout?.metadata?.fallback_reason || burnout?.metadata?.fallback_reason;

  return {
    dropout_risk_score: dropout.score,
    burnout_risk_score: burnout.score,
    disengagement_risk_score: response.disengagement_score,
    risk_level: dropout.level,
    primary_risk_factors: dropout.factors || [],
    protective_factors: protectiveFactors,
    recommended_interventions: recommendations,
    early_warning_flags: combinedFlags,
    model_version: modelVersion,
    model_source: fallbackReason ? `${modelSource}-fallback` : modelSource,
    confidence_score: fallbackReason ? 0.72 : 0.86,
    metadata: {
      ...response,
      fallback_reason: fallbackReason,
    },
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

function deriveProtectiveFactors(patterns: BehavioralPattern[]): string[] {
  if (!patterns || patterns.length === 0) {
    return [];
  }

  const recent = patterns.slice(0, 14);
  const engagementScores = recent.map((p) => p.engagement_score || 0);
  const emotionScores = recent.map((p) => p.avg_emotion_score || 0);
  const avgEngagement = average(engagementScores);
  const avgEmotion = average(emotionScores);
  const chatActivity = recent.reduce((sum, p) => sum + (p.chat_message_count || 0), 0);

  const protective: string[] = [];
  if (avgEngagement >= 60) protective.push("Consistent engagement over the last two weeks");
  if (avgEmotion >= 5) protective.push("Positive emotional baseline maintained");
  if (chatActivity >= 5) protective.push("Active conversations with mentors/peers");

  return protective;
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

async function maybeCreateRiskAlert(
  supabase: any,
  student: any,
  normalized: NormalizedRisk,
  studentId: string
) {
  if (normalized.risk_level !== "high" && normalized.risk_level !== "critical") {
    return false;
  }

  const { data: teacher } = await supabase
    .from("teachers")
    .select("user_id, assigned_batches")
    .contains("assigned_batches", [student.batch])
    .limit(1)
    .single();

  await supabase.from("risk_alerts").insert({
    student_id: studentId,
    teacher_id: teacher?.user_id || null,
    alert_type: "dropout_risk",
    severity: normalized.risk_level,
    message: `Student showing ${normalized.risk_level} dropout risk (${normalized.dropout_risk_score.toFixed(1)}/100)`,
    risk_score: normalized.dropout_risk_score,
    recommended_actions: normalized.recommended_interventions,
  });

  return true;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("student_id");

    if (!studentId) {
      return errorResponse("student_id is required", 400);
    }

    const { data: prediction, error } = await supabase
      .from("risk_predictions")
      .select("*")
      .eq("student_id", studentId)
      .eq("is_active", true)
      .order("prediction_date", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (!prediction) {
      return successResponse({
        prediction: null,
        message: "No recent prediction found. Run POST /api/ml/predict-risk to generate one.",
      });
    }

    return successResponse({ prediction });
  } catch (error) {
    return handleApiError(error);
  }
}


