"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileCheck, User } from "lucide-react";
import type { InstituteARKTemplate } from "@/lib/types";

interface TemplatePreviewProps {
  template: InstituteARKTemplate;
  onSelect: () => void;
  isSelected: boolean;
}

export function TemplatePreview({ template, onSelect, isSelected }: TemplatePreviewProps) {
  const milestoneCount = Array.isArray(template.milestones) ? template.milestones.length : 0;

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:border-yellow-500/50 ${
        isSelected
          ? 'border-2 border-yellow-400 bg-yellow-900/10 neon-glow'
          : 'glass border-yellow-500/20'
      }`}
      onClick={onSelect}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-yellow-400" />
              {template.title}
            </CardTitle>
            <CardDescription className="mt-2">
              {template.description}
            </CardDescription>
          </div>
          {isSelected && (
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              Selected
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Milestones:</span>
            <span className="text-white font-semibold">{milestoneCount}</span>
          </div>
          
          {template.target_grade && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Target Grade:</span>
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                Grade {template.target_grade}
              </Badge>
            </div>
          )}
          
          {template.target_batch && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Batch:</span>
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                {template.target_batch}
              </Badge>
            </div>
          )}
          
          <div className="pt-3 border-t border-gray-700">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              variant={isSelected ? "default" : "outline"}
              className={`w-full ${
                isSelected 
                  ? 'bg-gradient-cyan-blue hover:opacity-90 neon-glow' 
                  : 'border-yellow-500/30 hover:bg-yellow-500/10'
              }`}
              size="sm"
            >
              {isSelected ? 'Using This Template' : 'Use This Template'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

