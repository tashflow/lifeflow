# LifeFlow — Stage 03D Evidence Index

**Audit Date:** 2026-11-25  
**Principle:** Every conclusion maps strictly to verified files, exact line numbers, executed tool outputs, or explicitly labeled supplied CI evidence.

---

## 1. Source Code & Configuration Evidence Map

| Conclusion / Finding ID | Artifact / File | Exact Lines / Scope | Evidence Type |
| :--- | :--- | :--- | :--- |
| **Firebase Project & Spark Config** (`gen-lang-client-0038488587`) | `/firebase-applet-config.json`, `/firebase.json`, `/src/services/firebase.ts` | `firebase-applet-config.json` L1–12; `firebase.json` L1–14; `firebase.ts` L27–29 | Source-code inspection (no keys printed) |
| **Offline Persistence Init** (`AUD-E-02`) | `/src/services/firebase.ts` | L31–42 (`enableIndexedDbPersistence`) | Source-code inspection |
| **Auth Modal (Email/Google/Reset)** | `/src/components/AuthModal.tsx` | L21–69 | Source-code inspection (live Auth **NOT VERIFIED**) |
| **Auth Lifecycle & Sign-Out Reset** (`AUD-A-01`, `AUD-A-02`, `AUD-A-03`) | `/src/App.tsx` | L73–102 (`onAuthStateChanged`), L105–201 (`onSnapshot` + cleanup), L204–232 (`persistToFirestore`/`deleteFromFirestore`), L302–306 (`handleSignOut`) | Source-code inspection |
| **App-to-Rules `id` Field Mismatch** (`AUD-D-01`) | `/src/App.tsx`, `/firestore.rules` | `App.tsx` L235–290; `firestore.rules` L18–76 | Source-code inspection (`setDoc` passes `id`; `hasOnly` omits `'id'`) |
| **Missing `onSnapshot` Error Handlers** (`AUD-D-02`) | `/src/App.tsx` | L118–123 (`tasks` has handler); L125–186 (9 listeners omit error handler) | Source-code inspection |
| **Unintegrated `emergency` & `settings`** (`AUD-D-03`) | `/src/App.tsx`, `/src/views/EmergencyView.tsx`, `/src/views/SettingsView.tsx` | `App.tsx` L423, L427–432; `EmergencyView.tsx` L4–76; `SettingsView.tsx` L10–99 | Source-code inspection |
| **Blueprint Schema Drift** (`AUD-D-04`) | `/firebase-blueprint.json`, `/firestore.rules` | `firebase-blueprint.json` L30–130; `firestore.rules` L39–115 | Source-code inspection |
| **Firestore Rules Hardening & `list` Fix** (`AUD-B-01`, `AUD-B-02`, `AUD-B-03`) | `/firestore.rules` | L5–15 (helpers), L18–130 (12 validators), L133–135 (catch-all deny), L138–212 (user & 12 subcollections) | Source-code inspection |
| **Documents Storage & Misleading UI** (`AUD-F-01`) | `/src/views/DocumentsView.tsx`, `/src/services/firebase.ts` | `DocumentsView.tsx` L15, L19, L46–52; `firebase.ts` (no `firebase/storage`) | Source-code inspection |
| **Client Gemini Key Guard** (`AUD-G-01`) | `/src/views/AIAssistantView.tsx`, `/.env.example` | `AIAssistantView.tsx` L36–45; `.env.example` L4 | Source-code inspection |
| **Unused Translations & RTL Offset Bug** (`AUD-H-01`) | `/src/translations.ts`, `/src/App.tsx`, `/src/components/Sidebar.tsx` | `translations.ts` L1–132; `App.tsx` L310, L325; `Sidebar.tsx` L70 | Source-code inspection |
| **Dashboard/Routine/Modal UI Defects** (`AUD-H-02`) | `/src/views/DashboardView.tsx`, `/src/views/RoutineView.tsx`, `/src/components/GlobalSearchModal.tsx` | `DashboardView.tsx` L56, L69, L72, L148–152; `RoutineView.tsx` L15; `GlobalSearchModal.tsx` L233 | Source-code inspection |

---

## 2. Test, Build & CI Execution Evidence Map

| Verification Layer | Command / Source | Outcome | Scope & Limitations |
| :--- | :--- | :--- | :--- |
| **TypeScript Type Check** | `tsc --noEmit` (`lint_applet`) | **PASSED** (`exit 0`) | Executed locally on current workspace (`src/**`, `tests/**`, `jest.config.ts`). |
| **Production Build** | `vite build` (`compile_applet`) | **PASSED** (`exit 0`) | Executed locally on current workspace; confirms bundle compiles cleanly. |
| **Dependency Vulnerability Audit** | `bun audit` (`v1.4.4`) | **4 Advisories** | Executed locally: 1 High + 1 Low (`@grpc/grpc-js@1.9.16`), 2 Moderate (`glob`, `minimatch`). |
| **Security Test Suite Inspection** | `/tests/firestore/firestore.rules.test.ts`, `/tests/firestore/test-data.ts`, `/tests/firestore/test-helpers.ts`, `/jest.config.ts`, `/tests/firestore/jest-esbuild-transformer.cjs` | **VERIFIED** (code reviewed) | 11 Jest tests cover all 12 collections; `test-data.ts` omits `id` (unlike `App.tsx`). |
| **Local Firestore Emulator** | `which java` / `firebase emulators:exec` | **NOT EXECUTED** | `NO_JAVA` in container; emulator cannot launch locally. |
| **GitHub Actions CI Workflow** | `/.github/workflows/firebase-security-tests.yml` (L1–147) | **PARTIALLY VERIFIED** | Run #4 (supplied user evidence) reported `1/1` suite, `11/11` tests `PASS` under `lifeflow-stage-03c1-test`; post-Stage 03C.4 Run #5+ is **NOT VERIFIED** on GitHub yet. |
| **Remote Deploy Workflow** | `.github/workflows/deploy.yml` | **NOT VERIFIED** | Exists in remote GitHub repository per user prompt; absent from local container. |
| **Live Browser Auth & Multi-Device E2E** | Browser session against `gen-lang-client-0038488587` | **NOT VERIFIED** | No live interactive browser/multi-device test evidence exists. |
