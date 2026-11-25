import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Users, Trash2 } from 'lucide-react';
import { generateFirestoreDocId } from '../services/firestoreSerializers';

export interface CalendarEventItem {
  id: string;
  title: string;
  time: string;
  category: string;
  attendees: string;
  day: number;
}

interface CalendarViewProps {
  events: CalendarEventItem[];
  onAddEvent: (ev: CalendarEventItem) => void;
  onDeleteEvent: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ events, onAddEvent, onDeleteEvent }) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('10:00 AM');
  const [category, setCategory] = useState('Work');
  const [attendees, setAttendees] = useState('Personal');
  const [day, setDay] = useState(23);

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddEvent({
      id: generateFirestoreDocId('ev'),
      title: title.trim(),
      time,
      category,
      attendees,
      day: Math.min(31, Math.max(1, Number(day) || 1))
    });
    setTitle('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E9ECE8] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#123D32]">Global Calendar & Schedule</h2>
          <p className="text-xs text-neutral-500">November 2026 • Unified life commitments and appointments.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#123D32] text-white rounded-xl hover:bg-[#1a5244] font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Event</span>
        </button>
      </div>

      {/* Grid calendar overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-base text-[#123D32]">November 2026</h3>
            <span className="text-xs bg-[#123D32]/10 text-[#123D32] px-3 py-1 rounded-full font-semibold">Today: Nov 23</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-neutral-400 mb-2">
            <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            <div className="h-20 bg-neutral-50/50 rounded-xl opacity-40"></div>
            <div className="h-20 bg-neutral-50/50 rounded-xl opacity-40"></div>
            <div className="h-20 bg-neutral-50/50 rounded-xl opacity-40"></div>
            <div className="h-20 bg-neutral-50/50 rounded-xl opacity-40"></div>
            <div className="h-20 bg-neutral-50/50 rounded-xl opacity-40"></div>
            <div className="h-20 bg-neutral-50/50 rounded-xl opacity-40"></div>
            {days.map(d => {
              const isToday = d === 23;
              const dayEvents = events.filter(ev => ev.day === d);
              return (
                <div 
                  key={d} 
                  className={`h-24 p-2 rounded-xl border flex flex-col justify-between transition-all overflow-y-auto ${
                    isToday 
                      ? 'bg-[#123D32] text-white border-[#123D32] shadow-md font-bold' 
                      : 'bg-white border-neutral-200 text-neutral-800 hover:border-[#123D32]'
                  }`}
                >
                  <span className={`text-xs font-mono ${isToday ? 'text-[#C5A45D]' : 'text-neutral-500'}`}>{d}</span>
                  {dayEvents.map(ev => (
                    <div key={ev.id} className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium ${isToday ? 'bg-[#C5A45D] text-[#123D32]' : 'bg-emerald-50 text-emerald-800'}`}>
                      {ev.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs">
            <h3 className="font-bold text-base text-[#123D32] mb-4">Scheduled Commitments</h3>
            <div className="space-y-4">
              {events.length === 0 && (
                <p className="text-xs text-neutral-400 text-center py-6">No upcoming events scheduled.</p>
              )}
              {events.map((ev) => (
                <div key={ev.id} className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2 relative group">
                  <button
                    onClick={() => onDeleteEvent(ev.id)}
                    className="absolute top-3 right-3 text-neutral-400 hover:text-red-600 transition-colors"
                    title="Delete event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex items-center justify-between pr-6">
                    <span className="text-xs font-semibold text-[#123D32] bg-[#123D32]/10 px-2 py-0.5 rounded">{ev.category}</span>
                    <span className="text-xs font-mono text-neutral-500">Day {ev.day} • {ev.time}</span>
                  </div>
                  <h4 className="font-semibold text-sm text-neutral-900">{ev.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Users className="w-3.5 h-3.5" />
                    <span>{ev.attendees}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-[#E9ECE8] space-y-4">
            <h3 className="font-bold text-lg text-[#123D32]">Schedule New Event</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Event Title</label>
                <input 
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q1 Strategy Sync"
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-[#123D32]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Day of November</label>
                  <input 
                    type="number"
                    min="1"
                    max="30"
                    value={day}
                    onChange={(e) => setDay(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-[#123D32]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Time</label>
                  <input 
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-[#123D32]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Category</label>
                  <input 
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-[#123D32]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Attendees</label>
                  <input 
                    type="text"
                    value={attendees}
                    onChange={(e) => setAttendees(e.target.value)}
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
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
