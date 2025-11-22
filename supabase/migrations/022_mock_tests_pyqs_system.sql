-- ==================== MOCK TESTS & PYQS SYSTEM ====================
-- Migration: 022_mock_tests_pyqs_system
-- Description: Complete system for mock tests, test questions, attempts, and PYQs

-- ==================== MOCK TESTS ====================

-- Mock Tests: Store test definitions
CREATE TABLE IF NOT EXISTS mock_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id UUID REFERENCES institutes(id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL CHECK (exam_type IN ('JEE_MAIN', 'JEE_ADVANCED', 'NEET', 'AIIMS', 'BITSAT', 'WBJEE', 'NDA', 'CUSTOM')),
  subject TEXT, -- NULL for full tests, or specific subject for subject-wise
  title TEXT NOT NULL,
  description TEXT,
  year INTEGER, -- For PYQ-based tests
  total_questions INTEGER NOT NULL DEFAULT 90 CHECK (total_questions > 0),
  duration_minutes INTEGER NOT NULL DEFAULT 180 CHECK (duration_minutes > 0),
  total_marks INTEGER NOT NULL DEFAULT 360 CHECK (total_marks > 0),
  marking_scheme JSONB DEFAULT '{"correct": 4, "incorrect": -1, "unanswered": 0}',
  is_pyq BOOLEAN DEFAULT FALSE, -- True if this is a previous year paper
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mock_tests_exam_type_idx ON mock_tests(exam_type);
CREATE INDEX IF NOT EXISTS mock_tests_institute_idx ON mock_tests(institute_id);
CREATE INDEX IF NOT EXISTS mock_tests_is_pyq_idx ON mock_tests(is_pyq);
CREATE INDEX IF NOT EXISTS mock_tests_year_idx ON mock_tests(year);

-- ==================== TEST QUESTIONS ====================

-- Test Questions: Store questions for mock tests
CREATE TABLE IF NOT EXISTS test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES mock_tests(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL CHECK (question_number > 0),
  question_text TEXT NOT NULL,
  question_image_url TEXT, -- For image-based questions
  options JSONB NOT NULL, -- {"A": "...", "B": "...", "C": "...", "D": "..."}
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  subject TEXT,
  topic TEXT,
  chapter TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  exam_weightage DECIMAL(5,2) DEFAULT 0, -- Percentage weightage in exam
  marks INTEGER DEFAULT 4,
  negative_marks DECIMAL(3,2) DEFAULT 1.0,
  source TEXT, -- 'PYQ', 'MOCK', 'PRACTICE'
  source_year INTEGER, -- For PYQs
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS test_questions_test_idx ON test_questions(test_id);
CREATE INDEX IF NOT EXISTS test_questions_subject_topic_idx ON test_questions(subject, topic);
CREATE INDEX IF NOT EXISTS test_questions_difficulty_idx ON test_questions(difficulty);

-- ==================== TEST ATTEMPTS ====================

-- Test Attempts: Store student test attempts
CREATE TABLE IF NOT EXISTS test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES mock_tests(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  score INTEGER DEFAULT 0,
  total_marks INTEGER NOT NULL,
  percentage DECIMAL(5,2),
  correct_answers INTEGER DEFAULT 0,
  wrong_answers INTEGER DEFAULT 0,
  skipped_questions INTEGER DEFAULT 0,
  rank INTEGER, -- All India rank estimate
  percentile DECIMAL(5,2),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  time_spent_seconds INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, test_id, started_at) -- Allow multiple attempts
);

CREATE INDEX IF NOT EXISTS test_attempts_student_idx ON test_attempts(student_id);
CREATE INDEX IF NOT EXISTS test_attempts_test_idx ON test_attempts(test_id);
CREATE INDEX IF NOT EXISTS test_attempts_status_idx ON test_attempts(status);
CREATE INDEX IF NOT EXISTS test_attempts_submitted_idx ON test_attempts(submitted_at);

-- ==================== TEST ATTEMPT ANSWERS ====================

-- Test Attempt Answers: Store individual question responses
CREATE TABLE IF NOT EXISTS test_attempt_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES test_questions(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  selected_answer TEXT CHECK (selected_answer IN ('A', 'B', 'C', 'D', NULL)),
  is_correct BOOLEAN,
  is_skipped BOOLEAN DEFAULT FALSE,
  is_marked_for_review BOOLEAN DEFAULT FALSE,
  time_spent_seconds INTEGER DEFAULT 0,
  marks_obtained DECIMAL(5,2) DEFAULT 0,
  answered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(attempt_id, question_id)
);

CREATE INDEX IF NOT EXISTS test_attempt_answers_attempt_idx ON test_attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS test_attempt_answers_question_idx ON test_attempt_answers(question_id);

-- ==================== PYQS (Previous Year Papers) ====================

-- PYQs: Store previous year question papers
CREATE TABLE IF NOT EXISTS pyqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_type TEXT NOT NULL CHECK (exam_type IN ('JEE_MAIN', 'JEE_ADVANCED', 'NEET', 'AIIMS', 'BITSAT', 'WBJEE')),
  year INTEGER NOT NULL,
  paper_set TEXT, -- 'SET_A', 'SET_B', 'SET_C', 'SET_D' for JEE Main
  subject TEXT, -- NULL for full paper, or specific subject
  question_number INTEGER,
  question_text TEXT NOT NULL,
  question_image_url TEXT,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  topic TEXT,
  chapter TEXT,
  difficulty TEXT DEFAULT 'medium',
  marks INTEGER DEFAULT 4,
  negative_marks DECIMAL(3,2) DEFAULT 1.0,
  source_url TEXT, -- Original NTA/Exam board URL if available
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pyqs_exam_year_idx ON pyqs(exam_type, year);
CREATE INDEX IF NOT EXISTS pyqs_subject_idx ON pyqs(subject);
CREATE INDEX IF NOT EXISTS pyqs_topic_idx ON pyqs(topic);

-- ==================== SYLLABUS TRACKER ====================

-- Syllabus Tracker: Track syllabus completion per student
CREATE TABLE IF NOT EXISTS syllabus_tracker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL CHECK (exam_type IN ('JEE_MAIN', 'JEE_ADVANCED', 'NEET', 'AIIMS')),
  subject TEXT NOT NULL,
  chapter TEXT NOT NULL,
  topic TEXT,
  completion_percentage DECIMAL(5,2) DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  questions_attempted INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  last_practiced_at TIMESTAMPTZ,
  mastery_level TEXT DEFAULT 'not_started' CHECK (mastery_level IN ('not_started', 'learning', 'practicing', 'mastered')),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, exam_type, subject, chapter, topic)
);

CREATE INDEX IF NOT EXISTS syllabus_tracker_student_idx ON syllabus_tracker(student_id);
CREATE INDEX IF NOT EXISTS syllabus_tracker_exam_subject_idx ON syllabus_tracker(exam_type, subject);
CREATE INDEX IF NOT EXISTS syllabus_tracker_mastery_idx ON syllabus_tracker(mastery_level);

-- ==================== RANK PREDICTIONS ====================

-- Rank Predictions: Store rank predictions based on mock test scores
CREATE TABLE IF NOT EXISTS rank_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL CHECK (exam_type IN ('JEE_MAIN', 'JEE_ADVANCED', 'NEET')),
  test_attempt_id UUID REFERENCES test_attempts(id) ON DELETE SET NULL,
  score INTEGER NOT NULL,
  predicted_rank INTEGER,
  predicted_percentile DECIMAL(5,2),
  confidence_level TEXT DEFAULT 'medium' CHECK (confidence_level IN ('low', 'medium', 'high')),
  factors JSONB DEFAULT '{}', -- Factors affecting prediction
  historical_data JSONB DEFAULT '{}', -- Historical rank trends
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rank_predictions_student_idx ON rank_predictions(student_id);
CREATE INDEX IF NOT EXISTS rank_predictions_exam_idx ON rank_predictions(exam_type);

-- ==================== ROW LEVEL SECURITY ====================

ALTER TABLE mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pyqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllabus_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE rank_predictions ENABLE ROW LEVEL SECURITY;

-- Students can view active mock tests
CREATE POLICY "Students view active mock tests" ON mock_tests
  FOR SELECT USING (
    is_active = TRUE OR
    EXISTS (SELECT 1 FROM students WHERE students.user_id = auth.uid())
  );

-- Students can view test questions for tests they can access
CREATE POLICY "Students view test questions" ON test_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mock_tests 
      WHERE mock_tests.id = test_questions.test_id 
      AND (mock_tests.is_active = TRUE OR EXISTS (SELECT 1 FROM students WHERE students.user_id = auth.uid()))
    )
  );

-- Students can manage their own test attempts
CREATE POLICY "Students manage own test attempts" ON test_attempts
  FOR ALL USING (student_id = (SELECT user_id FROM students WHERE students.user_id = auth.uid()));

-- Students can manage their own answers
CREATE POLICY "Students manage own answers" ON test_attempt_answers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM test_attempts 
      WHERE test_attempts.id = test_attempt_answers.attempt_id 
      AND test_attempts.student_id = (SELECT user_id FROM students WHERE students.user_id = auth.uid())
    )
  );

-- Everyone can view PYQs (public data)
CREATE POLICY "Everyone can view PYQs" ON pyqs
  FOR SELECT USING (TRUE);

-- Students can manage their own syllabus tracker
CREATE POLICY "Students manage own syllabus tracker" ON syllabus_tracker
  FOR ALL USING (student_id = (SELECT user_id FROM students WHERE students.user_id = auth.uid()));

-- Students can view their own rank predictions
CREATE POLICY "Students view own rank predictions" ON rank_predictions
  FOR SELECT USING (student_id = (SELECT user_id FROM students WHERE students.user_id = auth.uid()));

-- Teachers can view students' attempts in their batches
CREATE POLICY "Teachers view batch test attempts" ON test_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM teachers 
      WHERE teachers.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM students 
        WHERE students.user_id = test_attempts.student_id
        AND students.batch = ANY(teachers.assigned_batches)
      )
    )
  );

-- Admins can manage all tests
CREATE POLICY "Admins manage all mock tests" ON mock_tests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

-- ==================== TRIGGERS ====================

-- Auto-update test_attempts score and percentage
CREATE OR REPLACE FUNCTION update_test_attempt_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE test_attempts
  SET 
    correct_answers = (
      SELECT COUNT(*) FROM test_attempt_answers
      WHERE attempt_id = NEW.attempt_id AND is_correct = TRUE
    ),
    wrong_answers = (
      SELECT COUNT(*) FROM test_attempt_answers
      WHERE attempt_id = NEW.attempt_id AND is_correct = FALSE
    ),
    skipped_questions = (
      SELECT COUNT(*) FROM test_attempt_answers
      WHERE attempt_id = NEW.attempt_id AND is_skipped = TRUE
    ),
    score = (
      SELECT COALESCE(SUM(marks_obtained), 0) FROM test_attempt_answers
      WHERE attempt_id = NEW.attempt_id
    ),
    percentage = (
      SELECT CASE 
        WHEN total_marks > 0 THEN 
          ROUND((COALESCE(SUM(marks_obtained), 0)::DECIMAL / total_marks) * 100, 2)
        ELSE 0
      END
      FROM test_attempt_answers
      JOIN test_attempts ON test_attempts.id = test_attempt_answers.attempt_id
      WHERE attempt_id = NEW.attempt_id
    ),
    updated_at = NOW()
  WHERE id = NEW.attempt_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER test_attempt_answers_score_trigger
  AFTER INSERT OR UPDATE ON test_attempt_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_test_attempt_score();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mock_tests_updated_at
  BEFORE UPDATE ON mock_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER test_attempts_updated_at
  BEFORE UPDATE ON test_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER syllabus_tracker_updated_at
  BEFORE UPDATE ON syllabus_tracker
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ==================== COMMENTS ====================

COMMENT ON TABLE mock_tests IS 'Store mock test definitions including PYQ-based tests';
COMMENT ON TABLE test_questions IS 'Store questions for mock tests with metadata';
COMMENT ON TABLE test_attempts IS 'Track student test attempts and scores';
COMMENT ON TABLE test_attempt_answers IS 'Store individual question responses in test attempts';
COMMENT ON TABLE pyqs IS 'Store previous year question papers for practice';
COMMENT ON TABLE syllabus_tracker IS 'Track syllabus completion and mastery per student';
COMMENT ON TABLE rank_predictions IS 'Store rank predictions based on mock test performance';

