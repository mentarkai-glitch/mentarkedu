-- ==================== MENTARK QUANTUM DATABASE SCHEMA ====================
-- Migration: 001_initial_schema
-- Description: Complete database schema with RLS policies for multi-tenancy

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== CORE TABLES ====================

-- Institutes (Multi-tenancy base)
CREATE TABLE institutes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('neuro', 'quantum')),
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users (extends auth.users with profile data)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  email TEXT NOT NULL UNIQUE,
  profile_data JSONB NOT NULL DEFAULT '{"first_name": "", "last_name": ""}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students
CREATE TABLE students (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  grade TEXT NOT NULL,
  batch TEXT NOT NULL,
  interests TEXT[] DEFAULT '{}',
  goals TEXT[] DEFAULT '{}',
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  onboarding_profile JSONB
);

-- Teachers
CREATE TABLE teachers (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  specialization TEXT[] DEFAULT '{}',
  assigned_batches TEXT[] DEFAULT '{}'
);

-- Admins
CREATE TABLE admins (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  permissions TEXT[] DEFAULT '{}'
);

-- ==================== ARK SYSTEM ====================

-- ARKs (Adaptive Roadmaps of Knowledge)
CREATE TABLE arks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('academic', 'personal', 'career', 'emotional', 'health')),
  duration TEXT NOT NULL CHECK (duration IN ('short', 'mid', 'long')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ARK Milestones
CREATE TABLE ark_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ark_id UUID NOT NULL REFERENCES arks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_duration TEXT
);

-- ARK Resources
CREATE TABLE ark_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ark_id UUID NOT NULL REFERENCES arks(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('video', 'article', 'course', 'book', 'podcast', 'tool')),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}'
);

-- ==================== AI INTERACTION ====================

-- Chat Sessions
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentor_persona TEXT NOT NULL DEFAULT 'friendly' CHECK (mentor_persona IN ('friendly', 'strict', 'calm', 'logical', 'spiritual')),
  context_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  emotion_score DECIMAL(3,2),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Check-ins
CREATE TABLE daily_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  energy INTEGER NOT NULL CHECK (energy >= 1 AND energy <= 5),
  focus INTEGER NOT NULL CHECK (focus >= 1 AND focus <= 5),
  emotion TEXT NOT NULL,
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- ==================== GAMIFICATION ====================

-- Student Stats
CREATE TABLE student_stats (
  user_id UUID PRIMARY KEY REFERENCES students(user_id) ON DELETE CASCADE,
  xp INTEGER DEFAULT 0 CHECK (xp >= 0),
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  streak_days INTEGER DEFAULT 0 CHECK (streak_days >= 0),
  coins INTEGER DEFAULT 0 CHECK (coins >= 0),
  badges TEXT[] DEFAULT '{}'
);

-- Achievements
CREATE TABLE achievements (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('streak', 'ark_completion', 'daily_checkin', 'chat_engagement', 'milestone')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  criteria JSONB NOT NULL,
  icon_url TEXT NOT NULL
);

-- User Achievements
CREATE TABLE user_achievements (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

-- ==================== ANALYTICS & PREDICTIONS ====================

-- Emotion Timeline
CREATE TABLE emotion_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sentiment_score DECIMAL(3,2) NOT NULL CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  context TEXT,
  UNIQUE(student_id, date)
);

-- Dropout Predictions
CREATE TABLE dropout_predictions (
  student_id UUID PRIMARY KEY REFERENCES students(user_id) ON DELETE CASCADE,
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  factors TEXT[] DEFAULT '{}',
  predicted_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Career DNA
CREATE TABLE career_dna (
  student_id UUID PRIMARY KEY REFERENCES students(user_id) ON DELETE CASCADE,
  clusters TEXT[] DEFAULT '{}',
  strengths TEXT[] DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Peer Matches
CREATE TABLE peer_matches (
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  matched_student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  compatibility_score INTEGER NOT NULL CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (student_id, matched_student_id),
  CHECK (student_id <> matched_student_id)
);

-- Batch Health
CREATE TABLE batch_health (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  batch_id TEXT NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{"average_motivation": 0, "burnout_risk": 0, "engagement_rate": 0, "ark_completion_rate": 0}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teacher Effectiveness
CREATE TABLE teacher_effectiveness (
  teacher_id UUID NOT NULL REFERENCES teachers(user_id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{"student_engagement": 0, "response_time": 0, "insight_quality": 0}',
  insights TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (teacher_id, period)
);

-- ==================== NOTIFICATIONS ====================

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('daily_checkin', 'ark_milestone', 'teacher_message', 'achievement', 'parent_report', 'system')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parent Reports
CREATE TABLE parent_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  content TEXT NOT NULL,
  sent_via TEXT NOT NULL CHECK (sent_via IN ('email', 'whatsapp', 'both')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== CERTIFICATES ====================

-- Certificates (blockchain-ready)
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  ark_id UUID NOT NULL REFERENCES arks(id) ON DELETE CASCADE,
  hash TEXT NOT NULL UNIQUE,
  metadata JSONB DEFAULT '{}',
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blockchain_tx TEXT
);

-- ==================== ROW LEVEL SECURITY (RLS) POLICIES ====================

-- Enable RLS on all tables
ALTER TABLE institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE arks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ark_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE ark_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotion_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE dropout_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_effectiveness ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Institutes: Admins can view their own institute
CREATE POLICY "Admins can view own institute" ON institutes
  FOR SELECT USING (
    id IN (SELECT institute_id FROM users WHERE id = auth.uid())
  );

-- Users: Users can view users from same institute
CREATE POLICY "Users can view same institute users" ON users
  FOR SELECT USING (
    institute_id IN (SELECT institute_id FROM users WHERE id = auth.uid())
  );

-- Students: Students see own data, teachers see assigned students, admins see all
CREATE POLICY "Students see own data" ON students
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Teachers see assigned students" ON students
  FOR SELECT USING (
    batch = ANY(SELECT UNNEST(assigned_batches) FROM teachers WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins see all students" ON students
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE institute_id IN (SELECT institute_id FROM users WHERE id = auth.uid() AND role = 'admin'))
  );

-- ARKs: Students see own, teachers see students' ARKs, admins see all
CREATE POLICY "Students see own ARKs" ON arks
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Teachers see assigned students ARKs" ON arks
  FOR SELECT USING (
    student_id IN (
      SELECT user_id FROM students WHERE batch = ANY(SELECT UNNEST(assigned_batches) FROM teachers WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Admins see all ARKs" ON arks
  FOR SELECT USING (
    student_id IN (SELECT id FROM users WHERE institute_id IN (SELECT institute_id FROM users WHERE id = auth.uid() AND role = 'admin'))
  );

-- Chat Sessions: Users can only access their own sessions
CREATE POLICY "Users access own chat sessions" ON chat_sessions
  FOR ALL USING (user_id = auth.uid());

-- Messages: Users can only access messages from their sessions
CREATE POLICY "Users access own messages" ON messages
  FOR ALL USING (
    session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid())
  );

-- Daily Check-ins: Students own, teachers can view assigned students
CREATE POLICY "Students own daily checkins" ON daily_checkins
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Teachers view students checkins" ON daily_checkins
  FOR SELECT USING (
    student_id IN (
      SELECT user_id FROM students WHERE batch = ANY(SELECT UNNEST(assigned_batches) FROM teachers WHERE user_id = auth.uid())
    )
  );

-- Student Stats: Read-only for students, admins can update
CREATE POLICY "Students view own stats" ON student_stats
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System updates stats" ON student_stats
  FOR ALL USING (true);

-- Notifications: Users see only their own
CREATE POLICY "Users see own notifications" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- ==================== INDEXES FOR PERFORMANCE ====================

CREATE INDEX idx_users_institute ON users(institute_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_students_batch ON students(batch);
CREATE INDEX idx_arks_student ON arks(student_id);
CREATE INDEX idx_arks_status ON arks(status);
CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX idx_messages_session ON messages(session_id);
CREATE INDEX idx_daily_checkins_student ON daily_checkins(student_id);
CREATE INDEX idx_daily_checkins_date ON daily_checkins(date);
CREATE INDEX idx_emotion_timeline_student ON emotion_timeline(student_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- ==================== TRIGGERS ====================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_arks_updated_at BEFORE UPDATE ON arks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== SEED DATA ====================

-- Insert default achievements
INSERT INTO achievements (id, type, title, description, criteria, icon_url) VALUES
  ('streak_3', 'streak', 'Getting Started', 'Complete 3 days of check-ins in a row', '{"streak_days": 3}', '/badges/streak-3.svg'),
  ('streak_7', 'streak', 'Week Warrior', 'Maintain a 7-day check-in streak', '{"streak_days": 7}', '/badges/streak-7.svg'),
  ('streak_30', 'streak', 'Monthly Master', 'Incredible! 30 days of consistent check-ins', '{"streak_days": 30}', '/badges/streak-30.svg'),
  ('ark_first', 'ark_completion', 'Roadmap Pioneer', 'Complete your first ARK', '{"arks_completed": 1}', '/badges/ark-first.svg'),
  ('checkin_first', 'daily_checkin', 'First Step', 'Complete your first daily check-in', '{"daily_checkins": 1}', '/badges/checkin-first.svg')
ON CONFLICT (id) DO NOTHING;

