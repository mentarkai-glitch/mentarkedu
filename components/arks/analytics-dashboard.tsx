'use client';

interface AnalyticsDashboardProps {
  arkId: string;
}

export function AnalyticsDashboard({ arkId }: AnalyticsDashboardProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">Analytics</h2>
      <p className="text-slate-400">Analytics dashboard coming soon...</p>
    </div>
  );
}

