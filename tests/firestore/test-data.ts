export const validPayloads: Record<string, any> = {
  tasks: {
    title: 'Complete Q1 Strategy Review',
    category: 'Work',
    priority: 'High',
    dueDate: 'Today',
    completed: false,
    notes: 'Review regional expansion metrics'
  },
  goals: {
    title: 'Financial Independence Milestone',
    category: 'Wealth',
    progress: 68,
    targetDate: 'Dec 2026',
    milestones: [{ id: 'm1', title: 'Max out accounts', completed: true }]
  },
  routines: {
    time: '06:00 AM',
    title: 'Mindfulness Meditation',
    category: 'Morning',
    completed: true,
    streak: 14
  },
  calendar: {
    title: 'Executive Board Sync',
    time: '10:00 AM',
    category: 'Work',
    attendees: 'Board Members',
    day: 23
  },
  finance: {
    title: 'Global Tech Salary',
    amount: 8400,
    type: 'income',
    category: 'Salary',
    date: '2026-11-01'
  },
  notes: {
    title: 'LifeFlow Vision',
    folder: 'Personal',
    content: 'Protect deep focus blocks and prioritize health.',
    updatedAt: '2026-11-20'
  },
  documents: {
    name: 'Global Passport',
    category: 'Identity',
    uploadDate: '2025-01-15',
    size: '2.4 MB',
    expiryDate: '2032-05-12'
  },
  health: {
    waterDrank: 6,
    sleepHours: 7.8,
    weight: 74.2,
    steps: 8420,
    heartRate: 64
  },
  family: {
    name: 'Maya Vance',
    relation: 'Spouse',
    status: 'In Office',
    avatarColor: 'bg-emerald-700'
  },
  learning: {
    title: 'Advanced React 19 Architecture',
    provider: 'Global Tech Academy',
    progress: 85,
    category: 'Engineering',
    status: 'In Progress'
  },
  emergency: {
    name: 'Dr. Sarah Jenkins',
    phone: '+1-555-890-1122',
    relation: 'Primary Physician'
  },
  settings: {
    language: 'en',
    theme: 'system'
  }
};
