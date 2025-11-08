-- ==================== ML DATA COLLECTION SCHEMA ====================
-- Migration: 014_ml_data_collection
-- Description: Tables for ML model training data collection and feature storage

-- ==================== FEATURE STORE ====================

-- ML Feature Store: Store computed feature vectors for fast ML inference
CREATE TABLE IF NOT EXISTS ml_feature_store (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  feature_version TEXT NOT NULL DEFAULT '1.0.0',
  features JSONB NOT NULL,
  extraction_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_ml_feature_store_student_id ON ml_feature_store(student_id);
CREATE INDEX IF NOT EXISTS idx_ml_feature_store_timestamp ON ml_feature_store(extraction_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ml_feature_store_version ON ml_feature_store(feature_version);

-- ==================== TRAINING DATA ====================

-- ML Training Data: Labeled examples for model training
CREATE TABLE IF NOT EXISTS ml_training_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  feature_vector_id UUID REFERENCES ml_feature_store(id) ON DELETE SET NULL,
  label_type TEXT NOT NULL CHECK (label_type IN ('dropout', 'burnout', 'career_success', 'ark_difficulty', 'sentiment')),
  label_value JSONB NOT NULL,
  label_confidence DECIMAL(3,2) DEFAULT 1.0 CHECK (label_confidence >= 0 AND label_confidence <= 1),
  labeled_by TEXT, -- 'admin', 'teacher', 'automated', 'system'
  labeled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for training data queries
CREATE INDEX IF NOT EXISTS idx_ml_training_data_student_id ON ml_training_data(student_id);
CREATE INDEX IF NOT EXISTS idx_ml_training_data_label_type ON ml_training_data(label_type);
CREATE INDEX IF NOT EXISTS idx_ml_training_data_labeled_at ON ml_training_data(labeled_at DESC);

-- ==================== MODEL VERSIONS ====================

-- ML Model Versions: Track model versions and metadata
CREATE TABLE IF NOT EXISTS ml_model_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_name TEXT NOT NULL,
  version TEXT NOT NULL,
  model_type TEXT NOT NULL CHECK (model_type IN ('dropout', 'burnout', 'career', 'difficulty', 'sentiment')),
  training_data_count INTEGER DEFAULT 0,
  accuracy_metrics JSONB DEFAULT '{}',
  hyperparameters JSONB DEFAULT '{}',
  model_path TEXT, -- Path to model file (S3, GCS, etc.)
  deployed BOOLEAN DEFAULT FALSE,
  deployed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(model_name, version)
);

-- Index for model version queries
CREATE INDEX IF NOT EXISTS idx_ml_model_versions_model_type ON ml_model_versions(model_type);
CREATE INDEX IF NOT EXISTS idx_ml_model_versions_deployed ON ml_model_versions(deployed, deployed_at DESC);

-- ==================== DATA COLLECTION EVENTS ====================

-- Data Collection Events: Track student actions for feature engineering
CREATE TABLE IF NOT EXISTS data_collection_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'checkin_completed', 'checkin_skipped', 'ark_created', 'ark_completed', 
    'ark_paused', 'milestone_completed', 'milestone_started', 'chat_message_sent',
    'chat_session_started', 'resource_viewed', 'resource_completed', 
    'intervention_created', 'intervention_acknowledged', 'xp_earned', 
    'badge_earned', 'streak_broken', 'streak_continued', 'goal_set', 
    'goal_achieved', 'peer_match_viewed', 'study_session_started', 
    'study_session_ended', 'doubt_asked', 'doubt_resolved'
  )),
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for event queries
CREATE INDEX IF NOT EXISTS idx_data_collection_events_student_id ON data_collection_events(student_id);
CREATE INDEX IF NOT EXISTS idx_data_collection_events_event_type ON data_collection_events(event_type);
CREATE INDEX IF NOT EXISTS idx_data_collection_events_timestamp ON data_collection_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_data_collection_events_student_timestamp ON data_collection_events(student_id, timestamp DESC);

-- ==================== STUDENT OUTCOMES ====================

-- Student Outcomes: Ground truth labels for training (dropout, burnout, success)
CREATE TABLE IF NOT EXISTS student_outcomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  outcome_type TEXT NOT NULL CHECK (outcome_type IN ('dropout', 'burnout', 'success', 'career_placement', 'academic_achievement')),
  outcome_value TEXT NOT NULL,
  outcome_date DATE,
  confirmed BOOLEAN DEFAULT FALSE,
  confirmed_by UUID REFERENCES users(id),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for outcome queries
CREATE INDEX IF NOT EXISTS idx_student_outcomes_student_id ON student_outcomes(student_id);
CREATE INDEX IF NOT EXISTS idx_student_outcomes_outcome_type ON student_outcomes(outcome_type);
CREATE INDEX IF NOT EXISTS idx_student_outcomes_confirmed ON student_outcomes(confirmed, outcome_date);

-- ==================== RLS POLICIES ====================

-- Enable RLS on all tables
ALTER TABLE ml_feature_store ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_model_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_collection_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_outcomes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ml_feature_store
CREATE POLICY "Students can view their own features"
  ON ml_feature_store FOR SELECT
  USING (
    student_id IN (
      SELECT user_id FROM students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all features"
  ON ml_feature_store FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert features"
  ON ml_feature_store FOR INSERT
  WITH CHECK (true); -- Service role can insert

-- RLS Policies for ml_training_data
CREATE POLICY "Admins can manage training data"
  ON ml_training_data FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for ml_model_versions
CREATE POLICY "Admins can manage model versions"
  ON ml_model_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for data_collection_events
CREATE POLICY "Students can view their own events"
  ON data_collection_events FOR SELECT
  USING (
    student_id IN (
      SELECT user_id FROM students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert events"
  ON data_collection_events FOR INSERT
  WITH CHECK (true); -- Service role can insert

CREATE POLICY "Admins can view all events"
  ON data_collection_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for student_outcomes
CREATE POLICY "Admins can manage outcomes"
  ON student_outcomes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view outcomes for their students"
  ON student_outcomes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teachers t
      JOIN students s ON s.batch = ANY(t.assigned_batches)
      WHERE s.user_id = student_outcomes.student_id
      AND t.user_id = auth.uid()
    )
  );

-- ==================== FUNCTIONS ====================

-- Function to automatically label training data from outcomes
CREATE OR REPLACE FUNCTION auto_label_training_data()
RETURNS TRIGGER AS $$
BEGIN
  -- When a student outcome is confirmed, create training data labels
  IF NEW.confirmed = TRUE AND OLD.confirmed = FALSE THEN
    -- Get the most recent feature vector for this student
    INSERT INTO ml_training_data (
      student_id,
      feature_vector_id,
      label_type,
      label_value,
      label_confidence,
      labeled_by
    )
    SELECT 
      NEW.student_id,
      mfs.id,
      CASE 
        WHEN NEW.outcome_type = 'dropout' THEN 'dropout'
        WHEN NEW.outcome_type = 'burnout' THEN 'burnout'
        WHEN NEW.outcome_type = 'career_placement' THEN 'career_success'
        ELSE 'career_success'
      END,
      jsonb_build_object(
        'outcome_type', NEW.outcome_type,
        'outcome_value', NEW.outcome_value,
        'outcome_date', NEW.outcome_date
      ),
      1.0,
      'automated'
    FROM ml_feature_store mfs
    WHERE mfs.student_id = NEW.student_id
    ORDER BY mfs.extraction_timestamp DESC
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-label training data
CREATE TRIGGER trigger_auto_label_training_data
  AFTER UPDATE ON student_outcomes
  FOR EACH ROW
  EXECUTE FUNCTION auto_label_training_data();

-- ==================== COMMENTS ====================

COMMENT ON TABLE ml_feature_store IS 'Stores computed ML feature vectors for fast inference';
COMMENT ON TABLE ml_training_data IS 'Labeled training examples for ML model training';
COMMENT ON TABLE ml_model_versions IS 'Tracks ML model versions and deployment status';
COMMENT ON TABLE data_collection_events IS 'Tracks student actions and events for feature engineering';
COMMENT ON TABLE student_outcomes IS 'Ground truth labels for ML model training (dropout, burnout, success)';


