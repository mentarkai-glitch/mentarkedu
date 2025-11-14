# 📋 How to Apply Practice Questions Migration

## Step 1: Apply Database Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `mentark-edu`

2. **Navigate to SQL Editor**
   - Click on **"SQL Editor"** in the left sidebar
   - Click **"New query"**

3. **Copy Migration File**
   - Open: `supabase/migrations/017_practice_questions_system.sql`
   - Copy the entire contents

4. **Paste and Run**
   - Paste into the SQL editor
   - Click **"Run"** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

5. **Verify Migration**
   - Check that all tables are created:
     - `practice_sessions`
     - `practice_questions`
     - `practice_attempts`
     - `mistake_patterns`
     - `adaptive_difficulty`
   - Verify RLS policies are enabled

---

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Apply migration
supabase db push
```

---

## Step 2: Verify Tables Created

Run this SQL query in Supabase SQL Editor to verify:

```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'practice_sessions',
    'practice_questions',
    'practice_attempts',
    'mistake_patterns',
    'adaptive_difficulty'
  )
ORDER BY table_name;
```

You should see all 5 tables listed.

---

## Step 3: Verify RLS Policies

Run this SQL query to check RLS policies:

```sql
-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN (
  'practice_sessions',
  'practice_questions',
  'practice_attempts',
  'mistake_patterns',
  'adaptive_difficulty'
)
ORDER BY tablename, policyname;
```

You should see policies for all tables with `cmd = 'ALL'` (allowing SELECT, INSERT, UPDATE, DELETE).

---

## Step 4: Test API Endpoints

### Option 1: Using Test Script

```bash
# Run test script
npx tsx scripts/test-practice-api.ts
```

### Option 2: Manual Testing

1. **Login to your application**
2. **Navigate to**: `/dashboard/student/practice`
3. **Add a mistake** and generate questions
4. **Complete a practice session**
5. **Check analytics** tab for insights

---

## Step 5: Verify Everything Works

### Checklist:
- ✅ All 5 tables created
- ✅ RLS policies enabled
- ✅ Can create practice sessions
- ✅ Can record attempts
- ✅ Analytics endpoint returns data
- ✅ Mistake patterns are tracked
- ✅ Adaptive difficulty is updated

---

## Troubleshooting

### Issue: "relation does not exist"
**Solution**: Migration not applied. Apply migration in Step 1.

### Issue: "permission denied"
**Solution**: RLS policies not enabled. Check Step 3.

### Issue: "authentication required"
**Solution**: You need to be logged in. Test from the UI after logging in.

### Issue: "function does not exist"
**Solution**: Helper functions not created. Re-run migration.

---

## Migration Rollback (if needed)

If you need to rollback the migration:

```sql
-- Drop tables (in reverse order)
DROP TABLE IF EXISTS public.practice_attempts CASCADE;
DROP TABLE IF EXISTS public.practice_questions CASCADE;
DROP TABLE IF EXISTS public.practice_sessions CASCADE;
DROP TABLE IF EXISTS public.mistake_patterns CASCADE;
DROP TABLE IF EXISTS public.adaptive_difficulty CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.update_practice_session_accuracy() CASCADE;
DROP FUNCTION IF EXISTS public.update_adaptive_difficulty_performance() CASCADE;
```

⚠️ **Warning**: This will delete all practice data!

---

## Status

✅ Migration file ready: `supabase/migrations/017_practice_questions_system.sql`
✅ All tables defined
✅ RLS policies configured
✅ Helper functions created

**Ready to apply!** Follow Step 1 to apply the migration.

