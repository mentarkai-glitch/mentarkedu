-- ==================== ML DROPOUT RISK & SENTIMENT TIMELINE ====================
-- Migration: 004_ml_risk_sentiment
-- Description: Dropout risk prediction and sentiment timeline tracking

-- ==================== DROPOUT RISK PREDICTION ====================

-- Behavioral Patterns (features for ML model)
CREATE TABLE behavioral_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  pattern_date DATE NOT NULL,
  
  -- Engagement metrics
  daily_checkin_completed BOOLEAN DEFAULT FALSE,
  chat_message_count INTEGER DEFAULT 0,
  ark_progress_delta DECIMAL(5,2) DEFAULT 0, -- Progress change %
  time_spent_minutes INTEGER DEFAULT 0,
  
  -- Emotional metrics
  avg_energy_level DECIMAL(3,2), -- 0-10 scale
  avg_emotion_score DECIMAL(3,2), -- 0-10 scale
  avg_progress_rating DECIMAL(3,2), -- 0-10 scale
  stress_level DECIMAL(3,2),
  motivation_level DECIMAL(3,2),
  confidence_level DECIMAL(3,2),
  
  -- Performance metrics
  milestone_completed_count INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  
  -- Risk indicators
  missed_checkin_streak INTEGER DEFAULT 0,
  declining_progress_days INTEGER DEFAULT 0,
  high_stress_days INTEGER DEFAULT 0,
  low_motivation_days INTEGER DEFAULT 0,
  intervention_count INTEGER DEFAULT 0,
  
  -- Calculated features
  engagement_score DECIMAL(5,2), -- 0-100
  wellbeing_score DECIMAL(5,2), -- 0-100
  performance_score DECIMAL(5,2), -- 0-100
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, pattern_date)
);

-- Risk Predictions (ML model outputs)
CREATE TABLE risk_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  prediction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Risk scores (0-100)
  dropout_risk_score INTEGER NOT NULL CHECK (dropout_risk_score >= 0 AND dropout_risk_score <= 100),
  burnout_risk_score INTEGER NOT NULL CHECK (burnout_risk_score >= 0 AND burnout_risk_score <= 100),
  disengagement_risk_score INTEGER NOT NULL CHECK (disengagement_risk_score >= 0 AND disengagement_risk_score <= 100),
  
  -- Risk level
  risk_level TEXT NOT NULL CHECK (risk_level IN ('critical', 'high', 'medium', 'low')),
  
  -- Contributing factors
  primary_risk_factors JSONB DEFAULT '[]',
  protective_factors JSONB DEFAULT '[]',
  
  -- Recommendations
  recommended_interventions JSONB DEFAULT '[]',
  early_warning_flags JSONB DEFAULT '[]',
  
  -- Model metadata
  model_version TEXT,
  confidence_score DECIMAL(3,2), -- Model confidence 0-1
  
  -- Prediction validity
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Risk Alerts (triggered when risk crosses threshold)
CREATE TABLE risk_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(user_id),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('dropout_risk', 'burnout_risk', 'disengagement_risk', 'sudden_change')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  message TEXT NOT NULL,
  risk_score INTEGER NOT NULL,
  recommended_actions JSONB DEFAULT '[]',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'addressed', 'resolved', 'false_alarm')),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== SENTIMENT TIMELINE ====================

-- Sentiment Records (daily sentiment analysis)
CREATE TABLE sentiment_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  
  -- Sentiment scores (AI-analyzed from check-ins and chats)
  overall_sentiment DECIMAL(3,2) NOT NULL, -- -1 to 1 (negative to positive)
  emotional_valence DECIMAL(3,2), -- -1 to 1
  arousal_level DECIMAL(3,2), -- 0 to 1 (calm to excited)
  
  -- Emotion categories (0-1 scores)
  joy DECIMAL(3,2) DEFAULT 0,
  sadness DECIMAL(3,2) DEFAULT 0,
  anger DECIMAL(3,2) DEFAULT 0,
  fear DECIMAL(3,2) DEFAULT 0,
  surprise DECIMAL(3,2) DEFAULT 0,
  trust DECIMAL(3,2) DEFAULT 0,
  
  -- Text sources analyzed
  checkin_analyzed BOOLEAN DEFAULT FALSE,
  chat_messages_analyzed INTEGER DEFAULT 0,
  total_text_length INTEGER DEFAULT 0,
  
  -- Sentiment trends
  sentiment_change_from_previous DECIMAL(3,2), -- Delta from yesterday
  sentiment_7day_avg DECIMAL(3,2),
  sentiment_30day_avg DECIMAL(3,2),
  
  -- Analysis metadata
  ai_model_used TEXT,
  confidence_score DECIMAL(3,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, record_date)
);

-- Events (for correlation analysis)
CREATE TABLE student_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'ark_created', 'ark_completed', 'milestone_completed',
    'badge_earned', 'level_up', 'streak_broken', 'streak_milestone',
    'intervention_received', 'teacher_meeting', 'exam_scheduled',
    'grade_received', 'achievement_unlocked', 'peer_match_accepted',
    'check_in_milestone', 'custom'
  )),
  event_title TEXT NOT NULL,
  event_description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Event impact
  sentiment_before DECIMAL(3,2),
  sentiment_after DECIMAL(3,2),
  sentiment_impact DECIMAL(3,2), -- Calculated difference
  
  -- Event metadata
  metadata JSONB DEFAULT '{}',
  
  -- Correlation tracking
  is_positive_event BOOLEAN,
  is_milestone BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event-Sentiment Correlations (ML-discovered patterns)
CREATE TABLE event_sentiment_correlations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  
  -- Correlation metrics
  correlation_strength DECIMAL(3,2) NOT NULL, -- -1 to 1
  avg_sentiment_impact DECIMAL(3,2), -- Average change in sentiment
  occurrence_count INTEGER DEFAULT 1,
  
  -- Pattern details
  typical_delay_hours INTEGER, -- How long after event does sentiment change
  consistency_score DECIMAL(3,2), -- How consistent is this pattern
  
  -- Last occurrence
  last_event_date TIMESTAMP WITH TIME ZONE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(student_id, event_type)
);

-- Sentiment Anomalies (sudden changes worth investigating)
CREATE TABLE sentiment_anomalies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  anomaly_date DATE NOT NULL,
  
  -- Anomaly details
  sentiment_score DECIMAL(3,2) NOT NULL,
  expected_score DECIMAL(3,2) NOT NULL,
  deviation DECIMAL(3,2) NOT NULL, -- Absolute difference
  
  -- Anomaly type
  anomaly_type TEXT CHECK (anomaly_type IN ('sudden_drop', 'sudden_spike', 'unusual_pattern')),
  severity TEXT CHECK (severity IN ('minor', 'moderate', 'severe')),
  
  -- Potential causes (AI-analyzed)
  potential_triggers JSONB DEFAULT '[]',
  correlated_events JSONB DEFAULT '[]',
  
  -- Investigation status
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'investigating', 'explained', 'resolved')),
  investigation_notes TEXT,
  investigated_by UUID REFERENCES users(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== RLS POLICIES ====================

-- Behavioral Patterns
ALTER TABLE behavioral_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own patterns" ON behavioral_patterns
  FOR SELECT USING (
    student_id = auth.uid()
  );

CREATE POLICY "Teachers can view assigned student patterns" ON behavioral_patterns
  FOR SELECT USING (
    student_id IN (
      SELECT student_id FROM teacher_student_assignments 
      WHERE teacher_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "System can insert patterns" ON behavioral_patterns
  FOR INSERT WITH CHECK (true);

-- Risk Predictions
ALTER TABLE risk_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own predictions" ON risk_predictions
  FOR SELECT USING (
    student_id = auth.uid()
  );

CREATE POLICY "Teachers can view assigned student predictions" ON risk_predictions
  FOR SELECT USING (
    student_id IN (
      SELECT student_id FROM teacher_student_assignments 
      WHERE teacher_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "Admins can view all predictions in institute" ON risk_predictions
  FOR SELECT USING (
    student_id IN (
      SELECT s.user_id FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE u.institute_id IN (
        SELECT institute_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "System can insert predictions" ON risk_predictions
  FOR INSERT WITH CHECK (true);

-- Risk Alerts
ALTER TABLE risk_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own alerts" ON risk_alerts
  FOR SELECT USING (
    student_id = auth.uid()
  );

CREATE POLICY "Teachers can view alerts for assigned students" ON risk_alerts
  FOR SELECT USING (
    teacher_id = auth.uid() OR
    student_id IN (
      SELECT student_id FROM teacher_student_assignments 
      WHERE teacher_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "Teachers can update alert status" ON risk_alerts
  FOR UPDATE USING (
    teacher_id = auth.uid()
  );

-- Sentiment Records
ALTER TABLE sentiment_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own sentiment" ON sentiment_records
  FOR SELECT USING (
    student_id = auth.uid()
  );

CREATE POLICY "Teachers can view assigned student sentiment" ON sentiment_records
  FOR SELECT USING (
    student_id IN (
      SELECT student_id FROM teacher_student_assignments 
      WHERE teacher_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "System can manage sentiment records" ON sentiment_records
  FOR ALL WITH CHECK (true);

-- Student Events
ALTER TABLE student_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own events" ON student_events
  FOR SELECT USING (
    student_id = auth.uid()
  );

CREATE POLICY "Teachers can view assigned student events" ON student_events
  FOR SELECT USING (
    student_id IN (
      SELECT student_id FROM teacher_student_assignments 
      WHERE teacher_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "System can insert events" ON student_events
  FOR INSERT WITH CHECK (true);

-- Event-Sentiment Correlations
ALTER TABLE event_sentiment_correlations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own correlations" ON event_sentiment_correlations
  FOR SELECT USING (
    student_id = auth.uid()
  );

CREATE POLICY "Teachers can view assigned student correlations" ON event_sentiment_correlations
  FOR SELECT USING (
    student_id IN (
      SELECT student_id FROM teacher_student_assignments 
      WHERE teacher_id = auth.uid() AND is_active = TRUE
    )
  );

-- Sentiment Anomalies
ALTER TABLE sentiment_anomalies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own anomalies" ON sentiment_anomalies
  FOR SELECT USING (
    student_id = auth.uid()
  );

CREATE POLICY "Teachers can view and investigate anomalies" ON sentiment_anomalies
  FOR ALL USING (
    student_id IN (
      SELECT student_id FROM teacher_student_assignments 
      WHERE teacher_id = auth.uid() AND is_active = TRUE
    )
  );

-- ==================== INDEXES ====================

-- Behavioral Patterns
CREATE INDEX idx_behavioral_patterns_student ON behavioral_patterns(student_id);
CREATE INDEX idx_behavioral_patterns_date ON behavioral_patterns(pattern_date DESC);
CREATE INDEX idx_behavioral_patterns_engagement ON behavioral_patterns(engagement_score DESC);

-- Risk Predictions
CREATE INDEX idx_risk_predictions_student ON risk_predictions(student_id);
CREATE INDEX idx_risk_predictions_date ON risk_predictions(prediction_date DESC);
CREATE INDEX idx_risk_predictions_active ON risk_predictions(is_active);
CREATE INDEX idx_risk_predictions_level ON risk_predictions(risk_level);
CREATE INDEX idx_risk_predictions_dropout_score ON risk_predictions(dropout_risk_score DESC);

-- Risk Alerts
CREATE INDEX idx_risk_alerts_student ON risk_alerts(student_id);
CREATE INDEX idx_risk_alerts_teacher ON risk_alerts(teacher_id);
CREATE INDEX idx_risk_alerts_status ON risk_alerts(status);
CREATE INDEX idx_risk_alerts_severity ON risk_alerts(severity);
CREATE INDEX idx_risk_alerts_created ON risk_alerts(created_at DESC);

-- Sentiment Records
CREATE INDEX idx_sentiment_records_student ON sentiment_records(student_id);
CREATE INDEX idx_sentiment_records_date ON sentiment_records(record_date DESC);
CREATE INDEX idx_sentiment_records_sentiment ON sentiment_records(overall_sentiment);

-- Student Events
CREATE INDEX idx_student_events_student ON student_events(student_id);
CREATE INDEX idx_student_events_date ON student_events(event_date DESC);
CREATE INDEX idx_student_events_type ON student_events(event_type);
CREATE INDEX idx_student_events_positive ON student_events(is_positive_event);

-- Event Correlations
CREATE INDEX idx_event_correlations_student ON event_sentiment_correlations(student_id);
CREATE INDEX idx_event_correlations_type ON event_sentiment_correlations(event_type);
CREATE INDEX idx_event_correlations_strength ON event_sentiment_correlations(correlation_strength DESC);

-- Sentiment Anomalies
CREATE INDEX idx_sentiment_anomalies_student ON sentiment_anomalies(student_id);
CREATE INDEX idx_sentiment_anomalies_date ON sentiment_anomalies(anomaly_date DESC);
CREATE INDEX idx_sentiment_anomalies_severity ON sentiment_anomalies(severity);
CREATE INDEX idx_sentiment_anomalies_status ON sentiment_anomalies(status);

-- ==================== FUNCTIONS ====================

-- Calculate daily behavioral pattern
CREATE OR REPLACE FUNCTION calculate_daily_behavioral_pattern(
  p_student_id UUID,
  p_date DATE
)
RETURNS VOID AS $$
DECLARE
  v_checkin_completed BOOLEAN;
  v_chat_count INTEGER;
  v_energy DECIMAL(3,2);
  v_emotion DECIMAL(3,2);
  v_progress DECIMAL(3,2);
  v_xp_earned INTEGER;
BEGIN
  -- Get daily check-in data
  SELECT 
    TRUE,
    COALESCE(energy_level, 5),
    COALESCE(emotion_score, 5),
    COALESCE(progress_rating, 5)
  INTO v_checkin_completed, v_energy, v_emotion, v_progress
  FROM daily_checkins
  WHERE student_id = p_student_id 
    AND DATE(created_at) = p_date
  LIMIT 1;

  -- Get chat activity
  SELECT COUNT(*) INTO v_chat_count
  FROM messages
  WHERE user_id = p_student_id 
    AND DATE(created_at) = p_date;

  -- Get XP earned
  SELECT COALESCE(SUM(amount), 0) INTO v_xp_earned
  FROM xp_transactions
  WHERE student_id = p_student_id 
    AND DATE(created_at) = p_date;

  -- Calculate engagement score
  DECLARE
    v_engagement DECIMAL(5,2);
  BEGIN
    v_engagement := (
      (CASE WHEN v_checkin_completed THEN 30 ELSE 0 END) +
      (LEAST(v_chat_count * 5, 40)) +
      (LEAST(v_xp_earned / 10, 30))
    );

    -- Insert or update behavioral pattern
    INSERT INTO behavioral_patterns (
      student_id,
      pattern_date,
      daily_checkin_completed,
      chat_message_count,
      avg_energy_level,
      avg_emotion_score,
      avg_progress_rating,
      xp_earned,
      engagement_score
    ) VALUES (
      p_student_id,
      p_date,
      COALESCE(v_checkin_completed, FALSE),
      COALESCE(v_chat_count, 0),
      v_energy,
      v_emotion,
      v_progress,
      v_xp_earned,
      v_engagement
    )
    ON CONFLICT (student_id, pattern_date)
    DO UPDATE SET
      daily_checkin_completed = EXCLUDED.daily_checkin_completed,
      chat_message_count = EXCLUDED.chat_message_count,
      avg_energy_level = EXCLUDED.avg_energy_level,
      avg_emotion_score = EXCLUDED.avg_emotion_score,
      avg_progress_rating = EXCLUDED.avg_progress_rating,
      xp_earned = EXCLUDED.xp_earned,
      engagement_score = EXCLUDED.engagement_score;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-record student events
CREATE OR REPLACE FUNCTION record_student_event()
RETURNS TRIGGER AS $$
DECLARE
  v_event_type TEXT;
  v_event_title TEXT;
  v_is_positive BOOLEAN;
BEGIN
  -- Determine event type based on table
  IF TG_TABLE_NAME = 'arks' AND NEW.status = 'completed' THEN
    v_event_type := 'ark_completed';
    v_event_title := 'ARK Completed: ' || NEW.title;
    v_is_positive := TRUE;
  ELSIF TG_TABLE_NAME = 'badge_awards' THEN
    v_event_type := 'badge_earned';
    v_event_title := 'Badge Earned';
    v_is_positive := TRUE;
  ELSIF TG_TABLE_NAME = 'ark_milestones' AND NEW.status = 'completed' THEN
    v_event_type := 'milestone_completed';
    v_event_title := 'Milestone Completed: ' || NEW.title;
    v_is_positive := TRUE;
  ELSIF TG_TABLE_NAME = 'interventions' THEN
    v_event_type := 'intervention_received';
    v_event_title := 'Intervention: ' || NEW.title;
    v_is_positive := FALSE;
  END IF;

  IF v_event_type IS NOT NULL THEN
    INSERT INTO student_events (
      student_id,
      event_type,
      event_title,
      event_date,
      is_positive_event,
      metadata
    ) VALUES (
      COALESCE(NEW.student_id, NEW.user_id),
      v_event_type,
      v_event_title,
      NOW(),
      v_is_positive,
      jsonb_build_object('table', TG_TABLE_NAME, 'record_id', NEW.id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto-event recording
CREATE TRIGGER trigger_record_ark_completed
  AFTER UPDATE ON arks
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION record_student_event();

CREATE TRIGGER trigger_record_badge_earned
  AFTER INSERT ON badge_awards
  FOR EACH ROW
  EXECUTE FUNCTION record_student_event();

CREATE TRIGGER trigger_record_intervention
  AFTER INSERT ON interventions
  FOR EACH ROW
  EXECUTE FUNCTION record_student_event();

-- ==================== INITIAL DATA ====================

-- Create sample risk prediction for testing
-- (Will be replaced with real ML predictions)

