import React, { useState } from 'react';
import { Search, X, CheckSquare, Target, BookOpenText, Wallet, FolderLock, ArrowRight } from 'lucide-react';
import { Task, Goal, NoteItem, DocumentItem, Transaction, NavigationTab } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  goals: Goal[];
  notes: NoteItem[];
  documents: DocumentItem[];
  transactions: Transaction[];
  onNavigate: (tab: NavigationTab) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  tasks,
  goals,
  notes,
  documents,
  transactions,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const q = query.toLowerCase();

  const matchedTasks = tasks.filter(t => t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
  const matchedGoals = goals.filter(g => g.title.toLowerCase().includes(q) || g.category.toLowerCase().includes(q));
  const matchedNotes = notes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
  const matchedDocs = documents.filter(d => d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q));
  const matchedTx = transactions.filter(t => t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));

  const hasResults = q.trim() !== '' && (matchedTasks.length > 0 || matchedGoals.length > 0 || matchedNotes.length > 0 || matchedDocs.length > 0 || matchedTx.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-[#E9ECE8]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E9ECE8]">
          <Search className="w-5 h-5 text-neutral-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across all your tasks, goals, notes, documents, and finance..."
            className="w-full bg-transparent text-neutral-900 placeholder:text-neutral-400 text-base focus:outline-none"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-6 space-y-6">
          {query.trim() === '' && (
            <div className="text-center py-12 text-neutral-400">
              <p className="text-sm">Type anything above to search across your entire LifeFlow OS.</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <span className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs">Tasks</span>
                <span className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs">Goals</span>
                <span className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs">Notes</span>
                <span className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs">Documents</span>
                <span className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs">Finance</span>
              </div>
            </div>
          )}

          {query.trim() !== '' && !hasResults && (
            <div className="text-center py-12 text-neutral-500">
              <p className="text-sm font-medium">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-neutral-400 mt-1">Try checking your spelling or searching for another keyword.</p>
            </div>
          )}

          {/* Tasks Results */}
          {matchedTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#123D32] uppercase tracking-wider mb-3">
                <CheckSquare className="w-4 h-4 text-[#C5A45D]" />
                <span>Tasks ({matchedTasks.length})</span>
              </div>
              <div className="space-y-2">
                {matchedTasks.map(task => (
                  <div 
                    key={task.id}
                    onClick={() => { onNavigate('tasks'); onClose(); }}
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 hover:bg-[#F8F7F0] border border-neutral-200 cursor-pointer transition-all"
                  >
                    <div>
                      <span className={`text-sm font-medium ${task.completed ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>{task.title}</span>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-500">
                        <span className="text-[#123D32] font-semibold">{task.category}</span>
                        <span>•</span>
                        <span>Due: {task.dueDate}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Goals Results */}
          {matchedGoals.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#123D32] uppercase tracking-wider mb-3">
                <Target className="w-4 h-4 text-[#C5A45D]" />
                <span>Goals ({matchedGoals.length})</span>
              </div>
              <div className="space-y-2">
                {matchedGoals.map(goal => (
                  <div 
                    key={goal.id}
                    onClick={() => { onNavigate('goals'); onClose(); }}
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 hover:bg-[#F8F7F0] border border-neutral-200 cursor-pointer transition-all"
                  >
                    <div>
                      <span className="text-sm font-semibold text-neutral-900">{goal.title}</span>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-500">
                        <span>Progress: {goal.progress}%</span>
                        <span>•</span>
                        <span>Target: {goal.targetDate}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes Results */}
          {matchedNotes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#123D32] uppercase tracking-wider mb-3">
                <BookOpenText className="w-4 h-4 text-[#C5A45D]" />
                <span>Notes & Diary ({matchedNotes.length})</span>
              </div>
              <div className="space-y-2">
                {matchedNotes.map(note => (
                  <div 
                    key={note.id}
                    onClick={() => { onNavigate('notes'); onClose(); }}
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 hover:bg-[#F8F7F0] border border-neutral-200 cursor-pointer transition-all"
                  >
                    <div>
                      <span className="text-sm font-semibold text-neutral-900">{note.title}</span>
                      <p className="text-xs text-neutral-500 truncate max-w-md mt-0.5">{note.content}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents Results */}
          {matchedDocs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#123D32] uppercase tracking-wider mb-3">
                <FolderLock className="w-4 h-4 text-[#C5A45D]" />
                <span>Documents ({matchedDocs.length})</span>
              </div>
              <div className="space-y-2">
                {matchedDocs.map(doc => (
                  <div 
                    key={doc.id}
                    onClick={() => { onNavigate('documents'); onClose(); }}
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 hover:bg-[#F8F7F0] border border-neutral-200 cursor-pointer transition-all"
                  >
                    <div>
                      <span className="text-sm font-semibold text-neutral-900">{doc.name}</span>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-500">
                        <span>{doc.category}</span>
                        <span>•</span>
                        <span>{doc.size}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Finance Results */}
          {matchedTx.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#123D32] uppercase tracking-wider mb-3">
                <Wallet className="w-4 h-4 text-[#C5A45D]" />
                <span>Finance Transactions ({matchedTx.length})</span>
              </div>
              <div className="space-y-2">
                {matchedTx.map(tx => (
                  <div 
                    key={tx.id}
                    onClick={() => { onNavigate('finance'); onClose(); }}
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 hover:bg-[#F8F7F0] border border-neutral-200 cursor-pointer transition-all"
                  >
                    <div>
                      <span className="text-sm font-semibold text-neutral-900">{tx.title}</span>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-500">
                        <span>{tx.category}</span>
                        <span>•</span>
                        <span>{tx.date}</span>
                      </div>
                    </div>
                    <span className={`text-sm font-bold font-mono ${tx.type === 'income' ? 'text-emerald-600' : 'text-neutral-800'}`}>
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-50 border-t border-[#E9ECE8] text-xs text-neutral-500 flex justify-between items-center">
          <span>Press ESC to close</span>
          <span className="font-semibold text-[#123D32]">LifeFlow Global Search</span>
        </div>
      </div>
    </div>
  );
};
