import React from 'react';
import { Users, Calendar, ShoppingCart, Sparkles } from 'lucide-react';
import { FamilyMember } from '../types';

interface FamilyViewProps {
  family: FamilyMember[];
}

export const FamilyView: React.FC<FamilyViewProps> = ({ family }) => {
  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="bg-white p-6 rounded-2xl border border-[#E9ECE8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#123D32]">Family Hub & Shared Notes</h2>
          <p className="text-xs text-neutral-500">Coordinated schedules, shared shopping lists, and family wellbeing.</p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 bg-amber-50 text-amber-800 rounded-xl text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Connected Household</span>
        </div>
      </div>

      {family.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-[#E9ECE8] text-center text-neutral-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium text-neutral-600">No family members added to your household hub yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {family.map(member => (
            <div key={member.id} className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-2xl ${member.avatarColor} text-white font-bold text-xl flex items-center justify-center shadow-md mb-4`}>
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="font-bold text-lg text-neutral-900">{member.name}</h3>
              <span className="text-xs font-semibold text-[#123D32] bg-[#123D32]/10 px-2.5 py-0.5 rounded-full mt-1">{member.relation}</span>
              <p className="text-xs text-neutral-500 mt-4 bg-neutral-50 p-3 rounded-xl w-full">{member.status}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-[#123D32]" />
            <h3 className="font-bold text-base text-[#123D32]">Shared Family Grocery List</h3>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="text-sm font-medium text-neutral-800">Organic Avocados (Bag of 6)</span>
              <span className="text-xs text-neutral-500 font-semibold">Added by Maya</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="text-sm font-medium text-neutral-800">Almond Milk & Greek Yogurt</span>
              <span className="text-xs text-neutral-500 font-semibold">Added by Alex</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="text-sm font-medium text-neutral-800">Fresh Berries for Sam & Leo</span>
              <span className="text-xs text-neutral-500 font-semibold">Added by Maya</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-[#123D32]" />
            <h3 className="font-bold text-base text-[#123D32]">Upcoming Family Events</h3>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
              <div>
                <span className="text-sm font-semibold text-neutral-900 block">Weekend Mountain Resort Trip</span>
                <span className="text-xs text-neutral-500">Feb 28 – Mar 02, 2026</span>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">Confirmed</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
              <div>
                <span className="text-sm font-semibold text-neutral-900 block">Sam&apos;s Soccer Championship Finals</span>
                <span className="text-xs text-neutral-500">Saturday, 3:00 PM</span>
              </div>
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded">Reminder</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
