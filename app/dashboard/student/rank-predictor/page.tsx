"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  Target,
  Award,
  BarChart3,
  Calculator,
  AlertCircle,
  CheckCircle2,
  History
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface RankPrediction {
  predicted_rank: number;
  predicted_percentile: number;
  confidence_level: string;
  score_range: string;
  historical_trend: any[];
  factors: {
    score: number;
    exam_type: string;
    historical_attempts: number;
  };
}

interface PredictionHistory {
  id: string;
  exam_type: string;
  score: number;
  predicted_rank: number;
  predicted_percentile: number;
  confidence_level: string;
  created_at: string;
}

export default function RankPredictorPage() {
  const [examType, setExamType] = useState<string>("JEE_MAIN");
  const [score, setScore] = useState<string>("");
  const [prediction, setPrediction] = useState<RankPrediction | null>(null);
  const [history, setHistory] = useState<PredictionHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [examType]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/student/rank-predictor?exam_type=${examType}`);
      const result = await response.json();

      if (result.success) {
        setHistory(result.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handlePredict = async () => {
    const scoreNum = parseInt(score);
    if (!scoreNum || scoreNum < 0) {
      toast.error("Please enter a valid score");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/student/rank-predictor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam_type: examType,
          score: scoreNum,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setPrediction(result.data);
        fetchHistory(); // Refresh history
        toast.success("Rank predicted successfully!");
      } else {
        toast.error("Failed to predict rank");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getMaxScore = () => {
    switch (examType) {
      case "NEET":
        return 720;
      default:
        return 360;
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    }
  };

  const getRankCategory = (rank: number) => {
    if (rank <= 100) return { label: "Top 100", color: "text-green-400" };
    if (rank <= 1000) return { label: "Top 1K", color: "text-green-400" };
    if (rank <= 10000) return { label: "Top 10K", color: "text-yellow-400" };
    if (rank <= 50000) return { label: "Top 50K", color: "text-orange-400" };
    return { label: "Above 50K", color: "text-red-400" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rank Predictor</h1>
          <p className="text-sm text-muted-foreground">
            Predict your rank based on mock test scores
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/student/mock-tests">
            <BarChart3 className="w-4 h-4 mr-2" />
            View Mock Tests
          </Link>
        </Button>
      </div>

      {/* Prediction Input */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-cyan-400" />
            Enter Your Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={examType} onValueChange={setExamType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Exam Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="JEE_MAIN">JEE Main</SelectItem>
                <SelectItem value="JEE_ADVANCED">JEE Advanced</SelectItem>
                <SelectItem value="NEET">NEET</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder={`Enter score (Max: ${getMaxScore()})`}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              max={getMaxScore()}
              min={0}
              className="flex-1"
            />
            <Button
              onClick={handlePredict}
              disabled={loading || !score}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
            >
              {loading ? (
                <>
                  <Target className="w-4 h-4 mr-2 animate-spin" />
                  Predicting...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Predict Rank
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter your mock test score to get an estimated rank prediction
          </p>
        </CardContent>
      </Card>

      {/* Prediction Result */}
      {prediction && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-cyan-500/20">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-cyan-400" />
                    <p className="text-sm text-muted-foreground">Predicted Rank</p>
                  </div>
                  <p className={`text-4xl font-bold ${getRankCategory(prediction.predicted_rank).color}`}>
                    {prediction.predicted_rank.toLocaleString()}
                  </p>
                  <Badge variant="outline" className="mt-2">
                    {getRankCategory(prediction.predicted_rank).label}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    <p className="text-sm text-muted-foreground">Percentile</p>
                  </div>
                  <p className="text-4xl font-bold text-foreground">
                    {prediction.predicted_percentile.toFixed(2)}%
                  </p>
                  <Badge variant="outline" className="mt-2">
                    {prediction.score_range}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-yellow-400" />
                    <p className="text-sm text-muted-foreground">Confidence</p>
                  </div>
                  <Badge className={getConfidenceColor(prediction.confidence_level)}>
                    {prediction.confidence_level.toUpperCase()}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">
                    Based on {prediction.factors.historical_attempts} previous attempts
                  </p>
                </div>
              </div>

              {/* Improvement Suggestions */}
              <div className="mt-6 p-4 bg-background/50 rounded-lg border border-cyan-500/20">
                <p className="text-sm font-medium text-foreground mb-2">Improvement Suggestions:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  {prediction.predicted_rank > 10000 && (
                    <li>Focus on high-weightage topics to improve your score</li>
                  )}
                  {prediction.predicted_rank > 50000 && (
                    <li>Practice more mock tests to build consistency</li>
                  )}
                  <li>Review weak areas identified in your concept heatmap</li>
                  <li>Take more mock tests to improve prediction accuracy</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Prediction History */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            Prediction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-2"></div>
              <p className="text-xs text-muted-foreground">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="py-8 text-center">
              <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No predictions yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Enter a score above to get your first prediction
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg border border-border bg-muted/30 hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge>{item.exam_type.replace("_", " ")}</Badge>
                        <Badge variant="outline">Score: {item.score}</Badge>
                        <Badge className={getConfidenceColor(item.confidence_level)}>
                          {item.confidence_level}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Rank: </span>
                          <span className={`font-semibold ${getRankCategory(item.predicted_rank).color}`}>
                            {item.predicted_rank.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Percentile: </span>
                          <span className="font-semibold text-foreground">
                            {item.predicted_percentile.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

