-- ==================== COLLEGE ADMISSION SYSTEM ====================
-- Migration: 010_college_admission_system.sql
-- Purpose: College matching, cutoff predictions, and form filling agents

-- ==================== COLLEGES & COURSES ====================

-- Colleges Master Data
CREATE TABLE IF NOT EXISTS colleges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  short_name TEXT,
  type TEXT NOT NULL CHECK (type IN ('government', 'private', 'semi_government', 'deemed')),
  tier TEXT NOT NULL, -- 'IIT', 'NIT', 'AIIMS', 'IIM', 'Tier1', 'Tier2', 'Tier3'
  
  -- Location
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  pincode TEXT,
  country TEXT DEFAULT 'India',
  latitude DECIMAL,
  longitude DECIMAL,
  
  -- Recognition
  accreditation TEXT[], -- 'NAAC', 'UGC', 'AICTE', etc.
  nirf_rank INTEGER, -- National ranking
  nirf_year INTEGER,
  
  -- Academics
  specializations TEXT[], -- Research areas, famous for
  
  -- Infrastructure
  campus_size_acres DECIMAL,
  facilities TEXT[], -- 'library', 'lab', 'hostel', 'sports'
  
  -- Links
  website_url TEXT,
  application_url TEXT,
  brochure_url TEXT,
  virtual_tour_url TEXT,
  
  -- Metadata
  description TEXT,
  images JSONB,
  logo_url TEXT,
  contact_info JSONB, -- { phone, email, admission_office }
  
  -- Search & Discovery
  tags TEXT[],
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  verified BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- College Courses
CREATE TABLE IF NOT EXISTS college_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  
  -- Course Details
  name TEXT NOT NULL, -- 'B.Tech Computer Science'
  degree TEXT NOT NULL, -- 'B.Tech', 'MBBS', 'BBA', 'MBA', 'MS', 'PhD'
  duration_years DECIMAL NOT NULL, -- 4.0, 5.5, etc.
  specialization TEXT,
  
  -- Academic Info
  intake INTEGER, -- Total seats per year
  seat_distribution JSONB, -- { 'general': 40%, 'obc': 27%, 'sc': 15%, 'st': 7.5%, 'ews': 10%, 'other': 0.5% }
  
  -- Admission Requirements
  exam_type TEXT[], -- ['JEE Main', 'JEE Advanced', 'NEET']
  required_qualifications TEXT[], -- '10+2 with PCM'
  
  -- Cutoff Data
  cutoff_last_year JSONB, -- { 'general': 15000, 'obc': 18000, 'sc': 50000 }
  cutoff_history JSONB, -- Array of historical cutoffs
  
  -- Fees & Financial
  fees_annual JSONB, -- { 'tuition': 10000, 'hostel': 5000, 'mess': 3000, 'total': 18000 }
  fees_total DECIMAL, -- Total course fee
  scholarship_info JSONB, -- Available scholarships
  
  -- Placement & Career
  average_salary DECIMAL, -- LPA
  median_salary DECIMAL, -- LPA
  highest_salary DECIMAL, -- LPA
  placement_percentage DECIMAL,
  top_recruiters TEXT[],
  placement_stats JSONB,
  
  -- Rankings
  department_rank INTEGER,
  special_mentions TEXT[],
  
  -- Duration Info
  internship_mandatory BOOLEAN DEFAULT TRUE,
  thesis_required BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== STUDENT EXAM SCORES ====================

-- Student Exam Scores (Extended Profile)
CREATE TABLE IF NOT EXISTS student_exam_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  
  -- Exam Details
  exam_type TEXT NOT NULL, -- 'jee_main', 'jee_advanced', 'neet', 'sat', 'act', 'board_12th'
  exam_year INTEGER NOT NULL,
  
  -- Scores
  marks_obtained INTEGER,
  max_marks INTEGER,
  percentage DECIMAL,
  percentile DECIMAL,
  rank INTEGER,
  all_india_rank INTEGER,
  
  -- Category
  category TEXT, -- 'general', 'obc', 'sc', 'st', 'ews'
  
  -- Additional Info
  attempt_number INTEGER DEFAULT 1, -- 1st attempt, 2nd attempt, etc.
  exam_center TEXT,
  exam_date DATE,
  
  -- Verification
  scorecard_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(student_id, exam_type, exam_year)
);

-- ==================== ADMISSION PREFERENCES ====================

-- Student Admission Preferences
CREATE TABLE IF NOT EXISTS admission_preferences (
  student_id UUID PRIMARY KEY REFERENCES students(user_id) ON DELETE CASCADE,
  
  -- Preferences
  preferred_states TEXT[],
  preferred_cities TEXT[],
  preferred_college_types TEXT[], -- 'government', 'private', 'both'
  
  -- Financial
  budget_max DECIMAL,
  budget_min DECIMAL,
  currency TEXT DEFAULT 'INR',
  willing_for_loans BOOLEAN DEFAULT TRUE,
  
  -- Course Interests
  interested_degrees TEXT[], -- 'B.Tech', 'MBBS', 'BBA', 'B.Com'
  interested_fields TEXT[], -- 'Computer Science', 'Medicine', 'Business'
  
  -- Priorities
  priority_rankings JSONB, -- { 'location': 1, 'fees': 2, 'reputation': 3, 'placement': 4 }
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== CUTOFF PREDICTIONS ====================

-- Cutoff Predictions
CREATE TABLE IF NOT EXISTS cutoff_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES college_courses(id) ON DELETE CASCADE,
  
  -- Target Year
  target_year INTEGER NOT NULL, -- 2025, 2026, etc.
  
  -- Predictions
  predicted_cutoff_general INTEGER,
  predicted_cutoff_obc INTEGER,
  predicted_cutoff_sc INTEGER,
  predicted_cutoff_st INTEGER,
  predicted_cutoff_ews INTEGER,
  
  -- Confidence
  prediction_confidence DECIMAL CHECK (prediction_confidence >= 0 AND prediction_confidence <= 100),
  methodology TEXT, -- How prediction was made
  
  -- Alternative Scenarios
  pessimistic_cutoff INTEGER, -- Worst case
  optimistic_cutoff INTEGER, -- Best case
  
  -- Factors Analyzed
  factors JSONB, -- { 'exam_difficulty_change': -5, 'applicant_increase': 8, 'seat_change': -2, 'policy_change': 'none' }
  
  -- Trend
  trend_direction TEXT CHECK (trend_direction IN ('rising', 'falling', 'stable', 'volatile')),
  trend_magnitude DECIMAL, -- % change
  
  -- Historical Context
  last_5_years_avg DECIMAL,
  standard_deviation DECIMAL, -- Volatility measure
  
  -- AI Insights
  ai_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(college_id, course_id, target_year)
);

-- ==================== COLLEGE RECOMMENDATIONS ====================

-- College Recommendations for Students
CREATE TABLE IF NOT EXISTS college_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES college_courses(id) ON DELETE CASCADE,
  
  -- Scoring
  match_score DECIMAL CHECK (match_score >= 0 AND match_score <= 100),
  admission_probability DECIMAL CHECK (admission_probability >= 0 AND admission_probability <= 100),
  
  -- Category
  category TEXT CHECK (category IN ('safe', 'moderate', 'reach', 'dream')),
  
  -- Reasons
  recommendation_reasons JSONB, -- Why recommended
  strengths JSONB, -- What student brings to this college
  improvements_needed TEXT,
  
  -- Comparison
  vs_competition JSONB, -- How student compares to typical admits
  
  -- Financial Fit
  financial_fit_score DECIMAL,
  scholarship_eligibility BOOLEAN DEFAULT FALSE,
  
  -- Career Alignment
  career_alignment_score DECIMAL,
  career_path_suggestions JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(student_id, college_id, course_id)
);

-- ==================== ADMISSION APPLICATIONS ====================

-- College Admission Applications
CREATE TABLE IF NOT EXISTS admission_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES college_courses(id) ON DELETE CASCADE,
  
  -- Application Data
  application_data JSONB NOT NULL, -- Full form data
  application_number TEXT,
  
  -- Documents
  documents_submitted TEXT[], -- File URLs
  documents_pending TEXT[],
  documents_verified BOOLEAN DEFAULT FALSE,
  
  -- Status Tracking
  status TEXT NOT NULL CHECK (status IN (
    'draft', 
    'submitted', 
    'under_review', 
    'shortlisted',
    'accepted', 
    'rejected', 
    'waitlisted',
    'withdrawn'
  )),
  
  -- Dates
  submission_date TIMESTAMP WITH TIME ZONE,
  review_start_date TIMESTAMP WITH TIME ZONE,
  decision_date TIMESTAMP WITH TIME ZONE,
  
  -- Financials
  application_fee_paid BOOLEAN DEFAULT FALSE,
  application_fee_amount DECIMAL,
  payment_transaction_id TEXT,
  
  -- Scholarships
  scholarship_applied BOOLEAN DEFAULT FALSE,
  scholarship_status TEXT,
  scholarship_amount DECIMAL,
  
  -- AI Recommendations
  ai_suggestions JSONB, -- Why this college, career fit, etc.
  priority_rank INTEGER, -- Student's preference order
  
  -- Notes
  student_notes TEXT,
  admin_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== FORM TEMPLATES ====================

-- College Form Templates
CREATE TABLE IF NOT EXISTS form_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  
  -- Form Structure
  fields JSONB NOT NULL, -- Form field definitions with types, validation
  required_fields TEXT[],
  optional_fields TEXT[],
  
  -- Validation Rules
  validation_rules JSONB, -- Field-specific validation
  
  -- Form Info
  form_type TEXT CHECK (form_type IN ('online', 'offline', 'hybrid')),
  application_url TEXT,
  brochure_url TEXT,
  
  -- Dates
  opens_date TIMESTAMP WITH TIME ZONE,
  deadline_date TIMESTAMP WITH TIME ZONE,
  is_extended BOOLEAN DEFAULT FALSE,
  
  -- Fees
  application_fee DECIMAL,
  late_fee DECIMAL,
  late_fee_date TIMESTAMP WITH TIME ZONE,
  
  -- Status
  is_current BOOLEAN DEFAULT TRUE,
  academic_year TEXT, -- '2024-25', '2025-26'
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== DEADLINE REMINDERS ====================

-- Admission Deadlines & Reminders
CREATE TABLE IF NOT EXISTS admission_deadlines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
  form_template_id UUID REFERENCES form_templates(id) ON DELETE CASCADE,
  
  deadline_type TEXT NOT NULL CHECK (deadline_type IN (
    'application_start',
    'application_end',
    'document_submission',
    'fee_payment',
    'counseling',
    'result_declaration',
    'admission_confirmation'
  )),
  
  deadline_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_extended BOOLEAN DEFAULT FALSE,
  extended_date TIMESTAMP WITH TIME ZONE,
  
  -- Reminders
  reminders_sent JSONB, -- Track sent reminders by date
  
  -- Metadata
  notification_sent BOOLEAN DEFAULT FALSE,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== INDEXES ====================

CREATE INDEX IF NOT EXISTS idx_colleges_state ON colleges(state);
CREATE INDEX IF NOT EXISTS idx_colleges_city ON colleges(city);
CREATE INDEX IF NOT EXISTS idx_colleges_type ON colleges(type);
CREATE INDEX IF NOT EXISTS idx_colleges_tier ON colleges(tier);
-- CREATE INDEX IF NOT EXISTS idx_colleges_search_vector ON colleges USING ivfflat (search_vector vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_courses_college ON college_courses(college_id);
CREATE INDEX IF NOT EXISTS idx_courses_degree ON college_courses(degree);

CREATE INDEX IF NOT EXISTS idx_exam_scores_student ON student_exam_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_scores_type ON student_exam_scores(exam_type);

CREATE INDEX IF NOT EXISTS idx_recommendations_student ON college_recommendations(student_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_category ON college_recommendations(category);

CREATE INDEX IF NOT EXISTS idx_applications_student ON admission_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_college ON admission_applications(college_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON admission_applications(status);

CREATE INDEX IF NOT EXISTS idx_deadlines_date ON admission_deadlines(deadline_date);

-- ==================== RLS POLICIES ====================

-- Enable RLS
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_exam_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE admission_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE cutoff_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admission_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE admission_deadlines ENABLE ROW LEVEL SECURITY;

-- Colleges: Public read, admin write
CREATE POLICY "colleges_public_read" ON colleges FOR SELECT USING (TRUE);
CREATE POLICY "colleges_admin_write" ON colleges FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- College Courses: Public read, admin write
CREATE POLICY "courses_public_read" ON college_courses FOR SELECT USING (TRUE);
CREATE POLICY "courses_admin_write" ON college_courses FOR ALL WITH CHECK (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- Student Exam Scores: Student own access
CREATE POLICY "exam_scores_own" ON student_exam_scores FOR ALL USING (
  student_id = auth.uid()
);

-- Admission Preferences: Student own access
CREATE POLICY "preferences_own" ON admission_preferences FOR ALL USING (
  student_id = auth.uid()
);

-- Cutoff Predictions: Public read
CREATE POLICY "predictions_public_read" ON cutoff_predictions FOR SELECT USING (TRUE);

-- College Recommendations: Student own access
CREATE POLICY "recommendations_own" ON college_recommendations FOR ALL USING (
  student_id = auth.uid()
);

-- Admission Applications: Student own access
CREATE POLICY "applications_own" ON admission_applications FOR ALL USING (
  student_id = auth.uid()
);

-- Form Templates: Public read
CREATE POLICY "templates_public_read" ON form_templates FOR SELECT USING (TRUE);

-- Deadlines: Public read
CREATE POLICY "deadlines_public_read" ON admission_deadlines FOR SELECT USING (TRUE);

-- ==================== TRIGGERS ====================

-- Update timestamps
CREATE TRIGGER update_colleges_timestamp BEFORE UPDATE ON colleges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_timestamp BEFORE UPDATE ON college_courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exam_scores_timestamp BEFORE UPDATE ON student_exam_scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preferences_timestamp BEFORE UPDATE ON admission_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recommendations_timestamp BEFORE UPDATE ON college_recommendations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_timestamp BEFORE UPDATE ON admission_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== COMMENTS ====================

COMMENT ON TABLE colleges IS 'Master data for all educational institutions';
COMMENT ON TABLE college_courses IS 'Courses offered by each college with admission details';
COMMENT ON TABLE student_exam_scores IS 'Student exam scores for various competitive and board exams';
COMMENT ON TABLE admission_preferences IS 'Student preferences for college selection';
COMMENT ON TABLE cutoff_predictions IS 'AI-generated cutoff predictions for college admissions';
COMMENT ON TABLE college_recommendations IS 'Personalized college recommendations for students';
COMMENT ON TABLE admission_applications IS 'Student applications to colleges';
COMMENT ON TABLE form_templates IS 'Admission form templates and structures';
COMMENT ON TABLE admission_deadlines IS 'Deadlines and important dates for admissions';


