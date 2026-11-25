# LifeFlow — Stage 03D 12-Module Integration Matrix

**Audit Date:** 2026-11-25  
**Methodology:** Line-by-line inspection of `src/App.tsx`, `src/types.ts`, `src/views/*.tsx`, `src/components/*.tsx`, `firestore.rules`, and `firebase-blueprint.json`.

---

## 1. Per-Module Integration Matrix

| # | Module (Collection) | Create | Read / Real-Time Sync | Update | Delete | Error Handling | Loading State | Empty State | Offline Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Tasks** (`tasks`) | `PARTIALLY VERIFIED` (writes `id` field rejected by `firestore.rules`) | `VERIFIED` (`onSnapshot` L112–123 updates even on empty snapshot) | `PARTIALLY VERIFIED` (toggle writes `id` field rejected by rules) | `VERIFIED` (`deleteDoc` L251–254; optimistic delete lacks rollback) | `PARTIALLY VERIFIED` (only listener with error callback L118–123; writes report `syncError`) | `PARTIALLY VERIFIED` (`syncStatus='syncing'` badge only; hidden `<640px`) | `VERIFIED` (`TasksView.tsx` L79–84) | `PARTIALLY VERIFIED` (IndexedDB persistence enabled; optimistic UI diverges on failure) |
| 2 | **Calendar** (`calendar`) | `PARTIALLY VERIFIED` (writes `id` field rejected by `firestore.rules`) | `PARTIALLY VERIFIED` (`onSnapshot` L153–158 skips empty snapshot) | `NOT IMPLEMENTED` | `VERIFIED` (`deleteDoc` L292–295; no rollback) | `FAILED` (listener has no error callback; writes report `syncError`) | `PARTIALLY VERIFIED` (navbar badge only) | `VERIFIED` (`CalendarView.tsx` L108–110) | `PARTIALLY VERIFIED` (same as Tasks) |
| 3 | **Routines** (`routines`) | `NOT IMPLEMENTED` | `PARTIALLY VERIFIED` (`onSnapshot` L125–130 skips empty snapshot) | `PARTIALLY VERIFIED` (toggle writes `id` field rejected by rules) | `NOT IMPLEMENTED` | `FAILED` (listener has no error callback) | `PARTIALLY VERIFIED` (navbar badge only) | `FAILED` (missing; `L15` divides by `routines.length` $\rightarrow$ `NaN%`) | `PARTIALLY VERIFIED` |
| 4 | **Goals** (`goals`) | `PARTIALLY VERIFIED` (writes `id` field rejected by `firestore.rules`) | `PARTIALLY VERIFIED` (`onSnapshot` L132–137 skips empty snapshot) | `NOT IMPLEMENTED` (milestones/progress read-only in UI) | `NOT IMPLEMENTED` | `FAILED` (listener has no error callback) | `PARTIALLY VERIFIED` (navbar badge only) | `NOT IMPLEMENTED` (`GoalsView.tsx` L52–84) | `PARTIALLY VERIFIED` |
| 5 | **Finance** (`finance`) | `PARTIALLY VERIFIED` (writes `id` field rejected by `firestore.rules`) | `PARTIALLY VERIFIED` (`onSnapshot` L139–144 skips empty snapshot) | `NOT IMPLEMENTED` | `VERIFIED` (`deleteDoc` L277–280; no rollback) | `FAILED` (listener has no error callback) | `PARTIALLY VERIFIED` (navbar badge only) | `VERIFIED` (`FinanceView.tsx` L120–124) | `PARTIALLY VERIFIED` |
| 6 | **Documents** (`documents`) | `NOT IMPLEMENTED` | `PARTIALLY VERIFIED` (read-only `onSnapshot` L160–165 skips empty snapshot) | `NOT IMPLEMENTED` | `NOT IMPLEMENTED` | `FAILED` (listener has no error callback) | `PARTIALLY VERIFIED` (navbar badge only) | `NOT IMPLEMENTED` (`DocumentsView.tsx` L23–56) | `NOT VERIFIED` |
| 7 | **Health** (`health`) | `PARTIALLY VERIFIED` (`setDoc('vitals')` matches `isValidHealth`, no `id` field) | `PARTIALLY VERIFIED` (`onSnapshot` L167–172 skips empty snapshot) | `PARTIALLY VERIFIED` (only `waterDrank` button calls `onUpdateHealth`) | `NOT IMPLEMENTED` | `FAILED` (listener has no error callback) | `PARTIALLY VERIFIED` (navbar badge only) | `NOT APPLICABLE` (single `HealthStat` object) | `PARTIALLY VERIFIED` |
| 8 | **Family** (`family`) | `NOT IMPLEMENTED` | `PARTIALLY VERIFIED` (read-only `onSnapshot` L174–179 skips empty snapshot) | `NOT IMPLEMENTED` | `NOT IMPLEMENTED` | `FAILED` (listener has no error callback) | `PARTIALLY VERIFIED` (navbar badge only) | `NOT IMPLEMENTED` (`FamilyView.tsx` L23–34; grocery/events hardcoded) | `NOT VERIFIED` |
| 9 | **Notes** (`notes`) | `PARTIALLY VERIFIED` (writes `id` field rejected by `firestore.rules`) | `PARTIALLY VERIFIED` (`onSnapshot` L146–151 skips empty snapshot) | `NOT IMPLEMENTED` | `NOT IMPLEMENTED` | `FAILED` (listener has no error callback) | `PARTIALLY VERIFIED` (navbar badge only) | `NOT IMPLEMENTED` (`NotesView.tsx` L66–79) | `PARTIALLY VERIFIED` |
| 10 | **Learning** (`learning`) | `NOT IMPLEMENTED` | `PARTIALLY VERIFIED` (read-only `onSnapshot` L181–186 skips empty snapshot) | `NOT IMPLEMENTED` | `NOT IMPLEMENTED` | `FAILED` (listener has no error callback) | `PARTIALLY VERIFIED` (navbar badge only) | `NOT IMPLEMENTED` (`LearningView.tsx` L19–42) | `NOT VERIFIED` |
| 11 | **Emergency** (`emergency`) | `NOT IMPLEMENTED` | `NOT IMPLEMENTED` (no listener; hardcoded JSX) | `NOT IMPLEMENTED` | `NOT IMPLEMENTED` | `NOT IMPLEMENTED` | `NOT IMPLEMENTED` | `NOT IMPLEMENTED` | `LOCAL ONLY` (static JSX) |
| 12 | **Settings** (`settings`) | `NOT IMPLEMENTED` | `NOT IMPLEMENTED` (no listener) | `LOCAL ONLY` (`language` state only; profile uncontrolled) | `NOT IMPLEMENTED` | `NOT IMPLEMENTED` | `NOT IMPLEMENTED` | `NOT APPLICABLE` | `LOCAL ONLY` |

---

## 2. Detailed Integration Findings

- **Finding ID:** `AUD-D-01`
  - **Severity:** `CRITICAL`
  - **Status:** `FAILED` (Release-Blocking Defect)
  - **Relevant File Path:** `/src/App.tsx`, `/firestore.rules`
  - **Line Range:** `App.tsx` `L204–217`, `L235–290`; `firestore.rules` `L18–76`
  - **Evidence Excerpt:** `handleAddTask` passes `newTask` (`{ id: 't_' + Date.now(), title, ... }`) into `persistToFirestore('tasks', newTask.id, newTask)` $\rightarrow$ `setDoc(..., data, { merge: true })`. `isValidTask` enforces `data.keys().hasOnly(['title', 'category', 'priority', 'dueDate', 'completed', 'notes'])` (no `'id'`). Same mismatch affects `tasks`, `routines`, `goals`, `finance`, `notes`, and `calendar`.
  - **Security / Operational Impact:** 6 of 7 writable modules fail in live Firestore with `PERMISSION_DENIED` on create and update, leaving local UI state out of sync with Firestore because optimistic React state mutations are never rolled back on error.
  - **Recommended Next Action:** Strip `id` before writing in `persistToFirestore` (e.g., `const { id: _omitted, ...payload } = data`) so document ID lives only in the path, and revert/refetch optimistic state on write failure.

- **Finding ID:** `AUD-D-02`
  - **Severity:** `HIGH`
  - **Status:** `FAILED`
  - **Relevant File Path:** `/src/App.tsx`
  - **Line Range:** `L125–186`
  - **Evidence Excerpt:** `unsubRoutines` through `unsubLearning` pass only the snapshot callback to `onSnapshot(collection(...), (snapshot) => ...)` with no error callback argument.
  - **Security / Operational Impact:** Read/permission/index/network errors on 9 collections are silently swallowed without updating `syncError` or `syncStatus`.
  - **Recommended Next Action:** Attach error handlers to every `onSnapshot` subscription that check `isMounted` and surface errors via `syncError`.

- **Finding ID:** `AUD-D-03`
  - **Severity:** `HIGH`
  - **Status:** `FAILED`
  - **Relevant File Path:** `/src/App.tsx`, `/src/views/EmergencyView.tsx`, `/src/views/SettingsView.tsx`
  - **Line Range:** `App.tsx` `L423`, `L427–432`; `EmergencyView.tsx` `L4–76`; `SettingsView.tsx` `L10–99`
  - **Evidence Excerpt:** `<EmergencyView />` receives zero props; `<SettingsView language={language} onSelectLanguage={setLanguage} />` receives no user/save handler; `App.tsx` has 10 listeners (omitting `emergency` and `settings`).
  - **Security / Operational Impact:** `emergency` and `settings` have zero Firestore persistence; authenticated users cannot save or sync emergency contacts or settings across devices.
  - **Recommended Next Action:** Wire `users/{uid}/emergency` and `users/{uid}/settings` listeners and CRUD handlers matching `isValidEmergency` and `isValidSettings`.

- **Finding ID:** `AUD-D-04`
  - **Severity:** `LOW`
  - **Status:** `VERIFIED`
  - **Relevant File Path:** `/firebase-blueprint.json`, `/src/views/CalendarView.tsx`, `/firestore.rules`
  - **Line Range:** `firebase-blueprint.json` `L44–54`; `CalendarView.tsx` `L4–11`; `firestore.rules` `L49–57`
  - **Evidence Excerpt:** `CalendarEvent` in `firebase-blueprint.json` omits `day`, `Routine` omits `streak` from `required`, `Note` omits `updatedAt` from `required`, `Health` omits `weight` from `required`, and `Learning` omits `category` from `required`, whereas `firestore.rules` requires all of those fields.
  - **Security / Operational Impact:** Blueprint IR has drifted from `firestore.rules`.
  - **Recommended Next Action:** Synchronize `firebase-blueprint.json` with `firestore.rules` in the next maintenance stage.
