# LifeFlow (LifeOS) — Stage 03C Firestore Rules Test Plan

**Scope:** Comprehensive security verification plan for all 12 LifeFlow collections (`tasks`, `goals`, `routines`, `calendar`, `finance`, `notes`, `documents`, `health`, `family`, `learning`, `emergency`, `settings`).  
**Execution Mode:** Prepared for local Windows execution (`NOT EXECUTED` in mobile Android workspace).

---

## 1. Test Objectives
1. Verify owner-isolated read, create, update, and delete access.
2. Verify unauthenticated access denial.
3. Verify cross-user isolation (User A cannot access User B data).
4. Verify strict payload validation (required fields, allowed fields, type safety, string length bounds, numeric ranges, enum checks).
5. Verify ID poisoning prevention (`isValidId`).

---

## 2. Test Scenarios per Collection
For each of the 12 collections:
- **TC-01**: Authenticated Owner Create (Valid payload $\rightarrow$ `SUCCESS`).
- **TC-02**: Authenticated Owner Read (`SUCCESS`).
- **TC-03**: Authenticated Owner Update (Valid modification $\rightarrow$ `SUCCESS`).
- **TC-04**: Authenticated Owner Delete (`SUCCESS`).
- **TC-05**: Unauthenticated Access (`PERMISSION_DENIED`).
- **TC-06**: Cross-User Access by User B (`PERMISSION_DENIED`).
- **TC-07**: Invalid Payload - Missing Required Field (`PERMISSION_DENIED`).
- **TC-08**: Invalid Payload - Unknown Field / Shadow Field (`PERMISSION_DENIED`).
- **TC-09**: Invalid Payload - Out of Range / Bad Enum (`PERMISSION_DENIED`).
- **TC-10**: Invalid Document ID (`PERMISSION_DENIED`).
