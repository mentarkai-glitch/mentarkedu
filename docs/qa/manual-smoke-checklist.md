## Manual Smoke Checklist (Student Experience)

> _Last updated: 2025-11-08_  
> Use this sheet while running the app locally (`npm run dev`). Mark each item ✅ once verified.

### Global
- [ ] Sidebar expands/collapses; all links render icons + labels.
- [ ] Top navigation (landing page) scrolls correctly on mobile & desktop.
- [ ] Offline banner surfaces when network disconnected (toggle DevTools offline).

### Authentication
- [ ] `/auth/login`: email/password form submits, error message on bad creds.
- [ ] `/auth/register`: registration flow completes.
- [ ] Logout button in sidebar clears session and redirects to `/auth/login`.

### Student Dashboard
- [ ] `/dashboard/student`: quick actions open correct routes in same tab.
- [ ] Level progress card updates after `demo:generate`.

### Main Sidebar Routes
- [ ] **Daily Assistant** `/dashboard/student/daily-assistant`  
  - Tasks list renders, toggle between planned/completed.  
  - `Refresh` button refetches without console errors.
- [ ] **My ARKs** `/dashboard/student/arks`  
  - Grid/list/timeline view toggles work.  
  - `Create New ARK` button routes to `/ark/create`.
- [ ] **Study Analyzer** `/dashboard/student/study`  
  - Upload material, analyze gaps, generate plan.
- [ ] **Practice Questions** `/dashboard/student/practice`  
  - Add mistake, generate practice set, review answers.
- [ ] **Project Helper** `/dashboard/student/projects`  
  - Generate plan, download zip export, preview history.
- [ ] **Academic Papers** `/dashboard/student/papers`  
  - Template search works, bookmarks persist via localStorage.
- [ ] **Cutoff Predictor** `/dashboard/student/cutoffs`  
  - Fetch predictions, export JSON, offline guard.
- [ ] **Form Filler** `/dashboard/student/forms`  
  - College/course selectors populate, export/share buttons work.
- [ ] **Job Matcher** `/dashboard/student/jobs`  
  - ARK select -> fetch jobs, save/unsave, export saved list.
- [ ] **Emotion Check** `/dashboard/student/emotion`  
  - Analyze entry, slider updates, positive/concern lists update.
- [ ] **Progress** `/dashboard/student/progress`  
  - Tabs show XP, achievements, leaderboard; export button works.
- [ ] **Achievements** `/dashboard/student/achievements`  
  - Filters + sort change badge list.
- [ ] **Peer Matches** `/dashboard/student/peers`  
  - Find matches action returns data or friendly empty state.
- [ ] **Doubt Solver** `/dashboard/student/doubt-solver`  
  - Submit text, verify answer, history persists.

### AI Surfaces & Integrations
- [ ] `/chat`: persona switch, network offline toast, quick prompts auto-send.
- [ ] `/search`: query + filters, history chips, offline notice.
- [ ] `/daily-checkin`: slider inputs, completion screen, streak updates.

### Admin Views (optional if role available)
- [ ] `/dashboard/admin`: risk charts render, alerts list links to students.
- [ ] `/dashboard/admin/data-labeling`: CRUD labels, filters, pagination.

### Follow-up
- Record any failures (URL, console error, repro steps) in `docs/qa/issues/`.
- After fixes, re-run relevant Playwright specs: `npm run test:e2e`.


