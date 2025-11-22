# MENTARK QUANTUM - COMPREHENSIVE UX MASTER PLAN

## 📋 Table of Contents
1. [Information Architecture](#information-architecture)
2. [User Roles & Access](#user-roles--access)
3. [Navigation Structure](#navigation-structure)
4. [User Flows](#user-flows)
5. [Screen Specifications](#screen-specifications)
6. [Component Library](#component-library)
7. [Interaction Patterns](#interaction-patterns)

---

## 1. INFORMATION ARCHITECTURE

### 1.1 Site Map

```
MENTARK QUANTUM
│
├── PUBLIC PAGES
│   ├── / (Landing Page)
│   ├── /product
│   ├── /features
│   ├── /about
│   ├── /team
│   ├── /contact
│   ├── /privacy
│   ├── /terms
│   └── /demo
│
├── AUTHENTICATION
│   ├── /auth/login
│   ├── /auth/register
│   ├── /auth/reset
│   ├── /auth/verify
│   └── /auth/callback
│
├── ONBOARDING
│   └── /onboarding (Student Profile Setup)
│
├── DASHBOARD HUB
│   └── /dashboard (Role Selection)
│
├── STUDENT DASHBOARD (/dashboard/student)
│   ├── /dashboard/student (Home - Fighter Pilot View)
│   │
│   ├── LEARNING HUB
│   │   ├── /dashboard/student/arks (My ARKs)
│   │   ├── /dashboard/student/arks/:id (ARK Detail)
│   │   ├── /ark/create (Create New ARK)
│   │   ├── /dashboard/student/study (Study Analyzer)
│   │   ├── /dashboard/student/practice (Practice Questions)
│   │   ├── /dashboard/student/doubt-solver (Doubt Solver)
│   │   ├── /dashboard/student/visual (Visual Explainer)
│   │   └── /dashboard/student/papers (Academic Papers)
│   │
│   ├── EXAM PREP
│   │   ├── /dashboard/student/mock-tests (Mock Tests)
│   │   ├── /dashboard/student/mock-tests/:id (Test Interface)
│   │   ├── /dashboard/student/mock-tests/:id/strategy (Strategy Analysis)
│   │   ├── /dashboard/student/pyqs (Previous Year Papers)
│   │   ├── /dashboard/student/syllabus-tracker (Syllabus Tracker)
│   │   ├── /dashboard/student/rank-predictor (Rank Predictor)
│   │   └── /dashboard/student/concept-heatmap (Micro-Concept Heatmap)
│   │
│   ├── AI & MENTORING
│   │   ├── /chat (AI Mentor Chat)
│   │   ├── /dashboard/student/daily-assistant (Daily Assistant)
│   │   └── /daily-checkin (Daily Check-in)
│   │
│   ├── CAREER & COLLEGE
│   │   ├── /dashboard/student/colleges (College Matcher)
│   │   ├── /dashboard/student/cutoffs (Cutoff Predictor)
│   │   ├── /dashboard/student/jobs (Job Matcher)
│   │   ├── /dashboard/student/resume-builder (Resume Builder)
│   │   ├── /dashboard/student/documents (Document Generator)
│   │   └── /career-dna/analyze (Career DNA)
│   │
│   ├── TRACKING & PROGRESS
│   │   ├── /dashboard/student/progress (Progress Dashboard)
│   │   ├── /dashboard/student/emotion (Emotion Check)
│   │   ├── /dashboard/student/achievements (Achievements)
│   │   └── /dashboard/student/peers (Peer Matches)
│   │
│   └── SETTINGS
│       ├── /dashboard/student/settings (Settings)
│       ├── /dashboard/student/train-ai (Train AI)
│       └── /dashboard/student/agents (AI Agents Hub)
│
├── TEACHER DASHBOARD (/dashboard/teacher)
│   ├── /dashboard/teacher (Home)
│   ├── /dashboard/teacher/students (Student List)
│   ├── /dashboard/teacher/students/:id (Student Detail)
│   ├── /dashboard/teacher/analytics (Batch Analytics)
│   ├── /dashboard/teacher/interventions (Interventions)
│   └── /dashboard/teacher/settings (Settings)
│
├── ADMIN DASHBOARD (/dashboard/admin)
│   ├── /dashboard/admin (Home - Air Traffic Control)
│   ├── /dashboard/admin/students (Student Management)
│   ├── /dashboard/admin/students/import (Bulk Import)
│   ├── /dashboard/admin/teachers (Teacher Management)
│   ├── /dashboard/admin/batches (Batch Management)
│   ├── /dashboard/admin/templates (ARK Templates)
│   ├── /dashboard/admin/analytics (Analytics)
│   ├── /dashboard/admin/risks (Risk War Room)
│   ├── /dashboard/admin/communications (Communications)
│   └── /dashboard/admin/settings (Settings)
│
└── PARENT PORTAL (/dashboard/parent)
    ├── /dashboard/parent (Home)
    ├── /dashboard/parent/progress (Progress Reports)
    ├── /dashboard/parent/communications (Messages)
    └── /dashboard/parent/settings (Settings)
```

---

## 2. USER ROLES & ACCESS

### 2.1 Role Hierarchy

```
INSTITUTE OWNER (Admin)
    ├── Full access to all features
    ├── Institute settings
    ├── Billing management
    └── User management

TEACHER
    ├── View assigned batches
    ├── View assigned students
    ├── Create interventions
    ├── View analytics (batch-level)
    └── Communication with students/parents

STUDENT
    ├── Personal dashboard
    ├── ARKs (view & create)
    ├── Study tools
    ├── Progress tracking
    └── AI mentor access

PARENT
    ├── View child's progress
    ├── Receive reports
    ├── Communication with teachers
    └── Limited settings access
```

### 2.2 Access Control Matrix

| Feature | Student | Teacher | Admin | Parent |
|---------|---------|---------|-------|--------|
| Personal Dashboard | ✅ | ✅ | ✅ | ✅ (Child's) |
| Create ARK | ✅ | ❌ | ❌ | ❌ |
| View All Students | ❌ | ✅ (Assigned) | ✅ | ❌ |
| Bulk Import | ❌ | ❌ | ✅ | ❌ |
| Risk Dashboard | ❌ | ✅ (Assigned) | ✅ | ✅ (Child's) |
| Generate Reports | ✅ | ✅ | ✅ | ✅ (Child's) |
| Institute Settings | ❌ | ❌ | ✅ | ❌ |

---

## 3. NAVIGATION STRUCTURE

### 3.1 Student Navigation (Sidebar)

```
📊 MAIN
├── 🏠 Home Dashboard
├── 📅 Daily Assistant
├── 📚 My ARKs
├── 💬 AI Mentor
├── 🔍 Smart Search
└── ❓ Doubt Solver

📖 LEARNING HUB
├── 🎯 Study Analyzer
├── 📝 Practice Questions
├── 💡 Visual Explainer
├── 📄 Academic Papers
└── 🛠️ Project Helper

🎯 EXAM PREP
├── 📊 Mock Tests
├── 📚 Previous Year Papers
├── 📈 Syllabus Tracker
├── 🏆 Rank Predictor
└── 🔥 Concept Heatmap

🚀 CAREER & COLLEGE
├── 🏛️ College Matcher
├── 🧮 Cutoff Predictor
├── 💼 Job Matcher
├── 📄 Resume Builder
├── 📑 Document Generator
└── 🧬 Career DNA

📈 TRACKING
├── 💭 Emotion Check
├── 📊 Progress
├── 🏅 Achievements
└── 👥 Peer Matches

⚙️ TOOLS
├── ✨ AI Agents Hub
├── 🧠 Train AI
└── ⚙️ Settings
```

### 3.2 Admin Navigation (Top Bar + Sidebar)

```
TOP BAR
├── Logo
├── Institute Name
├── Notifications
└── User Menu

SIDEBAR
├── 🏠 Dashboard
├── 👥 Students
│   ├── All Students
│   ├── Bulk Import
│   └── Batch Assignment
├── 👨‍🏫 Teachers
│   ├── Teacher List
│   └── Assign Batches
├── 📚 Batches
│   ├── Batch List
│   ├── Create Batch
│   └── Schedule Management
├── 📋 Templates
│   ├── Template Library
│   └── Create Template
├── 📊 Analytics
│   ├── Overview
│   ├── Batch Performance
│   └── Retention Metrics
├── 🚨 Risk Management
│   ├── Risk War Room
│   └── Interventions
├── 💬 Communications
│   ├── Announcements
│   └── Parent Reports
└── ⚙️ Settings
    ├── Institute Profile
    ├── Branding
    └── Billing
```

### 3.3 Teacher Navigation

```
SIDEBAR
├── 🏠 Dashboard
├── 👥 My Students
├── 📊 Batch Analytics
├── 🚨 Risk Alerts
├── 📝 Interventions
├── 📚 Resources
└── ⚙️ Settings
```

### 3.4 Parent Navigation

```
SIDEBAR
├── 🏠 Dashboard
├── 📊 Progress Reports
├── 💬 Communications
└── ⚙️ Settings
```

---

## 4. USER FLOWS

### 4.1 New Student Journey

```
1. Landing Page (/)
   ↓
2. Click "Get Started" or "Login"
   ↓
3. Registration (/auth/register)
   ├── Fill form (Name, Email, Password, Role, Institute)
   ├── Submit
   └── Email verification sent
   ↓
4. Email Verification (/auth/verify)
   ├── Enter OTP
   └── Verify
   ↓
5. Dashboard Hub (/dashboard)
   ├── Select "Student Dashboard"
   └── Redirect to /dashboard/student
   ↓
6. Onboarding Check
   ├── If not completed → Redirect to /onboarding
   └── If completed → Show dashboard
   ↓
7. Onboarding Flow (/onboarding)
   ├── Welcome Screen
   ├── Category Selection
   ├── Grade Selection
   ├── Questions (Dynamic)
   └── Completion
   ↓
8. Student Dashboard (/dashboard/student)
   ├── See "THE ONE THING" widget
   ├── View heatmap
   ├── Check daily nudge
   └── Start learning journey
```

### 4.2 Daily Student Flow

```
1. Login (/auth/login)
   ↓
2. Student Dashboard (/dashboard/student)
   ├── View "THE ONE THING"
   ├── Check energy level
   ├── See streak counter
   └── Review heatmap
   ↓
3. Daily Check-in (Widget on Dashboard)
   ├── Set mood, energy, stress, focus
   ├── Optional journal entry
   └── Submit
   ↓
4. Complete "THE ONE THING"
   ├── Click "Start Practice"
   ├── Practice micro-concept
   ├── Complete questions
   └── Mastery updated
   ↓
5. View Updated Heatmap
   ├── See progress
   ├── Identify next weak area
   └── Continue learning
```

### 4.3 ARK Creation Flow

```
1. Navigate to ARKs (/dashboard/student/arks)
   ↓
2. Click "Create New ARK" (/ark/create)
   ↓
3. ARK Creation Wizard
   ├── Step 1: Goal Selection
   │   ├── Exam (JEE/NEET/AIIMS)
   │   ├── Skill Development
   │   └── Career Path
   ├── Step 2: Exam Details (if exam)
   │   ├── Exam type
   │   ├── Target rank
   │   └── Timeline
   ├── Step 3: Constraints
   │   ├── Available hours/day
   │   ├── Preferred study times
   │   └── Weak areas
   ├── Step 4: Review
   │   ├── Preview ARK structure
   │   └── Confirm
   └── Step 5: Generation
       ├── AI generates ARK
       ├── Show progress
       └── Display ARK
   ↓
4. ARK Detail View (/dashboard/student/arks/:id)
   ├── View phases
   ├── See milestones
   ├── Check tasks
   └── Track progress
```

### 4.4 Mock Test Flow

```
1. Navigate to Mock Tests (/dashboard/student/mock-tests)
   ↓
2. Select Test
   ├── Browse available tests
   ├── Filter by exam type
   └── Select test
   ↓
3. Test Interface (/dashboard/student/mock-tests/:id)
   ├── View instructions
   ├── Start timer
   ├── Answer questions
   │   ├── Track time per question
   │   ├── Mark for review
   │   └── Skip if needed
   ├── Submit test
   └── Confirm submission
   ↓
4. Results Page
   ├── View score & rank
   ├── Subject-wise breakdown
   └── Click "View Strategy Analysis"
   ↓
5. Strategy Dashboard (/dashboard/student/mock-tests/:id/strategy)
   ├── Time allocation heatmap
   ├── Momentum graph
   ├── Skipping pattern analysis
   ├── Recommendations
   └── Practice suggestions
```

### 4.5 Backlog Destroyer Flow

```
1. Dashboard Alert
   ├── See backlog notification
   └── Click "I'm Overwhelmed"
   ↓
2. Backlog Destroyer Modal
   ├── View backlog count
   ├── See exam date
   └── Click "Create Survival Plan"
   ↓
3. Survival Plan Generation
   ├── AI calculates plan
   ├── Show progress
   └── Display plan
   ↓
4. Plan Preview
   ├── Priority 1 concepts (must master)
   ├── Priority 2 concepts (high value)
   ├── Deprioritized concepts
   ├── Time estimates
   └── Customization options
   ↓
5. Activation
   ├── Review plan
   ├── Customize (optional)
   └── Activate
   ↓
6. ARK Updated
   ├── New simplified ARK created
   ├── Old ARK archived
   ├── Notification shown
   └── Redirect to new ARK
```

### 4.6 Admin Intervention Flow

```
1. Admin Dashboard (/dashboard/admin)
   ├── View batch radar
   └── See red dots (critical students)
   ↓
2. Click Red Dot
   ├── Student detail panel opens
   ├── View risk scores
   ├── See risk factors
   └── Review recent activity
   ↓
3. Quick Actions Menu
   ├── Assign Counselor
   ├── Call Parent
   ├── Schedule Meeting
   └── Create Intervention
   ↓
4. Intervention Form
   ├── Select type
   ├── Set priority
   ├── Assign to teacher/counselor
   ├── Add notes
   └── Submit
   ↓
5. Intervention Created
   ├── Notification sent to assignee
   ├── Tracked in war room
   └── Status updates available
```

### 4.7 Document Generation Flow

```
1. Student Detail Page (Admin/Teacher view)
   ↓
2. Click "Generate Report"
   ↓
3. Document Type Selector
   ├── PTM Report
   ├── Progress Report
   ├── Exam Readiness Report
   ├── Resume
   └── SOP
   ↓
4. Generation Process
   ├── Fetch student data
   ├── AI generates content
   ├── Merge with template
   ├── Render PDF
   └── Store document
   ↓
5. Document Ready
   ├── Preview document
   ├── Download option
   ├── Email option
   └── Send WhatsApp summary (if enabled)
```

---

## 5. SCREEN SPECIFICATIONS

### 5.1 Student Dashboard (Fighter Pilot View)

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Mentark  [Exam: JEE Main ▼]  [⚡ 75%] [🔥 7d]  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 🎯 THE ONE THING                                    │ │
│ │ ───────────────────────────────────────────────────│ │
│ │ Master "Lens Maker Formula" (Optics)              │ │
│ │ ⏱️ 15 min | 📊 3 attempts, 0% accuracy            │ │
│ │                                                     │ │
│ │ [Start Practice] [Watch Video] [Skip for Now]      │ │
│ │                                                     │ │
│ │ 💡 Why this matters:                               │ │
│ │ "This concept appears in 8% of JEE Main papers..."│ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│ │ 📅 47d   │ │ 📊 ~15k  │ │ 🔥 7d    │                │
│ │ to exam  │ │ Rank est │ │ Streak  │                │
│ └──────────┘ └──────────┘ └──────────┘                │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 📈 CONCEPT HEATMAP                                  │ │
│ │ [Physics] [Chemistry] [Math]                       │ │
│ │ Physics: [🟢🟢🟡🔴🟢] 78%                          │ │
│ │ Chemistry: [🟢🟡🟢🟢] 85%                          │ │
│ │ Math: [🟡🔴🟡🟢🟡] 65%                             │ │
│ │ [View Detailed] [Focus on Weak Areas]               │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ ⚠️ BACKLOG ALERT (if applicable)                    │ │
│ │ You have 12 concepts behind schedule               │ │
│ │ [Activate Backlog Destroyer]                        │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 💬 DAILY NUDGE                                      │ │
│ │ "You've been consistent this week! Keep it up..."  │ │
│ │ [Tell me more] [Dismiss]                           │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 🎯 QUICK ACTIONS                                    │ │
│ │ [Mock Test] [PYQs] [Doubt Solver] [AI Mentor]      │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ [🚨 PANIC BUTTON] - Connect with Human Mentor       │ │
│ └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Components:**
- Top bar with exam selector, energy indicator, streak
- "THE ONE THING" widget (prominent)
- Key metrics cards
- Concept heatmap (mini view)
- Backlog alert (conditional)
- Daily nudge card
- Quick actions
- Panic button

### 5.2 Admin Dashboard (Air Traffic Control)

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Admin Dashboard  [Institute: Aakash] [👤 Menu]  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 📊 INSTITUTE OVERVIEW                               │ │
│ │ Students: 1,250 | Teachers: 45 | Batches: 12       │ │
│ │ Engagement: 78% | Risk Students: 23                │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 🎯 BATCH RADAR                                       │ │
│ │ [Batch: JEE 2025 ▼]                                 │ │
│ │                                                      │ │
│ │    🟢 🟢 🟢 🟡 🟢 🟢                                  │ │
│ │    🟢 🟡 🔴 🟢 🟢 🟡                                  │ │
│ │    🟢 🟢 🟢 🟢 🟡 🟢                                  │ │
│ │    🟢 🔴 🟢 🟢 🟢 🟢                                  │ │
│ │                                                      │ │
│ │ 🟢 On Track | 🟡 At Risk | 🔴 Critical              │ │
│ │ [Hover/Click for details]                           │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 🚨 INTERVENTION WAR ROOM                            │ │
│ │ ┌────────────────────────────────────────────────┐ │ │
│ │ │ 🔴 Critical (5)                                 │ │ │
│ │ │ • Rahul K. - Missed 3 assignments, mood: Low   │ │ │
│ │ │   [View] [Assign Counselor] [Call Parent]      │ │ │
│ │ │ • Priya M. - Test scores dropped 30%            │ │ │
│ │ │   [View] [Schedule Meeting]                    │ │ │
│ │ └────────────────────────────────────────────────┘ │ │
│ │ ┌────────────────────────────────────────────────┐ │ │
│ │ │ 🟡 At Risk (18)                                 │ │ │
│ │ │ [View All] [Bulk Actions]                       │ │ │
│ │ └────────────────────────────────────────────────┘ │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│ │ 📥 Bulk  │ │ 📋 Batch │ │ 📊 Analytics│            │
│ │ Import   │ │ Management│ │ Dashboard│              │
│ └──────────┘ └──────────┘ └──────────┘                │
└─────────────────────────────────────────────────────────┘
```

**Components:**
- Top bar with institute name
- Overview KPIs
- Batch radar (interactive grid)
- Intervention war room (categorized alerts)
- Quick access cards

### 5.3 Micro-Concept Heatmap

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ 📊 CONCEPT MASTERY HEATMAP                              │
│ [Physics ▼] [Chemistry] [Math]                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ OPTICS                                               │ │
│ │ ───────────────────────────────────────────────────│ │
│ │ Reflection & Refraction    [🟢🟢🟢] 95%           │ │
│ │ Lens Maker Formula         [🔴🔴🔴] 0%  ← Focus!  │ │
│ │ Optical Instruments        [🟡🟡🟢] 65%           │ │
│ │ Wave Optics                [🟢🟡🟢] 78%           │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ MECHANICS                                             │ │
│ │ ───────────────────────────────────────────────────│ │
│ │ Kinematics            [🟢🟢🟢] 92%                 │ │
│ │ Dynamics              [🟢🟢🟡] 85%                 │ │
│ │ Rotational Motion     [🟡🟡🟡] 55%                 │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ Legend: 🟢 Mastered | 🟡 Learning | 🔴 Needs Focus      │
│                                                          │
│ [Practice Weak Concepts] [View All Subjects]            │
└─────────────────────────────────────────────────────────┘
```

**Interactions:**
- Click concept → Start practice
- Hover → Show details tooltip
- Filter by mastery level
- Export progress report

### 5.4 Paper Attempt Strategy Dashboard

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ 📊 MOCK TEST #12 - STRATEGY ANALYSIS                    │
│ Score: 185/360 | Rank: ~15,000                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ ⏱️ TIME ALLOCATION                                  │ │
│ │                                                      │ │
│ │ Q1 [🟢 2min] Q2 [🟢 3min] Q3 [🔴 15min] ← Problem! │ │
│ │ Q4 [🟡 8min] Q5 [🟢 4min] Q6 [🟢 2min]             │ │
│ │                                                      │ │
│ │ 💡 Insight: You spent 15 min on Q3 and got it wrong│ │
│ │    This killed your momentum for next 5 questions   │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 🎯 SKIPPING PATTERN                                  │ │
│ │ You skipped 8 questions (Good!)                     │ │
│ │ But you should have skipped Q3 instead of Q12       │ │
│ │                                                      │ │
│ │ Recommended: If stuck > 5 min → Skip & mark review  │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 📈 MOMENTUM TRACKER                                  │ │
│ │ [Line graph showing confidence over time]           │ │
│ │ Drop after Q3 → Recovery after Q10                 │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ [Practice Time Management] [Take Another Mock]         │
└─────────────────────────────────────────────────────────┘
```

### 5.5 Backlog Destroyer Modal

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ 🚨 BACKLOG DESTROYER MODE                               │
│ ───────────────────────────────────────────────────────│ │
│                                                          │
│ You have 12 concepts behind schedule                    │
│ Exam in 47 days                                          │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 🎯 SURVIVAL PLAN                                     │ │
│ │                                                      │ │
│ │ Priority 1 (Must Master - 8% weightage):           │ │
│ │ ✅ Lens Maker Formula (2 hours)                     │ │
│ │ ✅ Organic Reactions (3 hours)                      │ │
│ │                                                      │ │
│ │ Priority 2 (High Value - 5% weightage):            │ │
│ │ ⏳ Integration Techniques (4 hours)                  │ │
│ │ ⏳ Thermodynamics (3 hours)                          │ │
│ │                                                      │ │
│ │ Deprioritized (Low weightage):                      │ │
│ │ ❌ Advanced Calculus (1% weightage)                 │ │
│ │ ❌ Complex Numbers (1% weightage)                   │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ Estimated time: 18 hours over 12 days (1.5 hrs/day)    │
│                                                          │
│ [Activate Survival Plan] [Customize] [Cancel]           │
└─────────────────────────────────────────────────────────┘
```

---

## 6. COMPONENT LIBRARY

### 6.1 Core Components

**Buttons:**
- Primary (Gradient cyan-blue)
- Secondary (Outlined)
- Ghost (Transparent)
- Danger (Red)
- Sizes: sm, md, lg

**Cards:**
- Default card
- Elevated card (with shadow)
- Interactive card (hover effects)
- Glass morphism card

**Forms:**
- Input (text, email, password)
- Select (dropdown)
- Textarea
- Checkbox
- Radio
- Slider (for check-ins)

**Navigation:**
- Sidebar (collapsible)
- Top bar
- Bottom bar (mobile)
- Breadcrumbs
- Tabs

**Data Display:**
- Badge (status, info, achievement)
- Progress bar
- Progress ring
- Stat card
- Metric card

**Feedback:**
- Toast notifications
- Alert banners
- Loading spinners
- Skeleton loaders
- Empty states

**Data Visualization:**
- Line chart
- Bar chart
- Pie chart
- Heatmap grid
- Radar visualization

### 6.2 Specialized Components

**Student Dashboard:**
- "THE ONE THING" widget
- Energy level indicator
- Streak counter
- Countdown timer
- Rank estimator
- Concept mastery indicator
- Daily nudge card
- Panic button

**Admin Dashboard:**
- Batch radar grid
- Risk score badge
- Intervention card
- Quick action menu
- Student status dot

**ARK System:**
- ARK timeline
- Milestone card
- Task checklist
- Progress indicator
- Recalibration button

**Test System:**
- Test timer
- Question navigator
- Answer selector
- Review marker
- Strategy heatmap

---

## 7. INTERACTION PATTERNS

### 7.1 Micro-Interactions

**Hover States:**
- Cards: Slight elevation
- Buttons: Scale up slightly
- Links: Underline
- Icons: Color change

**Click States:**
- Buttons: Scale down
- Cards: Ripple effect
- Navigation: Active state

**Loading States:**
- Skeleton screens (not spinners)
- Progress bars for operations
- Shimmer effect for content

**Transitions:**
- Page transitions: Fade/slide
- Card entrance: Stagger animation
- Modal: Slide in from bottom/right
- Dropdown: Fade + slide

### 7.2 Feedback Patterns

**Success:**
- Green toast notification
- Checkmark icon
- Success message
- Auto-dismiss after 3s

**Error:**
- Red toast notification
- Error icon
- Error message
- Action button (retry)

**Warning:**
- Yellow toast notification
- Warning icon
- Warning message
- Action button

**Info:**
- Blue toast notification
- Info icon
- Info message
- Dismiss button

### 7.3 Empty States

**Pattern:**
- Illustration or icon
- Heading
- Description
- Primary action button
- Secondary action (optional)

**Examples:**
- No ARKs yet
- No students in batch
- No mock tests taken
- No interventions created

### 7.4 Error States

**Pattern:**
- Error icon
- Error message
- Suggested actions
- Retry button
- Support link

**Examples:**
- API error
- Network error
- Validation error
- Permission error

---

## 8. RESPONSIVE DESIGN

### 8.1 Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### 8.2 Mobile Adaptations

**Navigation:**
- Bottom bar instead of sidebar
- Hamburger menu for secondary
- Swipe gestures

**Content:**
- Single column layout
- Stacked cards
- Collapsible sections
- Bottom sheet modals

**Forms:**
- Full-width inputs
- Large touch targets (min 44x44px)
- Sticky submit buttons
- Auto-focus management

---

## 9. ACCESSIBILITY

### 9.1 Requirements

- Keyboard navigation (Tab, Enter, Escape)
- Screen reader support (ARIA labels)
- High contrast mode
- Font size controls
- Reduced motion option

### 9.2 Implementation

- Semantic HTML
- ARIA labels on interactive elements
- Focus indicators
- Color contrast (WCAG AA minimum)
- Alt text for images
- Skip links

---

## 10. PERFORMANCE TARGETS

### 10.1 Metrics

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: > 90
- API Response Time: < 500ms

### 10.2 Optimization

- Lazy loading for images
- Code splitting
- Image optimization
- Caching strategies
- Prefetching for likely next pages

---

## 11. IMPLEMENTATION PRIORITY

### Phase 1: Foundation (Weeks 1-2)
- ✅ Information architecture
- ✅ Navigation structure
- ✅ Core components
- ✅ Student dashboard (basic)
- ✅ Admin dashboard (basic)

### Phase 2: Intelligence (Weeks 3-4)
- ✅ Micro-concept heatmap
- ✅ Paper attempt strategy
- ✅ Backlog destroyer
- ✅ Enhanced ARK views

### Phase 3: Value (Weeks 5-6)
- ✅ Document generation UI
- ✅ Intervention workflows
- ✅ Parent portal
- ✅ Communication system

### Phase 4: Polish (Weeks 7-8)
- ✅ Animations
- ✅ Micro-interactions
- ✅ Performance optimization
- ✅ Accessibility improvements

---

## 12. DESIGN TOKENS

### Colors
```json
{
  "primary": {
    "cyan": "#00E6FF",
    "blue": "#3B82F6"
  },
  "status": {
    "success": "#10B981",
    "warning": "#F59E0B",
    "error": "#EF4444",
    "info": "#3B82F6"
  },
  "background": {
    "dark": "#000000",
    "card": "#1E293B",
    "elevated": "#1F2937"
  }
}
```

### Typography
```json
{
  "fontFamily": {
    "heading": "Poppins",
    "body": "Inter",
    "mono": "JetBrains Mono"
  },
  "fontSize": {
    "xs": "12px",
    "sm": "14px",
    "base": "16px",
    "lg": "18px",
    "xl": "20px",
    "2xl": "24px",
    "3xl": "30px"
  }
}
```

### Spacing
```json
{
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px",
    "2xl": "48px"
  }
}
```

---

This UX Master Plan provides the complete foundation for building Mentark Quantum's user experience. All screens, flows, and interactions are documented and ready for implementation.

