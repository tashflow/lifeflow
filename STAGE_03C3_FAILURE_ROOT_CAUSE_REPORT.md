# LifeFlow — Stage 03C.3 Failure Root Cause Report

**Date:** 2026-11-25  
**Failing Test:** `"Authenticated owner can perform full CRUD (create, read, list, update, delete) on all 12 collections"`  
**Observed GitHub CI Result:** 11 total tests, 10 passed, 1 failed  
**Observed Emulator Error:** `permission-denied: false for 'list' @ L134, Null value error for 'list' @ L142`

---

## 1. Root Cause Analysis

Inspection of `firestore.rules` (lines 132–200) and `tests/firestore/firestore.rules.test.ts` (lines 90–100) confirmed the exact defect:

1. **Unbound Wildcard Evaluation on Collection `list` Queries (`L142` and all 11 sibling collections):**
   Previously, all 12 user subcollection match blocks used:
   ```javascript
   match /tasks/{taskId} {
     allow read, list, delete: if isOwner(userId) && isValidId(taskId);
     allow create, update: if isOwner(userId) && isValidId(taskId) && isValidTask(request.resource.data);
   }
   ```
   - In Firestore Security Rules (`rules_version = '2'`), a collection-level `list` query (`getDocs(collection(db, 'users/userA/tasks'))`) does not target a single document ID, so the document wildcard path variable (`taskId`, `goalId`, etc.) is unbound/`null`.
   - Calling `isValidId(taskId)` inside `allow read, list, delete` (and note that `read` itself expands to `get, list`) caused Firestore's rules evaluator to hit a **`Null value error for 'list' @ L142`**.
   - Because line 142 threw a runtime evaluation error, it did not grant access, causing evaluation to fall back to the default deny-all catch-all rule at **L134** (`allow read, write: if false;`), producing **`permission-denied: false for 'list' @ L134`**.

2. **Why `create`, `update`, and `delete` Warnings Appeared in the CI Log:**
   - The `Authenticated owner` test calls `setDoc` (`create`), `getDoc` (`get`), `getDocs` (`list`), `updateDoc` (`update`), and `deleteDoc` (`delete`) inside a loop over the 12 collections (`tasks` first). It threw on `getDocs` (`list`) for `tasks` before reaching `updateDoc`/`deleteDoc`.
   - Meanwhile, the 10 negative security tests in `tests/firestore/firestore.rules.test.ts` (unauthenticated access, cross-user User A vs User B isolation, missing fields, unknown fields, invalid types, invalid IDs, invalid enums, out-of-range boundaries, invalid partial updates, and catch-all deny) executed `assertFails(...)` against `create`, `update`, and `delete`. The Firestore Emulator logs `permission-denied` warnings to stdout for every denied operation even when `assertFails(...)` passes as expected.

3. **Verification Across All Other Rules & Helpers:**
   - `isOwner(userId)` (`isSignedIn() && request.auth.uid == userId`), `isValidId(id)`, all 12 `isValid*` payload helpers, `tests/firestore/test-data.ts`, `tests/firestore/test-helpers.ts`, and `tests/firestore/firestore.rules.test.ts` (`validPayloads` and `validUpdates`) were checked across all 12 collections (`tasks`, `goals`, `routines`, `calendar`, `finance`, `notes`, `documents`, `health`, `family`, `learning`, `emergency`, `settings`).
   - All optional field checks use `(!data.keys().hasAll(['field']) || ...)` short-circuiting safely when optional keys are absent.
   - No other defects were found in `firestore.rules` or the Stage 03C.2 test payloads.
