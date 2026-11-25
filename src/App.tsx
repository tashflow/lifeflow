import React, { useEffect, useRef, useState } from 'react';
import {
  DocumentItem,
  EmergencyContact,
  FamilyMember,
  Goal,
  HealthStat,
  Language,
  LearningItem,
  NoteItem,
  RoutineItem,
  SyncStatus,
  Task,
  ThemePreference,
  Transaction,
} from './types';
import {
  defaultUserSettings,
  emptyAuthenticatedHealthStat,
  initialDocuments,
  initialEmergencyContacts,
  initialFamilyMembers,
  initialGoals,
  initialHealthStat,
  initialLearning,
  initialNotes,
  initialRoutines,
  initialTasks,
  initialTransactions,
} from './data/mockData';

import {
  auth,
  collection,
  db,
  deleteDoc,
  doc,
  onAuthStateChanged,
  onSnapshot,
  setDoc,
  signOut,
  updateDoc,
  User,
} from './services/firebase';
import {
  buildFirestoreErrorInfo,
  deserializeCalendarEvent,
  deserializeDocument,
  deserializeEmergencyContact,
  deserializeFamilyMember,
  deserializeGoal,
  deserializeHealth,
  deserializeLearningItem,
  deserializeNote,
  deserializeRoutine,
  deserializeSettings,
  deserializeTask,
  deserializeTransaction,
  FirestoreOperationType,
  isValidFirestoreDocId,
  LifeFlowCollection,
  serializeForCollection,
  toFriendlyFirestoreErrorMessage,
} from './services/firestoreSerializers';
import {
  deriveSyncStatus,
  FailedSyncOperation,
  SessionCoordinator,
  SyncOperationsTracker,
} from './services/syncManager';
import { getTranslations } from './translations';

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

const initialDemoCalendarEvents: CalendarEventItem[] = [
  { id: 'ev1', title: 'Q1 Global Strategy Sync', time: '10:00 AM', category: 'Work', attendees: 'Executive Board', day: 23 },
  { id: 'ev2', title: 'Cardio & Strength Training', time: '05:30 PM', category: 'Health', attendees: 'Personal', day: 23 },
  { id: 'ev3', title: 'Family Weekend Resort Booking', time: '02:00 PM', category: 'Family', attendees: 'Maya & Sons', day: 25 },
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<import('./types').NavigationTab>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [language, setLanguage] = useState<Language>(defaultUserSettings.language);
  const [theme, setTheme] = useState<ThemePreference>(defaultUserSettings.theme ?? 'system');

  // Auth state & Sync status reporting
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Just now');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [failedRetryCount, setFailedRetryCount] = useState<number>(0);
  const [retryingSync, setRetryingSync] = useState<boolean>(false);
  const [moduleErrors, setModuleErrors] = useState<Partial<Record<LifeFlowCollection, string>>>({});
  const [emergencyLoading, setEmergencyLoading] = useState<boolean>(false);

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
  const [events, setEvents] = useState<CalendarEventItem[]>(initialDemoCalendarEvents);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(initialEmergencyContacts);

  // Session, online, and sync coordination refs
  const coordinatorRef = useRef<SessionCoordinator>(new SessionCoordinator());
  const trackerRef = useRef<SyncOperationsTracker>(new SyncOperationsTracker());
  const pendingCollectionsRef = useRef<Set<LifeFlowCollection>>(new Set());
  const listenerErrorsRef = useRef<Partial<Record<LifeFlowCollection, string>>>({});
  const isOnlineRef = useRef<boolean>(isOnline);
  const userRef = useRef<User | null>(user);

  isOnlineRef.current = isOnline;
  userRef.current = user;

  const refreshSyncStatus = () => {
    const isAuthenticated = userRef.current !== null;
    const hasPendingWrites = pendingCollectionsRef.current.size > 0;
    const inFlightCount = trackerRef.current.getInFlightCount();
    const failedCount = trackerRef.current.getFailedCount();
    const hasListenerError = Object.keys(listenerErrorsRef.current).length > 0;
    setFailedRetryCount(failedCount);
    setSyncStatus(
      deriveSyncStatus({
        isAuthenticated,
        isOnline: isOnlineRef.current,
        hasPendingWrites,
        inFlightCount,
        failedCount,
        hasListenerError,
      })
    );
  };

  // Track browser online / offline connectivity
  useEffect(() => {
    const handleOnline = () => {
      isOnlineRef.current = true;
      setIsOnline(true);
      refreshSyncStatus();
    };
    const handleOffline = () => {
      isOnlineRef.current = false;
      setIsOnline(false);
      refreshSyncStatus();
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Reset helper for authenticated empty vs signed-out demo states
  const resetStateForSignedOutDemo = () => {
    pendingCollectionsRef.current.clear();
    listenerErrorsRef.current = {};
    trackerRef.current.resetForSessionChange();
    setModuleErrors({});
    setFailedRetryCount(0);
    setEmergencyLoading(false);
    setSyncError(null);
    setSyncStatus('offline');
    setLanguage(defaultUserSettings.language);
    setTheme(defaultUserSettings.theme ?? 'system');

    setTasks(initialTasks);
    setRoutines(initialRoutines);
    setGoals(initialGoals);
    setTransactions(initialTransactions);
    setDocuments(initialDocuments);
    setHealth(initialHealthStat);
    setFamily(initialFamilyMembers);
    setNotes(initialNotes);
    setLearning(initialLearning);
    setEvents(initialDemoCalendarEvents);
    setEmergencyContacts(initialEmergencyContacts);
  };

  const clearStateForAuthenticatedTransition = () => {
    pendingCollectionsRef.current.clear();
    listenerErrorsRef.current = {};
    trackerRef.current.resetForSessionChange();
    setModuleErrors({});
    setFailedRetryCount(0);
    setEmergencyLoading(true);
    setSyncError(null);
    setLanguage(defaultUserSettings.language);
    setTheme(defaultUserSettings.theme ?? 'system');

    setTasks([]);
    setRoutines([]);
    setGoals([]);
    setTransactions([]);
    setDocuments([]);
    setHealth(emptyAuthenticatedHealthStat);
    setFamily([]);
    setNotes([]);
    setLearning([]);
    setEvents([]);
    setEmergencyContacts([]);
  };

  // Observe Firebase Auth state & enforce deterministic state isolation on logout / user switch
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      const nextUid = currentUser?.uid ?? null;
      const transition = coordinatorRef.current.transitionTo(nextUid);
      userRef.current = currentUser;
      setUser(currentUser);

      if (currentUser === null) {
        resetStateForSignedOutDemo();
      } else if (transition.changed) {
        clearStateForAuthenticatedTransition();
        setSyncStatus(isOnlineRef.current ? 'syncing' : 'offline');
      }
    });
    return () => unsubscribe();
  }, []);

  // Firestore Real-Time Listeners across all 12 collections with strict UID/session-gen scoping & error handlers
  useEffect(() => {
    if (!user) return;

    const capturedUid = user.uid;
    const capturedGen = coordinatorRef.current.getSessionGen();
    let isMounted = true;

    setSyncStatus(isOnlineRef.current ? 'syncing' : 'offline');

    const handleSnapshotMeta = (colName: LifeFlowCollection, hasPendingWrites: boolean) => {
      if (hasPendingWrites) {
        pendingCollectionsRef.current.add(colName);
      } else {
        pendingCollectionsRef.current.delete(colName);
        setLastSyncedTime(new Date().toLocaleTimeString());
      }
      if (listenerErrorsRef.current[colName]) {
        const nextErrors = { ...listenerErrorsRef.current };
        delete nextErrors[colName];
        listenerErrorsRef.current = nextErrors;
        setModuleErrors(nextErrors);
      }
      refreshSyncStatus();
    };

    const handleListenerError = (colName: LifeFlowCollection, err: unknown) => {
      if (!isMounted || !coordinatorRef.current.isCurrent(capturedGen, capturedUid)) return;
      const path = `users/${capturedUid}/${colName}`;
      console.error('Firestore listener error:', buildFirestoreErrorInfo(err, 'list', path, capturedUid));
      const friendlyMsg = toFriendlyFirestoreErrorMessage(err, colName, 'list');
      listenerErrorsRef.current = { ...listenerErrorsRef.current, [colName]: friendlyMsg };
      setModuleErrors({ ...listenerErrorsRef.current });
      setSyncError(friendlyMsg);
      if (colName === 'emergency') {
        setEmergencyLoading(false);
      }
      refreshSyncStatus();
    };

    const unsubTasks = onSnapshot(
      collection(db, `users/${capturedUid}/tasks`),
      { includeMetadataChanges: true },
      (snapshot) => {
        if (!isMounted || !coordinatorRef.current.isCurrent(capturedGen, capturedUid)) return;
        setTasks(snapshot.docs.map(d => deserializeTask(d.id, d.data() as Record<string, unknown>)));
        handleSnapshotMeta('tasks', snapshot.metadata.hasPendingWrites);
      },
      (err) => handleListenerError('tasks', err)
    );

    const unsubRoutines = onSnapshot(
      collection(db, `users/${capturedUid}/routines`),
      { includeMetadataChanges: true },
      (snapshot) => {
        if (!isMounted || !coordinatorRef.current.isCurrent(capturedGen, capturedUid)) return;
        setRoutines(snapshot.docs.map(d => deserializeRoutine(d.id, d.data() as Record<string, unknown>)));
        handleSnapshotMeta('routines', snapshot.metadata.hasPendingWrites);
      },
      (err) => handleListenerError('routines', err)
    );

    const unsubGoals = onSnapshot(
      collection(db, `users/${capturedUid}/goals`),
      { includeMetadataChanges: true },
      (snapshot) => {
        if (!isMounted || !coordinatorRef.current.isCurrent(capturedGen, capturedUid)) return;
        setGoals(snapshot.docs.map(d => deserializeGoal(d.id, d.data() as Record<string, unknown>)));
        handleSnapshotMeta('goals', snapshot.metadata.hasPendingWrites);
      },
      (err) => handleListenerError('goals', err)
    );

    const unsubFinance = onSnapshot(
      collection(db, `users/${capturedUid}/finance`),
      { includeMetadataChanges: true },
      (snapshot) => {
        if (!isMounted || !coordinatorRef.current.isCurrent(capturedGen, capturedUid)) return;
        setTransactions(snapshot.docs.map(d => deserializeTransaction(d.id, d.data() as Record<string, unknown>)));
        handleSnapshotMeta('finance', snapshot.metadata.hasPendingWrites);
      },
      (err) => handleListenerError('finance', err)
    );

    const unsubNotes = onSnapshot(
      collection(db, `users/${capturedUid}/notes`),
      { includeMetadataChanges: true },
      (snapshot) => {
        if (!isMounted || !coordinatorRef.current.isCurrent(capturedGen, capturedUid)) return;
        setNotes(snapshot.docs.map(d => deserializeNote(d.id, d.data() as Record<string, unknown>)));
        handleSnapshotMeta('notes', snapshot.metadata.hasPendingWrites);
      },
      (err) => handleListenerError('notes', err)
    );

    const unsubCalendar = onSnapshot(
      collection(db, `users/${capturedUid}/calendar`),
      { includeMetadataChanges: true },
      (snapshot) => {
        if (!isMounted || !coordinatorRef.current.isCurrent(capturedGen, capturedUid)) return;
        setEvents(snapshot.docs.map(d => deserializeCalendarEvent(d.id, d.data() as Record<string, unknown>)));
        handleSnapshotMeta('calendar', snapshot.metadata.hasPendingWrites);
      },
      (err) => handleListenerError('calendar', err)
    );

    const unsubDocuments = onSnapshot(
      collection(db, `users/${capturedUid}/documents`),
      { includeMetadataChanges: true },
      (snapshot) => {
        if (!isMounted || !coordinatorRef.current.isCurrent(capturedGen, capturedUid)) return;
        setDocuments(snapshot.docs.map(d => deserializeDocument(d.id, d.data() as Record<string, unknown>)));
        handleSnapshotMeta('documents', snapshot.metadata.hasPendingWrites);
      },
      (err) => handleListenerError('documents', err)
    );

    const unsubHealth = onSnapshot(
      collection(db, `users/${capturedUid}/health`),
      { includeMetadataChanges: true },
      (snapshot) => {
        if (!isMounted || !coordinatorRef.current.isCurrent(capturedGen, capturedUid)) return;
        const vitalsDoc = snapshot.docs.find(d => d.id === 'vitals') || snapshot.docs[0];
        if (vitalsDoc) {
          setHealth(deserializeHealth(vitalsDoc.data() as Record<string, unknown>));
        } else {
          setHealth(emptyAuthenticatedHealthStat);
        }
        handleSnapshotMeta('health', snapshot.metadata.hasPendingWrites);
      },
      (err) => handleListenerError('health', err)
    );

    const unsubFamily = onSnapshot(
      collection(db, `users/${capturedUid}/family`),
      { includeMetadataChanges: true },
      (snapshot) => {
        if (!isMounted || !coordinatorRef.current.isCurrent(capturedGen, capturedUid)) return;
        setFamily(snapshot.docs.map(d => deserializeFamilyMember(d.id, d.data() as Record<string, unknown>)));
        handleSnapshotMeta('family', snapshot.metadata.hasPendingWrites);
      },
      (err) => handleListenerError('family', err)
    );

    const unsubLearning = onSnapshot(
      collection(db, `users/${capturedUid}/learning`),
      { includeMetadataChanges: true },
      (snapshot) => {
        if (!isMounted || !coordinatorRef.current.isCurrent(capturedGen, capturedUid)) return;
        setLearning(snapshot.docs.map(d => deserializeLearningItem(d.id, d.data() as Record<string, unknown>)));
        handleSnapshotMeta('learning', snapshot.metadata.hasPendingWrites);
      },
      (err) => handleListenerError('learning', err)
    );

    const unsubEmergency = onSnapshot(
      collection(db, `users/${capturedUid}/emergency`),
      { includeMetadataChanges: true },
      (snapshot) => {
        if (!isMounted || !coordinatorRef.current.isCurrent(capturedGen, capturedUid)) return;
        setEmergencyContacts(snapshot.docs.map(d => deserializeEmergencyContact(d.id, d.data() as Record<string, unknown>)));
        setEmergencyLoading(false);
        handleSnapshotMeta('emergency', snapshot.metadata.hasPendingWrites);
      },
      (err) => handleListenerError('emergency', err)
    );

    const unsubSettings = onSnapshot(
      collection(db, `users/${capturedUid}/settings`),
      { includeMetadataChanges: true },
      (snapshot) => {
        if (!isMounted || !coordinatorRef.current.isCurrent(capturedGen, capturedUid)) return;
        // Preserve in-session user settings when Firestore settings collection is initially empty
        if (!snapshot.empty) {
          const prefDoc = snapshot.docs.find(d => d.id === 'preferences') || snapshot.docs[0];
          if (prefDoc) {
            const parsed = deserializeSettings(prefDoc.data() as Record<string, unknown>);
            setLanguage(parsed.language);
            if (parsed.theme) {
              setTheme(parsed.theme);
            }
          }
        }
        handleSnapshotMeta('settings', snapshot.metadata.hasPendingWrites);
      },
      (err) => handleListenerError('settings', err)
    );

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
      unsubEmergency();
      unsubSettings();
    };
  }, [user]);

  // Execute serialized Firestore write with session-gen guard, rollback on error, and retry queue
  const executeFirestoreMutation = async (params: {
    collectionName: LifeFlowCollection;
    docId: string;
    action: 'set' | 'update' | 'delete';
    rawData?: unknown;
    partialUpdate?: Record<string, unknown>;
    rollback: () => void;
  }) => {
    const activeUser = userRef.current;
    if (!activeUser) return;

    const capturedUid = activeUser.uid;
    const capturedGen = coordinatorRef.current.getSessionGen();
    const { collectionName, docId, action, rawData, partialUpdate, rollback } = params;

    if (!isValidFirestoreDocId(docId)) {
      rollback();
      setSyncError(`Invalid record identifier for ${collectionName}.`);
      refreshSyncStatus();
      return;
    }

    const opKey = `${collectionName}:${docId}:${action}`;
    if (!trackerRef.current.tryAcquireKey(opKey)) {
      return;
    }

    let serializedPayload: Record<string, unknown> | undefined;
    try {
      if (action === 'set') {
        serializedPayload = serializeForCollection(collectionName, rawData);
      } else if (action === 'update') {
        serializedPayload = partialUpdate ?? serializeForCollection(collectionName, rawData);
      }
    } catch (validationErr) {
      trackerRef.current.releaseKey(opKey);
      rollback();
      setSyncError(validationErr instanceof Error ? validationErr.message : `Invalid ${collectionName} data.`);
      refreshSyncStatus();
      return;
    }

    const docPath = `users/${capturedUid}/${collectionName}/${docId}`;
    refreshSyncStatus();

    try {
      const targetRef = doc(db, `users/${capturedUid}/${collectionName}`, docId);
      if (action === 'set' && serializedPayload) {
        await setDoc(targetRef, serializedPayload);
      } else if (action === 'update' && serializedPayload) {
        await updateDoc(targetRef, serializedPayload);
      } else if (action === 'delete') {
        await deleteDoc(targetRef);
      }

      if (!coordinatorRef.current.isCurrent(capturedGen, capturedUid)) return;
      trackerRef.current.clearFailure(opKey);
      setLastSyncedTime(new Date().toLocaleTimeString());
      if (trackerRef.current.getFailedCount() === 0 && Object.keys(listenerErrorsRef.current).length === 0) {
        setSyncError(null);
      }
    } catch (err) {
      if (!coordinatorRef.current.isCurrent(capturedGen, capturedUid)) return;
      const opType: FirestoreOperationType = action === 'set' ? 'write' : action;
      console.error('Firestore mutation error:', buildFirestoreErrorInfo(err, opType, docPath, capturedUid));
      rollback();
      const friendlyMsg = toFriendlyFirestoreErrorMessage(err, collectionName, opType);
      trackerRef.current.recordFailure({
        opKey,
        collectionName,
        docId,
        action,
        payload: serializedPayload,
        errorMessage: friendlyMsg,
        sessionGen: capturedGen,
        uid: capturedUid,
      });
      setSyncError(friendlyMsg);
    } finally {
      trackerRef.current.releaseKey(opKey);
      if (coordinatorRef.current.isCurrent(capturedGen, capturedUid)) {
        refreshSyncStatus();
      }
    }
  };

  // Manual bounded retry for failed operations
  const handleRetryFailedSync = async () => {
    if (!userRef.current || retryingSync) return;
    setRetryingSync(true);
    try {
      const result = await trackerRef.current.retryAll(
        coordinatorRef.current,
        async (op: FailedSyncOperation) => {
          const targetRef = doc(db, `users/${op.uid}/${op.collectionName}`, op.docId);
          if (op.action === 'set' && op.payload) {
            await setDoc(targetRef, op.payload);
          } else if (op.action === 'update' && op.payload) {
            await updateDoc(targetRef, op.payload);
          } else if (op.action === 'delete') {
            await deleteDoc(targetRef);
          }
        }
      );
      if (result.failed === 0) {
        setSyncError(null);
        setLastSyncedTime(new Date().toLocaleTimeString());
      } else {
        const remaining = trackerRef.current.getFailedOperations();
        setSyncError(remaining[0]?.errorMessage ?? 'Some cloud changes still failed to sync.');
      }
    } finally {
      setRetryingSync(false);
      refreshSyncStatus();
    }
  };

  // Module handlers with deterministic rollback
  const handleToggleTask = (id: string) => {
    const existing = tasks.find(tItem => tItem.id === id);
    if (!existing) return;
    const nextTask = { ...existing, completed: !existing.completed };
    setTasks(prev => prev.map(tItem => (tItem.id === id ? nextTask : tItem)));
    void executeFirestoreMutation({
      collectionName: 'tasks',
      docId: id,
      action: 'update',
      partialUpdate: { completed: nextTask.completed },
      rollback: () => {
        setTasks(prev => prev.map(tItem => (tItem.id === id ? existing : tItem)));
      },
    });
  };

  const handleAddTask = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
    void executeFirestoreMutation({
      collectionName: 'tasks',
      docId: newTask.id,
      action: 'set',
      rawData: newTask,
      rollback: () => {
        setTasks(prev => prev.filter(tItem => tItem.id !== newTask.id));
      },
    });
  };

  const handleDeleteTask = (id: string) => {
    const removed = tasks.find(tItem => tItem.id === id);
    if (!removed) return;
    setTasks(prev => prev.filter(tItem => tItem.id !== id));
    void executeFirestoreMutation({
      collectionName: 'tasks',
      docId: id,
      action: 'delete',
      rollback: () => {
        setTasks(prev => (prev.some(tItem => tItem.id === id) ? prev : [removed, ...prev]));
      },
    });
  };

  const handleToggleRoutine = (id: string) => {
    const existing = routines.find(r => r.id === id);
    if (!existing) return;
    const nextRoutine = { ...existing, completed: !existing.completed };
    setRoutines(prev => prev.map(r => (r.id === id ? nextRoutine : r)));
    void executeFirestoreMutation({
      collectionName: 'routines',
      docId: id,
      action: 'update',
      partialUpdate: { completed: nextRoutine.completed, streak: nextRoutine.streak },
      rollback: () => {
        setRoutines(prev => prev.map(r => (r.id === id ? existing : r)));
      },
    });
  };

  const handleAddGoal = (newGoal: Goal) => {
    setGoals(prev => [newGoal, ...prev]);
    void executeFirestoreMutation({
      collectionName: 'goals',
      docId: newGoal.id,
      action: 'set',
      rawData: newGoal,
      rollback: () => {
        setGoals(prev => prev.filter(g => g.id !== newGoal.id));
      },
    });
  };

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);
    void executeFirestoreMutation({
      collectionName: 'finance',
      docId: newTx.id,
      action: 'set',
      rawData: newTx,
      rollback: () => {
        setTransactions(prev => prev.filter(tx => tx.id !== newTx.id));
      },
    });
  };

  const handleDeleteTransaction = (id: string) => {
    const removed = transactions.find(tx => tx.id === id);
    if (!removed) return;
    setTransactions(prev => prev.filter(tx => tx.id !== id));
    void executeFirestoreMutation({
      collectionName: 'finance',
      docId: id,
      action: 'delete',
      rollback: () => {
        setTransactions(prev => (prev.some(tx => tx.id === id) ? prev : [removed, ...prev]));
      },
    });
  };

  const handleAddNote = (newNote: NoteItem) => {
    setNotes(prev => [newNote, ...prev]);
    void executeFirestoreMutation({
      collectionName: 'notes',
      docId: newNote.id,
      action: 'set',
      rawData: newNote,
      rollback: () => {
        setNotes(prev => prev.filter(n => n.id !== newNote.id));
      },
    });
  };

  const handleAddEvent = (newEv: CalendarEventItem) => {
    setEvents(prev => [newEv, ...prev]);
    void executeFirestoreMutation({
      collectionName: 'calendar',
      docId: newEv.id,
      action: 'set',
      rawData: newEv,
      rollback: () => {
        setEvents(prev => prev.filter(ev => ev.id !== newEv.id));
      },
    });
  };

  const handleDeleteEvent = (id: string) => {
    const removed = events.find(ev => ev.id === id);
    if (!removed) return;
    setEvents(prev => prev.filter(ev => ev.id !== id));
    void executeFirestoreMutation({
      collectionName: 'calendar',
      docId: id,
      action: 'delete',
      rollback: () => {
        setEvents(prev => (prev.some(ev => ev.id === id) ? prev : [removed, ...prev]));
      },
    });
  };

  const handleAddDocument = (newDoc: DocumentItem) => {
    setDocuments(prev => [newDoc, ...prev]);
    void executeFirestoreMutation({
      collectionName: 'documents',
      docId: newDoc.id,
      action: 'set',
      rawData: newDoc,
      rollback: () => {
        setDocuments(prev => prev.filter(d => d.id !== newDoc.id));
      },
    });
  };

  const handleDeleteDocument = (id: string) => {
    const removed = documents.find(d => d.id === id);
    if (!removed) return;
    setDocuments(prev => prev.filter(d => d.id !== id));
    void executeFirestoreMutation({
      collectionName: 'documents',
      docId: id,
      action: 'delete',
      rollback: () => {
        setDocuments(prev => (prev.some(d => d.id === id) ? prev : [removed, ...prev]));
      },
    });
  };

  const handleUpdateHealth = (newHealth: HealthStat) => {
    const previousHealth = health;
    setHealth(newHealth);
    void executeFirestoreMutation({
      collectionName: 'health',
      docId: 'vitals',
      action: 'set',
      rawData: newHealth,
      rollback: () => {
        setHealth(previousHealth);
      },
    });
  };

  const handleAddEmergencyContact = (contact: EmergencyContact) => {
    setEmergencyContacts(prev => [contact, ...prev]);
    void executeFirestoreMutation({
      collectionName: 'emergency',
      docId: contact.id,
      action: 'set',
      rawData: contact,
      rollback: () => {
        setEmergencyContacts(prev => prev.filter(c => c.id !== contact.id));
      },
    });
  };

  const handleUpdateEmergencyContact = (contact: EmergencyContact) => {
    const previousItem = emergencyContacts.find(c => c.id === contact.id);
    if (!previousItem) return;
    setEmergencyContacts(prev => prev.map(c => (c.id === contact.id ? contact : c)));
    void executeFirestoreMutation({
      collectionName: 'emergency',
      docId: contact.id,
      action: 'set',
      rawData: contact,
      rollback: () => {
        setEmergencyContacts(prev => prev.map(c => (c.id === contact.id ? previousItem : c)));
      },
    });
  };

  const handleDeleteEmergencyContact = (id: string) => {
    const removed = emergencyContacts.find(c => c.id === id);
    if (!removed) return;
    setEmergencyContacts(prev => prev.filter(c => c.id !== id));
    void executeFirestoreMutation({
      collectionName: 'emergency',
      docId: id,
      action: 'delete',
      rollback: () => {
        setEmergencyContacts(prev => (prev.some(c => c.id === id) ? prev : [removed, ...prev]));
      },
    });
  };

  const handleSelectLanguage = (nextLang: Language) => {
    const prevLang = language;
    setLanguage(nextLang);
    if (userRef.current) {
      void executeFirestoreMutation({
        collectionName: 'settings',
        docId: 'preferences',
        action: 'set',
        rawData: { language: nextLang, theme },
        rollback: () => {
          setLanguage(prevLang);
        },
      });
    }
  };

  const handleSelectTheme = (nextTheme: ThemePreference) => {
    const prevTheme = theme;
    setTheme(nextTheme);
    if (userRef.current) {
      void executeFirestoreMutation({
        collectionName: 'settings',
        docId: 'preferences',
        action: 'set',
        rawData: { language, theme: nextTheme },
        rollback: () => {
          setTheme(prevTheme);
        },
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      coordinatorRef.current.transitionTo(null);
      userRef.current = null;
      setUser(null);
      resetStateForSignedOutDemo();
    } catch (err) {
      console.error('Sign-out failed:', err);
      setSyncError('Failed to sign out cleanly. Please try again.');
    }
  };

  const t = getTranslations(language);
  const shellThemeClass =
    theme === 'dark'
      ? 'bg-neutral-950 text-neutral-100'
      : 'bg-[#F8F7F0] text-neutral-900';

  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      data-theme={theme}
      className={`min-h-screen ${shellThemeClass} flex font-sans antialiased selection:bg-[#123D32] selection:text-[#C5A45D]`}
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
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? 'md:ms-20' : 'md:ms-64'}`}>
        {/* Top Navbar */}
        <TopNavbar
          currentTab={currentTab}
          onOpenMobile={() => setMobileOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenQuickAction={() => setQuickActionOpen(true)}
          language={language}
          onSelectLanguage={handleSelectLanguage}
          user={user}
          onOpenAuth={() => setAuthModalOpen(true)}
          onSignOut={handleSignOut}
          syncStatus={syncStatus}
          lastSyncedTime={lastSyncedTime}
        />

        {/* Sync Error Banner if any */}
        {syncError && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-2.5 text-xs text-red-800 flex items-center justify-between gap-4">
            <span><strong>Cloud Sync Warning:</strong> {syncError}</span>
            <div className="flex items-center gap-3 shrink-0">
              {failedRetryCount > 0 && user && (
                <button
                  type="button"
                  disabled={retryingSync}
                  onClick={handleRetryFailedSync}
                  className="px-2.5 py-1 bg-red-700 text-white rounded-lg font-semibold hover:bg-red-800 disabled:opacity-50"
                >
                  {retryingSync ? t.syncing : `${t.retry} (${failedRetryCount})`}
                </button>
              )}
              <button type="button" onClick={() => setSyncError(null)} className="font-bold hover:underline">
                {t.dismiss}
              </button>
            </div>
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
              user={user}
              language={language}
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

          {currentTab === 'documents' && (
            <DocumentsView
              documents={documents}
              onAddDocument={handleAddDocument}
              onDeleteDocument={handleDeleteDocument}
            />
          )}

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

          {currentTab === 'emergency' && (
            <EmergencyView
              contacts={emergencyContacts}
              loading={emergencyLoading}
              error={moduleErrors.emergency ?? null}
              isAuthenticated={Boolean(user)}
              onAddContact={handleAddEmergencyContact}
              onUpdateContact={handleUpdateEmergencyContact}
              onDeleteContact={handleDeleteEmergencyContact}
            />
          )}

          {currentTab === 'ai-assistant' && <AIAssistantView />}

          {currentTab === 'settings' && (
            <SettingsView
              language={language}
              theme={theme}
              user={user}
              syncStatus={syncStatus}
              error={moduleErrors.settings ?? null}
              onSelectLanguage={handleSelectLanguage}
              onSelectTheme={handleSelectTheme}
              onOpenAuth={() => setAuthModalOpen(true)}
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
      />
    </div>
  );
}
