-- Migration: Student Documents and Resume Versions
-- Creates tables for storing document generation metadata

-- Student Documents Table
CREATE TABLE IF NOT EXISTS student_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- 'resume', 'cover_letter', 'project_report', 'study_notes', 'flashcards', etc.
  docgen_file_id VARCHAR(255) NOT NULL, -- Reference to mentark-docgen file_id
  template_used VARCHAR(100),
  format VARCHAR(10) NOT NULL DEFAULT 'pdf', -- 'pdf', 'docx', 'xlsx', 'html'
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_modified_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}', -- Store job_id, project_id, source, etc.
  is_active BOOLEAN DEFAULT true,
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resume Versions Table
CREATE TABLE IF NOT EXISTS resume_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES student_documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  file_id VARCHAR(255) NOT NULL,
  template_used VARCHAR(100),
  profile_snapshot JSONB, -- Store resume profile at time of generation
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_current BOOLEAN DEFAULT false,
  notes TEXT,
  UNIQUE(student_id, version_number)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_documents_student_id ON student_documents(student_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_type ON student_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_student_documents_active ON student_documents(is_active);
CREATE INDEX IF NOT EXISTS idx_student_documents_generated ON student_documents(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_resume_versions_student_id ON resume_versions(student_id);
CREATE INDEX IF NOT EXISTS idx_resume_versions_current ON resume_versions(student_id, is_current) WHERE is_current = true;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_student_documents_updated_at
  BEFORE UPDATE ON student_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one current resume version
CREATE OR REPLACE FUNCTION ensure_single_current_resume()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_current = true THEN
    UPDATE resume_versions
    SET is_current = false
    WHERE student_id = NEW.student_id
      AND id != NEW.id
      AND is_current = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to ensure single current resume
CREATE TRIGGER ensure_single_current_resume_trigger
  BEFORE INSERT OR UPDATE ON resume_versions
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_current_resume();

-- RLS Policies
ALTER TABLE student_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;

-- Students can only see their own documents
CREATE POLICY "Students can view own documents"
  ON student_documents
  FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own documents"
  ON student_documents
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own documents"
  ON student_documents
  FOR UPDATE
  USING (auth.uid() = student_id);

CREATE POLICY "Students can view own resume versions"
  ON resume_versions
  FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own resume versions"
  ON resume_versions
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own resume versions"
  ON resume_versions
  FOR UPDATE
  USING (auth.uid() = student_id);

-- Comments
COMMENT ON TABLE student_documents IS 'Stores metadata for all documents generated for students';
COMMENT ON TABLE resume_versions IS 'Tracks different versions of student resumes';
COMMENT ON COLUMN student_documents.metadata IS 'JSONB field storing document-specific metadata like job_id, project_id, source feature, etc.';

