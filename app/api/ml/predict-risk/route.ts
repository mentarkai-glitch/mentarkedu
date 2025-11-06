import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import { calculateDropoutRisk } from "@/lib/ml/risk-predictor";
import type { BehavioralPattern } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get current user or student_id from body
    const body = await request.json();
    const { student_id } = body;

    if (!student_id) {
      return errorResponse("student_id is required", 400);
    }

    // Get student profile
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select(`
        *,
        users!inner (
          full_name,
          email
        )
      `)
      .eq('user_id', student_id)
      .single();

    if (studentError) throw studentError;

    // Get behavioral patterns (last 60 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const { data: patterns, error: patternsError } = await supabase
      .from('behavioral_patterns')
      .select('*')
      .eq('student_id', student_id)
      .gte('pattern_date', sixtyDaysAgo.toISOString().split('T')[0])
      .order('pattern_date', { ascending: false });

    if (patternsError) throw patternsError;

    // If no patterns exist, calculate them first
    if (!patterns || patterns.length === 0) {
      // Calculate last 7 days of patterns
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        await supabase.rpc('calculate_daily_behavioral_pattern', {
          p_student_id: student_id,
          p_date: dateStr
        });
      }

      // Re-fetch patterns
      const { data: newPatterns } = await supabase
        .from('behavioral_patterns')
        .select('*')
        .eq('student_id', student_id)
        .order('pattern_date', { ascending: false });

      if (newPatterns) {
        return await generatePrediction(student_id, newPatterns, student, supabase);
      }
    }

    return await generatePrediction(student_id, patterns || [], student, supabase);
  } catch (error) {
    return handleApiError(error);
  }
}

async function generatePrediction(
  studentId: string,
  patterns: BehavioralPattern[],
  student: any,
  supabase: any
) {
  // Calculate risk using ML model
  const prediction = await calculateDropoutRisk(
    studentId,
    patterns,
    student
  );

  // Save prediction to database
  const { data: savedPrediction, error: saveError } = await supabase
    .from('risk_predictions')
    .insert({
      student_id: studentId,
      dropout_risk_score: prediction.dropout_risk_score,
      burnout_risk_score: prediction.burnout_risk_score,
      disengagement_risk_score: prediction.disengagement_risk_score,
      risk_level: prediction.risk_level,
      primary_risk_factors: prediction.primary_risk_factors,
      protective_factors: prediction.protective_factors,
      recommended_interventions: prediction.recommended_interventions,
      early_warning_flags: prediction.early_warning_flags,
      model_version: prediction.model_version,
      confidence_score: prediction.confidence_score,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Expires in 7 days
    })
    .select()
    .single();

  if (saveError) throw saveError;

  // Update student's risk_score in students table
  await supabase
    .from('students')
    .update({ risk_score: prediction.dropout_risk_score })
    .eq('user_id', studentId);

  // Create alert if risk is high or critical
  if (prediction.risk_level === 'high' || prediction.risk_level === 'critical') {
    // Get assigned teacher
    const { data: assignment } = await supabase
      .from('teacher_student_assignments')
      .select('teacher_id')
      .eq('student_id', studentId)
      .eq('is_active', true)
      .limit(1)
      .single();

    await supabase
      .from('risk_alerts')
      .insert({
        student_id: studentId,
        teacher_id: assignment?.teacher_id,
        alert_type: 'dropout_risk',
        severity: prediction.risk_level,
        message: `Student showing ${prediction.risk_level} dropout risk (${prediction.dropout_risk_score}/100)`,
        risk_score: prediction.dropout_risk_score,
        recommended_actions: prediction.recommended_interventions
      });
  }

  return successResponse({
    prediction: savedPrediction,
    behavioral_patterns_analyzed: patterns.length,
    alert_created: prediction.risk_level === 'high' || prediction.risk_level === 'critical'
  });
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');

    if (!studentId) {
      return errorResponse("student_id is required", 400);
    }

    // Get latest active prediction
    const { data: prediction, error } = await supabase
      .from('risk_predictions')
      .select('*')
      .eq('student_id', studentId)
      .eq('is_active', true)
      .order('prediction_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!prediction) {
      return successResponse({
        prediction: null,
        message: "No recent prediction found. Run POST /api/ml/predict-risk to generate one."
      });
    }

    return successResponse({ prediction });
  } catch (error) {
    return handleApiError(error);
  }
}


