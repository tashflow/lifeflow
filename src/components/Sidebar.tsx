import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Clock, 
  Target, 
  Wallet, 
  FolderLock, 
  HeartPulse, 
  Users, 
  BookOpenText, 
  GraduationCap, 
  ShieldAlert, 
  Bot, 
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Language, NavigationTab } from '../types';
import { getTranslations } from '../translations';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  language: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  language,
}) => {
  const t = getTranslations(language);
  const isRtl = language === 'ar';

  const menuItems: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: t.dashboard, icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'tasks', label: t.tasks, icon: <CheckSquare className="w-5 h-5" /> },
    { id: 'calendar', label: t.calendar, icon: <CalendarIcon className="w-5 h-5" /> },
    { id: 'routine', label: t.routine, icon: <Clock className="w-5 h-5" /> },
    { id: 'goals', label: t.goals, icon: <Target className="w-5 h-5" /> },
    { id: 'finance', label: t.finance, icon: <Wallet className="w-5 h-5" /> },
    { id: 'documents', label: t.documents, icon: <FolderLock className="w-5 h-5" /> },
    { id: 'health', label: t.health, icon: <HeartPulse className="w-5 h-5" /> },
    { id: 'family', label: t.family, icon: <Users className="w-5 h-5" /> },
    { id: 'notes', label: t.notes, icon: <BookOpenText className="w-5 h-5" /> },
    { id: 'learning', label: t.learning, icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'emergency', label: t.emergency, icon: <ShieldAlert className="w-5 h-5" /> },
    { id: 'ai-assistant', label: t.aiAssistant, icon: <Bot className="w-5 h-5" /> },
    { id: 'settings', label: t.settings, icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  const mobileSlideClass = mobileOpen
    ? 'translate-x-0'
    : isRtl
    ? 'translate-x-full md:translate-x-0'
    : '-translate-x-full md:translate-x-0';

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile} 
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 start-0 z-50 flex flex-col
        bg-[#123D32] text-[#F8F7F0] border-e border-[#1a5244]
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-64'}
        ${mobileSlideClass}
      `}>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 h-20 border-b border-[#1c5c4d]">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C5A45D] flex items-center justify-center text-[#123D32] font-bold shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-lg tracking-tight leading-none text-white">{t.appName}</h1>
                <span className="text-[11px] text-[#C5A45D] tracking-wide font-medium">Life OS 2026</span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto w-10 h-10 rounded-xl bg-[#C5A45D] flex items-center justify-center text-[#123D32] font-bold shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
          )}
          
          <button 
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-[#F8F7F0]/70 hover:text-white hover:bg-[#1c5c4d] transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200
                  group relative
                  ${isActive 
                    ? 'bg-[#C5A45D] text-[#123D32] shadow-lg font-semibold' 
                    : 'text-[#F8F7F0]/80 hover:bg-[#1a5244] hover:text-white'
                  }
                `}
              >
                <span className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-[#123D32]' : 'text-[#C5A45D]'}`}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="truncate text-start">{item.label}</span>
                )}
                {collapsed && (
                  <div className="absolute start-full ms-3 px-2 py-1 bg-[#0f332a] text-white text-xs rounded shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info inside sidebar */}
        {!collapsed && (
          <div className="p-4 border-t border-[#1c5c4d] text-xs text-[#F8F7F0]/60 bg-[#0f332a]">
            <div className="font-medium text-white mb-0.5">{t.platformTagline}</div>
            <div>{t.platformSubtagline}</div>
          </div>
        )}
      </aside>
    </>
  );
};

