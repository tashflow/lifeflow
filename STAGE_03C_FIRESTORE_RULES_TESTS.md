# LifeFlow — Stage 03C Firestore Rules Test Suite Specification

**Framework:** `@firebase/rules-unit-testing` + Jest  
**File Name:** `firestore.rules.test.ts` (Ready for execution on Windows).

---

## Complete Test Suite Code Structure

```ts
import { assertFails, assertSucceeds, initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import * as fs from 'fs';

describe('LifeFlow Stage 03C Comprehensive Security Rules Tests', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'lifeflow-stage-03c-test',
      firestore: {
        rules: fs.readFileSync('firestore.rules', 'utf8'),
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestoreData();
  });

  const collections = [
    'tasks', 'goals', 'routines', 'calendar', 'finance', 
    'notes', 'documents', 'health', 'family', 'learning', 'emergency', 'settings'
  ];

  const validPayloads: Record<string, any> = {
    tasks: { title: 'Test Task', category: 'Work', priority: 'High', completed: false },
    goals: { title: 'Test Goal', category: 'Wealth', progress: 50 },
    routines: { time: '08:00 AM', title: 'Meditation', category: 'Morning', completed: true, streak: 5 },
    calendar: { title: 'Sync', time: '10 AM', category: 'Work', day: 23 },
    finance: { title: 'Groceries', amount: 150, type: 'expense', category: 'Food', date: '2026-11-24' },
    notes: { title: 'Idea', folder: 'Personal', content: 'Note content', updatedAt: '2026-11-24' },
    documents: { name: 'Passport', category: 'Identity', uploadDate: '2026-01-01', size: '2 MB' },
    health: { waterDrank: 6, sleepHours: 8, weight: 70, steps: 8000, heartRate: 65 },
    family: { name: 'Maya', relation: 'Spouse', status: 'Free' },
    learning: { title: 'React', provider: 'Academy', progress: 80, category: 'Tech', status: 'In Progress' },
    emergency: { name: 'Dr. Smith', phone: '555-0199' },
    settings: { language: 'en' }
  };

  test('Unauthenticated access denied for all collections', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    for (const col of collections) {
      await assertFails(setDoc(doc(db, `users/userA/${col}/item1`), validPayloads[col]));
    }
  });

  test('User A can CRUD their own data across all 12 collections', async () => {
    const db = testEnv.authenticatedContext('userA').firestore();
    for (const col of collections) {
      const ref = doc(db, `users/userA/${col}/item1`);
      await assertSucceeds(setDoc(ref, validPayloads[col]));
      await assertSucceeds(getDoc(ref));
      await assertSucceeds(deleteDoc(ref));
    }
  });

  test('User A cannot read or write User B data', async () => {
    const dbA = testEnv.authenticatedContext('userA').firestore();
    const dbB = testEnv.authenticatedContext('userB').firestore();
    
    const refB = doc(dbB, 'users/userB/tasks/task1');
    await assertSucceeds(setDoc(refB, validPayloads.tasks));
    
    // User A cannot read or write User B record
    await assertFails(getDoc(refB));
    await assertFails(setDoc(refB, { ...validPayloads.tasks, title: 'Hacked' }));
  });

  test('Invalid payload missing required field rejected', async () => {
    const db = testEnv.authenticatedContext('userA').firestore();
    const badTask = { category: 'Work', priority: 'High', completed: false }; // missing title
    await assertFails(setDoc(doc(db, 'users/userA/tasks/task1'), badTask));
  });

  test('Payload with unknown shadow field rejected', async () => {
    const db = testEnv.authenticatedContext('userA').firestore();
    const badTask = { ...validPayloads.tasks, isAdmin: true };
    await assertFails(setDoc(doc(db, 'users/userA/tasks/task1'), badTask));
  });
});
```
