-- Job Recommendations Table
-- Store AI-powered job recommendations for students based on their ARKs and skills

CREATE TABLE IF NOT EXISTS job_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  ark_id UUID REFERENCES arks(id) ON DELETE SET NULL,
  
  -- Job data (from external APIs like JSearch)
  job_title TEXT NOT NULL,
  job_description TEXT,
  job_apply_link TEXT,
  job_location TEXT,
  job_is_remote BOOLEAN DEFAULT false,
  job_posted_at_datetime_utc TIMESTAMP WITH TIME ZONE,
  company_name TEXT,
  company_logo TEXT,
  company_url TEXT,
  employment_type TEXT, -- 'FULLTIME', 'PARTTIME', 'CONTRACTOR', 'INTERN'
  
  -- Relevance scoring
  relevance_score INTEGER DEFAULT 0, -- 1-100, higher is better
  skills_match_count INTEGER DEFAULT 0,
  skills_matched TEXT[], -- Array of matched skills
  
  -- Job metadata (full job data as JSON)
  job_data JSONB,
  
  -- Status tracking
  status TEXT DEFAULT 'recommended' CHECK (status IN ('recommended', 'viewed', 'applied', 'ignored', 'saved')),
  
  -- Timestamps
  recommended_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  viewed_at TIMESTAMP WITH TIME ZONE,
  applied_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_job_recommendations_student_id ON job_recommendations(student_id);
CREATE INDEX idx_job_recommendations_ark_id ON job_recommendations(ark_id);
CREATE INDEX idx_job_recommendations_status ON job_recommendations(status);
CREATE INDEX idx_job_recommendations_relevance_score ON job_recommendations(relevance_score DESC);
CREATE INDEX idx_job_recommendations_recommended_at ON job_recommendations(recommended_at DESC);
CREATE INDEX idx_job_recommendations_company_name ON job_recommendations(company_name);

-- Full-text search on job title and description
CREATE INDEX idx_job_recommendations_search ON job_recommendations USING gin(
  to_tsvector('english', coalesce(job_title, '') || ' ' || coalesce(job_description, ''))
);

-- Composite index for common queries
CREATE INDEX idx_job_recommendations_student_status ON job_recommendations(student_id, status);
CREATE INDEX idx_job_recommendations_student_relevance ON job_recommendations(student_id, relevance_score DESC);

-- RLS Policies
ALTER TABLE job_recommendations ENABLE ROW LEVEL SECURITY;

-- Students can view their own job recommendations
CREATE POLICY "Students can view their own job recommendations" ON job_recommendations
  FOR SELECT USING (
    student_id IN (
      SELECT user_id FROM students WHERE user_id = auth.uid()
    )
  );

-- Students can update their own job recommendations (mark as viewed, applied, etc.)
CREATE POLICY "Students can update their own job recommendations" ON job_recommendations
  FOR UPDATE USING (
    student_id IN (
      SELECT user_id FROM students WHERE user_id = auth.uid()
    )
  );

-- System can insert job recommendations (via service role)
CREATE POLICY "System can insert job recommendations" ON job_recommendations
  FOR INSERT WITH CHECK (true); -- Service role bypasses RLS

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_job_recommendations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Auto-update viewed_at when status changes to 'viewed'
  IF NEW.status = 'viewed' AND OLD.status != 'viewed' AND NEW.viewed_at IS NULL THEN
    NEW.viewed_at = NOW();
  END IF;
  
  -- Auto-update applied_at when status changes to 'applied'
  IF NEW.status = 'applied' AND OLD.status != 'applied' AND NEW.applied_at IS NULL THEN
    NEW.applied_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_recommendations_updated_at
  BEFORE UPDATE ON job_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_job_recommendations_updated_at();

-- Function to clean up old recommendations (optional, for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_job_recommendations(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM job_recommendations
  WHERE status IN ('ignored', 'recommended')
    AND recommended_at < NOW() - (days_old || ' days')::INTERVAL
    AND viewed_at IS NULL; -- Only delete if never viewed
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE job_recommendations IS 'Stores AI-powered job recommendations for students based on their ARKs, skills, and career goals';
COMMENT ON COLUMN job_recommendations.relevance_score IS 'AI-calculated relevance score (1-100) based on skills match, ARK alignment, and other factors';
COMMENT ON COLUMN job_recommendations.job_data IS 'Full job data from external API (JSearch, Indeed, etc.) stored as JSON';
COMMENT ON COLUMN job_recommendations.status IS 'Track student engagement: recommended (new), viewed, applied, ignored, saved';

