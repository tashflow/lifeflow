import React from 'react';
import { HeartPulse, Plus, Droplet, Moon, Activity, Flame } from 'lucide-react';
import { HealthStat } from '../types';

interface HealthViewProps {
  health: HealthStat;
  onUpdateHealth: (newHealth: HealthStat) => void;
}

export const HealthView: React.FC<HealthViewProps> = ({ health, onUpdateHealth }) => {
  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="bg-white p-6 rounded-2xl border border-[#E9ECE8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#123D32]">Health Reminders & Vitals</h2>
          <p className="text-xs text-neutral-500">Monitor hydration, sleep quality, biometric vitals, and preventive checkups.</p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold">
          <HeartPulse className="w-4 h-4 text-emerald-600" />
          <span>Optimal Physical Vitality</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Hydration</span>
            <Droplet className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-2xl font-bold font-mono text-neutral-900">{health.waterDrank} / 8</span>
            <span className="text-xs text-blue-600 font-semibold">Glasses</span>
          </div>
          <button
            onClick={() => onUpdateHealth({ ...health, waterDrank: Math.min(8, health.waterDrank + 1) })}
            className="w-full py-2 bg-blue-50 text-blue-700 rounded-xl font-semibold text-xs hover:bg-blue-100 transition-colors"
          >
            + Drink Glass
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Sleep Quality</span>
            <Moon className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-2xl font-bold font-mono text-neutral-900">{health.sleepHours} hrs</span>
            <span className="text-xs text-indigo-600 font-semibold">Restorative</span>
          </div>
          <div className="text-xs text-neutral-500 bg-neutral-50 p-2 rounded-lg text-center">
            Deep sleep: 2h 45m
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Daily Steps</span>
            <Activity className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-2xl font-bold font-mono text-neutral-900">{health.steps.toLocaleString()}</span>
            <span className="text-xs text-emerald-600 font-semibold">Goal: 10,000</span>
          </div>
          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${(health.steps / 10000) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Resting Heart Rate</span>
            <HeartPulse className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-2xl font-bold font-mono text-neutral-900">{health.heartRate} bpm</span>
            <span className="text-xs text-emerald-600 font-semibold">Excellent</span>
          </div>
          <div className="text-xs text-neutral-500 bg-neutral-50 p-2 rounded-lg text-center">
            Measured 30 mins ago
          </div>
        </div>
      </div>
    </div>
  );
};
