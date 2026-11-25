import { assertFails, assertSucceeds, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, collection } from 'firebase/firestore';
import { setupTestEnvironment } from './test-helpers';
import { validPayloads } from './test-data';

describe('LifeFlow Stage 03C.2 Comprehensive Firestore Security Rules Suite', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await setupTestEnvironment();
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  const collections = [
    'tasks', 'goals', 'routines', 'calendar', 'finance',
    'notes', 'documents', 'health', 'family', 'learning', 'emergency', 'settings'
  ] as const;

  const validUpdates: Record<string, Record<string, any>> = {
    tasks: { completed: true },
    goals: { progress: 85 },
    routines: { completed: false, streak: 15 },
    calendar: { day: 25 },
    finance: { amount: 9000 },
    notes: { content: 'Updated note text' },
    documents: { size: '3.0 MB' },
    health: { waterDrank: 8 },
    family: { status: 'At Home' },
    learning: { progress: 100, status: 'Completed' },
    emergency: { phone: '+1-555-000-9999' },
    settings: { language: 'ar' },
  };

  const missingRequiredPayloads: Record<string, Record<string, any>> = {
    tasks: { category: 'Work', priority: 'High', completed: false },
    goals: { category: 'Wealth', progress: 68 },
    routines: { time: '06:00 AM', category: 'Morning', completed: true, streak: 14 },
    calendar: { time: '10:00 AM', category: 'Work', day: 23 },
    finance: { amount: 8400, type: 'income', category: 'Salary', date: '2026-11-01' },
    notes: { folder: 'Personal', content: 'Body', updatedAt: '2026-11-20' },
    documents: { category: 'Identity', uploadDate: '2025-01-15', size: '2.4 MB' },
    health: { sleepHours: 7.8, weight: 74.2, steps: 8420, heartRate: 64 },
    family: { relation: 'Spouse', status: 'In Office' },
    learning: { provider: 'Global Tech Academy', progress: 85, category: 'Engineering', status: 'In Progress' },
    emergency: { phone: '+1-555-890-1122' },
    settings: { theme: 'system' },
  };

  const invalidTypePayloads: Record<string, Record<string, any>> = {
    tasks: { ...validPayloads.tasks, completed: 'yes' },
    goals: { ...validPayloads.goals, progress: '68' },
    routines: { ...validPayloads.routines, streak: '14' },
    calendar: { ...validPayloads.calendar, day: '23' },
    finance: { ...validPayloads.finance, amount: '8400' },
    notes: { ...validPayloads.notes, content: 12345 },
    documents: { ...validPayloads.documents, name: 999 },
    health: { ...validPayloads.health, steps: '8420' },
    family: { ...validPayloads.family, name: 123 },
    learning: { ...validPayloads.learning, progress: '85' },
    emergency: { ...validPayloads.emergency, phone: 5550199 },
    settings: { ...validPayloads.settings, language: 1 },
  };

  test('Unauthenticated users are denied read, list, create, update, and delete across all 12 collections', async () => {
    const adminDb = testEnv.authenticatedContext('userA').firestore();
    for (const col of collections) {
      await assertSucceeds(setDoc(doc(adminDb, `users/userA/${col}/item1`), validPayloads[col]));
    }

    const unauthDb = testEnv.unauthenticatedContext().firestore();
    for (const col of collections) {
      const ref = doc(unauthDb, `users/userA/${col}/item1`);
      await assertFails(getDoc(ref));
      await assertFails(getDocs(collection(unauthDb, `users/userA/${col}`)));
      await assertFails(setDoc(doc(unauthDb, `users/userA/${col}/item2`), validPayloads[col]));
      await assertFails(updateDoc(ref, validUpdates[col]));
      await assertFails(deleteDoc(ref));
    }
  });

  test('Authenticated owner can perform full CRUD (create, read, list, update, delete) on all 12 collections', async () => {
    const db = testEnv.authenticatedContext('userA').firestore();
    for (const col of collections) {
      const ref = doc(db, `users/userA/${col}/item_1-valid`);
      await assertSucceeds(setDoc(ref, validPayloads[col]));
      await assertSucceeds(getDoc(ref));
      await assertSucceeds(getDocs(collection(db, `users/userA/${col}`)));
      await assertSucceeds(updateDoc(ref, validUpdates[col]));
      await assertSucceeds(deleteDoc(ref));
    }
  });

  test('User A cannot read, list, create, update, or delete User B records across all 12 collections', async () => {
    const dbA = testEnv.authenticatedContext('userA').firestore();
    const dbB = testEnv.authenticatedContext('userB').firestore();

    for (const col of collections) {
      const refAsB = doc(dbB, `users/userB/${col}/item1`);
      await assertSucceeds(setDoc(refAsB, validPayloads[col]));

      // Explicitly bind DocumentReference and CollectionReference to User A's Firestore client
      const refAsA = doc(dbA, `users/userB/${col}/item1`);
      const newRefAsA = doc(dbA, `users/userB/${col}/item2`);
      await assertFails(getDoc(refAsA));
      await assertFails(getDocs(collection(dbA, `users/userB/${col}`)));
      await assertFails(setDoc(newRefAsA, validPayloads[col]));
      await assertFails(updateDoc(refAsA, validUpdates[col]));
      await assertFails(deleteDoc(refAsA));
    }
  });

  test('Missing required fields are rejected across all 12 collections', async () => {
    const db = testEnv.authenticatedContext('userA').firestore();
    for (const col of collections) {
      await assertFails(setDoc(doc(db, `users/userA/${col}/missing1`), missingRequiredPayloads[col]));
    }
  });

  test('Unknown shadow fields are rejected across all 12 collections', async () => {
    const db = testEnv.authenticatedContext('userA').firestore();
    for (const col of collections) {
      await assertFails(
        setDoc(doc(db, `users/userA/${col}/shadow1`), {
          ...validPayloads[col],
          unexpectedAdminFlag: true,
        })
      );
    }
  });

  test('Invalid data types are rejected across all 12 collections', async () => {
    const db = testEnv.authenticatedContext('userA').firestore();
    for (const col of collections) {
      await assertFails(setDoc(doc(db, `users/userA/${col}/badtype1`), invalidTypePayloads[col]));
    }
  });

  test('Invalid document IDs (characters and length > 128) are rejected', async () => {
    const db = testEnv.authenticatedContext('userA').firestore();
    await assertFails(setDoc(doc(db, 'users/userA/tasks/invalid.id'), validPayloads.tasks));
    await assertFails(setDoc(doc(db, 'users/userA/tasks/invalid id'), validPayloads.tasks));
    await assertFails(setDoc(doc(db, `users/userA/tasks/${'a'.repeat(129)}`), validPayloads.tasks));
  });

  test('Invalid enum values are rejected', async () => {
    const db = testEnv.authenticatedContext('userA').firestore();
    await assertFails(setDoc(doc(db, 'users/userA/tasks/enum1'), { ...validPayloads.tasks, category: 'InvalidCat' }));
    await assertFails(setDoc(doc(db, 'users/userA/tasks/enum2'), { ...validPayloads.tasks, priority: 'Critical' }));
    await assertFails(setDoc(doc(db, 'users/userA/goals/enum1'), { ...validPayloads.goals, category: 'Travel' }));
    await assertFails(setDoc(doc(db, 'users/userA/routines/enum1'), { ...validPayloads.routines, category: 'Midnight' }));
    await assertFails(setDoc(doc(db, 'users/userA/finance/enum1'), { ...validPayloads.finance, type: 'transfer' }));
    await assertFails(setDoc(doc(db, 'users/userA/finance/enum2'), { ...validPayloads.finance, category: 'Crypto' }));
    await assertFails(setDoc(doc(db, 'users/userA/notes/enum1'), { ...validPayloads.notes, folder: 'Archive' }));
    await assertFails(setDoc(doc(db, 'users/userA/documents/enum1'), { ...validPayloads.documents, category: 'Other' }));
    await assertFails(setDoc(doc(db, 'users/userA/learning/enum1'), { ...validPayloads.learning, status: 'Dropped' }));
    await assertFails(setDoc(doc(db, 'users/userA/settings/enum1'), { ...validPayloads.settings, language: 'fr' }));
  });

  test('Invalid numeric boundaries and excessive string lengths are rejected', async () => {
    const db = testEnv.authenticatedContext('userA').firestore();
    await assertFails(setDoc(doc(db, 'users/userA/goals/bound1'), { ...validPayloads.goals, progress: -1 }));
    await assertFails(setDoc(doc(db, 'users/userA/goals/bound2'), { ...validPayloads.goals, progress: 101 }));
    await assertFails(setDoc(doc(db, 'users/userA/routines/bound1'), { ...validPayloads.routines, streak: -1 }));
    await assertFails(setDoc(doc(db, 'users/userA/calendar/bound1'), { ...validPayloads.calendar, day: 0 }));
    await assertFails(setDoc(doc(db, 'users/userA/calendar/bound2'), { ...validPayloads.calendar, day: 32 }));
    await assertFails(setDoc(doc(db, 'users/userA/health/bound1'), { ...validPayloads.health, waterDrank: -1 }));
    await assertFails(setDoc(doc(db, 'users/userA/health/bound2'), { ...validPayloads.health, heartRate: -10 }));
    await assertFails(setDoc(doc(db, 'users/userA/learning/bound1'), { ...validPayloads.learning, progress: 105 }));
    await assertFails(setDoc(doc(db, 'users/userA/tasks/len1'), { ...validPayloads.tasks, title: 'a'.repeat(201) }));
    await assertFails(setDoc(doc(db, 'users/userA/emergency/len1'), { ...validPayloads.emergency, phone: '1'.repeat(51) }));
  });

  test('Partial updates enforcing invalid types, unknown fields, or out-of-range values are rejected', async () => {
    const db = testEnv.authenticatedContext('userA').firestore();
    const taskRef = doc(db, 'users/userA/tasks/upd1');
    await assertSucceeds(setDoc(taskRef, validPayloads.tasks));
    await assertFails(updateDoc(taskRef, { completed: 'not-a-bool' }));
    await assertFails(updateDoc(taskRef, { shadowField: 'bad' }));
    await assertFails(updateDoc(taskRef, { priority: 'Urgent' }));
  });

  test('Catch-all deny blocks unknown root collections and subcollections', async () => {
    const db = testEnv.authenticatedContext('userA').firestore();
    await assertFails(setDoc(doc(db, 'admins/userA'), { role: 'admin' }));
    await assertFails(setDoc(doc(db, 'users/userA/unknownCollection/doc1'), { data: 'test' }));
  });
});
