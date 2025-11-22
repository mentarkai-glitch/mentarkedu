# 🎯 REMAINING TASKS - IMPLEMENTATION PLAN

## Overview
This document outlines all remaining tasks organized by priority, with implementation details and dependencies.

---

## 🔴 PHASE 1: QUICK FIXES (High Priority)
**Goal:** Fix existing TODOs and "coming soon" features  
**Timeline:** 1-2 days  
**Impact:** High (immediate user value)

### 1.1 Edit Functionality for Students
**File:** `app/dashboard/admin/students/page.tsx`  
**Current State:** Shows "Edit functionality coming soon" toast  
**Task:**
- Create edit dialog/modal component
- Connect to `PATCH /api/admin/students/[id]` endpoint
- Add form validation
- Update UI after successful edit

**API:** Already exists at `app/api/admin/students/[id]/route.ts`

### 1.2 Edit Functionality for Teachers
**File:** `app/dashboard/admin/teachers/page.tsx`  
**Current State:** Shows "Edit functionality coming soon" toast  
**Task:**
- Create edit dialog/modal component
- Create `PATCH /api/admin/teachers/[id]` endpoint (if missing)
- Add form validation
- Update UI after successful edit

**API:** Need to check if exists, create if missing

### 1.3 Connect Real Data to Concept Heatmap
**File:** `app/dashboard/student/concept-heatmap/page.tsx`  
**Current State:** Has TODO comment for API fetch  
**Task:**
- Replace mock data with real API call to `/api/student/concept-heatmap`
- Handle loading and error states
- Add drill-down navigation to concept practice

**API:** Already exists at `app/api/student/concept-heatmap/route.ts`

### 1.4 Mock Test Answer Persistence
**File:** `app/dashboard/student/mock-tests/[id]/page.tsx`  
**Current State:** Has TODO for fetching existing answers  
**Task:**
- Create `GET /api/mock-tests/[id]/attempts/[attempt_id]` endpoint
- Save answers periodically during test (debounced)
- Load saved answers on page load
- Show resume option if test was interrupted

**API:** Need to create endpoint for saving/loading answers

---

## 🟡 PHASE 2: TEACHER DASHBOARD (Medium Priority)
**Goal:** Complete teacher experience  
**Timeline:** 3-4 days  
**Impact:** High (B2B value)

### 2.1 Teacher Dashboard Home
**File:** `app/dashboard/teacher/page.tsx` (create)  
**Task:**
- Create teacher-specific dashboard
- Show assigned batches
- Display student count per batch
- Show recent interventions
- Quick stats (active students, at-risk count)

**API Endpoints Needed:**
- `GET /api/teacher/dashboard` - Get teacher stats
- `GET /api/teacher/batches` - Get assigned batches

### 2.2 Student List for Teachers
**File:** `app/dashboard/teacher/students/page.tsx` (create)  
**Task:**
- List students in teacher's batches
- Filter by batch
- Show student progress
- Link to student detail page
- Risk indicators

**API Endpoints Needed:**
- `GET /api/teacher/students` - List students in teacher's batches

### 2.3 Batch Analytics for Teachers
**File:** `app/dashboard/teacher/analytics/page.tsx` (create)  
**Task:**
- Batch performance charts
- Subject-wise breakdown
- Student progress trends
- Comparison with other batches
- Export reports

**API Endpoints Needed:**
- `GET /api/teacher/analytics/batch/[id]` - Get batch analytics

### 2.4 Intervention Management
**File:** `app/dashboard/teacher/interventions/page.tsx` (create)  
**Task:**
- List at-risk students
- Create interventions
- Track intervention status
- Add notes
- Mark as resolved

**API Endpoints Needed:**
- `GET /api/teacher/interventions` - List interventions
- `POST /api/teacher/interventions` - Create intervention
- `PATCH /api/teacher/interventions/[id]` - Update intervention

---

## 🟢 PHASE 3: ENHANCED FEATURES (Medium Priority)
**Goal:** Leverage Pinecone embeddings for intelligence  
**Timeline:** 4-5 days  
**Impact:** Very High (differentiation)

### 3.1 Semantic Search API
**File:** `app/api/search/semantic/route.ts` (create)  
**Task:**
- Create endpoint that accepts query text
- Generate embedding for query
- Search Pinecone index
- Return ranked results with metadata
- Support filters (subject, exam_type, difficulty)

**Dependencies:**
- Pinecone client configured
- OpenAI embeddings API

### 3.2 Semantic Search UI
**File:** `app/dashboard/student/pyqs/page.tsx` (enhance)  
**Task:**
- Add search bar with semantic search toggle
- Show search results
- Highlight relevant sections
- Filter by relevance score

**Integration:** Use `/api/search/semantic` endpoint

### 3.3 Question Recommendations
**File:** `app/api/student/recommendations/route.ts` (create)  
**Task:**
- Analyze student's weak areas from test attempts
- Use Pinecone to find similar questions
- Rank by difficulty progression
- Return personalized question set

**Logic:**
1. Get student's failed/weak concepts
2. Search Pinecone for questions on those concepts
3. Filter by difficulty (start easy, progress)
4. Return top N recommendations

### 3.4 Similar Questions Finder
**File:** `app/api/questions/[id]/similar/route.ts` (create)  
**Task:**
- Given a question ID, get its embedding
- Search Pinecone for similar questions
- Return top 5-10 similar questions
- Show in UI on question detail page

**UI Integration:** Add to PYQ detail page and mock test review

### 3.5 Auto-Difficulty Tagging
**File:** `scripts/tag_question_difficulty.py` (create)  
**Task:**
- Analyze question text using AI
- Consider: concept complexity, question length, answer options
- Tag as: Easy, Medium, Hard
- Update database with difficulty tags

**Approach:** Use GPT-4o to analyze and tag questions

---

## 🔵 PHASE 4: ADDITIONAL STUDENT FEATURES (Lower Priority)
**Goal:** Enhance existing student pages  
**Timeline:** 3-4 days  
**Impact:** Medium

### 4.1 Enhanced ARK Detail Page
**File:** `app/dashboard/student/arks/[id]/page.tsx` (enhance)  
**Task:**
- Connect to real ARK data
- Show progress visualization
- Add milestone completion tracking
- Link tasks to actual resources
- Add recalibration option

### 4.2 Study Analyzer Enhancements
**File:** `app/dashboard/student/study/page.tsx` (enhance)  
**Task:**
- Connect to real study session data
- Show time spent per subject
- Identify study patterns
- Suggest optimal study times
- Track focus metrics

### 4.3 Practice Questions with Real Data
**File:** `app/dashboard/student/practice/page.tsx` (enhance)  
**Task:**
- Replace mock questions with real PYQs
- Add filters (subject, difficulty, concept)
- Show explanations
- Track practice history
- Link to concept heatmap

### 4.4 Daily Assistant Improvements
**File:** `app/dashboard/student/daily-assistant/page.tsx` (enhance)  
**Task:**
- Better AI integration
- Context-aware responses
- Personalized study tips
- Integration with ARK and check-ins

---

## ⚪ PHASE 5: POLISH & OPTIMIZATION (Ongoing)
**Goal:** Improve performance and UX  
**Timeline:** Ongoing  
**Impact:** Medium (user experience)

### 5.1 Pagination
**Files:** Multiple admin pages  
**Task:**
- Add pagination to student list
- Add pagination to teacher list
- Add pagination to PYQs list
- Use cursor-based or offset pagination

### 5.2 Caching
**Files:** API routes  
**Task:**
- Implement Redis caching for:
  - Student lists
  - Question data
  - Analytics queries
- Set appropriate TTLs
- Invalidate on updates

### 5.3 Performance Optimizations
**Files:** All pages  
**Task:**
- Implement lazy loading for images
- Code splitting for large components
- Optimize bundle size
- Add loading skeletons
- Reduce API calls with batching

### 5.4 Error Handling
**Files:** All pages and APIs  
**Task:**
- Add try-catch blocks
- Show user-friendly error messages
- Log errors for debugging
- Add retry logic for failed requests
- Handle edge cases

---

## 📋 IMPLEMENTATION ORDER

### Week 1: Quick Fixes + Teacher Dashboard
1. ✅ Quick Fix 1-4 (Days 1-2)
2. ✅ Teacher Dashboard Home (Day 3)
3. ✅ Teacher Student List (Day 4)
4. ✅ Teacher Analytics (Day 5)

### Week 2: Enhanced Features
1. ✅ Semantic Search API (Day 1)
2. ✅ Semantic Search UI (Day 2)
3. ✅ Question Recommendations (Day 3)
4. ✅ Similar Questions Finder (Day 4)
5. ✅ Auto-Difficulty Tagging (Day 5)

### Week 3: Student Features + Polish
1. ✅ Enhanced ARK Detail (Day 1)
2. ✅ Study Analyzer (Day 2)
3. ✅ Practice Questions (Day 3)
4. ✅ Daily Assistant (Day 4)
5. ✅ Pagination + Caching (Day 5)

---

## 🛠️ TECHNICAL NOTES

### API Patterns
- All APIs should use consistent error handling
- Use Zod for request validation
- Return consistent response format
- Add rate limiting where needed

### Database Considerations
- Add indexes for frequently queried fields
- Consider materialized views for analytics
- Optimize queries with proper joins

### Frontend Patterns
- Use React Query for data fetching
- Implement optimistic updates
- Add loading and error states
- Use shadcn/ui components consistently

---

## ✅ SUCCESS CRITERIA

### Quick Fixes
- [ ] All TODOs resolved
- [ ] No "coming soon" messages
- [ ] All features functional

### Teacher Dashboard
- [ ] All 4 pages built
- [ ] Full CRUD operations
- [ ] Analytics working

### Enhanced Features
- [ ] Semantic search returns relevant results
- [ ] Recommendations are personalized
- [ ] Similar questions finder works accurately

### Student Features
- [ ] All pages use real data
- [ ] Performance is acceptable
- [ ] User experience is smooth

### Polish
- [ ] No performance issues
- [ ] Error handling is robust
- [ ] Code is maintainable

---

**Last Updated:** 2024-01-XX  
**Status:** In Progress

