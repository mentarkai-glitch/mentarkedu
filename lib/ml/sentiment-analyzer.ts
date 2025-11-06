/**
 * AI-Powered Sentiment Analysis and Timeline Tracking
 * Analyzes emotional patterns and correlates with events
 */

import { aiOrchestrator } from "@/lib/ai/orchestrator";
import type { AIContext, SentimentRecord } from "@/lib/types";

export interface SentimentAnalysisInput {
  text: string;
  context?: string;
  previousSentiment?: number;
}

export interface SentimentAnalysisResult {
  overall_sentiment: number; // -1 to 1
  emotional_valence: number; // -1 to 1
  arousal_level: number; // 0 to 1
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    trust: number;
  };
  confidence: number;
  model_used: string;
}

/**
 * Analyze sentiment from text using Gemini (emotion specialist)
 */
export async function analyzeSentiment(
  input: SentimentAnalysisInput
): Promise<SentimentAnalysisResult> {
  
  const prompt = `Analyze the emotional sentiment and tone of this student's text.

**Text to Analyze:**
"${input.text}"

${input.context ? `**Context:** ${input.context}` : ''}
${input.previousSentiment ? `**Previous Sentiment:** ${input.previousSentiment.toFixed(2)} (-1 to 1 scale)` : ''}

**Task:**
Analyze the text and provide detailed sentiment scores.

**Sentiment Scales:**
- Overall Sentiment: -1 (very negative) to 1 (very positive)
- Emotional Valence: -1 (unpleasant) to 1 (pleasant)
- Arousal Level: 0 (calm) to 1 (excited/agitated)
- Emotions: 0 (not present) to 1 (strongly present)

**Output Format (JSON only):**
{
  "overall_sentiment": 0.45,
  "emotional_valence": 0.3,
  "arousal_level": 0.6,
  "emotions": {
    "joy": 0.7,
    "sadness": 0.1,
    "anger": 0.0,
    "fear": 0.2,
    "surprise": 0.4,
    "trust": 0.6
  },
  "confidence": 0.88,
  "reasoning": "Brief explanation of the analysis"
}

Return ONLY the JSON object.`;

  try {
    const context: AIContext = {
      task: "emotion",
      metadata: {
        input_text: input.text
      }
    };

    const aiResponse = await aiOrchestrator(context, prompt);
    
    // Parse response
    const jsonMatch = aiResponse.content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : aiResponse.content;
    const result = JSON.parse(jsonString);
    
    return {
      overall_sentiment: result.overall_sentiment,
      emotional_valence: result.emotional_valence,
      arousal_level: result.arousal_level,
      emotions: result.emotions,
      confidence: result.confidence,
      model_used: aiResponse.model
    };
  } catch (error) {
    console.error('Sentiment analysis failed:', error);
    // Fallback to simple keyword-based analysis
    return getFallbackSentiment(input.text);
  }
}

/**
 * Analyze sentiment trend over time period
 */
export function analyzeSentimentTrend(
  sentimentRecords: SentimentRecord[]
): {
  trend: 'improving' | 'stable' | 'declining';
  volatility: 'stable' | 'moderate' | 'volatile';
  avgSentiment: number;
  recentChange: number;
} {
  if (sentimentRecords.length < 7) {
    return {
      trend: 'stable',
      volatility: 'stable',
      avgSentiment: 0,
      recentChange: 0
    };
  }

  const recent7 = sentimentRecords.slice(0, 7);
  const previous7 = sentimentRecords.slice(7, 14);
  
  const recentAvg = avg(recent7.map(r => r.overall_sentiment));
  const previousAvg = avg(previous7.map(r => r.overall_sentiment));
  const change = recentAvg - previousAvg;
  
  // Calculate volatility (standard deviation)
  const values = recent7.map(r => r.overall_sentiment);
  const mean = recentAvg;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  return {
    trend: change > 0.1 ? 'improving' : change < -0.1 ? 'declining' : 'stable',
    volatility: stdDev > 0.3 ? 'volatile' : stdDev > 0.15 ? 'moderate' : 'stable',
    avgSentiment: recentAvg,
    recentChange: change
  };
}

/**
 * Detect sentiment anomalies
 */
export function detectSentimentAnomalies(
  sentimentRecords: SentimentRecord[],
  currentSentiment: number
): {
  isAnomaly: boolean;
  anomalyType?: 'sudden_drop' | 'sudden_spike' | 'unusual_pattern';
  severity?: 'minor' | 'moderate' | 'severe';
  expectedScore: number;
  deviation: number;
} {
  if (sentimentRecords.length < 7) {
    return {
      isAnomaly: false,
      expectedScore: 0,
      deviation: 0
    };
  }

  // Calculate expected sentiment (7-day average)
  const recent7 = sentimentRecords.slice(0, 7);
  const expectedScore = avg(recent7.map(r => r.overall_sentiment));
  const deviation = Math.abs(currentSentiment - expectedScore);
  
  // Calculate standard deviation for threshold
  const values = recent7.map(r => r.overall_sentiment);
  const mean = expectedScore;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  // Anomaly if deviation > 2 standard deviations
  const threshold = 2 * stdDev;
  const isAnomaly = deviation > threshold;
  
  if (!isAnomaly) {
    return {
      isAnomaly: false,
      expectedScore,
      deviation
    };
  }

  // Determine anomaly type
  const anomalyType = currentSentiment < expectedScore ? 'sudden_drop' : 'sudden_spike';
  
  // Determine severity
  const severity = deviation > 0.6 ? 'severe' :
                  deviation > 0.3 ? 'moderate' : 'minor';
  
  return {
    isAnomaly: true,
    anomalyType,
    severity,
    expectedScore,
    deviation
  };
}

/**
 * Calculate event-sentiment correlation
 */
export function calculateEventCorrelation(
  events: any[],
  sentimentRecords: SentimentRecord[]
): {
  eventType: string;
  correlationStrength: number;
  avgImpact: number;
  occurrences: number;
  typicalDelayHours: number;
} | null {
  if (events.length < 3) return null;

  const impacts = events
    .filter(e => e.sentiment_impact !== null)
    .map(e => e.sentiment_impact);

  if (impacts.length < 3) return null;

  const avgImpact = avg(impacts);
  const consistency = 1 - (Math.sqrt(variance(impacts)) / Math.abs(avgImpact || 1));
  
  // Calculate typical delay (average hours between event and sentiment change)
  const delays = events
    .filter(e => e.sentiment_before && e.sentiment_after)
    .map(e => {
      // Find sentiment record closest to event
      const eventDate = new Date(e.event_date);
      const closestRecord = sentimentRecords.find(r => 
        new Date(r.record_date) > eventDate
      );
      if (closestRecord) {
        return (new Date(closestRecord.record_date).getTime() - eventDate.getTime()) / (1000 * 60 * 60);
      }
      return 24; // Default 24 hours
    });

  return {
    eventType: events[0].event_type,
    correlationStrength: consistency * Math.sign(avgImpact),
    avgImpact,
    occurrences: events.length,
    typicalDelayHours: Math.round(avg(delays))
  };
}

// ==================== HELPER FUNCTIONS ====================

function avg(arr: number[]): number {
  return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function variance(arr: number[]): number {
  const mean = avg(arr);
  return arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
}

/**
 * Fallback sentiment analysis (keyword-based)
 */
function getFallbackSentiment(text: string): SentimentAnalysisResult {
  const lowerText = text.toLowerCase();
  
  // Simple keyword matching
  const positiveWords = ['happy', 'good', 'great', 'excellent', 'love', 'amazing', 'wonderful', 'excited', 'confident'];
  const negativeWords = ['sad', 'bad', 'terrible', 'hate', 'awful', 'stressed', 'anxious', 'worried', 'confused'];
  
  let score = 0;
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) score += 0.2;
  });
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) score -= 0.2;
  });
  
  score = Math.max(-1, Math.min(1, score));
  
  return {
    overall_sentiment: score,
    emotional_valence: score,
    arousal_level: Math.abs(score),
    emotions: {
      joy: score > 0 ? score : 0,
      sadness: score < 0 ? Math.abs(score) : 0,
      anger: 0,
      fear: 0,
      surprise: 0,
      trust: score > 0 ? score * 0.5 : 0
    },
    confidence: 0.5,
    model_used: 'fallback-keyword'
  };
}


