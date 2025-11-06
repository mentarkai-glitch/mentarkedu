/**
 * ML-Powered Dropout Risk Prediction System
 * Uses behavioral patterns and AI analysis to predict student risk levels
 */

import { aiOrchestrator } from "@/lib/ai/orchestrator";
import type { AIContext, BehavioralPattern, RiskPrediction } from "@/lib/types";

export interface RiskFactors {
  engagement: {
    score: number; // 0-100
    trend: 'improving' | 'stable' | 'declining';
    flags: string[];
  };
  emotional: {
    score: number; // 0-100
    trend: 'improving' | 'stable' | 'declining';
    flags: string[];
  };
  performance: {
    score: number; // 0-100
    trend: 'improving' | 'stable' | 'declining';
    flags: string[];
  };
  social: {
    score: number; // 0-100
    flags: string[];
  };
}

/**
 * Calculate dropout risk score using ML-assisted analysis
 */
export async function calculateDropoutRisk(
  studentId: string,
  behavioralPatterns: BehavioralPattern[],
  studentProfile: any
): Promise<RiskPrediction> {
  
  // Step 1: Extract features from behavioral patterns
  const features = extractFeatures(behavioralPatterns, studentProfile);
  
  // Step 2: Calculate component scores
  const riskFactors = analyzeRiskFactors(features);
  
  // Step 3: Use AI to enhance prediction with contextual understanding
  const aiEnhancedRisk = await getAIRiskAssessment(studentId, features, riskFactors, studentProfile);
  
  // Step 4: Combine scores into final prediction
  const finalPrediction = combineRiskScores(riskFactors, aiEnhancedRisk);
  
  return finalPrediction;
}

/**
 * Extract ML features from behavioral patterns
 */
function extractFeatures(patterns: BehavioralPattern[], profile: any) {
  const recent30Days = patterns.slice(0, 30);
  const recent7Days = patterns.slice(0, 7);
  
  return {
    // Engagement features
    avgEngagementScore: avg(recent30Days.map(p => p.engagement_score)),
    engagementTrend: calculateTrend(recent30Days.map(p => p.engagement_score)),
    checkinCompletionRate: recent30Days.filter(p => p.daily_checkin_completed).length / 30,
    currentStreak: getCurrentStreak(patterns),
    longestMissedStreak: getLongestMissedStreak(patterns),
    
    // Emotional features
    avgEmotion: avg(recent30Days.map(p => p.avg_emotion_score)),
    emotionTrend: calculateTrend(recent30Days.map(p => p.avg_emotion_score)),
    avgEnergy: avg(recent30Days.map(p => p.avg_energy_level)),
    avgStress: profile.onboarding_profile?.stress_level || 5,
    stressIncreaseDays: recent30Days.filter(p => p.high_stress_days > 0).length,
    
    // Performance features
    arkProgressRate: avg(recent30Days.map(p => p.ark_progress_delta)),
    progressDeclineDays: recent30Days.filter(p => p.declining_progress_days > 0).length,
    xpEarnedRate: avg(recent30Days.map(p => p.xp_earned || 0)),
    milestoneCompletionRate: avg(recent30Days.map(p => p.milestone_completed_count || 0)),
    
    // Social features
    chatActivityRate: avg(recent30Days.map(p => p.chat_message_count)),
    interventionCount: sum(recent30Days.map(p => p.intervention_count)),
    
    // Motivation features
    avgMotivation: profile.onboarding_profile?.motivation_level || 7,
    motivationTrend: calculateTrend(recent7Days.map(p => p.avg_progress_rating)),
    
    // Recent changes (last 7 days vs previous 7 days)
    recentEngagementChange: calculateRecentChange(patterns, 'engagement_score'),
    recentEmotionChange: calculateRecentChange(patterns, 'avg_emotion_score'),
    recentPerformanceChange: calculateRecentChange(patterns, 'performance_score'),
    
    // Profile factors
    gradeLevel: parseInt(profile.grade) || 10,
    hasOnboarding: !!profile.onboarding_profile,
    baselineConfidence: profile.onboarding_profile?.confidence_level || 6
  };
}

/**
 * Analyze risk factors from features
 */
function analyzeRiskFactors(features: any): RiskFactors {
  // Engagement analysis
  const engagementScore = calculateEngagementScore(features);
  const engagementFlags: string[] = [];
  if (features.checkinCompletionRate < 0.5) engagementFlags.push("Low check-in completion");
  if (features.longestMissedStreak > 5) engagementFlags.push("Extended absence");
  if (features.chatActivityRate < 2) engagementFlags.push("Low chat engagement");
  
  // Emotional analysis
  const emotionalScore = calculateEmotionalScore(features);
  const emotionalFlags: string[] = [];
  if (features.avgEmotion < 4) emotionalFlags.push("Low emotional state");
  if (features.stressIncreaseDays > 15) emotionalFlags.push("High stress frequency");
  if (features.avgEnergy < 4) emotionalFlags.push("Low energy levels");
  
  // Performance analysis
  const performanceScore = calculatePerformanceScore(features);
  const performanceFlags: string[] = [];
  if (features.arkProgressRate < 0) performanceFlags.push("Declining ARK progress");
  if (features.progressDeclineDays > 10) performanceFlags.push("Consistent underperformance");
  if (features.xpEarnedRate < 20) performanceFlags.push("Low XP earning");
  
  // Social analysis
  const socialScore = calculateSocialScore(features);
  const socialFlags: string[] = [];
  if (features.interventionCount > 3) socialFlags.push("Multiple interventions needed");
  if (features.chatActivityRate === 0) socialFlags.push("No social engagement");
  
  return {
    engagement: {
      score: engagementScore,
      trend: features.engagementTrend,
      flags: engagementFlags
    },
    emotional: {
      score: emotionalScore,
      trend: features.emotionTrend,
      flags: emotionalFlags
    },
    performance: {
      score: performanceScore,
      trend: features.arkProgressRate >= 0 ? 'improving' : 'declining',
      flags: performanceFlags
    },
    social: {
      score: socialScore,
      flags: socialFlags
    }
  };
}

/**
 * Get AI-enhanced risk assessment
 */
async function getAIRiskAssessment(
  studentId: string,
  features: any,
  riskFactors: RiskFactors,
  profile: any
): Promise<any> {
  const prompt = `Analyze this student's dropout risk based on behavioral patterns and provide actionable insights.

**Student Profile:**
- Grade: ${profile.grade}
- Onboarding Complete: ${features.hasOnboarding ? 'Yes' : 'No'}
- Baseline Motivation: ${features.avgMotivation}/10
- Baseline Confidence: ${features.baselineConfidence}/10

**Behavioral Analysis (Last 30 Days):**

**Engagement:**
- Score: ${riskFactors.engagement.score}/100
- Trend: ${riskFactors.engagement.trend}
- Check-in Rate: ${(features.checkinCompletionRate * 100).toFixed(1)}%
- Current Streak: ${features.currentStreak} days
- Longest Gap: ${features.longestMissedStreak} days
- Flags: ${riskFactors.engagement.flags.join(', ') || 'None'}

**Emotional State:**
- Score: ${riskFactors.emotional.score}/100
- Trend: ${riskFactors.emotional.trend}
- Avg Emotion: ${features.avgEmotion}/10
- Avg Energy: ${features.avgEnergy}/10
- High Stress Days: ${features.stressIncreaseDays}
- Flags: ${riskFactors.emotional.flags.join(', ') || 'None'}

**Performance:**
- Score: ${riskFactors.performance.score}/100
- ARK Progress Rate: ${features.arkProgressRate.toFixed(2)}% per day
- Declining Days: ${features.progressDeclineDays}
- XP Earning Rate: ${features.xpEarnedRate.toFixed(1)} XP/day
- Flags: ${riskFactors.performance.flags.join(', ') || 'None'}

**Social:**
- Score: ${riskFactors.social.score}/100
- Chat Activity: ${features.chatActivityRate.toFixed(1)} messages/day
- Interventions Needed: ${features.interventionCount}
- Flags: ${riskFactors.social.flags.join(', ') || 'None'}

**Task:**
1. Calculate dropout risk (0-100)
2. Calculate burnout risk (0-100)
3. Calculate disengagement risk (0-100)
4. Identify top 3 risk factors
5. Identify protective factors
6. Recommend 3 specific interventions

**Output Format (JSON only):**
{
  "dropout_risk": 65,
  "burnout_risk": 72,
  "disengagement_risk": 58,
  "risk_level": "high",
  "primary_risk_factors": ["Low check-in completion", "High stress days", "Declining progress"],
  "protective_factors": ["Good baseline motivation", "Has onboarding profile"],
  "recommended_interventions": [
    {
      "type": "meeting",
      "title": "One-on-one check-in",
      "priority": "high",
      "description": "Discuss stress management and progress challenges"
    }
  ],
  "early_warning_flags": ["Extended absence pattern", "Emotional decline"],
  "confidence": 0.85
}

Return ONLY the JSON object.`;

  try {
    const context: AIContext = {
      task: "prediction",
      user_id: studentId,
      metadata: {
        features,
        riskFactors
      }
    };

    const aiResponse = await aiOrchestrator(context, prompt);
    
    // Parse AI response
    const jsonMatch = aiResponse.content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : aiResponse.content;
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('AI risk assessment failed:', error);
    // Fallback to rule-based prediction
    return getFallbackRiskAssessment(riskFactors);
  }
}

/**
 * Combine scores into final prediction
 */
function combineRiskScores(riskFactors: RiskFactors, aiAssessment: any): RiskPrediction {
  const dropoutRisk = aiAssessment.dropout_risk || calculateDropoutScore(riskFactors);
  const burnoutRisk = aiAssessment.burnout_risk || calculateBurnoutScore(riskFactors);
  const disengagementRisk = aiAssessment.disengagement_risk || calculateDisengagementScore(riskFactors);
  
  // Determine overall risk level
  const maxRisk = Math.max(dropoutRisk, burnoutRisk, disengagementRisk);
  const riskLevel = maxRisk >= 75 ? 'critical' :
                   maxRisk >= 55 ? 'high' :
                   maxRisk >= 35 ? 'medium' : 'low';

  return {
    id: '', // Will be set by database
    student_id: '', // Will be set by caller
    prediction_date: new Date().toISOString(),
    dropout_risk_score: dropoutRisk,
    burnout_risk_score: burnoutRisk,
    disengagement_risk_score: disengagementRisk,
    risk_level: riskLevel,
    primary_risk_factors: aiAssessment.primary_risk_factors || [],
    protective_factors: aiAssessment.protective_factors || [],
    recommended_interventions: aiAssessment.recommended_interventions || [],
    early_warning_flags: aiAssessment.early_warning_flags || [],
    model_version: 'v1.0-ai-enhanced',
    confidence_score: aiAssessment.confidence || 0.75
  };
}

// ==================== HELPER FUNCTIONS ====================

function avg(arr: number[]): number {
  return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

function calculateTrend(values: number[]): 'improving' | 'stable' | 'declining' {
  if (values.length < 2) return 'stable';
  
  const recent = values.slice(0, 7);
  const previous = values.slice(7, 14);
  
  const recentAvg = avg(recent);
  const previousAvg = avg(previous);
  
  const change = recentAvg - previousAvg;
  
  if (change > 0.5) return 'improving';
  if (change < -0.5) return 'declining';
  return 'stable';
}

function getCurrentStreak(patterns: BehavioralPattern[]): number {
  let streak = 0;
  for (const pattern of patterns) {
    if (pattern.daily_checkin_completed) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function getLongestMissedStreak(patterns: BehavioralPattern[]): number {
  let maxStreak = 0;
  let currentStreak = 0;
  
  for (const pattern of patterns) {
    if (!pattern.daily_checkin_completed) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  return maxStreak;
}

function calculateRecentChange(patterns: BehavioralPattern[], field: keyof BehavioralPattern): number {
  const recent7 = patterns.slice(0, 7);
  const previous7 = patterns.slice(7, 14);
  
  const recentAvg = avg(recent7.map(p => p[field] as number));
  const previousAvg = avg(previous7.map(p => p[field] as number));
  
  return recentAvg - previousAvg;
}

function calculateEngagementScore(features: any): number {
  let score = 50; // Baseline
  
  // Check-in completion (30 points)
  score += features.checkinCompletionRate * 30;
  
  // Streak bonus (20 points)
  score += Math.min(features.currentStreak / 30, 1) * 20;
  
  // Chat activity (20 points)
  score += Math.min(features.chatActivityRate / 5, 1) * 20;
  
  // XP earning (20 points)
  score += Math.min(features.xpEarnedRate / 50, 1) * 20;
  
  // Penalty for long gaps
  score -= Math.min(features.longestMissedStreak * 5, 30);
  
  return Math.max(0, Math.min(100, score));
}

function calculateEmotionalScore(features: any): number {
  let score = 50; // Baseline
  
  // Average emotion (40 points)
  score += (features.avgEmotion / 10) * 40;
  
  // Energy levels (30 points)
  score += (features.avgEnergy / 10) * 30;
  
  // Trend bonus/penalty (20 points)
  if (features.emotionTrend === 'improving') score += 20;
  if (features.emotionTrend === 'declining') score -= 20;
  
  // Stress penalty (up to -20 points)
  score -= Math.min(features.stressIncreaseDays, 20);
  
  return Math.max(0, Math.min(100, score));
}

function calculatePerformanceScore(features: any): number {
  let score = 50; // Baseline
  
  // ARK progress (40 points)
  score += Math.min(Math.max(features.arkProgressRate * 10, -40), 40);
  
  // XP earning (30 points)
  score += Math.min(features.xpEarnedRate / 2, 30);
  
  // Milestone completion (20 points)
  score += features.milestoneCompletionRate * 20;
  
  // Declining days penalty
  score -= Math.min(features.progressDeclineDays * 2, 30);
  
  return Math.max(0, Math.min(100, score));
}

function calculateSocialScore(features: any): number {
  let score = 70; // Baseline (social is less critical)
  
  // Chat activity (40 points)
  score += Math.min(features.chatActivityRate * 5, 40);
  
  // Intervention penalty
  score -= features.interventionCount * 10;
  
  return Math.max(0, Math.min(100, score));
}

function calculateDropoutScore(factors: RiskFactors): number {
  // Weighted combination
  const weights = {
    engagement: 0.35,
    emotional: 0.25,
    performance: 0.30,
    social: 0.10
  };
  
  const inverseScore = 
    (100 - factors.engagement.score) * weights.engagement +
    (100 - factors.emotional.score) * weights.emotional +
    (100 - factors.performance.score) * weights.performance +
    (100 - factors.social.score) * weights.social;
  
  return Math.round(inverseScore);
}

function calculateBurnoutScore(factors: RiskFactors): number {
  // Burnout is primarily emotional + performance stress
  const emotionalRisk = 100 - factors.emotional.score;
  const performanceStress = factors.performance.score < 50 ? 50 : 0;
  
  return Math.round((emotionalRisk * 0.7) + (performanceStress * 0.3));
}

function calculateDisengagementScore(factors: RiskFactors): number {
  // Disengagement is primarily engagement + social
  const engagementRisk = 100 - factors.engagement.score;
  const socialRisk = 100 - factors.social.score;
  
  return Math.round((engagementRisk * 0.7) + (socialRisk * 0.3));
}

function getFallbackRiskAssessment(factors: RiskFactors): any {
  return {
    dropout_risk: calculateDropoutScore(factors),
    burnout_risk: calculateBurnoutScore(factors),
    disengagement_risk: calculateDisengagementScore(factors),
    risk_level: 'medium',
    primary_risk_factors: [
      ...factors.engagement.flags,
      ...factors.emotional.flags,
      ...factors.performance.flags
    ].slice(0, 3),
    protective_factors: ["Enrolled in program", "Has support system"],
    recommended_interventions: [
      {
        type: "meeting",
        title: "Check-in meeting",
        priority: "medium",
        description: "Schedule a one-on-one to discuss progress"
      }
    ],
    early_warning_flags: [],
    confidence: 0.65
  };
}

