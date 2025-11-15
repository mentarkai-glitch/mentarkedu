"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { User, Target, AlertTriangle, TrendingUp, Eye, Activity, Clock } from "lucide-react";

interface StudentCardProps {
  student: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    grade: string;
    batch: string;
    risk_score: number;
    risk_level: 'high' | 'medium' | 'low';
    active_arks: number;
    completed_arks: number;
    engagement_score?: number;
    last_activity?: string;
    subject?: string;
  };
  onViewDetails: () => void;
}

export function StudentCard({ student, onViewDetails }: StudentCardProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRiskIcon = (level: string) => {
    if (level === 'high') return <AlertTriangle className="h-4 w-4" />;
    if (level === 'medium') return <TrendingUp className="h-4 w-4" />;
    return null;
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {student.avatar_url ? (
              <img
                src={student.avatar_url}
                alt={student.full_name}
                className="w-12 h-12 rounded-full border-2 border-slate-600"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <h3 className="text-white font-semibold">{student.full_name}</h3>
              <p className="text-sm text-gray-400">
                Grade {student.grade} • {student.batch}
              </p>
            </div>
          </div>
          
          <Badge className={getRiskColor(student.risk_level)}>
            {getRiskIcon(student.risk_level)}
            <span className="ml-1">{student.risk_level} risk</span>
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Target className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-gray-400">Active ARKs</span>
            </div>
            <p className="text-xl font-bold text-white">{student.active_arks}</p>
          </div>
          
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-xs text-gray-400">Completed</span>
            </div>
            <p className="text-xl font-bold text-white">{student.completed_arks}</p>
          </div>
        </div>

        {/* Engagement Score */}
        {student.engagement_score !== undefined && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-cyan-400" />
                <span className="text-xs text-gray-400">Engagement</span>
              </div>
              <span className="text-xs font-semibold text-white">{student.engagement_score}%</span>
            </div>
            <Progress value={student.engagement_score} className="h-2 bg-slate-700" />
          </div>
        )}

        {/* Last Activity */}
        {student.last_activity && (
          <div className="mb-4 flex items-center space-x-2 text-xs text-gray-400">
            <Clock className="h-3 w-3" />
            <span>Last active: {new Date(student.last_activity).toLocaleDateString()}</span>
          </div>
        )}

        {student.subject && (
          <div className="mb-4">
            <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
              {student.subject}
            </Badge>
          </div>
        )}

        <Button
          onClick={onViewDetails}
          className="w-full bg-cyan-500 hover:bg-cyan-600"
          size="sm"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}

