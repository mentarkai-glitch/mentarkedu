'use client';

interface TodayFocusProps {
  tasks: any[];
  totalEstimatedHours: number;
  completedHours: number;
  onTaskComplete: (taskId: string) => void;
  onTaskClick: (taskId: string) => void;
}

export function TodayFocus({ tasks, totalEstimatedHours, completedHours, onTaskComplete, onTaskClick }: TodayFocusProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">Today&apos;s Focus</h2>
      {tasks.length === 0 ? (
        <p className="text-slate-400">No tasks scheduled for today</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={task.is_completed}
                onChange={() => onTaskComplete(task.id)}
                className="w-4 h-4"
              />
              <span className="text-white">{task.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

