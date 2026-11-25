# LifeFlow — Stage 03D Offline Sync, Multi-Device & Storage Privacy Audit

**Audit Date:** 2026-11-25  
**Scope:** Audit E (Offline Persistence, Cloud Sync, Multi-Device Behavior) & Audit F (Documents, Storage, Spark Free Privacy).

---

## 1. Audit E — Offline Persistence & Multi-Device Sync Matrix

| Behavior | Classification | Evidence | Notes |
| :--- | :--- | :--- | :--- |
| IndexedDB Offline Persistence Configuration | Implemented & Source-Verified | `src/services/firebase.ts` L31–42 (`enableIndexedDbPersistence(db)`) | Handles `failed-precondition` (multi-tab) and `unimplemented` via `console.warn`; uses legacy API deprecated in Firebase v13. |
| Browser Cache / Multi-Tab Behavior | Supported by Firebase SDK, Not Tested | `src/services/firebase.ts` L34–35 | Single-tab lock only; second open tab fails persistence silently with warning. |
| Network Loss & Offline Write Status | Implemented with Defect | `src/App.tsx` L204–232 | `await setDoc(...)` does not resolve while offline until server commit, leaving `syncStatus` stuck at `'syncing'` without `navigator.onLine` or `snapshot.metadata` listeners. |
| Reconnection & Pending Writes Visibility | Not Implemented / Unverified | `src/App.tsx` (no `onSnapshotsInSync`, no `metadata.hasPendingWrites`) | Users cannot tell whether queued mutations are pending offline upload or failed. |
| Optimistic Update Reconciliation | **Defect** (`FAILED`) | `src/App.tsx` L235–295 | Local React state mutates before `setDoc`/`deleteDoc`; on error (`catch`), `syncError` displays but failed items/deletions remain in UI state. |
| Cached / Stale Data on Account Switching | **Defect** (`FAILED`) | `src/App.tsx` L80–99, L125–186, L302–306 | `clearIndexedDbPersistence` is not called on sign-out, and 9/10 `onSnapshot` listeners skip empty snapshots (`if (!snapshot.empty)`). |
| Real-Time Sync Across Two Authenticated Devices | Requires Real-Device Testing (`NOT VERIFIED`) | `src/App.tsx` L105–201 | Structurally wired via `onSnapshot` for 10 collections, blocked on writes for 6 collections (`AUD-D-01`) and unverified in E2E tests. |

---

## 2. Audit E Findings

- **Finding ID:** `AUD-E-01`
  - **Severity:** `HIGH`
  - **Status:** `FAILED`
  - **Relevant File Path:** `/src/App.tsx`
  - **Line Range:** `L204–295`
  - **Evidence Excerpt:** `setTasks(prev => [newTask, ...prev]); persistToFirestore('tasks', newTask.id, newTask);` (L247–248) with `catch` only updating `syncStatus` and `syncError` (L212–216).
  - **Security / Operational Impact:** Optimistic additions, toggles, and deletions are never rolled back when Firestore rejects a write (e.g., offline timeout or `PERMISSION_DENIED`), causing persistent divergence between UI and Firestore.
  - **Recommended Next Action:** Roll back failed optimistic updates (or rely on `onSnapshot` with `includeMetadataChanges: true` after fixing `AUD-D-01`).

- **Finding ID:** `AUD-E-02`
  - **Severity:** `MEDIUM`
  - **Status:** `PARTIALLY VERIFIED`
  - **Relevant File Path:** `/src/services/firebase.ts`, `/src/App.tsx`
  - **Line Range:** `firebase.ts` `L31–42`; `App.tsx` `L302–306`
  - **Evidence Excerpt:** `enableIndexedDbPersistence(db).catch(...)` (`firebase.ts` L33); `handleSignOut` (`App.tsx` L302–306) does not clear local IndexedDB cache.
  - **Security / Operational Impact:** Multi-tab browsers disable offline cache in secondary tabs, and offline IndexedDB cache is not explicitly purged on sign-out.
  - **Recommended Next Action:** Migrate to `initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })` (Firebase v13) and track `online`/`offline` + `hasPendingWrites` cleanly.

---

## 3. Audit F — Documents, Storage & Spark Free Privacy

- **Spark Free Compliance (`VERIFIED`):** `firebase/storage` is neither imported nor used anywhere in `src/` (even though `firebase-applet-config.json` L7 lists `storageBucket`), and no Cloud Functions or paid databases are used.
- **Document Metadata (`PARTIALLY VERIFIED`):** Firestore collection `users/{uid}/documents` stores metadata fields (`name`, `category`, `uploadDate`, `size`, optional `expiryDate`), protected by `isOwner(userId)` and `isValidDocument` (`firestore.rules` L78–86, L177–181).

- **Finding ID:** `AUD-F-01`
  - **Severity:** `MEDIUM`
  - **Status:** `FAILED`
  - **Relevant File Path:** `/src/views/DocumentsView.tsx`
  - **Line Range:** `L14–20`, `L46–52`
  - **Evidence Excerpt:** `"End-to-end encrypted storage..."` (L15), `"AES-256 Encrypted Session"` (L19), `onClick={() => alert(\`Downloading secure copy of ${doc.name}\`)}` (L47).
  - **Security / Operational Impact:** No binary file upload, local device storage, AES-256 encryption, or real file download exists. The UI misleads users into believing cloud-synced AES-256 encrypted file storage is active, and `window.alert` is incompatible with embedded iFrames/WebViews. Paid cloud binary storage (Firebase Cloud Storage beyond Spark limits or paid S3) must NOT be introduced; local device file handling (e.g., browser File API / local IndexedDB blob store clearly labeled as device-local) is the Spark-Free limitation.
  - **Recommended Next Action:** Replace misleading AES-256/download alerts with accurate metadata-only or explicitly device-local file handling labels and Spark-Free local file storage if needed.
