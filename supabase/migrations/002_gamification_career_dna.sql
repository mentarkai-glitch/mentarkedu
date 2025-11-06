-- ==================== GAMIFICATION & CAREER DNA SCHEMA ====================
-- Migration: 002_gamification_career_dna
-- Description: Add gamification system and career DNA mapping tables

-- ==================== GAMIFICATION TABLES ====================

-- XP Transactions (track all XP gains)
CREATE TABLE xp_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL CHECK (source IN (
    'daily_checkin', 'ark_milestone', 'ark_completion', 'chat_message', 
    'chat_session', 'badge_earned', 'streak_bonus', 'level_bonus'
  )),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badge Awards (track earned badges)
CREATE TABLE badge_awards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_seen BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'
);

-- Coin Transactions (track coin economy)
CREATE TABLE coin_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Can be negative for spending
  type TEXT NOT NULL CHECK (type IN ('earn', 'spend', 'bonus')),
  source TEXT NOT NULL, -- 'xp_conversion', 'custom_ark', 'priority_mentor', etc.
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaderboard Entries (cached for performance)
CREATE TABLE leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  batch_id TEXT NOT NULL,
  xp_total INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  rank INTEGER,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, institute_id, batch_id)
);

-- ==================== CAREER DNA TABLES ====================

-- Career Categories (predefined career clusters)
CREATE TABLE career_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT, -- emoji or icon name
  color TEXT, -- hex color
  embedding VECTOR(1536), -- OpenAI ada-002 embedding
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Career Profiles (affinity scores for each category)
CREATE TABLE student_career_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES career_categories(id) ON DELETE CASCADE,
  affinity_score DECIMAL(3,2) NOT NULL CHECK (affinity_score >= 0 AND affinity_score <= 1),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, category_id)
);

-- Peer Matches (study buddy recommendations)
CREATE TABLE peer_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  matched_student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  compatibility_score DECIMAL(3,2) NOT NULL CHECK (compatibility_score >= 0 AND compatibility_score <= 1),
  match_type TEXT NOT NULL CHECK (match_type IN ('study_buddy', 'complementary', 'similar_interests')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'active')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (student_id != matched_student_id)
);

-- Study Groups (formed from peer matches)
CREATE TABLE study_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  batch_id TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  description TEXT,
  max_members INTEGER DEFAULT 4,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Group Members
CREATE TABLE study_group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  UNIQUE(group_id, student_id)
);

-- ==================== RLS POLICIES ====================

-- XP Transactions
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view their own XP transactions" ON xp_transactions
  FOR SELECT USING (
    student_id IN (
      SELECT user_id FROM students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert XP transactions" ON xp_transactions
  FOR INSERT WITH CHECK (true);

-- Badge Awards
ALTER TABLE badge_awards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view their own badges" ON badge_awards
  FOR SELECT USING (
    student_id IN (
      SELECT user_id FROM students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert badge awards" ON badge_awards
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Students can update badge seen status" ON badge_awards
  FOR UPDATE USING (
    student_id IN (
      SELECT user_id FROM students WHERE user_id = auth.uid()
    )
  );

-- Coin Transactions
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view their own coin transactions" ON coin_transactions
  FOR SELECT USING (
    student_id IN (
      SELECT user_id FROM students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert coin transactions" ON coin_transactions
  FOR INSERT WITH CHECK (true);

-- Leaderboard Entries
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view leaderboards from their institute" ON leaderboard_entries
  FOR SELECT USING (
    institute_id IN (
      SELECT institute_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "System can manage leaderboard entries" ON leaderboard_entries
  FOR ALL WITH CHECK (true);

-- Career Categories (public read)
ALTER TABLE career_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view career categories" ON career_categories
  FOR SELECT USING (true);

-- Student Career Profiles
ALTER TABLE student_career_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view their own career profile" ON student_career_profiles
  FOR SELECT USING (
    student_id IN (
      SELECT user_id FROM students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage career profiles" ON student_career_profiles
  FOR ALL WITH CHECK (true);

-- Peer Matches
ALTER TABLE peer_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view their own matches" ON peer_matches
  FOR SELECT USING (
    student_id IN (
      SELECT user_id FROM students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Students can update their own matches" ON peer_matches
  FOR UPDATE USING (
    student_id IN (
      SELECT user_id FROM students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert peer matches" ON peer_matches
  FOR INSERT WITH CHECK (true);

-- Study Groups
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view groups from their institute" ON study_groups
  FOR SELECT USING (
    institute_id IN (
      SELECT institute_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Students can create study groups" ON study_groups
  FOR INSERT WITH CHECK (
    created_by IN (
      SELECT user_id FROM students WHERE user_id = auth.uid()
    )
  );

-- Study Group Members
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view members of their groups" ON study_group_members
  FOR SELECT USING (
    group_id IN (
      SELECT group_id FROM study_group_members 
      WHERE student_id IN (
        SELECT user_id FROM students WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Students can join groups" ON study_group_members
  FOR INSERT WITH CHECK (
    student_id IN (
      SELECT user_id FROM students WHERE user_id = auth.uid()
    )
  );

-- ==================== INDEXES ====================

-- Gamification indexes
CREATE INDEX idx_xp_transactions_student_id ON xp_transactions(student_id);
CREATE INDEX idx_xp_transactions_created_at ON xp_transactions(created_at DESC);
CREATE INDEX idx_badge_awards_student_id ON badge_awards(student_id);
CREATE INDEX idx_coin_transactions_student_id ON coin_transactions(student_id);
CREATE INDEX idx_leaderboard_entries_institute_batch ON leaderboard_entries(institute_id, batch_id);
CREATE INDEX idx_leaderboard_entries_rank ON leaderboard_entries(rank);

-- Career DNA indexes
CREATE INDEX idx_student_career_profiles_student_id ON student_career_profiles(student_id);
CREATE INDEX idx_peer_matches_student_id ON peer_matches(student_id);
CREATE INDEX idx_peer_matches_status ON peer_matches(status);
CREATE INDEX idx_study_group_members_group_id ON study_group_members(group_id);
CREATE INDEX idx_study_group_members_student_id ON study_group_members(student_id);

-- ==================== FUNCTIONS ====================

-- Function to calculate total XP for a student
CREATE OR REPLACE FUNCTION get_student_total_xp(student_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(amount) FROM xp_transactions WHERE student_id = student_uuid),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate student level from XP
CREATE OR REPLACE FUNCTION calculate_student_level(total_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Level formula: level = floor(sqrt(xp / 100)) + 1
  -- This gives levels: 0-99 XP = Level 1, 100-399 XP = Level 2, etc.
  RETURN FLOOR(SQRT(total_xp / 100.0)) + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to update leaderboard rankings
CREATE OR REPLACE FUNCTION update_leaderboard_rankings()
RETURNS void AS $$
BEGIN
  WITH ranked_students AS (
    SELECT 
      student_id,
      institute_id,
      batch_id,
      xp_total,
      ROW_NUMBER() OVER (PARTITION BY institute_id, batch_id ORDER BY xp_total DESC) as new_rank,
      calculate_student_level(xp_total) as new_level
    FROM leaderboard_entries
  )
  UPDATE leaderboard_entries 
  SET 
    rank = ranked_students.new_rank,
    level = ranked_students.new_level,
    last_updated = NOW()
  FROM ranked_students
  WHERE leaderboard_entries.student_id = ranked_students.student_id
    AND leaderboard_entries.institute_id = ranked_students.institute_id
    AND leaderboard_entries.batch_id = ranked_students.batch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== TRIGGERS ====================

-- Trigger to update leaderboard when XP is added
CREATE OR REPLACE FUNCTION update_leaderboard_on_xp_change()
RETURNS TRIGGER AS $$
DECLARE
  student_institute_id UUID;
  student_batch_id TEXT;
  current_xp INTEGER;
BEGIN
  -- Get student's institute and batch
  SELECT institute_id INTO student_institute_id
  FROM users WHERE id = NEW.student_id;
  
  SELECT batch INTO student_batch_id
  FROM students WHERE user_id = NEW.student_id;
  
  -- Calculate total XP
  SELECT get_student_total_xp(NEW.student_id) INTO current_xp;
  
  -- Insert or update leaderboard entry
  INSERT INTO leaderboard_entries (student_id, institute_id, batch_id, xp_total, level)
  VALUES (NEW.student_id, student_institute_id, student_batch_id, current_xp, calculate_student_level(current_xp))
  ON CONFLICT (student_id, institute_id, batch_id)
  DO UPDATE SET 
    xp_total = current_xp,
    level = calculate_student_level(current_xp),
    last_updated = NOW();
  
  -- Update rankings
  PERFORM update_leaderboard_rankings();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_leaderboard_on_xp
  AFTER INSERT ON xp_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_leaderboard_on_xp_change();

-- ==================== ARK TEMPLATES (Institute-guided ARKs) ====================

-- ARK Templates created by teachers/admins for students
CREATE TABLE ark_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_batch TEXT,
  target_grade TEXT,
  milestones JSONB NOT NULL DEFAULT '[]',
  resources JSONB DEFAULT '[]',
  created_by UUID NOT NULL REFERENCES users(id),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for ARK Templates
ALTER TABLE ark_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view published templates from their institute" ON ark_templates
  FOR SELECT USING (
    is_published = TRUE AND
    institute_id IN (
      SELECT institute_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view all templates from their institute" ON ark_templates
  FOR SELECT USING (
    institute_id IN (
      SELECT institute_id FROM users WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers can create templates" ON ark_templates
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    created_by IN (
      SELECT id FROM users WHERE role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers can update their own templates" ON ark_templates
  FOR UPDATE USING (
    created_by = auth.uid()
  );

CREATE POLICY "Teachers can delete their own templates" ON ark_templates
  FOR DELETE USING (
    created_by = auth.uid()
  );

-- Indexes for ARK Templates
CREATE INDEX idx_ark_templates_institute ON ark_templates(institute_id);
CREATE INDEX idx_ark_templates_category ON ark_templates(category_id);
CREATE INDEX idx_ark_templates_published ON ark_templates(is_published);
CREATE INDEX idx_ark_templates_grade ON ark_templates(target_grade);

-- ==================== INITIAL DATA ====================

-- Insert career categories
INSERT INTO career_categories (name, description, icon, color) VALUES
('Technology & Engineering', 'Software development, AI/ML, robotics, cybersecurity', '💻', '#3B82F6'),
('Medicine & Healthcare', 'Doctor, nurse, researcher, therapist, public health', '🏥', '#EF4444'),
('Business & Finance', 'Entrepreneurship, investment, consulting, marketing', '💼', '#10B981'),
('Arts & Creative', 'Design, music, writing, film, photography, animation', '🎨', '#8B5CF6'),
('Science & Research', 'Physics, chemistry, biology, environmental science', '🔬', '#06B6D4'),
('Education & Training', 'Teaching, curriculum design, educational technology', '📚', '#F59E0B'),
('Law & Public Service', 'Lawyer, judge, politician, social worker', '⚖️', '#6B7280'),
('Sports & Fitness', 'Professional athlete, coach, sports medicine', '⚽', '#84CC16'),
('Media & Communication', 'Journalism, broadcasting, content creation, PR', '📺', '#EC4899'),
('Agriculture & Environment', 'Farming, sustainability, conservation, forestry', '🌱', '#22C55E');

-- Insert sample achievements/badges
INSERT INTO achievements (type, title, description, criteria, icon_url) VALUES
('streak', 'Early Bird', 'Check in for 7 consecutive days', '{"days": 7}', '🐦'),
('ark_completion', 'ARK Master', 'Complete your first ARK', '{"arks": 1}', '🎯'),
('daily_checkin', 'Consistent Learner', 'Complete 30 daily check-ins', '{"checkins": 30}', '📅'),
('chat_engagement', 'Chat Champion', 'Have 50 conversations with AI mentor', '{"messages": 50}', '💬'),
('streak', 'Fire Keeper', 'Maintain a 30-day streak', '{"days": 30}', '🔥'),
('ark_completion', 'Multi-Tasker', 'Complete 5 different ARKs', '{"arks": 5}', '🌟'),
('milestone', 'Goal Crusher', 'Complete 10 ARK milestones', '{"milestones": 10}', '💪'),
('chat_engagement', 'Deep Thinker', 'Have 100 meaningful conversations', '{"messages": 100}', '🧠');
