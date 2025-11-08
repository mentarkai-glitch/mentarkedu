-- ==================== ML RISK PREDICTIONS ====================
-- Migration: 015_ml_risk_predictions
-- Description: Tables to store ML risk predictions and alert workflows

-- Risk predictions (dropout, burnout, disengagement)
CREATE TABLE IF NOT EXISTS risk_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  prediction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  dropout_risk_score NUMERIC(5,2) NOT NULL,
  burnout_risk_score NUMERIC(5,2) NOT NULL,
  disengagement_risk_score NUMERIC(5,2) NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('critical', 'high', 'medium', 'low')),
  primary_risk_factors TEXT[] DEFAULT '{}',
  protective_factors TEXT[] DEFAULT '{}',
  recommended_interventions JSONB DEFAULT '[]',
  early_warning_flags TEXT[] DEFAULT '{}',
  model_version TEXT NOT NULL,
  model_source TEXT DEFAULT 'rule_based',
  confidence_score NUMERIC(5,2) DEFAULT 0.75,
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_risk_predictions_student ON risk_predictions(student_id);
CREATE INDEX IF NOT EXISTS idx_risk_predictions_active ON risk_predictions(is_active, prediction_date DESC);

-- Risk alerts routed to teachers/admins
CREATE TABLE IF NOT EXISTS risk_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(user_id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('dropout_risk', 'burnout_risk', 'disengagement_risk', 'sudden_change')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  message TEXT NOT NULL,
  risk_score NUMERIC(5,2) NOT NULL,
  recommended_actions JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'addressed', 'resolved', 'false_alarm')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_risk_alerts_student ON risk_alerts(student_id);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_status ON risk_alerts(status, created_at DESC);

-- ============== ROW LEVEL SECURITY =================
ALTER TABLE risk_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_alerts ENABLE ROW LEVEL SECURITY;

-- Students can view their own predictions
CREATE POLICY "Students view own risk predictions"
  ON risk_predictions FOR SELECT
  USING (student_id = auth.uid());

-- Admins can manage all predictions
CREATE POLICY "Admins manage risk predictions"
  ON risk_predictions FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

-- Teachers can view predictions for assigned students
CREATE POLICY "Teachers view batch predictions"
  ON risk_predictions FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM teachers t
      JOIN students s ON s.user_id = risk_predictions.student_id
      WHERE t.user_id = auth.uid()
        AND s.batch = ANY(t.assigned_batches)
    )
  );

-- Risk alerts policies
CREATE POLICY "Admins manage risk alerts"
  ON risk_alerts FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()));

CREATE POLICY "Teachers view assigned alerts"
  ON risk_alerts FOR SELECT
  USING (
    teacher_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM teachers t
      JOIN students s ON s.user_id = risk_alerts.student_id
      WHERE t.user_id = auth.uid()
        AND s.batch = ANY(t.assigned_batches)
    )
  );

CREATE POLICY "Students view own alerts"
  ON risk_alerts FOR SELECT
  USING (student_id = auth.uid());
