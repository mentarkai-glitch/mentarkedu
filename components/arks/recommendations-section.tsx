"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  TrendingUp,
  ArrowRight,
  Target,
  BookOpen,
  Clock
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface ARKRecommendation {
  ark_id: string;
  title: string;
  category: string;
  reason: string;
  confidence_score: number;
  alignment_factors: {
    skills_match: number;
    goal_alignment: number;
    difficulty_fit: number;
    interest_match: number;
  };
  preview?: {
    description: string;
    estimated_duration: string;
    skills_gained: string[];
  };
}

interface RecommendationsSectionProps {
  userId?: string;
  type?: 'general' | 'career';
  careerPath?: string;
}

export function RecommendationsSection({ userId, type = 'general', careerPath }: RecommendationsSectionProps) {
  const [recommendations, setRecommendations] = useState<ARKRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, careerPath]);

  const fetchRecommendations = async () => {
    try {
      const params = new URLSearchParams();
      if (type === 'career' && careerPath) {
        params.append('type', 'career');
        params.append('career', careerPath);
      }
      
      const response = await fetch(`/api/recommendations/arks?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setRecommendations(Array.isArray(data.recommendations) ? data.recommendations : []);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (score >= 0.6) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Sparkles className="w-8 h-8 text-slate-400 mx-auto animate-pulse" />
        <p className="text-slate-400 mt-2">Finding perfect ARKs for you...</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
        <p className="text-slate-400 mt-2">No recommendations available yet</p>
        <p className="text-sm text-slate-500 mt-1">Complete more ARKs to get personalized recommendations</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            {type === 'career' ? 'Career-Aligned ARKs' : 'Recommended for You'}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {type === 'career' 
              ? 'ARKs that align with your career goals'
              : 'Personalized recommendations based on your progress'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec, idx) => (
          <Card 
            key={rec.ark_id} 
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700 hover:border-yellow-500/30 transition-all"
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-white mb-2 line-clamp-2">{rec.title}</CardTitle>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30">
                      {rec.category}
                    </Badge>
                    <Badge className={getConfidenceColor(rec.confidence_score)}>
                      {Math.round(rec.confidence_score * 100)}% match
                    </Badge>
                  </div>
                </div>
                {idx === 0 && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    Top Pick
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300 text-sm line-clamp-3">{rec.reason}</p>

              {/* Alignment Factors */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Skills Match</span>
                  <span className="text-white font-semibold">
                    {Math.round(rec.alignment_factors.skills_match * 100)}%
                  </span>
                </div>
                <Progress value={rec.alignment_factors.skills_match * 100} className="h-1.5" />
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Goal Alignment</span>
                  <span className="text-white font-semibold">
                    {Math.round(rec.alignment_factors.goal_alignment * 100)}%
                  </span>
                </div>
                <Progress value={rec.alignment_factors.goal_alignment * 100} className="h-1.5" />
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Interest Match</span>
                  <span className="text-white font-semibold">
                    {Math.round(rec.alignment_factors.interest_match * 100)}%
                  </span>
                </div>
                <Progress value={rec.alignment_factors.interest_match * 100} className="h-1.5" />
              </div>

              {rec.preview && (
                <div className="pt-2 border-t border-slate-700">
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    {rec.preview.estimated_duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{rec.preview.estimated_duration}</span>
                      </div>
                    )}
                    {rec.preview.skills_gained && rec.preview.skills_gained.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        <span>{rec.preview.skills_gained.length} skills</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Link href={`/ark/${rec.ark_id}`}>
                <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black">
                  View ARK
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


