# B2B Student ARK Creation System

## Overview

Successfully implemented a complete B2B student-focused ARK (Adaptive Roadmap of Knowledge) creation system that integrates with student onboarding profiles, supports institute templates, and provides a personalized 7-step creation flow optimized for school/coaching center students.

---

## 🎯 Key Features

### 1. **Academic Calendar-Based Timeframes**
- Category-specific timeframe options aligned with school schedules
- **Academic Excellence**: Before Test, This Quarter, Before Midterms, Before Finals, This Semester, Before Boards, Before Competitive Exams (JEE/NEET)
- **Career Preparation**: Quick Exploration, Skill Building, College Prep, Long-term Career Path, Internship Ready
- **Emotional Wellbeing**: Immediate Relief, Build Resilience, Sustained Growth, Exam Season Support
- **Personal/Life Skills/Social**: Quick Habit Build, Short/Mid/Long Term, Ongoing Practice

### 2. **Student-Centric Categories**
Replaced B2C categories with 6 student-focused categories:
- 📚 **Academic Excellence** - Master subjects, ace exams
- 🎯 **Career Preparation** - Plan future, build career skills
- 🌟 **Personal Development** - Build confidence, discipline
- 💚 **Emotional Wellbeing** - Manage stress, anxiety
- 🤝 **Social & Relationships** - Improve communication, friendships
- 🛠️ **Life Skills** - Practical skills for independence

### 3. **Onboarding Integration**
- Automatically fetches student's onboarding profile
- Pre-fills current level, learning style, weekly hours
- Uses baseline psychology (motivation, stress, confidence)
- References interests, goals, and challenges in AR generation

### 4. **Institute Template System**
- Teachers/admins can create ARK templates for students
- Students can customize templates or create custom ARKs
- Templates filtered by grade, batch, and category
- RLS policies ensure proper access control

### 5. **Psychology-Aware Generation**
- 3 sliders: Motivation (0-10), Stress (0-10), Confidence (0-10)
- Adjusts roadmap intensity based on psychology
- High stress = lighter workload
- High motivation = more ambitious tasks
- Low confidence = confidence-building exercises

### 6. **7-Step Creation Flow**
1. **Category Selection** - Choose focus area with visual cards
2. **Goal Statement** - Define specific, achievable goal
3. **Timeframe Selection** - Pick academic calendar-based timeframe
4. **Profile Refinement** - Confirm/edit pre-filled profile data + category-specific question
5. **Institute Templates** (Optional) - Use teacher-created template or skip
6. **Psychology Check** - Quick 3-slider assessment
7. **Generate ARK** - Review summary and generate personalized roadmap

---

## 📁 Files Created/Modified

### New Files

**Configuration & Data:**
- `lib/data/student-timeframes.ts` - Academic calendar timeframe options (200+ lines)
- `lib/ai/prompts/student-ark-generator.ts` - Student-specific ARK prompts (350+ lines)

**API Endpoints:**
- `app/api/ark-templates/route.ts` - Fetch/create institute templates
- `app/api/students/profile/route.ts` - Get/update student profile with onboarding data

**UI Components:**
- `components/ark/CategoryCard.tsx` - Enhanced category selection cards
- `components/ark/TimeframeSelector.tsx` - Academic calendar picker
- `components/ark/TemplatePreview.tsx` - Institute template cards
- `components/ark/PsychologySlider.tsx` - Interactive 0-10 slider with emoji feedback
- `components/ark/ARKSummary.tsx` - Pre-generation summary view

**Main Page:**
- `app/ark/create-student/page.tsx` - Complete 7-step ARK creation flow (750+ lines)

### Modified Files

**Database:**
- `supabase/migrations/002_gamification_career_dna.sql` - Added `ark_templates` table with RLS

**Types:**
- `lib/types/index.ts` - Added `StudentARKData` and `InstituteARKTemplate` interfaces

**API:**
- `app/api/ai/generate-ark/route.ts` - Enhanced to handle student profiles and templates

**Homepage:**
- `app/page.tsx` - Changed "Create Your ARK" to "Build My Learning Path", updated link to `/ark/create-student`

**Documentation:**
- `GAMIFICATION_AND_CAREER_DNA.md` - Previous work documentation
- `B2B_STUDENT_ARK_CREATION.md` - This file

---

## 🗄️ Database Schema

### `ark_templates` Table

```sql
CREATE TABLE ark_templates (
  id UUID PRIMARY KEY,
  institute_id UUID REFERENCES institutes(id),
  category_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_batch TEXT,
  target_grade TEXT,
  milestones JSONB NOT NULL,
  resources JSONB DEFAULT '[]',
  created_by UUID REFERENCES users(id),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**RLS Policies:**
- Students can view published templates from their institute
- Teachers can view all templates from their institute
- Teachers can create/update/delete their own templates

---

## 🔌 API Endpoints

### `GET /api/students/profile`
Fetch complete student profile including onboarding data.

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "email": "student@example.com",
    "full_name": "John Doe",
    "grade": "10",
    "batch": "2024",
    "interests": ["coding", "sports"],
    "goals": ["get 90% in finals"],
    "onboarding_profile": { ... }
  }
}
```

### `GET /api/ark-templates?category=academic_excellence`
Fetch institute templates for a specific category.

**Query Params:**
- `category` (optional) - Filter by category ID

**Response:**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "uuid",
        "title": "JEE Mathematics Preparation",
        "description": "Comprehensive math prep for JEE",
        "target_grade": "11",
        "milestones": [...],
        "is_published": true
      }
    ],
    "count": 1
  }
}
```

### `POST /api/ai/generate-ark`
Generate personalized student ARK.

**Request Body:**
```json
{
  "category": "academic_excellence",
  "goal": "Score 90%+ in Math finals",
  "timeframe": {
    "id": "before_finals",
    "duration": "3-4 months",
    "durationWeeks": 14
  },
  "student_profile": { ... },
  "psychologyProfile": {
    "motivation": 8,
    "stress": 6,
    "confidence": 7
  },
  "specificFocus": "Calculus and Trigonometry",
  "useTemplate": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ark": {
      "title": "Master Math for Finals",
      "description": "...",
      "milestones": [...],
      "weeklySchedule": {...},
      "parentGuidance": "...",
      "teacherCollaboration": "..."
    },
    "model": "gpt-4o",
    "tokens_used": 1250
  }
}
```

---

## 🎨 UI/UX Features

### Visual Design
- Dark gradient background (slate-900 → purple-900 → slate-900)
- Category cards with emojis, gradients, and examples
- Animated transitions between steps (Framer Motion)
- Progress bar showing step completion
- Real-time generation progress with animated loader

### Smart Interactions
- Pre-filled values from onboarding profile
- Category-specific timeframe options
- Dynamic focus question based on selected category
- Psychology sliders with emoji feedback
- Template preview with "Use This" button
- Summary screen before generation

### Category-Specific Questions (Step 4)
- **Academic Excellence**: "Which subject or exam?"
- **Career Preparation**: "Which field interests you?"
- **Personal Development**: "What habit do you want to build?"
- **Emotional Wellbeing**: "What's your primary challenge?"
- **Social & Relationships**: "What's your communication goal?"
- **Life Skills**: "Which skill do you want to develop?"

---

## 🤖 AI Prompt Engineering

### Student ARK Generation Prompt

The prompt includes:
1. **Student Context**: Grade, category, goal, timeframe, learning style, weekly hours
2. **Psychology Profile**: Motivation, stress, confidence levels with intensity recommendations
3. **Onboarding Insights**: Complete profile from onboarding flow
4. **Requirements**:
   - Milestone structure (3-8 based on duration)
   - Age-appropriate language (different for grades 6-8, 9-10, 11-12)
   - Indian education system context (CBSE/ICSE/State boards)
   - School-friendly timings
   - Balance rigor with wellbeing
5. **Resource Guidelines**: Khan Academy, YouTube, NCERT, age-appropriate apps
6. **Wellbeing Integration**: Special handling for high stress/low confidence/low motivation
7. **Output Format**: Structured JSON with milestones, tasks, resources, weekly schedule, parent guidance, teacher collaboration

### Template Customization Prompt

When using institute template:
1. Takes original template structure
2. Personalizes for student's goal, learning style, and psychology
3. Adjusts pacing based on stress/motivation
4. Keeps structure but customizes descriptions and resources

---

## 📊 Data Flow

```
1. Student lands on /ark/create-student
   ↓
2. System fetches onboarding profile from /api/students/profile
   ↓
3. Pre-fills form data (level, learning style, hours, psychology)
   ↓
4. Student completes 7-step flow
   ↓
5. [Optional] Fetches institute templates from /api/ark-templates
   ↓
6. Student reviews summary
   ↓
7. POST to /api/ai/generate-ark with complete data
   ↓
8. AI generates personalized roadmap (or customizes template)
   ↓
9. ARK saved to database & student redirected to dashboard
```

---

## 🔒 Security & Access Control

### RLS Policies
- Students can only view their own profiles
- Students can only see published templates from their institute
- Teachers can view all templates from their institute
- Teachers can only edit/delete their own templates
- Admins have full access within their institute

### Data Privacy
- Onboarding profiles stored encrypted (JSONB)
- Psychology data only used for ARK generation
- No cross-institute data sharing

---

## 🚀 Usage Examples

### Student Journey

1. **Complete Onboarding** (`/onboarding`)
   - Answer 6-8 grade-specific MCQ questions
   - Profile saved with psychology baseline

2. **Create ARK** (`/ark/create-student`)
   - Choose category: "Academic Excellence"
   - Set goal: "Score 95% in Physics for JEE"
   - Pick timeframe: "Before Competitive Exam (12-24 months)"
   - Confirm pre-filled profile (Grade 11, Advanced level, 15 hrs/week)
   - Enter specific focus: "Mechanics and Electromagnetism"
   - Skip templates (create custom)
   - Quick psychology check (Motivation: 9, Stress: 7, Confidence: 6)
   - Generate ARK

3. **Receive Personalized Roadmap**
   - 8 milestones over 24 months
   - Physics-focused resources (HC Verma, online lectures)
   - Lighter initial workload (stress: 7/10)
   - Confidence-building quick wins
   - Weekly study schedule
   - Parent involvement suggestions
   - Teacher collaboration points

### Teacher Template Creation

```typescript
POST /api/ark-templates
{
  "category_id": "academic_excellence",
  "title": "Class 10 CBSE Board Exam - Mathematics",
  "description": "Complete math preparation for CBSE Class 10",
  "target_grade": "10",
  "target_batch": "2025",
  "milestones": [
    {
      "title": "Number Systems & Algebra",
      "estimatedWeeks": 4,
      "tasks": [...],
      "resources": [...]
    },
    ...
  ],
  "is_published": true
}
```

---

## ✅ Testing Checklist

- [x] Onboarding profile fetches correctly
- [x] Pre-fill works for all fields
- [x] Category selection updates timeframe options
- [x] Category-specific focus questions display correctly
- [x] Template fetching works when category selected
- [x] Template selection/deselection works
- [x] Psychology sliders update with emoji feedback
- [x] Summary displays all entered data correctly
- [x] Generation progress animates smoothly
- [x] ARK API receives correct payload
- [x] Navigation (Previous/Next) works correctly
- [x] Step validation prevents proceeding with incomplete data
- [x] Homepage link updated to `/ark/create-student`
- [x] No linting errors

---

## 🔮 Future Enhancements

1. **Real-time Collaboration**
   - Teachers can comment on student ARKs
   - Peer study groups based on similar ARKs

2. **Progress Tracking**
   - Mark milestones as complete
   - Visualize ARK progress on dashboard
   - Weekly check-ins to adjust roadmap

3. **Template Marketplace**
   - Share high-performing templates across institutes
   - Template ratings and reviews
   - Subject-matter expert created templates

4. **AI-Powered Adjustments**
   - Weekly micro-adjustments based on check-ins
   - Automatic pacing changes if student falling behind
   - Stress-based workload optimization

5. **Parent/Teacher Portal**
   - View student's active ARKs
   - Get weekly progress reports
   - Receive suggestions for support

6. **Gamification Integration**
   - Award XP for ARK milestone completion
   - Badges for finishing ARKs on time
   - Leaderboard for ARK completion rate

---

## 📝 Summary

Successfully built a comprehensive B2B student ARK creation system that:

✅ Integrates with student onboarding profiles (auto pre-fill)
✅ Uses 6 student-focused categories (not B2C categories)
✅ Offers academic calendar-based timeframes (exam-aligned)
✅ Supports institute templates AND custom creation
✅ Includes psychology assessment (motivation, stress, confidence)
✅ Removes professional-specific questions
✅ Provides 7-step streamlined flow
✅ Generates age-appropriate, personalized roadmaps
✅ Includes parent guidance and teacher collaboration points
✅ Fully responsive and beautifully designed

**Total Implementation:**
- 10+ new files created
- 5+ files modified
- 2000+ lines of code
- Full database schema
- Complete API layer
- Beautiful UI components
- Comprehensive AI prompts
- No linting errors

---

Built with ❤️ for Mentark Quantum B2B Platform

