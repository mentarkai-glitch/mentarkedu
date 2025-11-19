'use client';

import { Progress } from '@/components/ui/progress';

interface ProgressIndicatorProps {
  current: number;
  total: number;
  estimatedTimeLeft?: string;
}

export function ProgressIndicator({ current, total, estimatedTimeLeft }: ProgressIndicatorProps) {
  const progress = (current / total) * 100;
  
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600 font-medium">
          Question {current} of {total}
        </span>
        {estimatedTimeLeft && (
          <span className="text-slate-500">
            {estimatedTimeLeft}
          </span>
        )}
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
