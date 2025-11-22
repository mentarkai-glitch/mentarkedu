'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, AlertTriangle, Target, TrendingUp } from 'lucide-react';
import { ChapterWiseAnalysis } from '@/lib/utils/neet-scoring';

interface ChapterWiseBreakdownProps {
  chapterWise: ChapterWiseAnalysis;
}

export function ChapterWiseBreakdown({ chapterWise }: ChapterWiseBreakdownProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'Low':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-teal-400" />
          📚 Chapter-wise Performance Analysis
        </CardTitle>
        <CardDescription>
          Detailed breakdown of your strengths and weaknesses by subject
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Physics Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            Physics
          </h3>
          
          {chapterWise.physics.strongest.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-green-400" />
                <span className="text-sm font-semibold text-green-400">Strong Chapters</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {chapterWise.physics.strongest.map((chapter, idx) => (
                  <Badge key={idx} className="bg-green-500/10 text-green-300 border-green-500/30">
                    ✓ {chapter}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {chapterWise.physics.weakest.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-sm font-semibold text-red-400">Weak Chapters (Focus Here)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {chapterWise.physics.weakest.map((chapter, idx) => (
                  <Badge key={idx} className="bg-red-500/10 text-red-300 border-red-500/30">
                    ⚠ {chapter}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {chapterWise.physics.priority.length > 0 && (
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <h4 className="text-sm font-semibold text-foreground mb-3">Priority Focus Areas</h4>
              <div className="space-y-2">
                {chapterWise.physics.priority.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Badge className={`${getPriorityColor(item.priority)} text-xs`}>
                      {item.priority}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{item.chapter}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chemistry Section */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            Chemistry
          </h3>
          
          {chapterWise.chemistry.strongest.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-green-400" />
                <span className="text-sm font-semibold text-green-400">Strong Topics</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {chapterWise.chemistry.strongest.map((topic, idx) => (
                  <Badge key={idx} className="bg-green-500/10 text-green-300 border-green-500/30">
                    ✓ {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {chapterWise.chemistry.priority.length > 0 && (
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <h4 className="text-sm font-semibold text-foreground mb-3">Priority Focus Areas</h4>
              <div className="space-y-2">
                {chapterWise.chemistry.priority.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Badge className={`${getPriorityColor(item.priority)} text-xs`}>
                      {item.priority}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{item.topic}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Biology Section */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            Biology
          </h3>
          
          {chapterWise.biology.strongest.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-green-400" />
                <span className="text-sm font-semibold text-green-400">Strong Sections</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {chapterWise.biology.strongest.map((section, idx) => (
                  <Badge key={idx} className="bg-green-500/10 text-green-300 border-green-500/30">
                    ✓ {section}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {chapterWise.biology.priority.length > 0 && (
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <h4 className="text-sm font-semibold text-foreground mb-3">Priority Focus Areas</h4>
              <div className="space-y-2">
                {chapterWise.biology.priority.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Badge className={`${getPriorityColor(item.priority)} text-xs`}>
                      {item.priority}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{item.section}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border">
          <div className="p-4 rounded-lg bg-teal-500/10 border border-teal-500/30">
            <p className="text-sm font-semibold text-teal-400 mb-2">💡 Action Plan</p>
            <p className="text-xs text-muted-foreground">
              Focus on high-priority weak chapters first for maximum score improvement. Strengthen your strong areas to maintain them, and gradually work on medium-priority topics.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

