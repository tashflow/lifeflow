# LifeFlow — Stage 03E Offline Persistence & Error Recovery Report

**Stage:** 03E — Security Remediation & Data Integrity Restoration  
**Date:** 2026-11-25  
**Scope:** Multi-tab IndexedDB persistence (`AUD-E-02`), optimistic rollback & duplicate-write protection (`AUD-E-01`), bounded retry queue, 5-state sync indicator, and structured error handling (`AUD-D-02`).

---

## 1. Offline Persistence Architecture (`AUD-E-02`)

**Previous Defect (`src/services/firebase.ts`):** Used deprecated single-tab `enableIndexedDbPersistence(db)` which failed persistence in secondary browser tabs.

**Stage 03E Implementation (`/src/services/firebase.ts` L34–48):**
- Upgraded to Firebase Web SDK v13 modular local cache initialization:
  ```ts
  db = initializeFirestore(
    app,
    {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    },
    firebaseConfig.firestoreDatabaseId
  );
  ```
- Wrapped initialization with a clean fallback to `getFirestore(app, firebaseConfig.firestoreDatabaseId)` if IndexedDB is unavailable in restricted browser contexts.
- Exported `clearIndexedDbPersistence` cleanly for controlled cache management without paid backends.

---

## 2. Real-Time Sync Status & Pending Writes Visibility

**New Module (`/src/services/syncManager.ts`):**
- Replaced coarse 3-state status (`synced | syncing | offline`) with deterministic 5-state `SyncStatus`:
  1. `'offline'` — Unauthenticated Demo Mode OR browser offline (`!isOnline`) with no queued pending writes.
  2. `'pending'` — Browser offline (`!isOnline`) with queued writes (`hasPendingWrites || failedCount > 0`) OR online with snapshot `metadata.hasPendingWrites === true` after local write commit.
  3. `'syncing'` — Active in-flight write operations (`inFlightCount > 0`).
  4. `'error'` — Listener error (`hasListenerError`) or non-empty failed write queue (`failedCount > 0`) while online.
  5. `'synced'` — Authenticated, online, zero in-flight mutations, zero pending local cache writes, zero errors.
- **UI Wiring (`/src/App.tsx`, `/src/components/TopNavbar.tsx`):**
  - Attached `window` `'online'` and `'offline'` event listeners (`src/App.tsx` L253–266).
  - Subscribed all 12 `onSnapshot` listeners with `{ includeMetadataChanges: true }` so local cache commits vs. server acknowledgements update `pendingWritesCollectionsRef` accurately.
  - Updated `TopNavbar.tsx` sync pill to render localized status labels for all 5 states cleanly.

---

## 3. Optimistic Reconciliation, Duplicate Guard & Bounded Retry (`AUD-E-01`)

**Remediation in `/src/services/syncManager.ts` & `/src/App.tsx` (`executeFirestoreMutation`, `L463–580`):**

1. **Pre-Write Validation & Rule Compliance:**
   - Every mutation validates `isValidFirestoreDocId(docId)` and runs `serializeForCollection(collectionName, rawData)` *before* issuing `setDoc`/`updateDoc`, catching malformed UI input cleanly and rolling back invalid optimistic updates immediately.
2. **Duplicate In-Flight Lock:**
   - `SyncOperationsTracker.tryAcquireKey(opKey)` prevents concurrent duplicate writes for the same `collection:docId:action` key while an operation is already in flight (`finally { tracker.releaseKey(opKey) }`).
3. **Scoped Optimistic Rollback:**
   - Every mutation handler (`handleAddTask`, `handleToggleTask`, `handleDeleteTask`, `handleAddGoal`, `handleAddNote`, `handleAddTransaction`, `handleDeleteTransaction`, `handleToggleRoutine`, `handleAddEvent`, `handleDeleteEvent`, `handleAddDocument`, `handleDeleteDocument`, `handleUpdateHealth`, `handleAddEmergencyContact`, `handleUpdateEmergencyContact`, `handleDeleteEmergencyContact`, `handleSelectLanguage`, `handleSelectTheme`) passes an item-scoped `rollback()` closure restoring prior item state only if `isCurrent(capturedGen, capturedUid)` holds.
4. **Offline Persistence vs. Immediate Failure Handling:**
   - Because Firestore offline SDK `setDoc`/`updateDoc`/`deleteDoc` promises resolve once the server ACKs (staying open while offline), an `isOnline === false` failure or immediate rejection keeps behavior safe:
     - On permission/validation errors (`permission-denied`, `invalid-argument`, `unauthenticated`): rolls back optimistic UI state immediately and records friendly user error (`toFriendlyFirestoreErrorMessage`).
     - On transient/network failures: records the failed operation in `SyncOperationsTracker` (`max 1` entry per `opKey`) and shows a manual **"Retry (N)"** action in the sync warning banner.
5. **Bounded Manual Retry (No Infinite Loops):**
   - `SyncOperationsTracker.retryAll(coordinator, executor)` iterates a fixed snapshot of failed operations **once per click** (`attempts += 1`), stops cleanly if the user session changes (`!coordinator.isCurrent(...)`), clears succeeded items, and retains only still-failing items without automatic background retry storms.

---

## 4. Verification Status

| Behavior | Verification Method | Result |
| :--- | :--- | :--- |
| `deriveSyncStatus` across all 5 states | Jest unit test (`tests/unit/stage03e.regression.test.ts`) | **PASSED** |
| Duplicate `opKey` guard | Jest unit test | **PASSED** |
| Bounded manual retry & cross-session discard | Jest unit test | **PASSED** |
| Friendly error messages & structured diagnostics | Jest unit test | **PASSED** |
| Real multi-tab & offline-reconnect E2E against Firestore | Live multi-browser testing | **NOT EXECUTED** locally (requires interactive browser QA) |
