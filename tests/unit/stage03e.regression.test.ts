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
  generateFirestoreDocId,
  isValidFirestoreDocId,
  LifeFlowCollection,
  serializeForCollection,
  toFriendlyFirestoreErrorMessage,
} from '../../src/services/firestoreSerializers';
import {
  deriveSyncStatus,
  SessionCoordinator,
  SyncOperationsTracker,
} from '../../src/services/syncManager';
import { getTranslations, translations } from '../../src/translations';
import {
  defaultUserSettings,
  emptyAuthenticatedHealthStat,
  initialEmergencyContacts,
  initialHealthStat,
} from '../../src/data/mockData';

const EXPECTED_ALLOWED_FIELDS: Record<LifeFlowCollection, string[]> = {
  tasks: ['title', 'category', 'priority', 'dueDate', 'completed', 'notes'],
  goals: ['title', 'category', 'progress', 'targetDate', 'milestones'],
  routines: ['time', 'title', 'category', 'completed', 'streak'],
  calendar: ['title', 'time', 'category', 'attendees', 'day'],
  finance: ['title', 'amount', 'type', 'category', 'date'],
  notes: ['title', 'folder', 'content', 'updatedAt'],
  documents: ['name', 'category', 'uploadDate', 'size', 'expiryDate'],
  health: ['waterDrank', 'sleepHours', 'weight', 'steps', 'heartRate'],
  family: ['name', 'relation', 'status', 'avatarColor'],
  learning: ['title', 'provider', 'progress', 'category', 'status'],
  emergency: ['name', 'phone', 'relation'],
  settings: ['language', 'theme'],
};

describe('LifeFlow Stage 03E Remediation & Data Integrity Regression Suite', () => {
  describe('1. Firestore Serialization & Schema Compliance (AUD-D-01 / AUD-C-01)', () => {
    const sampleUiRecords: Record<LifeFlowCollection, any> = {
      tasks: { id: 't_123', title: 'Review Q1 Plan', category: 'Work', priority: 'High', dueDate: 'Today', completed: false, notes: 'Focus' },
      goals: { id: 'g_123', title: 'Run Marathon', category: 'Health', progress: 50, targetDate: 'Dec 2026', milestones: [{ id: 'm1', title: '10k', completed: true }] },
      routines: { id: 'r_123', time: '06:00 AM', title: 'Meditation', category: 'Morning', completed: true, streak: 7 },
      calendar: { id: 'ev_123', title: 'Board Sync', time: '10:00 AM', category: 'Work', attendees: 'Team', day: 23 },
      finance: { id: 'tx_123', title: 'Salary', amount: 5000, type: 'income', category: 'Salary', date: '2026-11-01' },
      notes: { id: 'n_123', title: 'Daily Log', folder: 'Journal', content: 'Productive day', updatedAt: '2026-11-25' },
      documents: { id: 'doc_123', name: 'Passport', category: 'Identity', uploadDate: '2025-01-01', size: '2.1 MB', expiryDate: '2035-01-01' },
      health: { id: 'vitals', waterDrank: 5, sleepHours: 7.5, weight: 72, steps: 8000, heartRate: 62 },
      family: { id: 'fam_123', name: 'Maya Vance', relation: 'Spouse', status: 'Home', avatarColor: 'bg-emerald-700' },
      learning: { id: 'l_123', title: 'React 19', provider: 'Academy', progress: 80, category: 'Engineering', status: 'In Progress' },
      emergency: { id: 'em_123', name: 'Dr. Sarah Jenkins', phone: '+1-555-890-1122', relation: 'Primary Physician' },
      settings: { id: 'preferences', language: 'ar', theme: 'dark' },
    };

    test('All 12 outgoing serializers strictly omit `id` and contain only firestore.rules allowed keys', () => {
      (Object.keys(sampleUiRecords) as LifeFlowCollection[]).forEach((col) => {
        const payload = serializeForCollection(col, sampleUiRecords[col]);
        expect(Object.prototype.hasOwnProperty.call(payload, 'id')).toBe(false);
        const allowed = EXPECTED_ALLOWED_FIELDS[col];
        Object.keys(payload).forEach((k) => {
          expect(allowed).toContain(k);
          expect(payload[k]).not.toBeUndefined();
        });
      });
    });

    test('Optional empty strings are omitted rather than stored as undefined/null', () => {
      const taskPayload = serializeForCollection('tasks', {
        id: 't_opt',
        title: 'Task without optional notes',
        category: 'Personal',
        priority: 'Low',
        dueDate: '',
        completed: false,
        notes: undefined,
      });
      expect(taskPayload).toEqual({
        title: 'Task without optional notes',
        category: 'Personal',
        priority: 'Low',
        completed: false,
      });

      const emergencyPayload = serializeForCollection('emergency', {
        id: 'em_opt',
        name: 'Local Clinic',
        phone: '911',
        relation: '',
      });
      expect(emergencyPayload).toEqual({ name: 'Local Clinic', phone: '911' });
    });

    test('Validation rejects missing required fields, empty titles, and NaN finance amounts', () => {
      expect(() =>
        serializeForCollection('tasks', { id: 't1', title: '   ', category: 'Work', priority: 'High', dueDate: '', completed: false })
      ).toThrow();
      expect(() =>
        serializeForCollection('finance', { id: 'tx1', title: 'Bad Amount', amount: Number.NaN, type: 'expense', category: 'Food', date: '2026-11-01' })
      ).toThrow();
      expect(() =>
        serializeForCollection('emergency', { id: 'em1', name: 'Alex', phone: '   ' })
      ).toThrow();
    });

    test('Deserializers restore document `id` from Firestore doc.id across all modules', () => {
      expect(deserializeTask('t_doc', { title: 'T', category: 'Work', priority: 'High', completed: true }).id).toBe('t_doc');
      expect(deserializeGoal('g_doc', { title: 'G', category: 'Wealth', progress: 40 }).id).toBe('g_doc');
      expect(deserializeRoutine('r_doc', { time: '07:00 AM', title: 'Walk', category: 'Morning', completed: false, streak: 2 }).id).toBe('r_doc');
      expect(deserializeCalendarEvent('ev_doc', { title: 'Meet', time: '10:00', category: 'Work', day: 12 }).id).toBe('ev_doc');
      expect(deserializeTransaction('tx_doc', { title: 'Coffee', amount: 5, type: 'expense', category: 'Food', date: '2026-11-25' }).id).toBe('tx_doc');
      expect(deserializeNote('n_doc', { title: 'N', folder: 'Personal', content: 'C', updatedAt: '2026-11-25' }).id).toBe('n_doc');
      expect(deserializeDocument('doc_doc', { name: 'Tax', category: 'Finance', uploadDate: '2026-11-01', size: '1 MB' }).id).toBe('doc_doc');
      expect(deserializeFamilyMember('fam_doc', { name: 'Maya', relation: 'Spouse', status: 'Free' }).id).toBe('fam_doc');
      expect(deserializeLearningItem('l_doc', { title: 'TS', provider: 'Academy', progress: 90, category: 'Eng', status: 'In Progress' }).id).toBe('l_doc');
      expect(deserializeEmergencyContact('em_doc', { name: 'Sarah', phone: '555-1234', relation: 'Doctor' })).toEqual({
        id: 'em_doc',
        name: 'Sarah',
        phone: '555-1234',
        relation: 'Doctor',
      });
      expect(deserializeHealth({ waterDrank: 4, sleepHours: 7, weight: 70, steps: 5000, heartRate: 65 })).toEqual({
        waterDrank: 4,
        sleepHours: 7,
        weight: 70,
        steps: 5000,
        heartRate: 65,
      });
      expect(deserializeSettings({ language: 'bn', theme: 'light' })).toEqual({
        language: 'bn',
        theme: 'light',
      });
    });

    test('Document ID validator matches firestore.rules regex and length bounds', () => {
      expect(isValidFirestoreDocId('t_1764000000_abc12')).toBe(true);
      expect(isValidFirestoreDocId(generateFirestoreDocId('em'))).toBe(true);
      expect(isValidFirestoreDocId('invalid.dot')).toBe(false);
      expect(isValidFirestoreDocId('invalid space')).toBe(false);
      expect(isValidFirestoreDocId('a'.repeat(129))).toBe(false);
    });
  });

  describe('2. Auth & Session Isolation Coordinator (AUD-A-01 / AUD-A-02)', () => {
    test('Session generation increments on sign-in, user switch, and sign-out, invalidating stale callbacks', () => {
      const coordinator = new SessionCoordinator();
      expect(coordinator.getActiveUid()).toBeNull();
      expect(coordinator.getSessionGen()).toBe(0);

      // Sign in User A
      const tA = coordinator.transitionTo('userA');
      expect(tA).toEqual({ changed: true, sessionGen: 1, uid: 'userA' });
      expect(coordinator.isCurrent(tA.sessionGen, 'userA')).toBe(true);

      // Same user re-emission does not bump generation
      const tSame = coordinator.transitionTo('userA');
      expect(tSame.changed).toBe(false);
      expect(coordinator.isCurrent(tA.sessionGen, 'userA')).toBe(true);

      // Switch User A -> User B immediately invalidates User A async callbacks/writes
      const tB = coordinator.transitionTo('userB');
      expect(tB).toEqual({ changed: true, sessionGen: 2, uid: 'userB' });
      expect(coordinator.isCurrent(tA.sessionGen, 'userA')).toBe(false);
      expect(coordinator.isCurrent(tB.sessionGen, 'userB')).toBe(true);

      // Sign out immediately invalidates User B async callbacks/writes
      const tOut = coordinator.transitionTo(null);
      expect(tOut).toEqual({ changed: true, sessionGen: 3, uid: null });
      expect(coordinator.isCurrent(tB.sessionGen, 'userB')).toBe(false);
      expect(coordinator.isCurrent(tOut.sessionGen, null)).toBe(false);
    });

    test('Authenticated empty health defaults are cleanly separated from Demo Mode mock health values', () => {
      expect(emptyAuthenticatedHealthStat.steps).toBe(0);
      expect(initialHealthStat.steps).toBeGreaterThan(0);
      expect(initialEmergencyContacts.length).toBeGreaterThan(0);
      expect(defaultUserSettings).toEqual({ language: 'en', theme: 'system' });
    });
  });

  describe('3. Offline Sync, Optimistic Reconciliation & Bounded Retry (AUD-E-01)', () => {
    test('Duplicate mutation guard prevents concurrent writes for the same opKey', () => {
      const tracker = new SyncOperationsTracker();
      expect(tracker.tryAcquireKey('tasks:t1:update')).toBe(true);
      expect(tracker.tryAcquireKey('tasks:t1:update')).toBe(false);
      expect(tracker.getInFlightCount()).toBe(1);
      tracker.releaseKey('tasks:t1:update');
      expect(tracker.tryAcquireKey('tasks:t1:update')).toBe(true);
    });

    test('Bounded manual retry executes once per failed op, clears succeeded ops, and ignores stale sessions', async () => {
      const coordinator = new SessionCoordinator();
      const tracker = new SyncOperationsTracker();
      const sA = coordinator.transitionTo('userA');

      tracker.recordFailure({
        opKey: 'tasks:t1:set',
        collectionName: 'tasks',
        docId: 't1',
        action: 'set',
        payload: { title: 'Task 1', category: 'Work', priority: 'High', completed: false },
        errorMessage: 'unavailable',
        sessionGen: sA.sessionGen,
        uid: 'userA',
      });
      tracker.recordFailure({
        opKey: 'emergency:em1:set',
        collectionName: 'emergency',
        docId: 'em1',
        action: 'set',
        payload: { name: 'Contact', phone: '555-0100' },
        errorMessage: 'unavailable',
        sessionGen: sA.sessionGen,
        uid: 'userA',
      });

      let executedCount = 0;
      const result = await tracker.retryAll(coordinator, async (op) => {
        executedCount += 1;
        if (op.docId === 'em1') {
          throw new Error('still-unavailable');
        }
      });

      expect(executedCount).toBe(2); // Single bounded pass — no infinite loop
      expect(result).toEqual({ succeeded: 1, failed: 1 });
      expect(tracker.getFailedCount()).toBe(1);
      expect(tracker.getFailedOperations()[0].docId).toBe('em1');
      expect(tracker.getFailedOperations()[0].attempts).toBe(2);

      // Switching user discards old failed queue cleanly
      coordinator.transitionTo('userB');
      const staleRetry = await tracker.retryAll(coordinator, async () => {
        throw new Error('should not execute for userA');
      });
      expect(staleRetry).toEqual({ succeeded: 0, failed: 0 });
      expect(tracker.getFailedCount()).toBe(0);
    });

    test('deriveSyncStatus distinguishes synced, syncing, pending, offline, and error deterministically', () => {
      expect(
        deriveSyncStatus({
          isAuthenticated: false,
          isOnline: true,
          hasPendingWrites: false,
          inFlightCount: 0,
          failedCount: 0,
          hasListenerError: false,
        })
      ).toBe('offline');

      expect(
        deriveSyncStatus({
          isAuthenticated: true,
          isOnline: false,
          hasPendingWrites: true,
          inFlightCount: 0,
          failedCount: 0,
          hasListenerError: false,
        })
      ).toBe('pending');

      expect(
        deriveSyncStatus({
          isAuthenticated: true,
          isOnline: true,
          hasPendingWrites: false,
          inFlightCount: 1,
          failedCount: 0,
          hasListenerError: false,
        })
      ).toBe('syncing');

      expect(
        deriveSyncStatus({
          isAuthenticated: true,
          isOnline: true,
          hasPendingWrites: false,
          inFlightCount: 0,
          failedCount: 1,
          hasListenerError: false,
        })
      ).toBe('error');

      expect(
        deriveSyncStatus({
          isAuthenticated: true,
          isOnline: true,
          hasPendingWrites: false,
          inFlightCount: 0,
          failedCount: 0,
          hasListenerError: false,
        })
      ).toBe('synced');
    });
  });

  describe('4. Listener Error Formatting & Localization Checks (AUD-D-02 / AUD-H-01)', () => {
    test('Firestore errors map to clear user-friendly messages and structured diagnostics without secret leaks', () => {
      const err = { code: 'permission-denied', message: 'Missing or insufficient permissions' };
      const friendly = toFriendlyFirestoreErrorMessage(err, 'emergency', 'list');
      expect(friendly).toContain('Permission denied');
      expect(friendly).toContain('emergency');

      const info = buildFirestoreErrorInfo(err, 'list', 'users/userA/emergency', 'userA');
      expect(info).toEqual({
        error: 'Missing or insufficient permissions',
        code: 'permission-denied',
        operationType: 'list',
        path: 'users/userA/emergency',
        uid: 'userA',
      });
    });

    test('Translations support en, bn, ar with complete key parity and no Cyrillic typo in Bengali', () => {
      const enKeys = Object.keys(translations.en).sort();
      const bnKeys = Object.keys(translations.bn).sort();
      const arKeys = Object.keys(translations.ar).sort();
      expect(bnKeys).toEqual(enKeys);
      expect(arKeys).toEqual(enKeys);

      expect(getTranslations('bn').welcomeBack).not.toMatch(/[А-Яа-я]/);
      expect(getTranslations('ar').dashboard).toBe('لوحة القيادة');
      expect(getTranslations('en').dashboard).toBe('Dashboard');
    });
  });
});
