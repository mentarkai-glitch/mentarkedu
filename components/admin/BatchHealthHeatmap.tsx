"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";

interface BatchMetrics {
  batch: string;
  student_count: number;
  avg_motivation: number;
  avg_engagement: number;
  completion_rate: number;
  high_risk_count: number;
  health_score: number;
}

interface BatchHealthHeatmapProps {
  instituteId?: string;
}

export function BatchHealthHeatmap({ instituteId }: BatchHealthHeatmapProps) {
  const [batches, setBatches] = useState<BatchMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatchHealth();
  }, [instituteId]);

  const fetchBatchHealth = async () => {
    try {
      const response = await fetch("/api/admin/batch-health");
      const data = await response.json();
      
      if (data.success) {
        setBatches(data.data.batches || []);
      }
    } catch (error) {
      console.error("Failed to fetch batch health:", error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return "bg-green-500/20 border-green-500/50 text-green-400";
    if (score >= 60) return "bg-yellow-500/20 border-yellow-500/50 text-yellow-400";
    if (score >= 40) return "bg-orange-500/20 border-orange-500/50 text-orange-400";
    return "bg-red-500/20 border-red-500/50 text-red-400";
  };

  const getHealthIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5" />;
    if (score >= 60) return <TrendingUp className="h-5 w-5" />;
    if (score >= 40) return <AlertTriangle className="h-5 w-5" />;
    return <TrendingDown className="h-5 w-5" />;
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Attention";
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Batch Health Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 w-full bg-slate-700/30 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Batch Health Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        {batches.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No batch data available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches.map((batch) => (
              <div
                key={batch.batch}
                className={`border-2 rounded-lg p-4 transition-all hover:scale-105 ${getHealthColor(batch.health_score)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Batch {batch.batch}</h3>
                    <p className="text-sm opacity-75">{batch.student_count} students</p>
                  </div>
                  {getHealthIcon(batch.health_score)}
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="opacity-75">Health Score</span>
                    <span className="font-semibold">{batch.health_score}/100</span>
                  </div>
                  <div className="w-full bg-black/20 rounded-full h-2">
                    <div
                      className="bg-current h-2 rounded-full transition-all"
                      style={{ width: `${batch.health_score}%` }}
                    />
                  </div>
                  <div className="text-xs text-center mt-1">
                    {getHealthLabel(batch.health_score)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-black/10 rounded p-2">
                    <div className="flex items-center space-x-1 mb-1">
                      <TrendingUp className="h-3 w-3" />
                      <span className="opacity-75">Engagement</span>
                    </div>
                    <span className="font-semibold">{Math.round(batch.avg_engagement)}%</span>
                  </div>
                  <div className="bg-black/10 rounded p-2">
                    <div className="flex items-center space-x-1 mb-1">
                      <CheckCircle className="h-3 w-3" />
                      <span className="opacity-75">Completion</span>
                    </div>
                    <span className="font-semibold">{Math.round(batch.completion_rate)}%</span>
                  </div>
                </div>

                {batch.high_risk_count > 0 && (
                  <Badge className="mt-2 bg-red-500/20 text-red-400 border-red-500/30">
                    {batch.high_risk_count} at-risk
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
