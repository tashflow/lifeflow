# LifeFlow — Stage 03C.1 Windows Test Execution Guide

**Target Environment:** Local Windows PC with Node.js and Java Runtime Environment (JRE) installed.

---

## Prerequisites
1. Node.js (v18+)
2. Java JRE / JDK (Required for Firebase Emulator Suite)
3. Firebase CLI (`npm install -g firebase-tools`)

---

## Step-by-Step Execution Instructions

1. **Clone or Open Project**: Open the LifeFlow project folder in VS Code on Windows.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Start Emulator & Run Tests**:
   ```bash
   npx firebase emulators:exec --only firestore "npx jest"
   ```
4. **Verify Output**: Confirm all test suites pass successfully.
