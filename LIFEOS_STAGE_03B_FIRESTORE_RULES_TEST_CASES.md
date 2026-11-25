# LifeFlow — Stage 03B Firestore Rules Test Cases

**Test Suite Scope:** 10 mandatory security test cases.  
**Execution Status:** **NOT EXECUTED** (Firebase Emulator and rules unit testing package `@firebase/rules-unit-testing` require local Java runtime not present in mobile Android workspace).

---

## Test Cases

### 1. Unauthenticated Read Denied
- **Finding ID:** TC-01
- **File path:** `/firestore.rules`
- **Code evidence:** `function isSignedIn() { return request.auth != null; }`
- **Risk level:** High
- **Status:** **VERIFIED** (Code-Inspected) / **NOT EXECUTED** (Runtime)
- **Recommended action:** Execute via rules unit testing suite on Windows.

### 2. Unauthenticated Write Denied
- **Finding ID:** TC-02
- **File path:** `/firestore.rules`
- **Code evidence:** Default-deny catch-all.
- **Risk level:** High
- **Status:** **VERIFIED** (Code-Inspected)
- **Recommended action:** Execute in local emulator.

### 3. User A Can Read User A Data
- **Finding ID:** TC-03
- **File path:** `/firestore.rules`
- **Code evidence:** `isOwner(userId)`
- **Risk level:** Low
- **Status:** **VERIFIED** (Code-Inspected)
- **Recommended action:** Execute in local emulator.

### 4. User A Cannot Read User B Data
- **Finding ID:** TC-04
- **File path:** `/firestore.rules`
- **Code evidence:** `request.auth.uid == userId`
- **Risk level:** High
- **Status:** **VERIFIED** (Code-Inspected)
- **Recommended action:** Execute in local emulator.

### 5. User A Cannot Write User B Data
- **Finding ID:** TC-05
- **File path:** `/firestore.rules`
- **Code evidence:** `isOwner(userId)`
- **Risk level:** High
- **Status:** **VERIFIED** (Code-Inspected)
- **Recommended action:** Execute in local emulator.

### 6. Invalid Document IDs Rejected
- **Finding ID:** TC-06
- **File path:** `/firestore.rules`
- **Code evidence:** `isValidId(id)`
- **Risk level:** Medium
- **Status:** **VERIFIED** (Code-Inspected)
- **Recommended action:** Execute in local emulator.

### 7. Invalid Payloads Rejected
- **Finding ID:** TC-07
- **File path:** `/firebase-blueprint.json` & `/firestore.rules`
- **Code evidence:** Blueprint schema constraints.
- **Risk level:** Medium
- **Status:** **PARTIALLY VERIFIED** (Blueprint defined, rules rely on owner path)
- **Recommended action:** Add strict payload validation helpers.

### 8. Ownership Changes Rejected
- **Finding ID:** TC-08
- **File path:** `/firestore.rules`
- **Code evidence:** Owner path restriction.
- **Risk level:** Medium
- **Status:** **VERIFIED** (Code-Inspected)
- **Recommended action:** Execute in local emulator.

### 9. Unknown Collections Denied
- **Finding ID:** TC-09
- **File path:** `/firestore.rules`
- **Code evidence:** Catch-all deny rule.
- **Risk level:** High
- **Status:** **VERIFIED** (Code-Inspected)
- **Recommended action:** Execute in local emulator.

### 10. Logout Immediately Clears Old User Data
- **Finding ID:** TC-10
- **File path:** `/src/App.tsx`
- **Code evidence:** `onAuthStateChanged` and cleanup hooks.
- **Risk level:** High
- **Status:** **VERIFIED** (Code-Inspected)
- **Recommended action:** Test live auth state transitions.
