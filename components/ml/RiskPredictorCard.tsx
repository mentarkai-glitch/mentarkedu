"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingDown, Flame, UserX, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import type { RiskPrediction } from "@/lib/types";

interface RiskPredictorCardProps {
  studentId: string;
  className?: string;
}

export function RiskPredictorCard({ studentId, className }: RiskPredictorCardProps) {
  const [prediction, setPrediction] = useState<RiskPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchPrediction();
  }, [studentId]);

  const fetchPrediction = async () => {
    try {
      const response = await fetch(`/api/ml/predict-risk?student_id=${studentId}`);
      const data = await response.json();
      
      if (data.success && data.data.prediction) {
        setPrediction(data.data.prediction);
      }
    } catch (error) {
      console.error('Failed to fetch risk prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  const runPrediction = async () => {
    try {
      setAnalyzing(true);
      const response = await fetch('/api/ml/predict-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId })
      });
      
      const data = await response.json();
      if (data.success && data.data.prediction) {
        setPrediction(data.data.prediction);
      }
    } catch (error) {
      console.error('Failed to run prediction:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return {
        bg: 'bg-red-500/20',
        text: 'text-red-400',
        border: 'border-red-500/30',
        gradient: 'from-red-500 to-orange-500'
      };
      case 'high': return {
        bg: 'bg-orange-500/20',
        text: 'text-orange-400',
        border: 'border-orange-500/30',
        gradient: 'from-orange-500 to-yellow-500'
      };
      case 'medium': return {
        bg: 'bg-yellow-500/20',
        text: 'text-yellow-400',
        border: 'border-yellow-500/30',
        gradient: 'from-yellow-500 to-green-500'
      };
      case 'low': return {
        bg: 'bg-green-500/20',
        text: 'text-green-400',
        border: 'border-green-500/30',
        gradient: 'from-green-500 to-emerald-500'
      };
      default: return {
        bg: 'bg-gray-500/20',
        text: 'text-gray-400',
        border: 'border-gray-500/30',
        gradient: 'from-gray-500 to-slate-500'
      };
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical': return <UserX className="h-6 w-6" />;
      case 'high': return <AlertTriangle className="h-6 w-6" />;
      case 'medium': return <AlertCircle className="h-6 w-6" />;
      case 'low': return <CheckCircle className="h-6 w-6" />;
      default: return <AlertTriangle className="h-6 w-6" />;
    }
  };

  if (loading) {
    return (
      <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-700 rounded w-1/3"></div>
            <div className="h-20 bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!prediction) {
    return (
      <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-yellow-400" />
            <span>Risk Prediction</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-gray-400 mb-4">No risk analysis available yet</p>
            <Button
              onClick={runPrediction}
              disabled={analyzing}
              className="bg-cyan-500 hover:bg-cyan-600"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Run Risk Analysis'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const colors = getRiskColor(prediction.risk_level);

  return (
    <Card className={`bg-gradient-to-br ${colors.bg} border ${colors.border} ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            {getRiskIcon(prediction.risk_level)}
            <span>Dropout Risk Analysis</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={`${colors.bg} ${colors.text} ${colors.border}`}>
              {prediction.risk_level.toUpperCase()}
            </Badge>
            <Button
              onClick={runPrediction}
              disabled={analyzing}
              size="sm"
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RefreshCw className={`h-3 w-3 ${analyzing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Risk Scores */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300 flex items-center">
                <UserX className="h-4 w-4 mr-2 text-red-400" />
                Dropout Risk
              </span>
              <span className={`${colors.text} font-bold`}>{prediction.dropout_risk_score}/100</span>
            </div>
            <Progress value={prediction.dropout_risk_score} className="h-3" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300 flex items-center">
                <Flame className="h-4 w-4 mr-2 text-orange-400" />
                Burnout Risk
              </span>
              <span className={`${colors.text} font-bold`}>{prediction.burnout_risk_score}/100</span>
            </div>
            <Progress value={prediction.burnout_risk_score} className="h-3" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300 flex items-center">
                <TrendingDown className="h-4 w-4 mr-2 text-yellow-400" />
                Disengagement Risk
              </span>
              <span className={`${colors.text} font-bold`}>{prediction.disengagement_risk_score}/100</span>
            </div>
            <Progress value={prediction.disengagement_risk_score} className="h-3" />
          </div>
        </div>

        {/* Risk Factors */}
        {prediction.primary_risk_factors.length > 0 && (
          <div className="pt-4 border-t border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Risk Factors:</h4>
            <div className="space-y-2">
              {prediction.primary_risk_factors.map((factor, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{factor}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Protective Factors */}
        {prediction.protective_factors.length > 0 && (
          <div className="pt-4 border-t border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Protective Factors:</h4>
            <div className="space-y-2">
              {prediction.protective_factors.map((factor, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{factor}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Interventions */}
        {prediction.recommended_interventions.length > 0 && (
          <div className="pt-4 border-t border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Recommended Actions:</h4>
            <div className="space-y-2">
              {prediction.recommended_interventions.map((intervention: any, idx) => (
                <div key={idx} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-white font-medium text-sm">{intervention.title}</span>
                    <Badge className={
                      intervention.priority === 'high' || intervention.priority === 'critical'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }>
                      {intervention.priority}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-xs">{intervention.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Model Info */}
        <div className="pt-4 border-t border-gray-700 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Model: {prediction.model_version}</span>
            <span>Confidence: {Math.round((prediction.confidence_score || 0) * 100)}%</span>
          </div>
          <div className="mt-1">
            Last updated: {new Date(prediction.prediction_date).toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


