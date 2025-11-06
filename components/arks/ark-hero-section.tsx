'use client';

interface ARKHeroSectionProps {
  ark: any;
  stats: any;
  upcomingDeadline?: any;
}

export function ARKHeroSection({ ark, stats, upcomingDeadline }: ARKHeroSectionProps) {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700">
      <h1 className="text-3xl font-bold text-white mb-2">{ark?.title || 'ARK'}</h1>
      <p className="text-slate-400">{ark?.description || ''}</p>
    </div>
  );
}

