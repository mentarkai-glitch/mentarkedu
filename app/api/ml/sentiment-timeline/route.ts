import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import { analyzeSentiment, analyzeSentimentTrend, detectSentimentAnomalies } from "@/lib/ml/sentiment-analyzer";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');
    const days = parseInt(searchParams.get('days') || '30');

    if (!studentId) {
      return errorResponse("student_id is required", 400);
    }

    // Get sentiment records
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: sentimentRecords, error: sentimentError } = await supabase
      .from('sentiment_records')
      .select('*')
      .eq('student_id', studentId)
      .gte('record_date', startDate.toISOString().split('T')[0])
      .order('record_date', { ascending: false });

    if (sentimentError) throw sentimentError;

    // Get student events for correlation
    const { data: events, error: eventsError } = await supabase
      .from('student_events')
      .select('*')
      .eq('student_id', studentId)
      .gte('event_date', startDate.toISOString())
      .order('event_date', { ascending: false });

    if (eventsError) throw eventsError;

    // Get event correlations
    const { data: correlations, error: correlError } = await supabase
      .from('event_sentiment_correlations')
      .select('*')
      .eq('student_id', studentId)
      .order('correlation_strength', { ascending: false });

    if (correlError) throw correlError;

    // Analyze trend
    const trend = analyzeSentimentTrend(sentimentRecords || []);

    // Get anomalies
    const { data: anomalies, error: anomalyError } = await supabase
      .from('sentiment_anomalies')
      .select('*')
      .eq('student_id', studentId)
      .gte('anomaly_date', startDate.toISOString().split('T')[0])
      .order('anomaly_date', { ascending: false });

    if (anomalyError) throw anomalyError;

    return successResponse({
      sentiment_timeline: sentimentRecords || [],
      events: events || [],
      correlations: correlations || [],
      anomalies: anomalies || [],
      trend_analysis: trend,
      total_days_analyzed: sentimentRecords?.length || 0
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const body = await request.json();
    const { student_id, text, context, date } = body;

    if (!student_id || !text) {
      return errorResponse("student_id and text are required", 400);
    }

    // Get previous sentiment for context
    const { data: previousSentiment } = await supabase
      .from('sentiment_records')
      .select('overall_sentiment')
      .eq('student_id', student_id)
      .order('record_date', { ascending: false })
      .limit(1)
      .single();

    // Analyze sentiment using AI
    const sentimentResult = await analyzeSentiment({
      text,
      context,
      previousSentiment: previousSentiment?.overall_sentiment
    });

    // Get recent records for anomaly detection
    const { data: recentRecords } = await supabase
      .from('sentiment_records')
      .select('*')
      .eq('student_id', student_id)
      .order('record_date', { ascending: false})
      .limit(30);

    // Detect anomalies
    const anomalyDetection = detectSentimentAnomalies(
      recentRecords || [],
      sentimentResult.overall_sentiment
    );

    // Calculate 7-day and 30-day averages
    const recent7 = (recentRecords || []).slice(0, 7);
    const recent30 = recentRecords || [];
    const sentiment7DayAvg = recent7.length > 0 
      ? recent7.reduce((sum, r) => sum + r.overall_sentiment, 0) / recent7.length
      : sentimentResult.overall_sentiment;
    const sentiment30DayAvg = recent30.length > 0
      ? recent30.reduce((sum, r) => sum + r.overall_sentiment, 0) / recent30.length
      : sentimentResult.overall_sentiment;

    const sentimentChange = previousSentiment 
      ? sentimentResult.overall_sentiment - previousSentiment.overall_sentiment
      : 0;

    // Save sentiment record
    const recordDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    const { data: sentimentRecord, error: saveError } = await supabase
      .from('sentiment_records')
      .upsert({
        student_id,
        record_date: recordDate,
        overall_sentiment: sentimentResult.overall_sentiment,
        emotional_valence: sentimentResult.emotional_valence,
        arousal_level: sentimentResult.arousal_level,
        joy: sentimentResult.emotions.joy,
        sadness: sentimentResult.emotions.sadness,
        anger: sentimentResult.emotions.anger,
        fear: sentimentResult.emotions.fear,
        surprise: sentimentResult.emotions.surprise,
        trust: sentimentResult.emotions.trust,
        sentiment_change_from_previous: sentimentChange,
        sentiment_7day_avg: sentiment7DayAvg,
        sentiment_30day_avg: sentiment30DayAvg,
        ai_model_used: sentimentResult.model_used,
        confidence_score: sentimentResult.confidence
      }, {
        onConflict: 'student_id,record_date'
      })
      .select()
      .single();

    if (saveError) throw saveError;

    // If anomaly detected, create anomaly record
    if (anomalyDetection.isAnomaly) {
      await supabase
        .from('sentiment_anomalies')
        .insert({
          student_id,
          anomaly_date: recordDate,
          sentiment_score: sentimentResult.overall_sentiment,
          expected_score: anomalyDetection.expectedScore,
          deviation: anomalyDetection.deviation,
          anomaly_type: anomalyDetection.anomalyType,
          severity: anomalyDetection.severity,
          potential_triggers: [], // Will be analyzed separately
          correlated_events: []
        });
    }

    return successResponse({
      sentiment: sentimentRecord,
      anomaly_detected: anomalyDetection.isAnomaly,
      anomaly_details: anomalyDetection.isAnomaly ? anomalyDetection : null
    });
  } catch (error) {
    return handleApiError(error);
  }
}


