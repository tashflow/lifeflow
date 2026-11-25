import React, { useState, useEffect } from 'react';
import { NavigationTab, Language, Task, RoutineItem, Goal, Transaction, DocumentItem, HealthStat, FamilyMember, NoteItem, LearningItem } from './types';
import { 
  initialTasks, 
  initialRoutines, 
  initialGoals, 
  initialTransactions, 
  initialDocuments, 
  initialHealthStat, 
  initialFamilyMembers, 
  initialNotes, 
  initialLearning 
} from './data/mockData';

import { auth, onAuthStateChanged, signOut, db, collection, doc, setDoc, deleteDoc, onSnapshot } from './services/firebase';
import { User } from 'firebase/auth';

import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { QuickActionModal } from './components/QuickActionModal';
import { AuthModal } from './components/AuthModal';

import { DashboardView } from './views/DashboardView';
import { TasksView } from './views/TasksView';
import { CalendarView, CalendarEventItem } from './views/CalendarView';
import { RoutineView } from './views/RoutineView';
import { GoalsView } from './views/GoalsView';
import { FinanceView } from './views/FinanceView';
import { DocumentsView } from './views/DocumentsView';
import { HealthView } from './views/HealthView';
import { FamilyView } from './views/FamilyView';
import { NotesView } from './views/NotesView';
import { LearningView } from './views/LearningView';
import { EmergencyView } from './views/EmergencyView';
import { AIAssistantView } from './views/AIAssistantView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

  // Auth state & Sync error reporting
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('offline');
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Just now');
  const [syncError, setSyncError] = useState<string | null>(null);

  // Modals
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  // Core application data state across all 12 modules
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [routines, setRoutines] = useState<RoutineItem[]>(initialRoutines);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [health, setHealth] = useState<HealthStat>(initialHealthStat);
  const [family, setFamily] = useState<FamilyMember[]>(initialFamilyMembers);
  const [notes, setNotes] = useState<NoteItem[]>(initialNotes);
  const [learning, setLearning] = useState<LearningItem[]>(initialLearning);
  const [events, setEvents] = useState<CalendarEventItem[]>([
    { id: 'ev1', title: 'Q1 Global Strategy Sync', time: '10:00 AM', category: 'Work', attendees: 'Executive Board', day: 23 },
    { id: 'ev2', title: 'Cardio & Strength Training', time: '05:30 PM', category: 'Health', attendees: 'Personal', day: 23 },
    { id: 'ev3', title: 'Family Weekend Resort Booking', time: '02:00 PM', category: 'Family', attendees: 'Maya & Sons', day: 25 },
  ]);

  // Observe Firebase Auth state & handle complete state reset on logout or user transition
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setSyncStatus('synced');
        setLastSyncedTime(new Date().toLocaleTimeString());
        setSyncError(null);
      } else {
        // Complete logout state reset: clear all user data and revert to default demo state
        setUser(null);
        setSyncStatus('offline');
        setSyncError(null);
        setTasks(initialTasks);
        setRoutines(initialRoutines);
        setGoals(initialGoals);
        setTransactions(initialTransactions);
        setDocuments(initialDocuments);
        setHealth(initialHealthStat);
        setFamily(initialFamilyMembers);
        setNotes(initialNotes);
        setLearning(initialLearning);
        setEvents([
          { id: 'ev1', title: 'Q1 Global Strategy Sync', time: '10:00 AM', category: 'Work', attendees: 'Executive Board', day: 23 },
          { id: 'ev2', title: 'Cardio & Strength Training', time: '05:30 PM', category: 'Health', attendees: 'Personal', day: 23 },
          { id: 'ev3', title: 'Family Weekend Resort Booking', time: '02:00 PM', category: 'Family', attendees: 'Maya & Sons', day: 25 },
        ]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Firestore Real-Time Listeners across all 12 collections when Authenticated with strict UID scoping & cleanup
  useEffect(() => {
    if (!user) return;

    setSyncStatus('syncing');
    const uid = user.uid;
    let isMounted = true;

    const unsubTasks = onSnapshot(collection(db, `users/${uid}/tasks`), (snapshot) => {
      if (!isMounted) return;
      setTasks(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Task)));
      setSyncStatus('synced');
      setLastSyncedTime(new Date().toLocaleTimeString());
      setSyncError(null);
    }, (err) => {
      if (!isMounted) return;
      console.error('Firestore tasks sync error:', err);
      setSyncStatus('offline');
      setSyncError('Sync failed: Check network or security rules.');
    });

    const unsubRoutines = onSnapshot(collection(db, `users/${uid}/routines`), (snapshot) => {
      if (!isMounted) return;
      if (!snapshot.empty) {
        setRoutines(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as RoutineItem)));
      }
    });

    const unsubGoals = onSnapshot(collection(db, `users/${uid}/goals`), (snapshot) => {
      if (!isMounted) return;
      if (!snapshot.empty) {
        setGoals(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Goal)));
      }
    });

    const unsubFinance = onSnapshot(collection(db, `users/${uid}/finance`), (snapshot) => {
      if (!isMounted) return;
      if (!snapshot.empty) {
        setTransactions(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)));
      }
    });

    const unsubNotes = onSnapshot(collection(db, `users/${uid}/notes`), (snapshot) => {
      if (!isMounted) return;
      if (!snapshot.empty) {
        setNotes(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as NoteItem)));
      }
    });

    const unsubCalendar = onSnapshot(collection(db, `users/${uid}/calendar`), (snapshot) => {
      if (!isMounted) return;
      if (!snapshot.empty) {
        setEvents(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CalendarEventItem)));
      }
    });

    const unsubDocuments = onSnapshot(collection(db, `users/${uid}/documents`), (snapshot) => {
      if (!isMounted) return;
      if (!snapshot.empty) {
        setDocuments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as DocumentItem)));
      }
    });

    const unsubHealth = onSnapshot(collection(db, `users/${uid}/health`), (snapshot) => {
      if (!isMounted) return;
      if (!snapshot.empty && snapshot.docs[0]) {
        setHealth(snapshot.docs[0].data() as HealthStat);
      }
    });

    const unsubFamily = onSnapshot(collection(db, `users/${uid}/family`), (snapshot) => {
      if (!isMounted) return;
      if (!snapshot.empty) {
        setFamily(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FamilyMember)));
      }
    });

    const unsubLearning = onSnapshot(collection(db, `users/${uid}/learning`), (snapshot) => {
      if (!isMounted) return;
      if (!snapshot.empty) {
        setLearning(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LearningItem)));
      }
    });

    return () => {
      isMounted = false;
      unsubTasks();
      unsubRoutines();
      unsubGoals();
      unsubFinance();
      unsubNotes();
      unsubCalendar();
      unsubDocuments();
      unsubHealth();
      unsubFamily();
      unsubLearning();
    };
  }, [user]);

  // Robust helper to persist or delete in Firestore with error handling
  const persistToFirestore = async (collectionName: string, id: string, data: any) => {
    if (!user) return;
    try {
      setSyncStatus('syncing');
      await setDoc(doc(db, `users/${user.uid}/${collectionName}`, id), data, { merge: true });
      setSyncStatus('synced');
      setLastSyncedTime(new Date().toLocaleTimeString());
      setSyncError(null);
    } catch (err: any) {
      console.error('Firestore persist error:', err);
      setSyncStatus('offline');
      setSyncError(`Failed to save to cloud: ${err.message || 'Permission denied or offline'}`);
    }
  };

  const deleteFromFirestore = async (collectionName: string, id: string) => {
    if (!user) return;
    try {
      setSyncStatus('syncing');
      await deleteDoc(doc(db, `users/${user.uid}/${collectionName}`, id));
      setSyncStatus('synced');
      setLastSyncedTime(new Date().toLocaleTimeString());
      setSyncError(null);
    } catch (err: any) {
      console.error('Firestore delete error:', err);
      setSyncStatus('offline');
      setSyncError(`Failed to delete from cloud: ${err.message || 'Permission denied'}`);
    }
  };

  // Handlers with robust Firestore sync and error reporting
  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const next = { ...t, completed: !t.completed };
        persistToFirestore('tasks', id, next);
        return next;
      }
      return t;
    }));
  };

  const handleAddTask = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
    persistToFirestore('tasks', newTask.id, newTask);
  };

  const handleDeleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    await deleteFromFirestore('tasks', id);
  };

  const handleToggleRoutine = (id: string) => {
    setRoutines(prev => prev.map(r => {
      if (r.id === id) {
        const next = { ...r, completed: !r.completed };
        persistToFirestore('routines', id, next);
        return next;
      }
      return r;
    }));
  };

  const handleAddGoal = (newGoal: Goal) => {
    setGoals(prev => [newGoal, ...prev]);
    persistToFirestore('goals', newGoal.id, newGoal);
  };

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);
    persistToFirestore('finance', newTx.id, newTx);
  };

  const handleDeleteTransaction = async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    await deleteFromFirestore('finance', id);
  };

  const handleAddNote = (newNote: NoteItem) => {
    setNotes(prev => [newNote, ...prev]);
    persistToFirestore('notes', newNote.id, newNote);
  };

  const handleAddEvent = (newEv: CalendarEventItem) => {
    setEvents(prev => [newEv, ...prev]);
    persistToFirestore('calendar', newEv.id, newEv);
  };

  const handleDeleteEvent = async (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    await deleteFromFirestore('calendar', id);
  };

  const handleUpdateHealth = (newHealth: HealthStat) => {
    setHealth(newHealth);
    persistToFirestore('health', 'vitals', newHealth);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    setSyncStatus('offline');
  };

  return (
    <div 
      dir={language === 'ar' ? 'rtl' : 'ltr'} 
      className="min-h-screen bg-[#F8F7F0] text-neutral-900 flex font-sans antialiased selection:bg-[#123D32] selection:text-[#C5A45D]"
    >
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        language={language}
      />

      {/* Main Content Shell */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        {/* Top Navbar */}
        <TopNavbar
          currentTab={currentTab}
          onOpenMobile={() => setMobileOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenQuickAction={() => setQuickActionOpen(true)}
          language={language}
          onSelectLanguage={setLanguage}
          user={user}
          onOpenAuth={() => setAuthModalOpen(true)}
          onSignOut={handleSignOut}
          syncStatus={syncStatus}
          lastSyncedTime={lastSyncedTime}
        />

        {/* Sync Error Banner if any */}
        {syncError && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-2.5 text-xs text-red-800 flex items-center justify-between">
            <span><strong>Cloud Sync Warning:</strong> {syncError}</span>
            <button onClick={() => setSyncError(null)} className="font-bold hover:underline">Dismiss</button>
          </div>
        )}

        {/* Viewport View Container */}
        <main className="flex-1 p-6 sm:p-10 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              tasks={tasks}
              routines={routines}
              goals={goals}
              transactions={transactions}
              health={health}
              onToggleTask={handleToggleTask}
              onToggleRoutine={handleToggleRoutine}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'tasks' && (
            <TasksView
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarView
              events={events}
              onAddEvent={handleAddEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          )}

          {currentTab === 'routine' && (
            <RoutineView
              routines={routines}
              onToggleRoutine={handleToggleRoutine}
            />
          )}

          {currentTab === 'goals' && (
            <GoalsView
              goals={goals}
              onAddGoal={handleAddGoal}
            />
          )}

          {currentTab === 'finance' && (
            <FinanceView
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {currentTab === 'documents' && <DocumentsView documents={documents} />}

          {currentTab === 'health' && (
            <HealthView
              health={health}
              onUpdateHealth={handleUpdateHealth}
            />
          )}

          {currentTab === 'family' && <FamilyView family={family} />}

          {currentTab === 'notes' && (
            <NotesView
              notes={notes}
              onAddNote={handleAddNote}
            />
          )}

          {currentTab === 'learning' && <LearningView learning={learning} />}

          {currentTab === 'emergency' && <EmergencyView />}

          {currentTab === 'ai-assistant' && <AIAssistantView />}

          {currentTab === 'settings' && (
            <SettingsView
              language={language}
              onSelectLanguage={setLanguage}
            />
          )}
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        tasks={tasks}
        goals={goals}
        notes={notes}
        documents={documents}
        transactions={transactions}
        onNavigate={setCurrentTab}
      />

      {/* Quick Action Modal */}
      <QuickActionModal
        isOpen={quickActionOpen}
        onClose={() => setQuickActionOpen(false)}
        onAddTask={handleAddTask}
        onAddGoal={handleAddGoal}
        onAddNote={handleAddNote}
        onAddTransaction={handleAddTransaction}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setSyncStatus('synced');
        }}
      />
    </div>
  );
}
