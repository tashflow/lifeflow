# LifeFlow — Stage 03C Windows Execution Guide

**Target Environment:** Local Windows PC with Node.js and Java Runtime Environment installed.

---

## Step-by-Step Instructions

1. **Clone or Open Project**: Open the LifeFlow project folder in VS Code on Windows.
2. **Install Dependencies**:
   ```bash
   npm install
   npm install --save-dev @firebase/rules-unit-testing jest ts-jest @types/jest
   ```
3. **Save Rules Test File**: Ensure `firestore.rules.test.ts` is placed in the project root.
4. **Run Emulator Security Tests**:
   ```bash
   npx firebase emulators:exec --only firestore "npx jest firestore.rules.test.ts"
   ```
5. **Verify Test Output**: Confirm all test scenarios pass with zero failures.
