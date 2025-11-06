-- ==================== MULTIMODAL SUPPORT MIGRATION ====================
-- Migration: 005_multimodal_support
-- Description: Add support for image uploads, vision analysis, and student journals

-- Add attachments table for image uploads in chat
CREATE TABLE message_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'audio', 'document')),
  file_size INTEGER,
  analyzed BOOLEAN DEFAULT false,
  vision_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add journal entries table for student uploads
CREATE TABLE student_journals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(user_id) ON DELETE CASCADE,
  title TEXT,
  image_url TEXT NOT NULL,
  extracted_text TEXT,
  ai_insights JSONB,
  emotion_detected TEXT,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_message_attachments_message_id ON message_attachments(message_id);
CREATE INDEX idx_message_attachments_analyzed ON message_attachments(analyzed);
CREATE INDEX idx_student_journals_student_id ON student_journals(student_id);
CREATE INDEX idx_student_journals_created_at ON student_journals(created_at DESC);

-- Enable RLS
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_journals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_attachments
CREATE POLICY "Users can view their own attachments" ON message_attachments
  FOR SELECT USING (auth.uid() IN (
    SELECT m.user_id 
    FROM messages m 
    WHERE m.id = message_attachments.message_id
  ));

CREATE POLICY "Users can insert their own attachments" ON message_attachments
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT m.user_id 
    FROM messages m 
    WHERE m.id = message_attachments.message_id
  ));

CREATE POLICY "Users can update their own attachments" ON message_attachments
  FOR UPDATE USING (auth.uid() IN (
    SELECT m.user_id 
    FROM messages m 
    WHERE m.id = message_attachments.message_id
  ));

-- RLS Policies for student_journals
CREATE POLICY "Students can view their own journals" ON student_journals
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own journals" ON student_journals
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own journals" ON student_journals
  FOR UPDATE USING (auth.uid() = student_id);

-- Teachers can view journals of their assigned students
CREATE POLICY "Teachers can view assigned student journals" ON student_journals
  FOR SELECT USING (auth.uid() IN (
    SELECT t.user_id 
    FROM teachers t
    JOIN teacher_student_assignments tsa ON t.user_id = tsa.teacher_id
    WHERE tsa.student_id = student_journals.student_id
  ));

-- Admins can view journals of students in their institute
CREATE POLICY "Admins can view institute student journals" ON student_journals
  FOR SELECT USING (auth.uid() IN (
    SELECT a.user_id 
    FROM admins a
    JOIN users u ON a.user_id = u.id
    JOIN students s ON u.institute_id = s.user_id
    WHERE s.user_id = student_journals.student_id
  ));

-- Add function to clean up orphaned attachments
CREATE OR REPLACE FUNCTION cleanup_orphaned_attachments()
RETURNS void AS $$
BEGIN
  DELETE FROM message_attachments 
  WHERE message_id NOT IN (SELECT id FROM messages);
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically clean up attachments when message is deleted
CREATE OR REPLACE FUNCTION trigger_cleanup_attachments()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM message_attachments WHERE message_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_message_attachments
  BEFORE DELETE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION trigger_cleanup_attachments();

-- Add updated_at trigger for student_journals
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_at = COALESCE(NEW.created_at, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_journals_updated_at
  BEFORE INSERT OR UPDATE ON student_journals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE message_attachments IS 'Stores file attachments for chat messages, primarily images for vision analysis';
COMMENT ON TABLE student_journals IS 'Stores student-uploaded journal entries with AI analysis results';
COMMENT ON COLUMN message_attachments.vision_results IS 'JSONB storing Vision API analysis results (text, labels, objects)';
COMMENT ON COLUMN student_journals.ai_insights IS 'JSONB storing AI-generated insights from journal analysis';
COMMENT ON COLUMN student_journals.confidence_score IS 'Confidence score for emotion detection (0-1)';
