import React from 'react';
import { ShieldAlert, Phone, HeartPulse, FileText } from 'lucide-react';

export const EmergencyView: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="bg-red-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-white text-red-900 flex items-center justify-center font-bold">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">ICE — In Case of Emergency Card</h2>
            <p className="text-xs text-red-200">Instant access medical and contact profile for emergency responders.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#123D32] flex items-center gap-2">
            <Phone className="w-5 h-5 text-red-600" />
            <span>Emergency Contacts</span>
          </h3>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-neutral-900 block">Maya Vance (Spouse)</span>
                <span className="text-xs font-mono text-neutral-500">+1 (555) 234-8890</span>
              </div>
              <button 
                onClick={() => alert('Calling Maya Vance...')}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors"
              >
                Call Now
              </button>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-neutral-900 block">Dr. Sarah Jenkins (Primary Physician)</span>
                <span className="text-xs font-mono text-neutral-500">+1 (555) 890-1122</span>
              </div>
              <button 
                onClick={() => alert('Calling Dr. Sarah Jenkins...')}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors"
              >
                Call Now
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#123D32] flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-emerald-600" />
            <span>Medical Profile & Insurance</span>
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="text-neutral-500 font-medium">Blood Type</span>
              <span className="font-bold font-mono text-neutral-900">O Positive (O+)</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="text-neutral-500 font-medium">Allergies</span>
              <span className="font-bold text-neutral-900">None Known</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="text-neutral-500 font-medium">Insurance Policy</span>
              <span className="font-bold font-mono text-[#123D32]">POL-2026-884</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
