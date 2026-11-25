export type NavigationTab = 
  | 'dashboard'
  | 'tasks'
  | 'calendar'
  | 'routine'
  | 'goals'
  | 'finance'
  | 'documents'
  | 'health'
  | 'family'
  | 'notes'
  | 'learning'
  | 'emergency'
  | 'ai-assistant'
  | 'settings';

export type Language = 'en' | 'bn' | 'ar';

export interface Task {
  id: string;
  title: string;
  category: 'Work' | 'Personal' | 'Health' | 'Finance' | 'Family';
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  completed: boolean;
  notes?: string;
}

export interface RoutineItem {
  id: string;
  time: string;
  title: string;
  category: 'Morning' | 'Afternoon' | 'Evening';
  completed: boolean;
  streak: number;
}

export interface Goal {
  id: string;
  title: string;
  category: 'Career' | 'Health' | 'Wealth' | 'Personal';
  progress: number; // 0 to 100
  targetDate: string;
  milestones: { id: string; title: string; completed: boolean }[];
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: 'Housing' | 'Food' | 'Transport' | 'Investment' | 'Salary' | 'Leisure';
  date: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  category: 'Identity' | 'Finance' | 'Medical' | 'Legal' | 'Real Estate';
  uploadDate: string;
  size: string;
  expiryDate?: string;
}

export interface HealthStat {
  waterDrank: number; // glasses out of 8
  sleepHours: number;
  weight: number; // kg
  steps: number;
  heartRate: number; // bpm
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  status: string;
  avatarColor: string;
}

export interface NoteItem {
  id: string;
  title: string;
  folder: 'Personal' | 'Ideas' | 'Journal' | 'Work';
  content: string;
  updatedAt: string;
}

export interface LearningItem {
  id: string;
  title: string;
  provider: string;
  progress: number;
  category: string;
  status: 'In Progress' | 'Completed' | 'Bookmarked';
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation?: string;
}

export type ThemePreference = 'system' | 'light' | 'dark';

export interface UserSettings {
  language: Language;
  theme?: ThemePreference;
}

export type SyncStatus = 'synced' | 'syncing' | 'pending' | 'offline' | 'error';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

