"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, Target, Users } from "lucide-react";

interface CareerCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface CareerProfile {
  categories: Array<{
    affinity_score: number;
    career_categories: CareerCategory;
  }>;
  top_categories: Array<{
    affinity_score: number;
    career_categories: CareerCategory;
  }>;
  average_affinity: number;
  last_updated: string | null;
}

interface CareerDNAChartProps {
  className?: string;
}

export function CareerDNAChart({ className }: CareerDNAChartProps) {
  const [careerProfile, setCareerProfile] = useState<CareerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCareerProfile();
  }, []);

  const fetchCareerProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/career-dna/profile');
      const data = await response.json();
      
      if (data.success) {
        setCareerProfile(data.data.career_profile);
      }
    } catch (error) {
      console.error('Failed to fetch career profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-400";
    if (score >= 0.6) return "text-yellow-400";
    if (score >= 0.4) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 0.8) return "bg-green-500/20";
    if (score >= 0.6) return "bg-yellow-500/20";
    if (score >= 0.4) return "bg-orange-500/20";
    return "bg-red-500/20";
  };

  if (loading) {
    return (
      <Card className={`bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20 ${className}`}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-700 rounded w-1/3"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!careerProfile || careerProfile.categories.length === 0) {
    return (
      <Card className={`bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Brain className="h-6 w-6 text-purple-400" />
            <span>Career DNA Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-2">No career profile found</p>
            <p className="text-sm text-gray-500 mb-4">
              Complete the career DNA analysis to discover your career strengths
            </p>
            <Button 
              onClick={() => window.location.href = '/career-dna/analyze'}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90"
            >
              Analyze Career DNA
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-white">
            <Brain className="h-6 w-6 text-purple-400" />
            <span>Career DNA Profile</span>
          </CardTitle>
          <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            <TrendingUp className="h-3 w-3 mr-1" />
            {Math.round(careerProfile.average_affinity * 100)}% Avg
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Top 3 Categories */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
            <Target className="h-4 w-4 mr-2" />
            Top Career Strengths
          </h4>
          <div className="space-y-3">
            {careerProfile.top_categories.slice(0, 3).map((category, index) => (
              <div
                key={category.career_categories.id}
                className={`p-4 rounded-lg border ${getScoreBgColor(category.affinity_score)} border-opacity-30`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{category.career_categories.icon}</span>
                    <div>
                      <h5 className="font-semibold text-white">
                        {category.career_categories.name}
                      </h5>
                      <p className="text-xs text-gray-400">
                        {category.career_categories.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getScoreColor(category.affinity_score)}`}>
                      {Math.round(category.affinity_score * 100)}%
                    </div>
                    <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
                <Progress 
                  value={category.affinity_score * 100} 
                  className="h-2 bg-gray-800"
                />
              </div>
            ))}
          </div>
        </div>

        {/* All Categories */}
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Complete Career Profile
          </h4>
          <div className="space-y-2">
            {careerProfile.categories.map((category) => (
              <div
                key={category.career_categories.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-900/30 hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{category.career_categories.icon}</span>
                  <span className="font-medium text-white">
                    {category.career_categories.name}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Progress 
                    value={category.affinity_score * 100} 
                    className="w-20 h-2 bg-gray-800"
                  />
                  <span className={`text-sm font-semibold w-12 text-right ${getScoreColor(category.affinity_score)}`}>
                    {Math.round(category.affinity_score * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {careerProfile.last_updated && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              Last updated: {new Date(careerProfile.last_updated).toLocaleDateString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
