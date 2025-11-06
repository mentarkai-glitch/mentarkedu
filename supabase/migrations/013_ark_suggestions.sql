-- ARK Suggestion Overrides Migration
-- Allows institutes to customize suggestion options per category

CREATE TABLE IF NOT EXISTS ark_suggestion_overrides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institute_id UUID REFERENCES institutes(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL CHECK (category_id IN (
    'academic_excellence',
    'career_preparation',
    'personal_development',
    'emotional_wellbeing',
    'social_relationships',
    'life_skills'
  )),
  suggestion_type TEXT NOT NULL, -- 'exam', 'goal', 'challenge', 'field', 'skill', etc.
  suggestion_text TEXT NOT NULL,
  priority INTEGER DEFAULT 0, -- Higher priority = shows first
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_suggestion_overrides_institute_category 
  ON ark_suggestion_overrides(institute_id, category_id, suggestion_type);

CREATE INDEX IF NOT EXISTS idx_suggestion_overrides_active 
  ON ark_suggestion_overrides(is_active, priority DESC);

-- RLS Policies
ALTER TABLE ark_suggestion_overrides ENABLE ROW LEVEL SECURITY;

-- Students can view active suggestions from their institute
CREATE POLICY "Students can view institute suggestions"
  ON ark_suggestion_overrides
  FOR SELECT
  USING (
    is_active = TRUE 
    AND institute_id IN (
      SELECT institute_id FROM students WHERE user_id = auth.uid()
    )
  );

-- Teachers can view and create suggestions for their institute
CREATE POLICY "Teachers can manage institute suggestions"
  ON ark_suggestion_overrides
  FOR ALL
  USING (
    institute_id IN (
      SELECT institute_id FROM teachers WHERE user_id = auth.uid()
    )
  );

-- Admins have full access
CREATE POLICY "Admins can manage all suggestions"
  ON ark_suggestion_overrides
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE user_id = auth.uid()
    )
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_ark_suggestion_overrides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ark_suggestion_overrides_updated_at
  BEFORE UPDATE ON ark_suggestion_overrides
  FOR EACH ROW
  EXECUTE FUNCTION update_ark_suggestion_overrides_updated_at();

COMMENT ON TABLE ark_suggestion_overrides IS 'Custom suggestion overrides for ARK creation per institute';
COMMENT ON COLUMN ark_suggestion_overrides.priority IS 'Higher priority suggestions appear first in dropdowns';

