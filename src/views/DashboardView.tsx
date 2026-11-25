import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Target, 
  Wallet, 
  ArrowUpRight, 
  Sparkles, 
  Calendar as CalendarIcon, 
  HeartPulse, 
  AlertCircle 
} from 'lucide-react';
import { Task, RoutineItem, Goal, Transaction, HealthStat, NavigationTab, Language } from '../types';
import { User } from '../services/firebase';
import { getTranslations } from '../translations';

interface DashboardViewProps {
  tasks: Task[];
  routines: RoutineItem[];
  goals: Goal[];
  transactions: Transaction[];
  health: HealthStat;
  user: User | null;
  language: Language;
  onToggleTask: (id: string) => void;
  onToggleRoutine: (id: string) => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  routines,
  goals,
  transactions,
  health,
  user,
  language,
  onToggleTask,
  onToggleRoutine,
  onNavigate,
}) => {
  const t = getTranslations(language);
  const completedTasksCount = tasks.filter(tItem => tItem.completed).length;
  const taskProgress = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  const completedRoutinesCount = routines.filter(r => r.completed).length;
  const routineProgress = routines.length > 0 ? Math.round((completedRoutinesCount / routines.length) * 100) : 0;

  const avgGoalProgress =
    goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) : 0;

  const displayName = user
    ? user.displayName || user.email?.split('@')[0] || 'Member'
    : 'Alex Vance';

  const totalExpenses = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Demo Notice Banner (only when signed out / demo mode) */}
      {!user && (
        <div className="bg-[#123D32]/5 border border-[#123D32]/20 rounded-2xl p-4 flex items-center justify-between text-[#123D32] text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C5A45D]" />
            <span>{t.demoNotice}</span>
          </div>
          <span className="hidden sm:inline font-mono text-[10px] bg-[#123D32]/10 px-2 py-1 rounded">LifeFlow v1.0</span>
        </div>
      )}

      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-[#123D32] to-[#1a5244] text-[#F8F7F0] rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute end-0 bottom-0 opacity-10 translate-x-12 translate-y-12">
          <Sparkles className="w-80 h-80" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A45D]/20 text-[#C5A45D] text-xs font-semibold mb-4">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>{new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : language === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            {t.welcomeBack}, {displayName}
          </h1>
          <p className="text-[#F8F7F0]/80 text-sm sm:text-base leading-relaxed mb-6">
            &ldquo;{t.tagline}&rdquo; {completedTasksCount}/{tasks.length} tasks completed today. {t.todayOverview}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('tasks')}
              className="px-5 py-2.5 bg-[#C5A45D] text-[#123D32] font-bold rounded-xl hover:bg-[#b09050] transition-colors shadow-sm text-sm"
            >
              {t.viewTasks}
            </button>
            <button
              onClick={() => onNavigate('ai-assistant')}
              className="px-5 py-2.5 bg-white/10 border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-colors text-sm"
            >
              {t.askAiCoach}
            </button>
          </div>
        </div>
      </div>

      {/* Progress Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Tasks Progress */}
        <div 
          onClick={() => onNavigate('tasks')}
          className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs hover:border-[#123D32] cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{t.tasksToday}</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#123D32] flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-bold font-mono text-neutral-900">{completedTasksCount}/{tasks.length}</span>
            <span className="text-xs font-semibold text-emerald-600">{taskProgress}%</span>
          </div>
          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#123D32] rounded-full transition-all duration-500" style={{ width: `${taskProgress}%` }}></div>
          </div>
        </div>

        {/* Routine Progress */}
        <div 
          onClick={() => onNavigate('routine')}
          className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs hover:border-[#123D32] cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{t.routine}</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-bold font-mono text-neutral-900">{completedRoutinesCount}/{routines.length}</span>
            <span className="text-xs font-semibold text-amber-600">{routineProgress}% Done</span>
          </div>
          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#C5A45D] rounded-full transition-all duration-500" style={{ width: `${routineProgress}%` }}></div>
          </div>
        </div>

        {/* Goals Progress */}
        <div 
          onClick={() => onNavigate('goals')}
          className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs hover:border-[#123D32] cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{t.goals}</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-bold font-mono text-neutral-900">{goals.length} Active</span>
            <span className="text-xs font-semibold text-teal-600">{avgGoalProgress}% Avg</span>
          </div>
          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-700 rounded-full transition-all duration-500" style={{ width: `${avgGoalProgress}%` }}></div>
          </div>
        </div>

        {/* Finance Balance */}
        <div 
          onClick={() => onNavigate('finance')}
          className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs hover:border-[#123D32] cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Net Cashflow</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-bold font-mono text-neutral-900">${(totalIncome - totalExpenses).toLocaleString()}</span>
            <span className="text-xs font-semibold text-emerald-600">Healthy</span>
          </div>
          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: '80%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Tasks & Routine */}
        <div className="lg:col-span-2 space-y-8">
          {/* Today's Priority Tasks */}
          <div className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-lg text-[#123D32]">Today&apos;s Tasks & Action Queue</h3>
                <p className="text-xs text-neutral-500">Showing priority items for today</p>
              </div>
              <button 
                onClick={() => onNavigate('tasks')}
                className="text-xs font-semibold text-[#123D32] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {tasks.slice(0, 4).map(task => (
                <div 
                  key={task.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-[#F8F7F0]/60 border border-[#E9ECE8] hover:border-[#123D32]/30 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <input 
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => onToggleTask(task.id)}
                      className="w-5 h-5 rounded accent-[#123D32] cursor-pointer"
                    />
                    <div>
                      <span className={`text-sm font-semibold ${task.completed ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-500">
                        <span className="font-medium text-[#123D32]">{task.category}</span>
                        <span>•</span>
                        <span>Due: {task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    task.priority === 'High' ? 'bg-red-50 text-red-700' :
                    task.priority === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Routine Checklist */}
          <div className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-lg text-[#123D32]">Daily Routine & Habits</h3>
                <p className="text-xs text-neutral-500">Track your daily wellness and productivity rhythm</p>
              </div>
              <button 
                onClick={() => onNavigate('routine')}
                className="text-xs font-semibold text-[#123D32] hover:underline flex items-center gap-1"
              >
                <span>Full Schedule</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {routines.slice(0, 4).map(routine => (
                <div 
                  key={routine.id}
                  onClick={() => onToggleRoutine(routine.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    routine.completed 
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' 
                      : 'bg-white border-[#E9ECE8] hover:border-neutral-300 text-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${routine.completed ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                      ✓
                    </div>
                    <div>
                      <span className="text-xs font-mono text-neutral-500 block">{routine.time}</span>
                      <span className={`text-sm font-semibold ${routine.completed ? 'line-through opacity-75' : ''}`}>{routine.title}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono bg-white/80 px-2 py-0.5 rounded border border-neutral-200">
                    🔥 {routine.streak}d
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Health, Goals, Finance */}
        <div className="space-y-8">
          {/* Health & Vital Summary */}
          <div className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-[#123D32]">Health & Vital Vibe</h3>
              <HeartPulse className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-xs font-medium text-neutral-600">Hydration (Glasses)</span>
                <span className="text-sm font-bold font-mono text-[#123D32]">{health.waterDrank} / 8 glasses</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-xs font-medium text-neutral-600">Sleep Quality</span>
                <span className="text-sm font-bold font-mono text-emerald-700">{health.sleepHours} hrs (Optimal)</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-xs font-medium text-neutral-600">Daily Steps</span>
                <span className="text-sm font-bold font-mono text-[#123D32]">{health.steps.toLocaleString()} steps</span>
              </div>
            </div>
          </div>

          {/* Goals Snapshot */}
          <div className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-[#123D32]">Goal Milestones</h3>
              <Target className="w-5 h-5 text-[#C5A45D]" />
            </div>
            <div className="space-y-4">
              {goals.map(goal => (
                <div key={goal.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-neutral-800 truncate max-w-[200px]">{goal.title}</span>
                    <span className="font-mono font-bold text-[#123D32]">{goal.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#123D32] rounded-full" style={{ width: `${goal.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Important Reminder / Emergency Card */}
          <div className="bg-[#123D32] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#C5A45D] text-[#123D32] flex items-center justify-center font-bold">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm">Emergency ICE Ready</h4>
            </div>
            <p className="text-xs text-[#F8F7F0]/80 mb-4 leading-relaxed">
              Medical insurance policy #POL-2026-884 active. Emergency contacts stored securely in vault.
            </p>
            <button
              onClick={() => onNavigate('emergency')}
              className="w-full py-2 bg-[#C5A45D] text-[#123D32] rounded-xl font-bold text-xs hover:bg-[#b09050] transition-colors"
            >
              View ICE Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
