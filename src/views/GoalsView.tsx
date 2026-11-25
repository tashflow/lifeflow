import React, { useState } from 'react';
import { Target, Plus, CheckCircle2, Circle } from 'lucide-react';
import { Goal } from '../types';

interface GoalsViewProps {
  goals: Goal[];
  onAddGoal: (goal: Goal) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  onAddGoal,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Career' | 'Health' | 'Wealth' | 'Personal'>('Wealth');
  const [targetDate, setTargetDate] = useState('Dec 2026');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddGoal({
      id: 'g_' + Date.now(),
      title,
      category,
      progress: 0,
      targetDate,
      milestones: [
        { id: 'm1', title: 'Define initial milestones', completed: false }
      ]
    });
    setTitle('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E9ECE8] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#123D32]">Goals & Milestones</h2>
          <p className="text-xs text-neutral-500">Long-term vision broken down into actionable quarterly and annual milestones.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#123D32] text-white rounded-xl hover:bg-[#1a5244] font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {goals.map(goal => (
          <div key={goal.id} className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#123D32] bg-[#123D32]/10 px-2.5 py-1 rounded-lg">{goal.category}</span>
                <span className="text-xs font-mono font-semibold text-neutral-500">Target: {goal.targetDate}</span>
              </div>
              <h3 className="font-bold text-lg text-neutral-900 mb-4">{goal.title}</h3>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-neutral-500">Progress</span>
                  <span className="font-mono text-[#123D32]">{goal.progress}%</span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#123D32] rounded-full" style={{ width: `${goal.progress}%` }}></div>
                </div>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-neutral-100">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Milestones</span>
                {goal.milestones.map(m => (
                  <div key={m.id} className="flex items-center gap-2.5 text-xs">
                    {m.completed ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <Circle className="w-4 h-4 text-neutral-300 shrink-0" />}
                    <span className={m.completed ? 'line-through text-neutral-400' : 'text-neutral-800'}>{m.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-[#E9ECE8] space-y-4">
            <h3 className="font-bold text-lg text-[#123D32]">Create New Goal</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Goal Title</label>
                <input 
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master cloud native architecture"
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-[#123D32]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm bg-white focus:outline-none focus:border-[#123D32]"
                  >
                    <option value="Wealth">Wealth</option>
                    <option value="Health">Health</option>
                    <option value="Career">Career</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Target Date</label>
                  <input 
                    type="text"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-[#123D32]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-neutral-200 rounded-xl text-neutral-700 font-medium text-sm hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#123D32] text-white rounded-xl font-medium text-sm hover:bg-[#1a5244]"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
