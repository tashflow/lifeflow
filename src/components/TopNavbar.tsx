import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Globe, 
  Plus, 
  Menu, 
  User as UserIcon, 
  CheckCircle2, 
  Calendar, 
  FileText,
  Cloud,
  LogOut,
  LogIn
} from 'lucide-react';
import { Language, NavigationTab, SyncStatus } from '../types';
import { User } from '../services/firebase';
import { getTranslations } from '../translations';

interface TopNavbarProps {
  currentTab: NavigationTab;
  onOpenMobile: () => void;
  onOpenSearch: () => void;
  onOpenQuickAction: () => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  user: User | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  syncStatus: SyncStatus;
  lastSyncedTime: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentTab,
  onOpenMobile,
  onOpenSearch,
  onOpenQuickAction,
  language,
  onSelectLanguage,
  user,
  onOpenAuth,
  onSignOut,
  syncStatus,
  lastSyncedTime,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const t = getTranslations(language);

  const formatTabName = (tab: NavigationTab) => {
    switch (tab) {
      case 'dashboard': return t.dashboard;
      case 'tasks': return t.tasks;
      case 'calendar': return t.calendar;
      case 'routine': return t.routine;
      case 'goals': return t.goals;
      case 'finance': return t.finance;
      case 'documents': return t.documents;
      case 'health': return t.health;
      case 'family': return t.family;
      case 'notes': return t.notes;
      case 'learning': return t.learning;
      case 'emergency': return t.emergency;
      case 'ai-assistant': return t.aiAssistant;
      case 'settings': return t.settings;
    }
  };

  const syncDotClass =
    syncStatus === 'synced' ? 'bg-emerald-500' :
    syncStatus === 'syncing' ? 'bg-amber-500 animate-pulse' :
    syncStatus === 'pending' ? 'bg-amber-500' :
    syncStatus === 'error' ? 'bg-red-600' : 'bg-neutral-400';

  const syncLabel =
    syncStatus === 'synced' ? t.cloudSynced :
    syncStatus === 'syncing' ? t.syncing :
    syncStatus === 'pending' ? t.pendingSync :
    syncStatus === 'error' ? t.syncError : t.offline;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 h-20 bg-[#F8F7F0]/90 backdrop-blur-md border-b border-[#E9ECE8]">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobile}
          className="md:hidden p-2 rounded-xl text-[#123D32] hover:bg-[#E9ECE8] transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[#123D32]">
              {formatTabName(currentTab)}
            </h2>
            {/* Sync Badge */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border bg-white shadow-2xs"
              title={`Last synced: ${lastSyncedTime}`}
            >
              <span className={`w-2 h-2 rounded-full ${syncDotClass}`}></span>
              <span className="text-neutral-600">{syncLabel}</span>
            </div>
          </div>
          <p className="text-xs text-neutral-500 font-medium hidden sm:block">
            {t.tagline} {user ? `• ${t.signedInAs} ${user.email}` : `• ${t.demoModeLocal}`}
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Search Bar Trigger */}
        <button
          onClick={onOpenSearch}
          className="hidden lg:flex items-center gap-3 px-4 py-2.5 bg-white border border-[#E9ECE8] rounded-xl text-neutral-500 hover:border-[#123D32] transition-all shadow-xs w-64 text-sm"
        >
          <Search className="w-4 h-4 text-neutral-400" />
          <span className="flex-1 text-start truncate">{t.searchPlaceholder}</span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-neutral-100 border border-neutral-200 rounded text-neutral-500 font-mono">⌘K</kbd>
        </button>

        <button
          onClick={onOpenSearch}
          className="lg:hidden p-2.5 bg-white border border-[#E9ECE8] rounded-xl text-neutral-700 hover:bg-neutral-50 transition-colors shadow-xs"
          title="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Quick Action Button */}
        <button
          onClick={onOpenQuickAction}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-[#123D32] text-white rounded-xl hover:bg-[#1a5244] transition-all font-medium text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{t.quickAction}</span>
        </button>

        {/* Language Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-2 px-3 py-2.5 bg-white border border-[#E9ECE8] rounded-xl text-neutral-700 hover:bg-neutral-50 transition-colors shadow-xs text-xs font-semibold uppercase"
            title={t.language}
          >
            <Globe className="w-4 h-4 text-[#123D32]" />
            <span>{language}</span>
          </button>

          {showLangMenu && (
            <div className="absolute end-0 mt-2 w-44 bg-white border border-[#E9ECE8] rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
              <button
                onClick={() => { onSelectLanguage('en'); setShowLangMenu(false); }}
                className={`w-full text-start px-4 py-2 text-xs font-medium hover:bg-neutral-50 transition-colors ${language === 'en' ? 'text-[#123D32] font-bold bg-neutral-50' : 'text-neutral-700'}`}
              >
                English (LTR)
              </button>
              <button
                onClick={() => { onSelectLanguage('bn'); setShowLangMenu(false); }}
                className={`w-full text-start px-4 py-2 text-xs font-medium hover:bg-neutral-50 transition-colors ${language === 'bn' ? 'text-[#123D32] font-bold bg-neutral-50' : 'text-neutral-700'}`}
              >
                বাংলা - Bengali (LTR)
              </button>
              <button
                onClick={() => { onSelectLanguage('ar'); setShowLangMenu(false); }}
                className={`w-full text-end px-4 py-2 text-xs font-medium hover:bg-neutral-50 transition-colors ${language === 'ar' ? 'text-[#123D32] font-bold bg-neutral-50' : 'text-neutral-700'}`}
              >
                العربية - Arabic (RTL)
              </button>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 bg-white border border-[#E9ECE8] rounded-xl text-neutral-700 hover:bg-neutral-50 transition-colors shadow-xs"
            title={t.notifications}
          >
            <Bell className="w-5 h-5 text-[#123D32]" />
            <span className="absolute top-2 end-2 w-2 h-2 bg-[#C5A45D] rounded-full ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute end-0 mt-2 w-80 bg-white border border-[#E9ECE8] rounded-2xl shadow-2xl py-3 z-50">
              <div className="px-4 pb-2 border-b border-neutral-100 flex items-center justify-between">
                <h4 className="font-bold text-sm text-[#123D32]">{t.notifications}</h4>
                <span className="text-[10px] bg-[#123D32]/10 text-[#123D32] px-2 py-0.5 rounded-full font-medium">3 Unread</span>
              </div>
              <div className="divide-y divide-neutral-100 max-h-72 overflow-y-auto">
                <div className="p-3 hover:bg-neutral-50 transition-colors flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#123D32] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-800">Review Q1 Strategy due at 2:00 PM</p>
                    <span className="text-[10px] text-neutral-400">10 minutes ago</span>
                  </div>
                </div>
                <div className="p-3 hover:bg-neutral-50 transition-colors flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-800">Family Weekend Trip planning reminder</p>
                    <span className="text-[10px] text-neutral-400">2 hours ago</span>
                  </div>
                </div>
                <div className="p-3 hover:bg-neutral-50 transition-colors flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-800">Passport expires in 2032 (Metadata Synced)</p>
                    <span className="text-[10px] text-neutral-400">Yesterday</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile / Auth Area */}
        <div className="relative ps-2 border-s border-neutral-200">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-neutral-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#123D32] text-[#C5A45D] font-bold flex items-center justify-center shadow-md border border-[#C5A45D]/30">
                  {user.email ? user.email.substring(0, 2).toUpperCase() : 'LF'}
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute end-0 mt-2 w-64 bg-white border border-[#E9ECE8] rounded-2xl shadow-2xl py-3 z-50">
                  <div className="px-4 pb-3 border-b border-neutral-100">
                    <p className="text-xs text-neutral-400 font-medium">{t.signedInAs}</p>
                    <p className="text-sm font-bold text-neutral-900 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-semibold">Firebase Cloud Active</span>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => { onSignOut(); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t.signOut}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#C5A45D] text-[#123D32] font-bold rounded-xl hover:bg-[#b09050] transition-colors shadow-sm text-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>{t.signInCloudSync}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

