"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Scatter, ScatterChart, ZAxis } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Calendar, Zap } from "lucide-react";
import type { SentimentRecord, StudentEvent } from "@/lib/types";

interface SentimentTimelineProps {
  studentId: string;
  className?: string;
}

export function SentimentTimeline({ studentId, className }: SentimentTimelineProps) {
  const [timelineData, setTimelineData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dayRange, setDayRange] = useState("30");

  useEffect(() => {
    fetchTimeline();
  }, [studentId, dayRange]);

  const fetchTimeline = async () => {
    try {
      const response = await fetch(`/api/ml/sentiment-timeline?student_id=${studentId}&days=${dayRange}`);
      const data = await response.json();
      
      if (data.success) {
        setTimelineData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch sentiment timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-700 rounded w-1/3"></div>
            <div className="h-64 bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!timelineData || timelineData.sentiment_timeline.length === 0) {
    return (
      <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white">Sentiment Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No sentiment data available yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Sentiment is tracked from daily check-ins and chat conversations.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = timelineData.sentiment_timeline.map((record: SentimentRecord) => {
    // Find events on this date
    const recordDate = new Date(record.record_date).toDateString();
    const eventsOnDate = timelineData.events.filter((e: StudentEvent) => 
      new Date(e.event_date).toDateString() === recordDate
    );

    return {
      date: new Date(record.record_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sentiment: parseFloat((record.overall_sentiment * 100).toFixed(1)), // Convert to -100 to 100
      emotion: parseFloat((record.overall_sentiment * 10).toFixed(1)), // For display -10 to 10
      energy: record.avg_energy_level ? parseFloat((record.avg_energy_level * 10).toFixed(1)) : null,
      joy: record.joy * 100,
      sadness: record.sadness * 100,
      stress: (1 - (record.emotional_valence + 1) / 2) * 100, // Inverse of valence
      events: eventsOnDate.length,
      eventDetails: eventsOnDate
    };
  }).reverse(); // Reverse to show oldest to newest

  const trend = timelineData.trend_analysis;
  const trendColor = trend.trend === 'improving' ? 'text-green-400' :
                     trend.trend === 'declining' ? 'text-red-400' : 'text-gray-400';
  const trendIcon = trend.trend === 'improving' ? TrendingUp :
                   trend.trend === 'declining' ? TrendingDown : Activity;
  const TrendIcon = trendIcon;

  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <Activity className="h-6 w-6 text-purple-400" />
            <span>Sentiment Timeline & Event Correlation</span>
          </CardTitle>
          
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 ${trendColor}`}>
              <TrendIcon className="h-5 w-5" />
              <span className="text-sm font-semibold">{trend.trend}</span>
            </div>
            
            <Select value={dayRange} onValueChange={setDayRange}>
              <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-700/30 rounded-lg p-3 text-center">
            <p className={`text-2xl font-bold ${trendColor}`}>
              {trend.avgSentiment > 0 ? '+' : ''}{(trend.avgSentiment * 100).toFixed(0)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Avg Sentiment</p>
          </div>
          
          <div className="bg-slate-700/30 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-white">
              {trend.volatility}
            </p>
            <p className="text-xs text-gray-400 mt-1">Volatility</p>
          </div>
          
          <div className="bg-slate-700/30 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-white">
              {timelineData.events.length}
            </p>
            <p className="text-xs text-gray-400 mt-1">Events</p>
          </div>
          
          <div className="bg-slate-700/30 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-white">
              {timelineData.anomalies.length}
            </p>
            <p className="text-xs text-gray-400 mt-1">Anomalies</p>
          </div>
        </div>

        {/* Sentiment Chart */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Sentiment Over Time</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9CA3AF"
                domain={[-100, 100]}
                ticks={[-100, -50, 0, 50, 100]}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="5 5" />
              <Line 
                type="monotone" 
                dataKey="sentiment" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                dot={{ fill: '#8B5CF6', r: 4 }}
                name="Sentiment Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Emotion Breakdown */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Emotion Breakdown (Recent Average)</h4>
          <div className="grid grid-cols-3 gap-3">
            {timelineData.sentiment_timeline.length > 0 && (() => {
              const recent = timelineData.sentiment_timeline.slice(0, 7);
              const avgJoy = recent.reduce((sum: number, r: SentimentRecord) => sum + r.joy, 0) / recent.length * 100;
              const avgSadness = recent.reduce((sum: number, r: SentimentRecord) => sum + r.sadness, 0) / recent.length * 100;
              const avgAnger = recent.reduce((sum: number, r: SentimentRecord) => sum + r.anger, 0) / recent.length * 100;
              const avgFear = recent.reduce((sum: number, r: SentimentRecord) => sum + r.fear, 0) / recent.length * 100;
              const avgSurprise = recent.reduce((sum: number, r: SentimentRecord) => sum + r.surprise, 0) / recent.length * 100;
              const avgTrust = recent.reduce((sum: number, r: SentimentRecord) => sum + r.trust, 0) / recent.length * 100;

              return (
                <>
                  <EmotionBar label="Joy" emoji="😊" value={avgJoy} color="green" />
                  <EmotionBar label="Sadness" emoji="😢" value={avgSadness} color="blue" />
                  <EmotionBar label="Anger" emoji="😠" value={avgAnger} color="red" />
                  <EmotionBar label="Fear" emoji="😨" value={avgFear} color="orange" />
                  <EmotionBar label="Surprise" emoji="😲" value={avgSurprise} color="yellow" />
                  <EmotionBar label="Trust" emoji="🤝" value={avgTrust} color="cyan" />
                </>
              );
            })()}
          </div>
        </div>

        {/* Event Correlations */}
        {timelineData.correlations && timelineData.correlations.length > 0 && (
          <div className="pt-4 border-t border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Event-Sentiment Correlations</h4>
            <div className="space-y-2">
              {timelineData.correlations.slice(0, 5).map((corr: any) => (
                <div key={corr.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                  <span className="text-gray-300 text-sm">{corr.event_type.replace(/_/g, ' ')}</span>
                  <div className="flex items-center space-x-2">
                    <Badge className={
                      Math.abs(corr.correlation_strength) > 0.7 ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                      Math.abs(corr.correlation_strength) > 0.4 ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      'bg-gray-500/20 text-gray-400 border-gray-500/30'
                    }>
                      {corr.correlation_strength > 0 ? '+' : ''}{(corr.correlation_strength * 100).toFixed(0)}%
                    </Badge>
                    <span className="text-xs text-gray-500">({corr.occurrence_count}x)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Anomalies */}
        {timelineData.anomalies && timelineData.anomalies.length > 0 && (
          <div className="pt-4 border-t border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
              <Zap className="h-4 w-4 mr-2 text-yellow-400" />
              Recent Anomalies
            </h4>
            <div className="space-y-2">
              {timelineData.anomalies.slice(0, 3).map((anomaly: any) => (
                <div key={anomaly.id} className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-yellow-300 font-medium text-sm">
                      {anomaly.anomaly_type.replace(/_/g, ' ')}
                    </span>
                    <Badge className={
                      anomaly.severity === 'severe' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      anomaly.severity === 'moderate' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }>
                      {anomaly.severity}
                    </Badge>
                  </div>
                  <p className="text-yellow-200/70 text-xs">
                    {new Date(anomaly.anomaly_date).toLocaleDateString()} - 
                    Deviation: {(anomaly.deviation * 100).toFixed(0)} points from expected
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmotionBar({ label, emoji, value, color }: { label: string; emoji: string; value: number; color: string }) {
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
    cyan: 'bg-cyan-500'
  };

  return (
    <div className="bg-slate-700/30 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-lg">{emoji}</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2 mb-1">
        <div 
          className={`${colorClasses[color as keyof typeof colorClasses]} h-2 rounded-full transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 text-right">{value.toFixed(0)}%</p>
    </div>
  );
}


