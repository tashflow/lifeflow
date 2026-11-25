import React from 'react';
import { Settings as SettingsIcon, Globe, Shield, User as UserIcon, Sparkles, Palette, AlertCircle } from 'lucide-react';
import { Language, SyncStatus, ThemePreference } from '../types';
import { User } from '../services/firebase';
import { getTranslations } from '../translations';

interface SettingsViewProps {
  language: Language;
  theme: ThemePreference;
  user: User | null;
  syncStatus?: SyncStatus;
  error?: string | null;
  onSelectLanguage: (lang: Language) => void;
  onSelectTheme: (theme: ThemePreference) => void;
  onOpenAuth?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  language,
  theme,
  user,
  syncStatus = 'offline',
  error = null,
  onSelectLanguage,
  onSelectTheme,
  onOpenAuth,
}) => {
  const t = getTranslations(language);

  return (
    <div className="space-y-6 animate-in fade-in pb-12 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-[#E9ECE8] shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#123D32]">{t.settingsTitle}</h2>
          <p className="text-xs text-neutral-500">{t.settingsSubtitle}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#123D32] text-[#C5A45D] flex items-center justify-center font-bold">
          <SettingsIcon className="w-5 h-5" />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#123D32] flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-[#C5A45D]" />
              <span>{t.profileAccount}</span>
            </h3>
            {user ? (
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Cloud Status: {syncStatus}
              </span>
            ) : (
              onOpenAuth && (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="px-3.5 py-1.5 bg-[#123D32] text-white rounded-xl text-xs font-semibold hover:bg-[#1a5244] transition-colors"
                >
                  {t.signInCloudSync}
                </button>
              )
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Account Label</label>
              <input
                type="text"
                readOnly
                value={user ? (user.displayName || user.email?.split('@')[0] || 'Authenticated Member') : 'Alex Vance (Demo Session)'}
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm bg-neutral-50 text-neutral-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                readOnly
                value={user ? (user.email || 'Signed-in Firebase Account') : 'demo@lifeflow.local'}
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm bg-neutral-50 text-neutral-700 focus:outline-none"
              />
            </div>
          </div>
          <p className="text-[11px] text-neutral-400">
            Account identity is managed by Firebase Authentication; language and theme preferences sync to your private Firestore settings document.
          </p>
        </div>

        {/* Language & RTL Settings */}
        <div className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#123D32] flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#C5A45D]" />
            <span>{t.multilingualTitle}</span>
          </h3>
          <p className="text-xs text-neutral-500">LifeFlow supports multi-language presentation with full RTL layout for Arabic and LTR for English and Bengali.</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => onSelectLanguage('en')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${language === 'en' ? 'bg-[#123D32] text-white shadow-md' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
            >
              English (LTR)
            </button>
            <button
              type="button"
              onClick={() => onSelectLanguage('bn')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${language === 'bn' ? 'bg-[#123D32] text-white shadow-md' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
            >
              বাংলা - Bengali (LTR)
            </button>
            <button
              type="button"
              onClick={() => onSelectLanguage('ar')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${language === 'ar' ? 'bg-[#123D32] text-white shadow-md' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
            >
              العربية - Arabic (RTL)
            </button>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#123D32] flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#C5A45D]" />
            <span>{t.themeTitle}</span>
          </h3>
          <div className="flex flex-wrap gap-3">
            {([
              { id: 'system', label: t.themeSystem },
              { id: 'light', label: t.themeLight },
              { id: 'dark', label: t.themeDark },
            ] as const).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectTheme(opt.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  theme === opt.id ? 'bg-[#123D32] text-white shadow-md' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Security & Spark Free */}
        <div className="bg-white rounded-2xl p-6 border border-[#E9ECE8] shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#123D32] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#C5A45D]" />
            <span>Security &amp; Spark Free Architecture</span>
          </h3>
          <p className="text-xs text-neutral-500">
            LifeFlow uses Firebase Authentication and owner-isolated Cloud Firestore rules on the Spark Free tier. No subscription plans or paywalls exist — 100% free forever.
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

