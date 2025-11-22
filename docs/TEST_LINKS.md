# MENTARK QUANTUM - TEST LINKS & PAGES

## 🧪 Pages to Test

### Student Dashboard (Fighter Pilot View)
**URL:** `http://localhost:3002/dashboard/student`

**What to Test:**
- ✅ Fighter Pilot Dashboard layout
- ✅ "THE ONE THING" widget
- ✅ Energy indicator (top bar)
- ✅ Streak counter (top bar)
- ✅ Concept Heatmap Mini
- ✅ Daily Check-in Widget
- ✅ Daily Nudge Card
- ✅ Backlog Alert (if applicable)
- ✅ Quick Actions panel
- ✅ Panic Button

**Prerequisites:**
- Must be logged in as a student
- Should have completed onboarding (has AI profile)

---

### Admin Dashboard (Air Traffic Control View)
**URL:** `http://localhost:3002/dashboard/admin`

**What to Test:**
- ✅ Batch Radar visualization
- ✅ Click on student dots to see detail panel
- ✅ Intervention War Room
- ✅ Search and filter functionality
- ✅ Student detail panel actions

**Prerequisites:**
- Must be logged in as admin
- Should have students in batches

---

### Navigation
**URL:** `http://localhost:3002/dashboard/student` (any student page)

**What to Test:**
- ✅ Sidebar navigation with Exam Prep section
- ✅ Collapsible sidebar
- ✅ Mobile navigation
- ✅ Active state highlighting

---

## 🔗 Direct Component Test Links

### Student Components
1. **The One Thing Widget**
   - Visible on: `/dashboard/student`
   - Test: Click "Start Practice", "Watch Video", "Skip for Now"

2. **Daily Check-in**
   - Visible on: `/dashboard/student`
   - Test: Click "Check In" button, adjust sliders, submit

3. **Backlog Destroyer**
   - Visible on: `/dashboard/student` (if backlog exists)
   - Test: Click "Activate Backlog Destroyer Mode", review plan, activate

4. **Concept Heatmap Mini**
   - Visible on: `/dashboard/student`
   - Test: Click "View Detailed" or "Focus on Weak Areas"

5. **Full Concept Heatmap Page** ⭐ NEW
   - URL: `http://localhost:3002/dashboard/student/concept-heatmap`
   - Test: View all concepts, filter by status, drill down by chapter

6. **Paper Attempt Strategy Dashboard** ⭐ NEW
   - URL: `http://localhost:3002/dashboard/student/mock-tests/[test-id]/strategy`
   - Test: View time allocation, skipping patterns, recommendations

7. **Panic Button**
   - Visible on: `/dashboard/student`
   - Test: Click "Need Help?" button, see options

### Admin Components
1. **Batch Radar**
   - Visible on: `/dashboard/admin` → Overview tab
   - Test: Click on colored dots, see student details

2. **Intervention War Room**
   - Visible on: `/dashboard/admin` → Overview tab
   - Test: Search, filter, click "Create Intervention"

3. **Student Detail Panel**
   - Opens when clicking student in Batch Radar
   - Test: View risk factors, use quick actions

---

## 📱 Mobile Testing

**Test on mobile viewport (< 640px):**
- Sidebar collapses to hamburger menu
- Bottom navigation appears
- Components stack vertically
- Touch targets are adequate (min 44x44px)

---

## ✅ API Endpoints Status

### ✅ All Endpoints Created!
All missing API endpoints have been implemented:

1. ✅ `/api/checkins` - Daily check-ins
2. ✅ `/api/student/the-one-thing` - Most impactful task
3. ✅ `/api/mentor/nudge` - Daily AI nudge
4. ✅ `/api/ark/backlog-destroyer` - Survival plan generator
5. ✅ `/api/student/concept-heatmap` - Concept mastery data
6. ✅ `/api/student/mock-tests/[id]/strategy` - Paper strategy analysis
7. ✅ `/api/admin/batches/[id]/radar` - Batch radar data
8. ✅ `/api/admin/interventions` - Intervention alerts

See `docs/API_ENDPOINTS_COMPLETE.md` for full details.

---

## 🐛 Known Issues / Notes

- Some endpoints may need database tables (with fallbacks in place)
- AI integration uses Claude/GPT-4o (fallbacks included)
- Test with real data to verify all functionality

---

## 🚀 Quick Test Checklist

- [ ] Student dashboard loads with Fighter Pilot View
- [ ] "THE ONE THING" widget displays correctly
- [ ] Energy indicator shows in top bar
- [ ] Streak counter displays
- [ ] Daily check-in opens modal
- [ ] Backlog destroyer generates plan
- [ ] **Full Concept Heatmap page loads** ⭐ NEW
- [ ] **Paper Strategy Dashboard displays analysis** ⭐ NEW
- [ ] Admin dashboard shows Batch Radar
- [ ] Clicking student dot opens detail panel
- [ ] Intervention War Room displays alerts
- [ ] Navigation works on mobile

---

## 🔧 Development Server

**Start the dev server:**
```bash
npm run dev
```

**Server runs on:** `http://localhost:3002`

---

## 📝 Testing Notes

1. **Student Dashboard:**
   - Login as student
   - Navigate to `/dashboard/student`
   - Verify all widgets appear
   - Test interactions (buttons, modals, etc.)

2. **Admin Dashboard:**
   - Login as admin
   - Navigate to `/dashboard/admin`
   - Check Overview tab
   - Test Batch Radar interactions
   - Test Intervention War Room

3. **Navigation:**
   - Test sidebar collapse/expand
   - Test mobile navigation
   - Verify all links work

---

**Happy Testing! 🎉**

