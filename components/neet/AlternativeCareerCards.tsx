'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import { AlternativeCareer } from '@/lib/utils/neet-scoring';

interface AlternativeCareerCardsProps {
  alternativeCareers: AlternativeCareer[];
}

export function AlternativeCareerCards({ alternativeCareers }: AlternativeCareerCardsProps) {
  if (alternativeCareers.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-teal-400" />
            Alternative Career Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Continue focusing on NEET preparation. Your strong alignment suggests you're on the right track.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getFitColor = (score: number): string => {
    if (score >= 80) return 'text-green-400 bg-green-400/10 border-green-400/30';
    if (score >= 65) return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-teal-400" />
          Plan B: Alternative Career Options
        </CardTitle>
        <CardDescription>
          High-fit allied health and related careers based on your profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alternativeCareers.map((career, index) => (
            <Card
              key={index}
              className={`border-border bg-muted/30 hover:bg-muted/50 transition-all ${
                career.fitScore >= 80 ? 'ring-2 ring-green-500/50' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{career.name}</CardTitle>
                  <Badge className={getFitColor(career.fitScore)}>
                    {career.fitScore}% fit
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-card/50 border border-border">
                  <p className="text-sm font-semibold text-foreground mb-1">Why this fits:</p>
                  <p className="text-sm text-muted-foreground">{career.why}</p>
                </div>
                <p className="text-sm text-muted-foreground">{career.description}</p>
                {career.careerTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {career.careerTags.slice(0, 3).map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        {tag.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {alternativeCareers.length > 0 && (
          <div className="mt-6 p-4 rounded-lg bg-teal-500/10 border border-teal-500/30">
            <p className="text-sm text-teal-400 font-semibold mb-2">
              💡 Remember: Plan B doesn't mean giving up!
            </p>
            <p className="text-xs text-muted-foreground">
              These careers are excellent backup options while you continue NEET preparation. They offer fulfilling careers in healthcare and related fields, often with shorter degree programs and good job prospects.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

