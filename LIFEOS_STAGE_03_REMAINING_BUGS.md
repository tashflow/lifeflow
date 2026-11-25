# LifeFlow — Stage 03B Remaining Bugs & Observations

### Finding ID: BUG-01
- **File path:** `/src/App.tsx`
- **Relevant function or component:** `deleteFromFirestore`
- **Actual evidence:** Successfully wired `deleteDoc` for tasks, finance, and calendar events. However, offline persistence queue may briefly retain optimistic local state until network reconnects.
- **Status:** **PARTIALLY VERIFIED**
- **Recommended action:** Monitor offline sync queue during multi-device testing.

### Finding ID: BUG-02
- **File path:** `/src/views/DocumentsView.tsx`
- **Relevant function or component:** Document file upload
- **Actual evidence:** File binaries remain device-local (Spark plan constraint), while metadata syncs to Firestore.
- **Status:** **VERIFIED** (Design constraint)
- **Recommended action:** Ensure UI clearly labels documents as device-local binaries.
