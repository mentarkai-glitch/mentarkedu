# How to Run Supabase Migration for PYQs Table

The `pyqs` table needs to be created in your Supabase database before importing questions.

## Option 1: Using Supabase Dashboard (Easiest)

1. Go to your Supabase project: https://supabase.com/dashboard
2. Select your project
3. Click on **"SQL Editor"** in the left sidebar
4. Click **"New query"**
5. Open the file: `supabase/migrations/022_mock_tests_pyqs_system.sql`
6. Copy the entire contents (or at least the `pyqs` table creation part)
7. Paste into the SQL Editor
8. Click **"Run"** (or press Ctrl+Enter)

## Option 2: Using Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push

# Or link to your project first
supabase link --project-ref your-project-ref
supabase db push
```

## Option 3: Run Just the PYQs Table

If you only want to create the `pyqs` table, run this SQL:

```sql
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
```

## Verify Table Creation

After running the migration, verify the table exists:

1. Go to **"Table Editor"** in Supabase Dashboard
2. You should see `pyqs` in the list of tables
3. Or run this query in SQL Editor:
   ```sql
   SELECT COUNT(*) FROM pyqs;
   ```

## After Migration

Once the table is created, you can run the import script:

```bash
python scripts\import_to_supabase.py
```

