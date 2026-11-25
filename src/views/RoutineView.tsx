import React from 'react';
import { Clock, CheckCircle2, Flame, Sparkles } from 'lucide-react';
import { RoutineItem } from '../types';

interface RoutineViewProps {
  routines: RoutineItem[];
  onToggleRoutine: (id: string) => void;
}

export const RoutineView: React.FC<RoutineViewProps> = ({
  routines,
  onToggleRoutine,
}) => {
  const completedCount = routines.filter(r => r.completed).length;
  const progress = routines.length > 0 ? Math.round((completedCount / routines.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="bg-white p-6 rounded-2xl border border-[#E9ECE8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#123D32]">Daily Routine & Habits</h2>
          <p className="text-xs text-neutral-500">Consistent daily rituals compound into extraordinary results.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-end">
            <span className="text-xs font-semibold text-neutral-500 block">Today&apos;s Completion</span>
            <span className="text-lg font-bold font-mono text-[#123D32]">{progress}%</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            {completedCount}/{routines.length}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {routines.length === 0 && (
          <div className="bg-white rounded-2xl p-12 border border-[#E9ECE8] text-center text-neutral-400">
            <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium text-neutral-600">No daily routines configured yet.</p>
          </div>
        )}
        {routines.map(routine => (
          <div 
            key={routine.id}
            onClick={() => onToggleRoutine(routine.id)}
            className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              routine.completed 
                ? 'bg-emerald-50/40 border-emerald-200 text-emerald-900 shadow-xs' 
                : 'bg-white border-[#E9ECE8] hover:border-neutral-300 text-neutral-900 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${routine.completed ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                {routine.completed ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-[#C5A45D] uppercase tracking-wider">{routine.category} • {routine.time}</span>
                <h4 className={`text-base font-bold mt-0.5 ${routine.completed ? 'line-through opacity-75' : 'text-neutral-900'}`}>
                  {routine.title}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-neutral-200 rounded-xl shadow-xs">
              <Flame className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold font-mono text-neutral-800">{routine.streak} Day Streak</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

