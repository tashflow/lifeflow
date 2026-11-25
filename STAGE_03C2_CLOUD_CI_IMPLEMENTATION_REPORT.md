# LifeFlow — Stage 03C.2 Cloud CI Implementation Report

**Objective:** Establish a zero-cost, Windows-free Linux Cloud CI pipeline (GitHub Actions) to execute the Firestore Security Rules test suite against the local Firebase Firestore Emulator without touching production data or deploying rules.

---

## 1. Pre-Implementation Inspection Findings
Inspecting the existing repository surfaced four concrete compatibility and assertion defects:
1. **`ts-jest` Incompatible with TypeScript 7.0.2**: Running `npx jest` failed immediately because `package.json` uses `"typescript": "^7.0.2"` (native preview), which does not expose the JavaScript compiler API required by `ts-jest`.
2. **Broken Cross-User Test Assertion (`tests/firestore/firestore.rules.test.ts`)**: `refB` was instantiated using `dbB` instead of `dbA`, causing cross-user isolation assertions to run under User B's context instead of User A's context (`dbA` was unused).
3. **Invalid Document ID Test Path**: The prior ID test targeted `users/userA/tasks/invalid/id/path` (6 path segments hitting catch-all deny) rather than testing `isValidId()` (`invalid.id`, spaces, length > 128).
4. **Lockfile & Package Manager Alignment**: The project uses `bun.lock` (`bun@1.4.4`) rather than `package-lock.json`; therefore, CI must install via `bun install --frozen-lockfile` instead of `npm ci`.

---

## 2. Files Created & Modified
| File | Action | Purpose |
| :--- | :--- | :--- |
| `/.github/workflows/firebase-security-tests.yml` | Created | Ubuntu Linux CI workflow (Node 22, Temurin Java 21, Bun 1.4.4, Firebase CLI 15.36.0, Firestore Emulator only, artifact upload on `always()`). |
| `/tests/firestore/jest-esbuild-transformer.cjs` | Created | CommonJS Jest transformer using existing `esbuild` (`^0.25.0`) to bypass `ts-jest` / TypeScript 7.0.2 incompatibility. |
| `/jest.config.ts` | Modified | Switched Jest transform from `ts-jest` to `tests/firestore/jest-esbuild-transformer.cjs`. |
| `/package.json` | Modified | Added `"test:rules": "jest tests/firestore/firestore.rules.test.ts"` script (kept `build`, `lint`, `dev` intact). |
| `/tests/firestore/test-helpers.ts` | Modified | Added `FIRESTORE_EMULATOR_HOST` parsing with `127.0.0.1:8080` fallback for Linux CI reliability. |
| `/tests/firestore/firestore.rules.test.ts` | Modified | Fixed `dbA` vs `dbB` reference binding, fixed `isValidId` assertions, added `afterAll` null-guard, and expanded full 12-collection positive/negative coverage (unauthenticated, cross-user CRUD, missing required fields, unknown fields, invalid types, invalid enums, numeric bounds, string length bounds, partial updates, and catch-all deny). |

---

## 3. Security & Cost Compliance
- **Dedicated Test Project ID**: `lifeflow-stage-03c1-test` (isolated from `gen-lang-client-0038488587`).
- **Firebase Spark Free Compatible**: Uses GitHub Actions free Ubuntu runners and local Firestore Emulator only; no Blaze plan, no Cloud Functions, no Cloud Storage, no secrets, and no deployments (`App Deploy: NO`, `Firestore Rules Deploy: NO`).
- **Rules Unmodified**: `firestore.rules` was not altered or weakened.
