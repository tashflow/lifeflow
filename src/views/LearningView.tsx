import React from 'react';
import { GraduationCap, BookOpenText } from 'lucide-react';
import { LearningItem } from '../types';

interface LearningViewProps {
  learning: LearningItem[];
}

export const LearningView: React.FC<LearningViewProps> = ({ learning }) => {
  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="bg-white p-6 rounded-2xl border border-[#E9ECE8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#123D32]">Learning & Skill Tracker</h2>
          <p className="text-xs text-neutral-500">Continuous mastery of engineering, economics, languages, and longevity science.</p>
        </div>
      </div>

      {learning.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-[#E9ECE8] text-center text-neutral-400">
          <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium text-neutral-600">No learning items tracked yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {learning.map(item => (
            <div key={item.id} className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#123D32] bg-[#123D32]/10 px-2.5 py-1 rounded-lg">{item.category}</span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${item.status === 'Completed' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>{item.status}</span>
                </div>
                <h3 className="font-bold text-lg text-neutral-900 mb-1">{item.title}</h3>
                <p className="text-xs text-neutral-500 mb-6">Provider: {item.provider}</p>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-neutral-500">Mastery Progress</span>
                    <span className="font-mono text-[#123D32]">{item.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#123D32] rounded-full" style={{ width: `${item.progress}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

