import React, { useState } from 'react';
import { X, CheckSquare, Target, Wallet, BookOpenText } from 'lucide-react';
import { Task, Goal, NoteItem, Transaction } from '../types';
import { generateFirestoreDocId } from '../services/firestoreSerializers';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Task) => void;
  onAddGoal: (goal: Goal) => void;
  onAddNote: (note: NoteItem) => void;
  onAddTransaction: (tx: Transaction) => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  onAddGoal,
  onAddNote,
  onAddTransaction,
}) => {
  const [activeType, setActiveType] = useState<'task' | 'goal' | 'note' | 'finance'>('task');

  // Form states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<'Work' | 'Personal' | 'Health' | 'Finance' | 'Family'>('Work');
  const [taskPriority, setTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState<'Career' | 'Health' | 'Wealth' | 'Personal'>('Wealth');

  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteFolder, setNoteFolder] = useState<'Personal' | 'Ideas' | 'Journal' | 'Work'>('Personal');

  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txCategory, setTxCategory] = useState<'Housing' | 'Food' | 'Transport' | 'Investment' | 'Salary' | 'Leisure'>('Food');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeType === 'task') {
      if (!taskTitle.trim()) return;
      onAddTask({
        id: generateFirestoreDocId('t'),
        title: taskTitle.trim(),
        category: taskCategory,
        priority: taskPriority,
        dueDate: 'Today',
        completed: false,
      });
      setTaskTitle('');
    } else if (activeType === 'goal') {
      if (!goalTitle.trim()) return;
      onAddGoal({
        id: generateFirestoreDocId('g'),
        title: goalTitle.trim(),
        category: goalCategory,
        progress: 0,
        targetDate: '2026',
        milestones: [{ id: 'm1', title: 'Initial setup & milestone', completed: false }]
      });
      setGoalTitle('');
    } else if (activeType === 'note') {
      if (!noteTitle.trim()) return;
      onAddNote({
        id: generateFirestoreDocId('n'),
        title: noteTitle.trim(),
        folder: noteFolder,
        content: noteContent,
        updatedAt: new Date().toISOString().split('T')[0]
      });
      setNoteTitle('');
      setNoteContent('');
    } else if (activeType === 'finance') {
      const parsedAmount = parseFloat(txAmount);
      if (!txTitle.trim() || !Number.isFinite(parsedAmount)) return;
      onAddTransaction({
        id: generateFirestoreDocId('tx'),
        title: txTitle.trim(),
        amount: parsedAmount,
        type: txType,
        category: txCategory,
        date: new Date().toISOString().split('T')[0]
      });
      setTxTitle('');
      setTxAmount('');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#E9ECE8]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E9ECE8] bg-[#123D32] text-white">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">Quick Add to LifeFlow</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Selector Tabs */}
        <div className="grid grid-cols-4 bg-neutral-100 p-1.5 gap-1 border-b border-[#E9ECE8]">
          <button
            type="button"
            onClick={() => setActiveType('task')}
            className={`flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-semibold transition-all ${activeType === 'task' ? 'bg-white text-[#123D32] shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Task</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveType('goal')}
            className={`flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-semibold transition-all ${activeType === 'goal' ? 'bg-white text-[#123D32] shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
          >
            <Target className="w-4 h-4" />
            <span>Goal</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveType('note')}
            className={`flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-semibold transition-all ${activeType === 'note' ? 'bg-white text-[#123D32] shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
          >
            <BookOpenText className="w-4 h-4" />
            <span>Note</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveType('finance')}
            className={`flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-semibold transition-all ${activeType === 'finance' ? 'bg-white text-[#123D32] shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
          >
            <Wallet className="w-4 h-4" />
            <span>Finance</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {activeType === 'task' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g., Prepare quarterly presentation"
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-[#123D32]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={taskCategory}
                    onChange={(e: any) => setTaskCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-[#123D32] bg-white"
                  >
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Health">Health</option>
                    <option value="Finance">Finance</option>
                    <option value="Family">Family</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e: any) => setTaskPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-[#123D32] bg-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {activeType === 'goal' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Goal Objective</label>
                <input
                  type="text"
                  required
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g., Launch mobile SaaS app"
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-[#123D32]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Category</label>
                <select
                  value={goalCategory}
                  onChange={(e: any) => setGoalCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-[#123D32] bg-white"
                >
                  <option value="Wealth">Wealth</option>
                  <option value="Health">Health</option>
                  <option value="Career">Career</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>
            </>
          )}

          {activeType === 'note' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Note Title</label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g., Book recommendations 2026"
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-[#123D32]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Folder</label>
                <select
                  value={noteFolder}
                  onChange={(e: any) => setNoteFolder(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-[#123D32] bg-white mb-3"
                >
                  <option value="Personal">Personal</option>
                  <option value="Ideas">Ideas</option>
                  <option value="Journal">Journal</option>
                  <option value="Work">Work</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Content</label>
                <textarea
                  rows={3}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write your note contents..."
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-[#123D32]"
                />
              </div>
            </>
          )}

          {activeType === 'finance' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Transaction Title</label>
                  <input
                    type="text"
                    required
                    value={txTitle}
                    onChange={(e) => setTxTitle(e.target.value)}
                    placeholder="e.g., Organic Groceries"
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-[#123D32]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="150.00"
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-[#123D32] font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Type</label>
                  <select
                    value={txType}
                    onChange={(e: any) => setTxType(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-[#123D32] bg-white"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={txCategory}
                    onChange={(e: any) => setTxCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-[#123D32] bg-white"
                  >
                    <option value="Food">Food</option>
                    <option value="Housing">Housing</option>
                    <option value="Transport">Transport</option>
                    <option value="Investment">Investment</option>
                    <option value="Salary">Salary</option>
                    <option value="Leisure">Leisure</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 font-medium text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#123D32] text-white rounded-xl hover:bg-[#1a5244] font-medium text-sm transition-colors shadow-sm"
            >
              Save Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
