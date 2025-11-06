-- Add AI identity profile to students table
ALTER TABLE students 
ADD COLUMN ai_identity_profile JSONB;

-- Add index for AI identity profile queries
CREATE INDEX idx_students_ai_identity_profile ON students USING GIN (ai_identity_profile);

-- Add comment to explain the field
COMMENT ON COLUMN students.ai_identity_profile IS 'Comprehensive AI identity profile including learning style, psychological traits, interests, and AI model preferences';


