import { Task, RoutineItem, Goal, Transaction, DocumentItem, HealthStat, FamilyMember, NoteItem, LearningItem } from '../types';

export const initialTasks: Task[] = [
  { id: 't1', title: 'Review Q1 Global Strategy & Budget Allocation', category: 'Work', priority: 'High', dueDate: 'Today, 2:00 PM', completed: false, notes: 'Focus on regional expansion metrics in Europe and Middle East.' },
  { id: 't2', title: 'Cardio & Strength Training Session (45 min)', category: 'Health', priority: 'High', dueDate: 'Today, 5:30 PM', completed: true, notes: 'Zone 2 running followed by core stability.' },
  { id: 't3', title: 'Monthly Investment Portfolio Rebalancing', category: 'Finance', priority: 'Medium', dueDate: 'Tomorrow', completed: false, notes: 'Check index fund ratios and crypto allocation.' },
  { id: 't4', title: 'Book Family Weekend Trip to Mountain Resort', category: 'Family', priority: 'Medium', dueDate: 'Feb 28', completed: false },
  { id: 't5', title: 'Complete Advanced TypeScript Generics Module', category: 'Personal', priority: 'Low', dueDate: 'Mar 02', completed: true },
];

export const initialRoutines: RoutineItem[] = [
  { id: 'r1', time: '06:00 AM', title: 'Mindfulness Meditation & Hydration', category: 'Morning', completed: true, streak: 14 },
  { id: 'r2', time: '07:00 AM', title: 'Morning Mobility & Sunlight Walk', category: 'Morning', completed: true, streak: 9 },
  { id: 'r3', time: '09:00 AM', title: 'Deep Work Focus Block (No Email)', category: 'Afternoon', completed: false, streak: 5 },
  { id: 'r4', time: '02:00 PM', title: 'Review Daily Task Queue & Emails', category: 'Afternoon', completed: false, streak: 21 },
  { id: 'r5', time: '08:00 PM', title: 'Digital Sunset & Family Reading', category: 'Evening', completed: false, streak: 12 },
  { id: 'r6', time: '10:00 PM', title: 'Sleep Preparation & Gratitude Journal', category: 'Evening', completed: false, streak: 30 },
];

export const initialGoals: Goal[] = [
  {
    id: 'g1',
    title: 'Achieve Financial Independence & Investment Milestones',
    category: 'Wealth',
    progress: 68,
    targetDate: 'Dec 2026',
    milestones: [
      { id: 'm1', title: 'Max out tax-free retirement accounts', completed: true },
      { id: 'm2', title: 'Build 6-month emergency reserve', completed: true },
      { id: 'm3', title: 'Diversify into international index funds', completed: false },
    ]
  },
  {
    id: 'g2',
    title: 'Complete Half Marathon & Sub-18% Body Fat',
    category: 'Health',
    progress: 75,
    targetDate: 'Aug 2026',
    milestones: [
      { id: 'm4', title: 'Run 10km under 50 minutes', completed: true },
      { id: 'm5', title: 'Consistent weekly strength workouts', completed: true },
      { id: 'm6', title: 'Complete 21.1km official race', completed: false },
    ]
  },
  {
    id: 'g3',
    title: 'Publish Open Source Software Architecture Toolkit',
    category: 'Career',
    progress: 40,
    targetDate: 'Jun 2026',
    milestones: [
      { id: 'm7', title: 'Core library design specification', completed: true },
      { id: 'm8', title: 'Automated test suite coverage > 90%', completed: false },
      { id: 'm9', title: 'Public documentation and launch', completed: false },
    ]
  }
];

export const initialTransactions: Transaction[] = [
  { id: 'tx1', title: 'Global Tech Salary Deposit', amount: 8400, type: 'income', category: 'Salary', date: '2026-11-01' },
  { id: 'tx2', title: 'Design Studio Rent & Utilities', amount: 1850, type: 'expense', category: 'Housing', date: '2026-11-03' },
  { id: 'tx3', title: 'Organic Market Groceries', amount: 320, type: 'expense', category: 'Food', date: '2026-11-05' },
  { id: 'tx4', title: 'Global Index Fund Investment', amount: 2500, type: 'expense', category: 'Investment', date: '2026-11-06' },
  { id: 'tx5', title: 'High-speed Fiber & Cloud Subscriptions', amount: 140, type: 'expense', category: 'Transport', date: '2026-11-10' },
];

export const initialDocuments: DocumentItem[] = [
  { id: 'doc1', name: 'Global Passport & Visa Credentials', category: 'Identity', uploadDate: '2025-01-15', size: '2.4 MB', expiryDate: '2032-05-12' },
  { id: 'doc2', name: 'Comprehensive Health Insurance Policy 2026', category: 'Medical', uploadDate: '2026-01-02', size: '4.1 MB', expiryDate: '2027-01-01' },
  { id: 'doc3', name: 'Property Deed & Title Registry', category: 'Real Estate', uploadDate: '2024-08-19', size: '8.7 MB' },
  { id: 'doc4', name: 'Certified Professional Engineering License', category: 'Legal', uploadDate: '2023-11-10', size: '1.8 MB', expiryDate: '2028-11-10' },
  { id: 'doc5', name: 'Tax Clearance Certificate 2025', category: 'Finance', uploadDate: '2026-03-20', size: '1.2 MB' },
];

export const initialHealthStat: HealthStat = {
  waterDrank: 6, // out of 8 glasses
  sleepHours: 7.8,
  weight: 74.2,
  steps: 8420,
  heartRate: 64,
};

export const initialFamilyMembers: FamilyMember[] = [
  { id: 'fam1', name: 'Maya Vance', relation: 'Spouse', status: 'In Office • Free at 6 PM', avatarColor: 'bg-emerald-700' },
  { id: 'fam2', name: 'Sam Vance', relation: 'Son (Age 10)', status: 'Soccer Practice until 4 PM', avatarColor: 'bg-amber-600' },
  { id: 'fam3', name: 'Leo Vance', relation: 'Son (Age 7)', status: 'School / Art Club', avatarColor: 'bg-teal-600' },
];

export const initialNotes: NoteItem[] = [
  {
    id: 'n1',
    title: 'LifeFlow Vision & Principles 2026',
    folder: 'Personal',
    content: '1. Protect deep focus blocks.\n2. Prioritize health and recovery above all.\n3. Build compounding assets and sustainable habits.\n4. Keep life simple, elegant, and clutter-free.',
    updatedAt: '2026-11-20'
  },
  {
    id: 'n2',
    title: 'System Architecture Ideas for Modular Plugins',
    folder: 'Ideas',
    content: 'Exploring zero-latency client state sync with indexeddb caching and reactive UI bindings.',
    updatedAt: '2026-11-18'
  },
  {
    id: 'n3',
    title: 'Quarterly Reflections: Gratitude & Growth',
    folder: 'Journal',
    content: 'Feeling deeply aligned with professional output and personal well-being. Main focus for next quarter is emotional presence.',
    updatedAt: '2026-11-15'
  }
];

export const initialLearning: LearningItem[] = [
  { id: 'l1', title: 'Advanced React 19 Concurrent Architecture', provider: 'Global Tech Academy', progress: 85, category: 'Engineering', status: 'In Progress' },
  { id: 'l2', title: 'Macroeconomics & Global Monetary Systems', provider: 'London School of Economics', progress: 40, category: 'Finance', status: 'In Progress' },
  { id: 'l3', title: 'Modern Arabic Conversational Fluency', provider: 'LinguaGlobal', progress: 100, category: 'Languages', status: 'Completed' },
  { id: 'l4', title: 'Longevity Science & Nutritional Protocols', provider: 'Stanford BioHealth', progress: 20, category: 'Health', status: 'Bookmarked' },
];
