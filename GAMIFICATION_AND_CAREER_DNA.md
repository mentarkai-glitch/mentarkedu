# Gamification & Career DNA System

## Overview

We've successfully implemented **Week 6 (Career DNA Mapping & Peer Matching)** and **Week 10 (Gamification System)** for Mentark Quantum. This adds powerful engagement and career discovery features to the platform.

---

## 🎮 Gamification System

### Database Schema

New tables added in `supabase/migrations/002_gamification_career_dna.sql`:

- **`xp_transactions`** - Tracks all XP gains from various sources
- **`badge_awards`** - Records earned badges with timestamps
- **`coin_transactions`** - Coin economy for premium features
- **`leaderboard_entries`** - Cached leaderboard rankings per institute/batch

### XP Sources

Students earn XP from:
- Daily check-ins (50 XP)
- ARK milestones (100 XP)
- ARK completion (500 XP)
- Chat messages (5 XP per message)
- Badge earned (100 XP bonus)
- Streak bonuses (variable)

### Level Calculation

Level formula: `level = floor(sqrt(xp / 100)) + 1`

This creates a balanced progression:
- Level 1: 0-99 XP
- Level 2: 100-399 XP
- Level 3: 400-899 XP
- Level 4: 900-1599 XP
- Level 5: 1600-2499 XP

### API Endpoints

#### `/api/gamification/xp`
- **GET**: Fetch student's XP, level, and transaction history
- **POST**: Award XP (requires amount, source, description)

#### `/api/gamification/badges`
- **GET**: Get earned and available badges
- **POST**: Award a badge to a student

#### `/api/gamification/leaderboard`
- **GET**: Fetch leaderboard for institute/batch
- Query params: `batch` (filter), `limit` (default 20)

### UI Components

#### `XPProgressBar`
Location: `components/gamification/XPProgressBar.tsx`

Features:
- Animated XP counter
- Progress bar to next level
- Level badge display
- Level-up celebration modal

#### `BadgeCollection`
Location: `components/gamification/BadgeCollection.tsx`

Features:
- Tabbed view (Earned vs Available)
- Badge detail modal on click
- Visual distinction for locked badges
- Earn date display

#### `Leaderboard`
Location: `components/gamification/Leaderboard.tsx`

Features:
- Top 3 highlighted with special icons (👑, 🥈, 🥉)
- Batch filter dropdown
- User's position indicator
- Real-time ranking updates

### Achievements/Badges

Pre-seeded badges:
- 🐦 **Early Bird** - 7-day check-in streak
- 🎯 **ARK Master** - Complete first ARK
- 📅 **Consistent Learner** - 30 daily check-ins
- 💬 **Chat Champion** - 50 AI conversations
- 🔥 **Fire Keeper** - 30-day streak
- 🌟 **Multi-Tasker** - Complete 5 ARKs
- 💪 **Goal Crusher** - Complete 10 milestones
- 🧠 **Deep Thinker** - 100 conversations

---

## 🧬 Career DNA System

### Database Schema

New tables:

- **`career_categories`** - 10 predefined career clusters with embeddings
- **`student_career_profiles`** - Affinity scores (0-1) per category
- **`peer_matches`** - Study buddy recommendations
- **`study_groups`** - Formed study groups
- **`study_group_members`** - Group membership tracking

### Career Categories

Pre-seeded categories with icons and colors:

1. 💻 **Technology & Engineering** (Blue) - Software, AI/ML, robotics
2. 🏥 **Medicine & Healthcare** (Red) - Doctor, nurse, research
3. 💼 **Business & Finance** (Green) - Entrepreneurship, consulting
4. 🎨 **Arts & Creative** (Purple) - Design, music, film
5. 🔬 **Science & Research** (Cyan) - Physics, chemistry, biology
6. 📚 **Education & Training** (Orange) - Teaching, ed-tech
7. ⚖️ **Law & Public Service** (Gray) - Lawyer, social work
8. ⚽ **Sports & Fitness** (Lime) - Professional athlete, coaching
9. 📺 **Media & Communication** (Pink) - Journalism, content creation
10. 🌱 **Agriculture & Environment** (Green) - Farming, sustainability

### API Endpoints

#### `/api/career-dna/analyze`
- **POST**: Analyze student profile and generate affinity scores
- Input: `student_profile`, `interests`, `goals`, `chat_history`
- Uses AI to calculate scores for each career category
- Saves results to database

#### `/api/career-dna/profile`
- **GET**: Fetch student's career DNA profile
- Returns: Categories ranked by affinity score, top 3 categories, average score

### Career DNA Analysis Flow

1. Student clicks "Analyze Career DNA"
2. System fetches onboarding profile (from `/api/onboarding/profile`)
3. AI analyzes:
   - Stated interests and goals
   - Learning style compatibility
   - Career clarity level
   - Challenges and strengths
4. Generates affinity scores (0.0 to 1.0) for all 10 categories
5. Stores in database with timestamp
6. Returns detailed analysis with recommendations

### UI Components

#### `CareerDNAChart`
Location: `components/career-dna/CareerDNAChart.tsx`

Features:
- Top 3 career strengths highlighted
- Visual progress bars for all categories
- Color-coded affinity levels (green = high, red = low)
- Detailed category descriptions
- Last updated timestamp

#### Career DNA Analysis Page
Location: `app/career-dna/analyze/page.tsx`

Features:
- 3-step flow: Info → Analyzing → Results
- Animated progress indicator
- Beautiful result celebration
- Direct link to dashboard

---

## 🤝 Peer Matching System

### Matching Algorithm

Located in `/api/peer-matching/find`

**Compatibility Score Calculation:**

1. **Interest Overlap (40%)** - Shared hobbies and subjects
2. **Goal Similarity (30%)** - Common academic/career objectives
3. **Career Profile (30%)** - Top 3 career categories alignment

**Match Types:**

- **Study Buddy** - High interest + goal overlap (>60% each)
- **Complementary** - Strong career profile match (>50%)
- **Similar Interests** - Default for moderate compatibility

### API Endpoints

#### `/api/peer-matching/find`
- **POST**: Find and rank top 5 matches
- Filters: Same institute, same batch
- Returns: Compatibility scores, match reasons, profile snippets

### UI Components

#### `PeerMatches`
Location: `components/peer-matching/PeerMatches.tsx`

Features:
- One-click match finding
- Match type badges (Study Buddy, Complementary, etc.)
- Compatibility percentage display
- Shared interests/goals visualization
- Connect and message buttons
- Refresh to find new matches

---

## 📊 Student Dashboard Integration

Updated `app/dashboard/student/page.tsx` with tabbed interface:

### Tabs:

1. **Overview** - ARKs, chats, achievements, quick actions
2. **Gamification** - XP progress, badge collection
3. **Career DNA** - Affinity chart, analyze button
4. **Leaderboard** - Institute rankings
5. **Peer Matching** - Study buddy finder

### Quick Actions Added:

- Career DNA Analysis
- Find Peer Matches
- View Leaderboard
- Check Badges

---

## 🎨 Design System

All components follow the Mentark design language:

- **Background**: Dark gradient (purple-900 → blue-900)
- **Cards**: Translucent slate-800 with blur
- **Borders**: Purple/blue accent colors
- **Gradients**: Cyan → Blue for CTAs
- **Typography**: Poppins (headings), Inter (body)

---

## 🔐 Security & RLS

All tables have Row Level Security enabled:

- Students see only their own data
- Institute-level isolation enforced
- Teachers see assigned students
- Admins see institute-wide data

---

## 🚀 Usage Examples

### Award XP to Student

```typescript
const response = await fetch('/api/gamification/xp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 50,
    source: 'daily_checkin',
    description: 'Completed daily check-in on 2024-01-15'
  })
});
```

### Analyze Career DNA

```typescript
const response = await fetch('/api/career-dna/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    student_profile: studentProfileData,
    interests: ['coding', 'robotics'],
    goals: ['become software engineer'],
    chat_history: []
  })
});
```

### Find Peer Matches

```typescript
const response = await fetch('/api/peer-matching/find', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    preferences: {}
  })
});
```

---

## 📈 Next Steps

Recommended enhancements:

1. **Real-time Updates** - Use Supabase Realtime for live leaderboard
2. **Study Groups** - Enable students to form/join groups
3. **Challenges** - Weekly/monthly XP challenges
4. **Coin Store** - Spend coins on custom ARKs, mentor personas
5. **Career Resources** - Link to courses/jobs per DNA category
6. **Peer Chat** - Direct messaging between matched students

---

## 🧪 Testing Checklist

- [ ] Create student account and complete onboarding
- [ ] Award XP through daily check-in
- [ ] View XP progress bar and level up
- [ ] Analyze Career DNA
- [ ] View career affinity chart
- [ ] Find peer matches
- [ ] View leaderboard rankings
- [ ] Earn and view badges
- [ ] Test all 5 dashboard tabs
- [ ] Verify RLS policies work correctly

---

## 📦 Dependencies Added

```json
{
  "chart.js": "^4.x",
  "react-chartjs-2": "^5.x",
  "@types/chart.js": "^2.x",
  "three": "^0.160.x",
  "@types/three": "^0.160.x",
  "@react-three/fiber": "^8.x",
  "@react-three/drei": "^9.x"
}
```

---

## ✅ Completion Status

**Week 6: Career DNA Mapping & Peer Matching** - ✅ Complete
- Career categories defined
- AI-powered affinity analysis
- Peer matching algorithm
- Study buddy recommendations

**Week 10: Gamification System** - ✅ Complete
- XP and leveling system
- Badge/achievement engine
- Leaderboard rankings
- Coin economy foundation

---

Built with ❤️ for Mentark Quantum

