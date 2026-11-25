# LifeFlow — Stage 03C.2 Android GitHub Setup & CI Execution Guide

You can run the full Linux Firestore Emulator security test suite directly from an Android phone browser using GitHub's free tier (no Windows PC or local Java required).

---

## 1. Repository Setup (Free Tier)
1. Create a free repository on **GitHub** (public or private; GitHub Free includes 2,000 free Linux CI minutes/month for private repos and unlimited minutes for public repos).
2. Upload/push the complete LifeFlow project, making sure the hidden folder `.github/workflows/firebase-security-tests.yml` is included in the repository root.
3. Verify no `.env.local` or private credentials are uploaded (`.gitignore` excludes local secrets; the CI workflow uses only the test project ID `lifeflow-stage-03c1-test`).

---

## 2. Triggering Tests from Your Android Phone Browser
1. Open **github.com** in Chrome (or your Android browser) and navigate to your LifeFlow repository.
2. Tap the **Actions** tab near the top of the repository page (switch to "Desktop site" in Chrome menu if tabs are hidden).
3. On the left/top workflow list, tap **LifeFlow Firestore Security Rules CI**.
4. Tap **Run workflow** $\rightarrow$ select your branch (`main`) $\rightarrow$ tap the green **Run workflow** button.
5. Wait ~1–2 minutes for the Ubuntu Linux runner to install Bun, Node 22, Temurin Java 21, and Firebase CLI, start the Firestore Emulator, and run Jest.
6. Tap the completed workflow run $\rightarrow$ **Firestore Emulator Security Tests** to inspect live logs, or scroll down to **Artifacts** to download `firestore-security-test-results` (`firestore-test-results.json` and `firestore-test-output.log`).
