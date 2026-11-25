import React from 'react';
import { Settings as SettingsIcon, Globe, Shield, User, Bell, Sparkles } from 'lucide-react';
import { Language } from '../types';

interface SettingsViewProps {
  language: Language;
  onSelectLanguage: (lang: Language) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ language, onSelectLanguage }) => {
  return (
    <div className="space-y-6 animate-in fade-in pb-12 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-[#E9ECE8] shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#123D32]">Platform Settings</h2>
          <p className="text-xs text-neutral-500">Manage account profile, language preferences, and data privacy.</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#123D32] text-[#C5A45D] flex items-center justify-center font-bold">
          <SettingsIcon className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#123D32] flex items-center gap-2">
            <User className="w-5 h-5 text-[#C5A45D]" />
            <span>Profile & Account</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Full Name</label>
              <input 
                type="text" 
                defaultValue="Alex Vance" 
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-[#123D32]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Email Address</label>
              <input 
                type="email" 
                defaultValue="alex.vance@lifeflow.global" 
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-[#123D32]"
              />
            </div>
          </div>
        </div>

        {/* Language & RTL Settings */}
        <div className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#123D32] flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#C5A45D]" />
            <span>Multilingual Architecture</span>
          </h3>
          <p className="text-xs text-neutral-500">LifeFlow supports multi-language presentation with full RTL layout for Arabic and LTR for English and Bengali.</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onSelectLanguage('en')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${language === 'en' ? 'bg-[#123D32] text-white shadow-md' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
            >
              English (LTR)
            </button>
            <button
              onClick={() => onSelectLanguage('bn')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${language === 'bn' ? 'bg-[#123D32] text-white shadow-md' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
            >
              বাংলা - Bengali (LTR)
            </button>
            <button
              onClick={() => onSelectLanguage('ar')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${language === 'ar' ? 'bg-[#123D32] text-white shadow-md' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
            >
              العربية - Arabic (RTL)
            </button>
          </div>
        </div>

        {/* Security & Firebase Preparation */}
        <div className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#123D32] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#C5A45D]" />
            <span>Security & Backend Preparation</span>
          </h3>
          <p className="text-xs text-neutral-500">
            LifeFlow is architected for future Firebase Authentication and Firestore synchronization. No subscription plans or paywalls exist — 100% free forever.
          </p>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Free Forever Guarantee: No Paywalls, No Subscriptions</span>
            </div>
            <span className="font-mono font-bold">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
