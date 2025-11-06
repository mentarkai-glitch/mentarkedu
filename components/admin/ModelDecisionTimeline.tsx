'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Brain, Zap, Target } from 'lucide-react';

interface ModelDecision {
  id: string;
  task: string;
  selected_model: string;
  selection_score: number;
  complexity_score: number;
  emotional_content_score: number;
  timestamp: string;
  reasoning_required?: boolean;
  creativity_required?: boolean;
  empathy_required?: boolean;
}

interface ModelDecisionTimelineProps {
  decisions: ModelDecision[];
}

export function ModelDecisionTimeline({ decisions }: ModelDecisionTimelineProps) {
  const getTaskColor = (task: string) => {
    const colors = {
      'mentor_chat': 'bg-blue-100 text-blue-800',
      'roadmap': 'bg-green-100 text-green-800',
      'emotion': 'bg-pink-100 text-pink-800',
      'insights': 'bg-purple-100 text-purple-800',
      'research': 'bg-orange-100 text-orange-800',
      'prediction': 'bg-yellow-100 text-yellow-800',
      'resource_recommendation': 'bg-indigo-100 text-indigo-800'
    };
    return colors[task as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getModelColor = (model: string) => {
    const colors = {
      'gpt-4o': 'bg-blue-500',
      'o1-preview': 'bg-purple-500',
      'claude-opus': 'bg-green-500',
      'gemini-pro': 'bg-yellow-500',
      'claude-sonnet': 'bg-teal-500',
      'gpt-4o-mini': 'bg-blue-400',
      'mistral-large': 'bg-orange-500',
      'llama-3.1': 'bg-red-500'
    };
    return colors[model as keyof typeof colors] || 'bg-gray-500';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplexityColor = (complexity: number) => {
    if (complexity >= 7) return 'text-red-600';
    if (complexity >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getEmotionalColor = (emotional: number) => {
    if (emotional >= 7) return 'text-pink-600';
    if (emotional >= 4) return 'text-orange-600';
    return 'text-blue-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Model Decision Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 w-full">
          <div className="space-y-4">
            {decisions.map((decision, index) => (
              <div key={decision.id} className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                {/* Timeline indicator */}
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${getModelColor(decision.selected_model)}`}></div>
                  {index < decisions.length - 1 && (
                    <div className="w-px h-16 bg-border mt-2"></div>
                  )}
                </div>

                {/* Decision details */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getTaskColor(decision.task)}>
                        {decision.task.replace('_', ' ')}
                      </Badge>
                      <span className="font-semibold">{decision.selected_model}</span>
                      <span className={`text-sm font-medium ${getScoreColor(decision.selection_score)}`}>
                        Score: {decision.selection_score.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {new Date(decision.timestamp).toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span>Complexity:</span>
                      <span className={`font-medium ${getComplexityColor(decision.complexity_score)}`}>
                        {decision.complexity_score}/10
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <span>Emotional:</span>
                      <span className={`font-medium ${getEmotionalColor(decision.emotional_content_score)}`}>
                        {decision.emotional_content_score}/10
                      </span>
                    </div>
                  </div>

                  {/* Feature requirements */}
                  {(decision.reasoning_required || decision.creativity_required || decision.empathy_required) && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Requirements:</span>
                      {decision.reasoning_required && (
                        <Badge variant="outline" className="text-xs">Reasoning</Badge>
                      )}
                      {decision.creativity_required && (
                        <Badge variant="outline" className="text-xs">Creativity</Badge>
                      )}
                      {decision.empathy_required && (
                        <Badge variant="outline" className="text-xs">Empathy</Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
