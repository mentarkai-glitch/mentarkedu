'use client';

import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';

interface QuickStatsSidebarProps {
  arkId: string;
  todayTasksCount: number;
  upcomingMilestonesCount: number;
  recentProgress: any[];
  onAddNote: () => void;
  onReschedule: () => void;
}

export function QuickStatsSidebar({
  arkId,
  todayTasksCount,
  upcomingMilestonesCount,
  recentProgress,
  onAddNote,
  onReschedule
}: QuickStatsSidebarProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-bold text-white">Quick Stats</h3>
      <div className="space-y-2">
        <div className="text-sm text-slate-400">Today&apos;s Tasks: <span className="text-white font-semibold">{todayTasksCount}</span></div>
        <div className="text-sm text-slate-400">Upcoming Milestones: <span className="text-white font-semibold">{upcomingMilestonesCount}</span></div>
      </div>
      <div className="space-y-2 pt-4 border-t border-slate-700">
        <Button
          onClick={onAddNote}
          variant="outline"
          size="sm"
          className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Note
        </Button>
        <Button
          onClick={onReschedule}
          variant="outline"
          size="sm"
          className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Reschedule
        </Button>
      </div>
    </div>
  );
}

