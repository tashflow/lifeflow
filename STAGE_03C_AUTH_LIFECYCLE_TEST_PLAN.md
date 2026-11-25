# LifeFlow — Stage 03C Auth Lifecycle Test Plan

**Scope:** Verification of authentication state transitions, listener teardown, and state reset across sessions.

---

## Test Procedures

### 1. Logout State Reset Verification
- **Steps:** Log in as User A $\rightarrow$ populate data across modules $\rightarrow$ click Sign Out.
- **Expected Result:** All 12 module states immediately revert to initial demo structures; sync status shows `'offline'`; zero User A data persists in React state (`NOT TESTED` in mobile Android workspace; `CODE-INSPECTED`).

### 2. User A to User B Session Transition
- **Steps:** Log in as User A $\rightarrow$ log out $\rightarrow$ log in immediately as User B.
- **Expected Result:** All 12 old snapshot listeners unsubscribe instantly; `isMounted` guards prevent stale callbacks; User B sees only User B's fresh Firestore data.

### 3. Stale Callback & Race Condition Prevention
- **Steps:** Rapid sign-out and sign-in while pending Firestore network requests are active.
- **Expected Result:** Stale promises or callbacks are ignored due to `isMounted` / `user` UID guards.
