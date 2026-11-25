# LifeFlow — Stage 03D Deployment Readiness, Build, CI & Product Blockers

**Audit Date:** 2026-11-25  
**Scope:** Audit G (Build, Dependencies, CI) & Audit H (Integration & Product Readiness).

---

## 1. Audit G — Build, Dependencies & CI Assessment

| Check | Command / File | Result | Notes |
| :--- | :--- | :--- | :--- |
| TypeScript Check | `tsc --noEmit` (`lint_applet`) | **PASSED** (`exit 0`) | Zero TypeScript compile errors under TS `^7.0.2`. |
| Production Bundle | `vite build` (`compile_applet`) | **PASSED** (`exit 0`) | Clean Vite `8.3.0` + Tailwind `4.3.3` production build. |
| Jest Compilation | `tests/firestore/jest-esbuild-transformer.cjs`, `jest.config.ts` | **VERIFIED** | Uses `esbuild` (`^0.25.0`) because `ts-jest` does not support TypeScript 7.0.2. |
| Local Emulator Run | `which java` / `firebase emulators:exec` | **NOT EXECUTED** | No Java runtime in container (`NO_JAVA`); Android users rely on GitHub Linux CI. |
| GitHub Actions CI | `.github/workflows/firebase-security-tests.yml` (L1–147) | **PARTIALLY VERIFIED** | Uses Node 22, Temurin Java 21, Bun 1.4.4 (`bun.lock`, no `package-lock.json`), `firebase-tools@15.36.0`, `actions/*@v4`, artifact `lifeflow-firestore-security-test-results`. Run #4 passed before Stage 03C.4 reporting update; Run #5+ pending push/run. |
| Remote Deploy Workflow | `.github/workflows/deploy.yml` | **NOT VERIFIED** | Exists in user's remote GitHub repo per user prompt; absent from local container. |
| Dependency Audit | `bun audit` (`v1.4.4`) | **4 Advisories** | 1 High + 1 Low in `@grpc/grpc-js@1.9.16` (via `firebase`); 2 Moderate in `glob`/`minimatch` (via `jest`/`ts-jest`). |

- **Finding ID:** `AUD-G-01`
  - **Severity:** `MEDIUM`
  - **Status:** `VERIFIED`
  - **Relevant File Path:** `/src/views/AIAssistantView.tsx`, `/.env.example`
  - **Line Range:** `AIAssistantView.tsx` `L36–45`; `.env.example` `L4`
  - **Evidence Excerpt:** `const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ''; if (apiKey) { const ai = new GoogleGenAI({ apiKey }); ... }`
  - **Security / Operational Impact:** `.env.example` defines server-side `GEMINI_API_KEY`, so `VITE_GEMINI_API_KEY` is unset and simulated responses run. However, if `VITE_GEMINI_API_KEY` were ever populated in a Vite SPA build, it would embed the Gemini API key directly into client-side JavaScript.
  - **Recommended Next Action:** Keep `VITE_GEMINI_API_KEY` unset on static Spark Hosting, or disable/mark AI Coach as offline-simulated unless routed through an authorized backend proxy.

- **Finding ID:** `AUD-G-02`
  - **Severity:** `HIGH`
  - **Status:** `VERIFIED`
  - **Relevant File Path:** `/package.json`, `/bun.lock`
  - **Line Range:** `package.json` `L20`, `L36`, `L38`
  - **Evidence Excerpt:** `bun audit v1.4.4`: `@grpc/grpc-js@1.9.16` (High `GHSA-m9gg-hp2v-232j`, Low `GHSA-f596-whhp-79r4` under `firebase`); `glob`/`minimatch` (Moderate `GHSA-3g3m-2fjr-6pw4`, `GHSA-g3hv-75wg-m249` under devDependencies `jest`/`ts-jest`).
  - **Security / Operational Impact:** Transitive gRPC advisory exists inside the Firebase JS SDK dependency tree (browser SPA uses REST/WebChannel unless Node/gRPC paths are invoked); devDependencies only affect CI/tooling.
  - **Recommended Next Action:** Evaluate `bun update` / `firebase` patch upgrade in a future dependency maintenance pass and re-run `bun audit`.

---

## 2. Audit H — Integration & Product Readiness Findings

- **Navigation (`VERIFIED`):** All 14 tabs in `Sidebar.tsx` (L41–56) map cleanly to view branches in `App.tsx` (L351–432).
- **Auth View Protection (`PARTIALLY VERIFIED`):** Unauthenticated users enter Demo Mode (`user === null`) with pre-populated `mockData.ts` records rather than an authenticated gate; sign-out returns to Demo Mode (`App.tsx` L80–99).

- **Finding ID:** `AUD-H-01`
  - **Severity:** `MEDIUM`
  - **Status:** `FAILED`
  - **Relevant File Path:** `/src/translations.ts`, `/src/App.tsx`, `/src/components/Sidebar.tsx`
  - **Line Range:** `translations.ts` `L1–132`; `App.tsx` `L310`, `L325`; `Sidebar.tsx` `L70`
  - **Evidence Excerpt:** `dir={language === 'ar' ? 'rtl' : 'ltr'}` (`App.tsx` L310), `md:ml-64` (`App.tsx` L325), `fixed top-0 bottom-0 left-0` (`Sidebar.tsx` L70); `translations.ts` has zero imports across `src/`.
  - **Security / Operational Impact:** Switching language to Bengali (`bn`) or Arabic (`ar`) never translates any UI text, and Arabic RTL leaves the sidebar pinned to `left-0` while offsetting content with `md:ml-64` instead of logical `start-0` / `md:ms-64`. Also `translations.ts` L71 contains mixed-script `"স্বাগতম, Алекс"`.
  - **Recommended Next Action:** Wire `translations.ts` into navigation/UI labels (fixing L71) and replace physical `left-0`/`ml-*`/`border-r` classes with logical Tailwind RTL classes (`start-0`, `md:ms-*`, `border-e`).

- **Finding ID:** `AUD-H-02`
  - **Severity:** `LOW`
  - **Status:** `FAILED`
  - **Relevant File Path:** `/src/views/DashboardView.tsx`, `/src/views/RoutineView.tsx`, `/src/components/GlobalSearchModal.tsx`, `/src/views/EmergencyView.tsx`
  - **Line Range:** `DashboardView.tsx` `L56`, `L69`, `L72`, `L148–152`; `RoutineView.tsx` `L15`; `GlobalSearchModal.tsx` `L233`; `EmergencyView.tsx` `L32`, `L44`
  - **Evidence Excerpt:** `DashboardView.tsx` hardcodes `"3 Active"` / `"61% Avg"` (L148–149), `"Demo Mode Active"` banner even when signed in (L56), and `"Alex Vance"` (L72); `RoutineView.tsx` L15 computes `completedCount / routines.length` without zero-guard (`NaN%` if empty); `GlobalSearchModal.tsx` advertises `"Press ESC to close"` without a keyboard listener; `EmergencyView.tsx` uses `window.alert`.
  - **Security / Operational Impact:** Misleading hardcoded dashboard metrics and browser `alert()` calls degrade mobile/iframe UX.
  - **Recommended Next Action:** Compute goal/routine metrics dynamically with zero-length guards, hide Demo Mode banner when authenticated, and replace `window.alert` with inline feedback or `tel:` links.

---

## 3. Release Blockers Summary (Must Resolve Before Production Deploy)

1. **`AUD-D-01` (CRITICAL):** Strip `id` from payloads before calling `setDoc` in `src/App.tsx` for `tasks`, `routines`, `goals`, `finance`, `notes`, and `calendar` (and add rollback/reconciliation on error `AUD-E-01`).
2. **`AUD-A-01` (HIGH):** Remove `if (!snapshot.empty)` guards in `src/App.tsx` L125–186 and clear all module states on user transition so User A/demo data cannot leak into User B's session.
3. **`AUD-D-02` & `AUD-D-03` (HIGH):** Add `onSnapshot` error callbacks to all 9 remaining listeners and wire `emergency` and `settings` persistence (or explicitly isolate them before launch).
4. **Live Runtime Verification:** Execute live browser Firebase Auth + multi-device Firestore CRUD + GitHub Actions CI `Run #5+` verification after remediation, and inspect remote `.github/workflows/deploy.yml` prior to any authorized deployment.
