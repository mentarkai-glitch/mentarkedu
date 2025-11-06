"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  TrendingUp,
  Target,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Zap,
  Award
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface CareerAlignment {
  career_path: string;
  alignment_score: number;
  skills_match: string[];
  skills_gap: string[];
  recommended_arks: string[];
  job_opportunities: JobOpportunity[];
  confidence_boost: number;
}

interface JobOpportunity {
  title: string;
  company?: string;
  description: string;
  required_skills: string[];
  match_score: number;
  confidence_level: 'ready' | 'nearly_ready' | 'developing';
}

interface ConfidenceAnalysis {
  overall_confidence: number;
  confidence_factors: {
    skill_mastery: number;
    milestone_completion: number;
    consistency: number;
    resource_utilization: number;
  };
  strengths: string[];
  improvement_areas: string[];
  confidence_trend: 'increasing' | 'stable' | 'decreasing';
  recommendations: string[];
}

interface CareerAnalysisCardProps {
  userId?: string;
  careerPath?: string;
}

export function CareerAnalysisCard({ userId, careerPath }: CareerAnalysisCardProps) {
  const [alignment, setAlignment] = useState<CareerAlignment | null>(null);
  const [confidence, setConfidence] = useState<ConfidenceAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCareerData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [careerPath]);

  const fetchCareerData = async () => {
    try {
      const params = new URLSearchParams();
      if (careerPath) params.append('career', careerPath);
      
      // Fetch alignment
      const alignmentRes = await fetch(`/api/career/analysis?${params.toString()}`);
      const alignmentData = await alignmentRes.json();
      if (alignmentData.success) {
        setAlignment(alignmentData.alignment);
      }

      // Fetch confidence
      const confidenceRes = await fetch(`/api/career/analysis?type=confidence`);
      const confidenceData = await confidenceRes.json();
      if (confidenceData.success) {
        setConfidence(confidenceData.confidence);
      }
    } catch (error) {
      console.error("Error fetching career data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceLevelColor = (level: string) => {
    switch (level) {
      case 'ready': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'nearly_ready': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'decreasing': return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
      default: return <TrendingUp className="w-4 h-4 text-yellow-400" />;
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-8 text-center">
          <Briefcase className="w-8 h-8 text-slate-400 mx-auto animate-pulse" />
          <p className="text-slate-400 mt-2">Analyzing career alignment...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Career Alignment */}
      {alignment && (
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-400" />
              Career Alignment: {alignment.career_path}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">Overall Alignment</span>
                <span className="text-white font-semibold text-lg">
                  {Math.round(alignment.alignment_score * 100)}%
                </span>
              </div>
              <Progress value={alignment.alignment_score * 100} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Skills You Have
                </p>
                <div className="flex flex-wrap gap-2">
                  {alignment.skills_match.slice(0, 5).map((skill, idx) => (
                    <Badge key={idx} className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {alignment.skills_match.length > 5 && (
                    <Badge className="bg-slate-700/50 text-slate-300 border-slate-600 text-xs">
                      +{alignment.skills_match.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-orange-400" />
                  Skills to Develop
                </p>
                <div className="flex flex-wrap gap-2">
                  {alignment.skills_gap.slice(0, 5).map((skill, idx) => (
                    <Badge key={idx} className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {alignment.skills_gap.length > 5 && (
                    <Badge className="bg-slate-700/50 text-slate-300 border-slate-600 text-xs">
                      +{alignment.skills_gap.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Opportunities */}
      {alignment && alignment.job_opportunities.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Job Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {alignment.job_opportunities.map((job, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{job.title}</h4>
                    {job.company && (
                      <p className="text-slate-400 text-sm">{job.company}</p>
                    )}
                  </div>
                  <Badge className={getConfidenceLevelColor(job.confidence_level)}>
                    {job.confidence_level.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-slate-300 text-sm mb-3 line-clamp-2">{job.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Match:</span>
                    <span className="text-white font-semibold text-sm">
                      {Math.round(job.match_score * 100)}%
                    </span>
                    <Progress value={job.match_score * 100} className="w-24 h-1.5" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Confidence Analysis */}
      {confidence && (
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              Confidence Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">Overall Confidence</span>
                <div className="flex items-center gap-2">
                  {getTrendIcon(confidence.confidence_trend)}
                  <span className="text-white font-semibold text-lg">
                    {Math.round(confidence.overall_confidence * 100)}%
                  </span>
                </div>
              </div>
              <Progress value={confidence.overall_confidence * 100} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Skill Mastery</p>
                <Progress value={confidence.confidence_factors.skill_mastery * 100} className="h-2" />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Milestone Completion</p>
                <Progress value={confidence.confidence_factors.milestone_completion * 100} className="h-2" />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Consistency</p>
                <Progress value={confidence.confidence_factors.consistency * 100} className="h-2" />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Resource Utilization</p>
                <Progress value={confidence.confidence_factors.resource_utilization * 100} className="h-2" />
              </div>
            </div>

            {confidence.strengths.length > 0 && (
              <div>
                <p className="text-sm text-slate-400 mb-2">Strengths</p>
                <div className="flex flex-wrap gap-2">
                  {confidence.strengths.slice(0, 3).map((strength, idx) => (
                    <Badge key={idx} className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {confidence.recommendations.length > 0 && (
              <div>
                <p className="text-sm text-slate-400 mb-2">Recommendations</p>
                <ul className="space-y-1">
                  {confidence.recommendations.slice(0, 3).map((rec, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 text-purple-400 mt-1 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}


