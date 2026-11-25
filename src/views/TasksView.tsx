import React, { useState } from 'react';
import { CheckSquare, Plus, Filter, Trash2 } from 'lucide-react';
import { Task } from '../types';
import { generateFirestoreDocId } from '../services/firestoreSerializers';

interface TasksViewProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
}) => {
  const [filter, setFilter] = useState<'all' | 'Work' | 'Personal' | 'Health' | 'Finance' | 'Family'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Work' | 'Personal' | 'Health' | 'Finance' | 'Family'>('Work');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [dueDate, setDueDate] = useState('Tomorrow');

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.category === filter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask({
      id: generateFirestoreDocId('t'),
      title: title.trim(),
      category,
      priority,
      dueDate,
      completed: false,
    });
    setTitle('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E9ECE8] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#123D32]">My Tasks & Action Queue</h2>
          <p className="text-xs text-neutral-500">Manage daily obligations across work, personal life, and health.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#123D32] text-white rounded-xl hover:bg-[#1a5244] font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {(['all', 'Work', 'Personal', 'Health', 'Finance', 'Family'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
              filter === cat 
                ? 'bg-[#123D32] text-white shadow-sm' 
                : 'bg-white border border-[#E9ECE8] text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {cat === 'all' ? 'All Tasks' : cat}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-2xl border border-[#E9ECE8] shadow-xs overflow-hidden">
        <div className="divide-y divide-neutral-100">
          {filteredTasks.length === 0 && (
            <div className="text-center py-16 text-neutral-400">
              <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No tasks found in this category.</p>
            </div>
          )}
          {filteredTasks.map(task => (
            <div 
              key={task.id}
              className={`p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-neutral-50/80 transition-colors ${task.completed ? 'bg-neutral-50/50' : 'bg-white'}`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <input 
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggleTask(task.id)}
                  className="w-5 h-5 rounded accent-[#123D32] cursor-pointer shrink-0"
                />
                <div className="min-w-0">
                  <h4 className={`text-sm font-semibold truncate ${task.completed ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>
                    {task.title}
                  </h4>
                  {task.notes && (
                    <p className="text-xs text-neutral-500 truncate mt-0.5">{task.notes}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                    <span className="font-medium text-[#123D32] bg-[#123D32]/10 px-2 py-0.5 rounded-md">{task.category}</span>
                    <span>•</span>
                    <span>Due: {task.dueDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  task.priority === 'High' ? 'bg-red-50 text-red-700' :
                  task.priority === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                }`}>
                  {task.priority}
                </span>
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-[#E9ECE8] space-y-4">
            <h3 className="font-bold text-lg text-[#123D32]">Add New Task</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Task Title</label>
                <input 
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Complete quarterly financial review"
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
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm bg-white focus:outline-none focus:border-[#123D32]"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Due Date</label>
                <input 
                  type="text"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  placeholder="e.g. Today, Tomorrow, Mar 05"
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-[#123D32]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border border-neutral-200 rounded-xl text-neutral-700 font-medium text-sm hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#123D32] text-white rounded-xl font-medium text-sm hover:bg-[#1a5244]"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
