"""
Create PYQs table using Supabase Python client
"""

import os
from pathlib import Path
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env.local")
load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY")

# Create Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# SQL to create the table
sql = """
CREATE TABLE IF NOT EXISTS pyqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_type TEXT NOT NULL CHECK (exam_type IN ('JEE_MAIN', 'JEE_ADVANCED', 'NEET', 'AIIMS', 'BITSAT', 'WBJEE')),
  year INTEGER NOT NULL,
  paper_set TEXT,
  subject TEXT,
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
  source_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pyqs_exam_year_idx ON pyqs(exam_type, year);
CREATE INDEX IF NOT EXISTS pyqs_subject_idx ON pyqs(subject);
CREATE INDEX IF NOT EXISTS pyqs_topic_idx ON pyqs(topic);
"""

print("=" * 60)
print("Creating PYQs table in Supabase...")
print("=" * 60)

# Note: Supabase Python client doesn't support raw SQL execution
# You need to use the Supabase Dashboard SQL Editor or Supabase CLI
print("\n⚠️  The Supabase Python client cannot execute raw SQL.")
print("Please run this SQL in the Supabase Dashboard:\n")
print(sql)
print("\nOr use the Supabase CLI:")
print("  supabase db execute --file supabase/migrations/022_mock_tests_pyqs_system.sql")

