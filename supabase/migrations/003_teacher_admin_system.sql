-- ==================== TEACHER & ADMIN SYSTEM ====================
-- Migration: 003_teacher_admin_system
-- Description: Teacher-student assignments, interventions, and billing management

-- ==================== TEACHER-STUDENT ASSIGNMENTS ====================

-- Teacher-Student Assignment Table
CREATE TABLE teacher_student_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES teachers(user_id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  batch TEXT NOT NULL,
  subject TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(teacher_id, student_id)
);

-- ==================== INTERVENTION SYSTEM ====================

-- Intervention Records
CREATE TABLE interventions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES teachers(user_id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('note', 'meeting', 'task', 'alert', 'praise')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  metadata JSONB DEFAULT '{}'
);

-- ==================== INSTITUTE BILLING ====================

-- Institute Billing Information
CREATE TABLE institute_billing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('neuro', 'quantum')),
  student_count INTEGER NOT NULL DEFAULT 0,
  amount_per_student DECIMAL(10,2) NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  next_billing_date DATE,
  last_payment_date DATE,
  last_payment_amount DECIMAL(10,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'trial', 'suspended', 'cancelled')),
  trial_ends_at DATE,
  discount_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(institute_id)
);

-- Payment History
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  billing_id UUID REFERENCES institute_billing(id),
  amount DECIMAL(10,2) NOT NULL,
  student_count INTEGER NOT NULL,
  plan_type TEXT NOT NULL,
  payment_method TEXT,
  transaction_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invoice_url TEXT,
  metadata JSONB DEFAULT '{}'
);

-- ==================== BATCH ANALYTICS CACHE ====================

-- Cached batch analytics for performance
CREATE TABLE batch_analytics_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  batch TEXT NOT NULL,
  teacher_id UUID REFERENCES teachers(user_id),
  student_count INTEGER DEFAULT 0,
  active_arks_count INTEGER DEFAULT 0,
  completed_arks_count INTEGER DEFAULT 0,
  avg_completion_rate DECIMAL(5,2) DEFAULT 0,
  avg_motivation DECIMAL(3,2) DEFAULT 0,
  avg_stress DECIMAL(3,2) DEFAULT 0,
  avg_confidence DECIMAL(3,2) DEFAULT 0,
  high_risk_count INTEGER DEFAULT 0,
  medium_risk_count INTEGER DEFAULT 0,
  low_risk_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(institute_id, batch, teacher_id)
);

-- ==================== TEACHER NOTES ====================

-- Private teacher notes about students
CREATE TABLE teacher_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES teachers(user_id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_private BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== RLS POLICIES ====================

-- Teacher-Student Assignments
ALTER TABLE teacher_student_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their assignments" ON teacher_student_assignments
  FOR SELECT USING (
    teacher_id IN (
      SELECT user_id FROM teachers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all assignments in their institute" ON teacher_student_assignments
  FOR SELECT USING (
    teacher_id IN (
      SELECT t.user_id FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE u.institute_id IN (
        SELECT institute_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage assignments" ON teacher_student_assignments
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin' AND institute_id IN (
        SELECT institute_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Interventions
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their own interventions" ON interventions
  FOR SELECT USING (
    teacher_id IN (
      SELECT user_id FROM teachers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can create interventions for assigned students" ON interventions
  FOR INSERT WITH CHECK (
    teacher_id = auth.uid() AND
    student_id IN (
      SELECT student_id FROM teacher_student_assignments 
      WHERE teacher_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "Teachers can update their own interventions" ON interventions
  FOR UPDATE USING (
    teacher_id = auth.uid()
  );

CREATE POLICY "Admins can view all interventions in their institute" ON interventions
  FOR SELECT USING (
    teacher_id IN (
      SELECT t.user_id FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE u.institute_id IN (
        SELECT institute_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Institute Billing
ALTER TABLE institute_billing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view their institute billing" ON institute_billing
  FOR SELECT USING (
    institute_id IN (
      SELECT institute_id FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update their institute billing" ON institute_billing
  FOR UPDATE USING (
    institute_id IN (
      SELECT institute_id FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Payment History
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view their institute payment history" ON payment_history
  FOR SELECT USING (
    institute_id IN (
      SELECT institute_id FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Batch Analytics Cache
ALTER TABLE batch_analytics_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their batch analytics" ON batch_analytics_cache
  FOR SELECT USING (
    teacher_id = auth.uid() OR
    institute_id IN (
      SELECT institute_id FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Teacher Notes
ALTER TABLE teacher_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their own notes" ON teacher_notes
  FOR SELECT USING (
    teacher_id = auth.uid()
  );

CREATE POLICY "Teachers can create notes for assigned students" ON teacher_notes
  FOR INSERT WITH CHECK (
    teacher_id = auth.uid() AND
    student_id IN (
      SELECT student_id FROM teacher_student_assignments 
      WHERE teacher_id = auth.uid() AND is_active = TRUE
    )
  );

CREATE POLICY "Teachers can update their own notes" ON teacher_notes
  FOR UPDATE USING (
    teacher_id = auth.uid()
  );

CREATE POLICY "Teachers can delete their own notes" ON teacher_notes
  FOR DELETE USING (
    teacher_id = auth.uid()
  );

-- ==================== INDEXES ====================

-- Teacher-Student Assignments
CREATE INDEX idx_teacher_assignments_teacher ON teacher_student_assignments(teacher_id);
CREATE INDEX idx_teacher_assignments_student ON teacher_student_assignments(student_id);
CREATE INDEX idx_teacher_assignments_batch ON teacher_student_assignments(batch);
CREATE INDEX idx_teacher_assignments_active ON teacher_student_assignments(is_active);

-- Interventions
CREATE INDEX idx_interventions_teacher ON interventions(teacher_id);
CREATE INDEX idx_interventions_student ON interventions(student_id);
CREATE INDEX idx_interventions_status ON interventions(status);
CREATE INDEX idx_interventions_priority ON interventions(priority);
CREATE INDEX idx_interventions_created ON interventions(created_at DESC);

-- Institute Billing
CREATE INDEX idx_billing_institute ON institute_billing(institute_id);
CREATE INDEX idx_billing_status ON institute_billing(status);
CREATE INDEX idx_billing_next_date ON institute_billing(next_billing_date);

-- Payment History
CREATE INDEX idx_payment_history_institute ON payment_history(institute_id);
CREATE INDEX idx_payment_history_billing ON payment_history(billing_id);
CREATE INDEX idx_payment_history_status ON payment_history(status);
CREATE INDEX idx_payment_history_created ON payment_history(created_at DESC);

-- Batch Analytics Cache
CREATE INDEX idx_batch_analytics_institute ON batch_analytics_cache(institute_id);
CREATE INDEX idx_batch_analytics_batch ON batch_analytics_cache(batch);
CREATE INDEX idx_batch_analytics_teacher ON batch_analytics_cache(teacher_id);

-- Teacher Notes
CREATE INDEX idx_teacher_notes_teacher ON teacher_notes(teacher_id);
CREATE INDEX idx_teacher_notes_student ON teacher_notes(student_id);
CREATE INDEX idx_teacher_notes_created ON teacher_notes(created_at DESC);

-- ==================== FUNCTIONS ====================

-- Function to auto-assign teacher to batch
CREATE OR REPLACE FUNCTION assign_teacher_to_batch(
  p_teacher_id UUID,
  p_batch TEXT,
  p_subject TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  assigned_count INTEGER := 0;
BEGIN
  -- Get all students in the batch
  INSERT INTO teacher_student_assignments (teacher_id, student_id, batch, subject, assigned_by)
  SELECT 
    p_teacher_id,
    s.user_id,
    p_batch,
    p_subject,
    auth.uid()
  FROM students s
  JOIN users u ON s.user_id = u.id
  WHERE s.batch = p_batch
    AND NOT EXISTS (
      SELECT 1 FROM teacher_student_assignments
      WHERE teacher_id = p_teacher_id AND student_id = s.user_id
    )
  ON CONFLICT (teacher_id, student_id) DO NOTHING;
  
  GET DIAGNOSTICS assigned_count = ROW_COUNT;
  RETURN assigned_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update batch analytics cache
CREATE OR REPLACE FUNCTION update_batch_analytics_cache(p_batch TEXT, p_teacher_id UUID DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
  v_institute_id UUID;
BEGIN
  -- Get institute ID from teacher or from batch students
  IF p_teacher_id IS NOT NULL THEN
    SELECT institute_id INTO v_institute_id
    FROM users WHERE id = p_teacher_id;
  ELSE
    SELECT DISTINCT u.institute_id INTO v_institute_id
    FROM students s
    JOIN users u ON s.user_id = u.id
    WHERE s.batch = p_batch
    LIMIT 1;
  END IF;

  -- Update or insert cache
  INSERT INTO batch_analytics_cache (
    institute_id,
    batch,
    teacher_id,
    student_count,
    active_arks_count,
    completed_arks_count,
    avg_completion_rate,
    avg_motivation,
    avg_stress,
    avg_confidence,
    high_risk_count,
    medium_risk_count,
    low_risk_count
  )
  SELECT 
    v_institute_id,
    p_batch,
    p_teacher_id,
    COUNT(DISTINCT s.user_id) as student_count,
    COUNT(DISTINCT CASE WHEN a.status = 'active' THEN a.id END) as active_arks_count,
    COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END) as completed_arks_count,
    AVG(COALESCE(a.progress, 0)) as avg_completion_rate,
    AVG(COALESCE((s.onboarding_profile->>'motivation_level')::numeric, 5)) as avg_motivation,
    AVG(COALESCE((s.onboarding_profile->>'stress_level')::numeric, 5)) as avg_stress,
    AVG(COALESCE((s.onboarding_profile->>'confidence_level')::numeric, 5)) as avg_confidence,
    COUNT(DISTINCT CASE WHEN s.risk_score >= 70 THEN s.user_id END) as high_risk_count,
    COUNT(DISTINCT CASE WHEN s.risk_score >= 40 AND s.risk_score < 70 THEN s.user_id END) as medium_risk_count,
    COUNT(DISTINCT CASE WHEN s.risk_score < 40 THEN s.user_id END) as low_risk_count
  FROM students s
  LEFT JOIN arks a ON s.user_id = a.student_id
  WHERE s.batch = p_batch
    AND (p_teacher_id IS NULL OR s.user_id IN (
      SELECT student_id FROM teacher_student_assignments 
      WHERE teacher_id = p_teacher_id AND is_active = TRUE
    ))
  GROUP BY v_institute_id, p_batch, p_teacher_id
  ON CONFLICT (institute_id, batch, teacher_id)
  DO UPDATE SET
    student_count = EXCLUDED.student_count,
    active_arks_count = EXCLUDED.active_arks_count,
    completed_arks_count = EXCLUDED.completed_arks_count,
    avg_completion_rate = EXCLUDED.avg_completion_rate,
    avg_motivation = EXCLUDED.avg_motivation,
    avg_stress = EXCLUDED.avg_stress,
    avg_confidence = EXCLUDED.avg_confidence,
    high_risk_count = EXCLUDED.high_risk_count,
    medium_risk_count = EXCLUDED.medium_risk_count,
    low_risk_count = EXCLUDED.low_risk_count,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== TRIGGERS ====================

-- Auto-update intervention timestamp
CREATE OR REPLACE FUNCTION update_intervention_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.resolved_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_intervention_timestamp
  BEFORE UPDATE ON interventions
  FOR EACH ROW
  EXECUTE FUNCTION update_intervention_timestamp();

-- Auto-update teacher notes timestamp
CREATE OR REPLACE FUNCTION update_teacher_notes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_teacher_notes_timestamp
  BEFORE UPDATE ON teacher_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_teacher_notes_timestamp();

-- ==================== INITIAL DATA ====================

-- Insert sample billing plans
INSERT INTO institute_billing (institute_id, plan_type, student_count, amount_per_student, billing_cycle, status)
SELECT 
  id,
  plan_type,
  0,
  CASE 
    WHEN plan_type = 'neuro' THEN 8999.00
    WHEN plan_type = 'quantum' THEN 11999.00
  END,
  'yearly',
  'trial'
FROM institutes
ON CONFLICT (institute_id) DO NOTHING;

