/**
 * Cutoff Predictor Agent
 * Predicts college admission cutoffs using historical data, trends, and AI
 */

import { BaseAgent, type AgentContext, type AgentResult } from "./agent-framework";
import { createClient } from "@/lib/supabase/server";
import { aiOrchestrator } from "@/lib/ai/orchestrator";
import type { AIContext } from "@/lib/types";

export class CutoffPredictorAgent extends BaseAgent {
  constructor() {
    super();
  }

  getType(): "career_guide" {
    return "career_guide";
  }

  /**
   * Predict cutoffs for colleges and courses
   */
  async execute(context: AgentContext): Promise<AgentResult> {
    const supabase = await createClient();

    try {
      const { college_ids, course_ids, target_year } = context.metadata || {};

      if (!target_year) {
        return {
          success: false,
          actions: [],
          error: "Target year is required",
        };
      }

      let predictions = [];

      // If specific colleges/courses requested
      if (college_ids || course_ids) {
        predictions = await this.predictSpecificCutoffs(college_ids, course_ids, target_year);
      } else {
        // Get all colleges needing predictions
        predictions = await this.predictAllCutoffs(target_year);
      }

      // Store predictions
      for (const prediction of predictions) {
        await this.storePrediction(prediction, target_year);
      }

      const actions = [
        `Analyzed historical cutoff trends`,
        `Generated predictions for ${predictions.length} college-course combinations`,
        `Average confidence: ${this.calculateAvgConfidence(predictions)}%`,
      ];

      return {
        success: true,
        actions,
        data: {
          predictions,
          total: predictions.length,
          avg_confidence: this.calculateAvgConfidence(predictions),
        },
        metadata: {
          target_year,
          execution_time: Date.now(),
        },
      };
    } catch (error: any) {
      console.error("Cutoff Predictor Agent error:", error);
      return {
        success: false,
        actions: [],
        error: error.message,
      };
    }
  }

  /**
   * Predict cutoffs for specific colleges/courses
   */
  private async predictSpecificCutoffs(
    collegeIds?: string[],
    courseIds?: string[],
    targetYear?: number
  ): Promise<any[]> {
    const supabase = await createClient();

    let query = supabase.from("college_courses").select(`
      *,
      colleges (*)
    `);

    if (collegeIds && collegeIds.length > 0) {
      query = query.in("college_id", collegeIds);
    }

    if (courseIds && courseIds.length > 0) {
      query = query.in("id", courseIds);
    }

    const { data: courses, error } = await query;

    if (error || !courses) {
      return [];
    }

    const predictions = [];
    for (const course of courses) {
      const prediction = await this.generateCutoffPrediction(course, targetYear || 2025);
      predictions.push(prediction);
    }

    return predictions;
  }

  /**
   * Predict cutoffs for all active colleges
   */
  private async predictAllCutoffs(targetYear: number): Promise<any[]> {
    const supabase = await createClient();

    const { data: courses } = await supabase
      .from("college_courses")
      .select(
        `
        *,
        colleges (*)
      `
      )
      .eq("colleges.is_active", true)
      .limit(100); // Limit for performance

    if (!courses) return [];

    const predictions = [];
    for (const course of courses) {
      const prediction = await this.generateCutoffPrediction(course, targetYear);
      predictions.push(prediction);
    }

    return predictions;
  }

  /**
   * Generate cutoff prediction for a course
   */
  private async generateCutoffPrediction(course: any, targetYear: number): Promise<any> {
    // Method 1: Historical Trend Analysis
    const trendBased = this.analyzeHistoricalTrends(course);

    // Method 2: AI-Based Prediction
    const aiBased = await this.aiPredictCutoff(course, targetYear);

    // Ensemble: Combine both methods
    const prediction = this.combinePredictions(trendBased, aiBased);

    return {
      college_id: course.college_id,
      course_id: course.id,
      target_year: targetYear,
      predicted_cutoff_general: prediction.cutoff,
      predicted_cutoff_obc: prediction.cutoff * 1.2,
      predicted_cutoff_sc: prediction.cutoff * 3.0,
      predicted_cutoff_st: prediction.cutoff * 3.5,
      predicted_cutoff_ews: prediction.cutoff * 1.15,
      prediction_confidence: prediction.confidence,
      methodology: "ensemble_trend_ai",
      pessimistic_cutoff: prediction.cutoff * 0.9,
      optimistic_cutoff: prediction.cutoff * 1.1,
      trend_direction: prediction.trend,
      trend_magnitude: prediction.magnitude,
      last_5_years_avg: trendBased.avg_cutoff,
      standard_deviation: trendBased.std_dev,
      factors: prediction.factors,
    };
  }

  /**
   * Analyze historical cutoff trends
   */
  private analyzeHistoricalTrends(course: any): any {
    const history = course.cutoff_history || [];

    if (history.length === 0) {
      return {
        trend: "stable",
        magnitude: 0,
        avg_cutoff: course.cutoff_last_year?.general || 10000,
        std_dev: 0,
        confidence: 30, // Low confidence with no data
      };
    }

    // Calculate trend
    let sum = 0;
    const changes = [];
    for (let i = 0; i < history.length - 1; i++) {
      const change = ((history[i + 1].cutoff - history[i].cutoff) / history[i].cutoff) * 100;
      changes.push(change);
      sum += history[i].cutoff;
    }
    sum += history[history.length - 1].cutoff;

    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length || 0;
    const avgCutoff = sum / history.length;
    const recentCutoff = history[history.length - 1].cutoff;

    // Calculate standard deviation
    const variance = history.reduce((acc: number, val: any) => {
      return acc + Math.pow(val.cutoff - avgCutoff, 2);
    }, 0) / history.length;
    const stdDev = Math.sqrt(variance);

    // Determine trend
    let trend = "stable";
    if (avgChange > 5) trend = "rising";
    else if (avgChange < -5) trend = "falling";
    else if (stdDev > avgCutoff * 0.2) trend = "volatile";

    // Confidence based on data quality
    let confidence = 60;
    if (history.length >= 5) confidence = 80;
    if (history.length >= 10) confidence = 90;
    if (stdDev > avgCutoff * 0.3) confidence *= 0.7; // Reduce confidence for volatile data

    // Predict next year
    const predictedCutoff = recentCutoff * (1 + avgChange / 100);

    return {
      trend,
      magnitude: Math.abs(avgChange),
      avg_cutoff: avgCutoff,
      std_dev: stdDev,
      predicted_cutoff: predictedCutoff,
      confidence: Math.min(95, confidence),
    };
  }

  /**
   * Use AI to predict cutoff
   */
  private async aiPredictCutoff(course: any, targetYear: number): Promise<any> {
    const prompt = `Predict the admission cutoff for ${course.colleges.name} - ${course.name} for the year ${targetYear}.

**Current Information:**
- College: ${course.colleges.name} (${course.colleges.type}, ${course.colleges.tier})
- Course: ${course.name}
- Location: ${course.colleges.city}, ${course.colleges.state}
- Last Year Cutoff: ${course.cutoff_last_year?.general || "Not available"}
- Historical Trend: ${course.cutoff_history ? `${course.cutoff_history.length} years of data` : "Limited data"}
- Seat Intake: ${course.intake || "Not available"}
- Exam Type: ${course.exam_type?.join(", ") || "Unknown"}

**Your Task:**
Analyze the current educational landscape for competitive exams in India. Consider:
1. Recent exam difficulty trends
2. Number of applicants vs. available seats
3. Government policies affecting admissions
4. Economic factors
5. Competition levels

Provide:
1. Predicted cutoff rank (general category)
2. Confidence level (0-100%)
3. Trend direction (rising/falling/stable/volatile)
4. Key factors influencing this prediction

Return ONLY a JSON object:
{
  "predicted_cutoff": 15000,
  "confidence": 75,
  "trend": "rising",
  "factors": {
    "exam_difficulty_change": -5,
    "applicant_increase": 8,
    "seat_change": 0,
    "other_factors": "High competition due to digital transformation"
  },
  "reasoning": "Brief explanation"
}`;

    try {
      const aiContext: AIContext = {
        task: "prediction",
        user_id: "system",
        session_id: `cutoff_predictor_${Date.now()}`,
        metadata: {
          system_prompt: "You are an expert college admission analyst with deep knowledge of Indian competitive exams and admission trends.",
          user_tier: "enterprise",
        },
      };

      const response = await aiOrchestrator(aiContext, prompt);

      // Parse AI response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error("Error in AI prediction:", error);
    }

    // Fallback
    return {
      predicted_cutoff: course.cutoff_last_year?.general || 10000,
      confidence: 40,
      trend: "stable",
      factors: {},
      reasoning: "Limited data available",
    };
  }

  /**
   * Combine trend-based and AI-based predictions
   */
  private combinePredictions(trendBased: any, aiBased: any): any {
    // Weight based on confidence
    const trendWeight = trendBased.confidence / 100;
    const aiWeight = aiBased.confidence / 100;
    const totalWeight = trendWeight + aiWeight;

    const combinedCutoff =
      totalWeight > 0
        ? (trendBased.predicted_cutoff * trendWeight + aiBased.predicted_cutoff * aiWeight) /
          totalWeight
        : trendBased.predicted_cutoff || aiBased.predicted_cutoff;

    const combinedConfidence = Math.min(95, (trendBased.confidence + aiBased.confidence) / 2);

    // Combine trend indicators
    let trend = trendBased.trend;
    if (trendBased.trend === "stable" && aiBased.trend !== "stable") {
      trend = aiBased.trend;
    }

    return {
      cutoff: Math.round(combinedCutoff),
      confidence: combinedConfidence,
      trend,
      magnitude: trendBased.magnitude || 0,
      factors: {
        ...aiBased.factors,
        historical_trend: trendBased.trend,
        volatility: trendBased.std_dev > trendBased.avg_cutoff * 0.2 ? "high" : "normal",
      },
    };
  }

  /**
   * Calculate average confidence
   */
  private calculateAvgConfidence(predictions: any[]): number {
    if (predictions.length === 0) return 0;
    const sum = predictions.reduce((acc, p) => acc + p.prediction_confidence, 0);
    return Math.round(sum / predictions.length);
  }

  /**
   * Store prediction in database
   */
  private async storePrediction(prediction: any, targetYear: number): Promise<void> {
    const supabase = await createClient();

    // Upsert prediction
    await supabase.from("cutoff_predictions").upsert(
      {
        college_id: prediction.college_id,
        course_id: prediction.course_id,
        target_year: targetYear,
        predicted_cutoff_general: prediction.predicted_cutoff_general,
        predicted_cutoff_obc: prediction.predicted_cutoff_obc,
        predicted_cutoff_sc: prediction.predicted_cutoff_sc,
        predicted_cutoff_st: prediction.predicted_cutoff_st,
        predicted_cutoff_ews: prediction.predicted_cutoff_ews,
        prediction_confidence: prediction.prediction_confidence,
        methodology: prediction.methodology,
        pessimistic_cutoff: prediction.pessimistic_cutoff,
        optimistic_cutoff: prediction.optimistic_cutoff,
        trend_direction: prediction.trend_direction,
        trend_magnitude: prediction.trend_magnitude,
        last_5_years_avg: prediction.last_5_years_avg,
        standard_deviation: prediction.standard_deviation,
        factors: prediction.factors,
      },
      {
        onConflict: "college_id,course_id,target_year",
        ignoreDuplicates: false,
      }
    );
  }
}


