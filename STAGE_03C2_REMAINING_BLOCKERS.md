# LifeFlow — Stage 03C.2 Remaining Blockers & Observations

## 1. Environment Blocker (Security Rules Execution)
- **Blocker**: Java Runtime Environment (JRE/JDK) is not installed in the current AI Studio container (`which java` returned empty). Consequently, `firebase emulators:exec --only firestore` cannot start locally here, and the 11 Jest Firestore Security Rules test suites remain **NOT EXECUTED** against a live emulator.
- **Resolution**: Push the repository (including `.github/workflows/firebase-security-tests.yml`) to GitHub and trigger the **LifeFlow Firestore Security Rules CI** workflow from an Android browser.

## 2. Application vs. `firestore.rules` Payload Mismatch (Pre-existing Code Observation)
- **Observation**: In `src/App.tsx` (lines 204–265), `persistToFirestore` writes state objects such as `Task`, `Goal`, `RoutineItem`, `Transaction`, `NoteItem`, `CalendarEventItem` that contain an `id` field (e.g., `{ id: 't_...', title: ..., ... }`) directly via `setDoc(...)`.
- **Impact**: `firestore.rules` enforces `data.keys().hasOnly([...])` without `'id'` in the allowed keys list for those collections. When authenticated users perform writes from the UI against the strict Stage 03B.1 rules, Firestore may reject writes containing the `id` property unless `id` is stripped before `setDoc` in a future app patch (rules were intentionally preserved unchanged per Stage 03C.2 instructions).

## 3. Unverified Runtime Auth & Multi-Device E2E Flows
- Live Firebase Auth (sign-up, email verification, password reset, Google Sign-In) and browser offline IndexedDB reconnect sync require testing in a live browser session against Firebase project `gen-lang-client-0038488587`.
