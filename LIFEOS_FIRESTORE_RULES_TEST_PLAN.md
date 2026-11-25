# LifeFlow — Firestore Rules Test Plan

**Execution Mode:** `UNTESTED` (Requires local Windows computer with Node.js and Java for Firebase Emulator).

---

## Test Cases

### Test 1: Unauthenticated Access Denial
- **Target:** All collections under `/users/{userId}/...`
- **Action:** Attempt `getDoc` or `setDoc` with unauthenticated context (`null`).
- **Expected Result:** `PERMISSION_DENIED` (`CODE-INSPECTED`).

### Test 2: Cross-User Isolation
- **Target:** `/users/userA/tasks/task1`
- **Action:** Authenticated context `userB` attempts to read/write `userA`'s record.
- **Expected Result:** `PERMISSION_DENIED` (`CODE-INSPECTED`).

### Test 3: Owner CRUD Access
- **Target:** All 12 LifeFlow collections for `userA`
- **Action:** Authenticated context `userA` creates, reads, updates, and deletes records with valid IDs.
- **Expected Result:** `SUCCESS` (`CODE-INSPECTED`).

### Test 4: ID Poisoning Guard
- **Target:** Subcollection document IDs (`{taskId}`, etc.)
- **Action:** Attempt write with path IDs containing illegal characters or exceeding 128 characters.
- **Expected Result:** `PERMISSION_DENIED` (`CODE-INSPECTED`).
