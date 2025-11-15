# 📋 How to Apply Dashboard Enhancements Migration via Supabase MCP

## Option 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/fdaalltjojwqxxcjombo

2. **Open SQL Editor**
   - Click on **"SQL Editor"** in the left sidebar
   - Click **"New query"**

3. **Copy Migration File**
   - Open: `supabase/migrations/018_dashboard_enhancements.sql`
   - Copy the entire contents (260 lines)

4. **Paste and Run**
   - Paste into the SQL editor
   - Click **"Run"** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

5. **Verify Migration**
   - Check that all tables are created:
     - `student_goals`
     - `attendance`
     - `engagement_logs`
     - `assignments`
     - `assignment_submissions`
     - `dashboard_preferences`
   - Verify RLS policies are enabled
   - Verify functions are created

---

## Option 2: Using Supabase MCP (If Available)

If your Supabase MCP server is authenticated and working, you can use it to apply the migration.

**Note**: Your MCP config shows Supabase MCP is configured at:
```
https://mcp.supabase.com/mcp?project_ref=fdaalltjojwqxxcjombo
```

To use MCP:
1. Ensure you're authenticated with Supabase MCP
2. The MCP server should have access to execute SQL
3. You can ask the AI assistant to run the migration SQL

**Current Status**: MCP resources are not currently showing, which might mean:
- The MCP server needs authentication
- The MCP server is not active
- You may need to authenticate through your browser when prompted

---

## Verification Query

After applying the migration, run this in Supabase SQL Editor to verify:

```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'student_goals',
    'attendance',
    'engagement_logs',
    'assignments',
    'assignment_submissions',
    'dashboard_preferences'
  )
ORDER BY table_name;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies
WHERE tablename IN (
  'student_goals',
  'attendance',
  'engagement_logs',
  'assignments',
  'assignment_submissions',
  'dashboard_preferences'
)
ORDER BY tablename, policyname;

-- Check functions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'update_student_goals_updated_at',
    'update_assignments_updated_at',
    'update_assignment_submissions_updated_at',
    'calculate_engagement_score'
  )
ORDER BY routine_name;
```

---

## Troubleshooting

### Issue: MCP resources not found
**Solution**: 
- Check if you need to authenticate the MCP server
- Try accessing Supabase Dashboard directly
- Apply migration manually via SQL Editor

### Issue: Permission denied
**Solution**: 
- Ensure you're using a user with proper permissions
- Check RLS policies are correctly set
- Verify you're authenticated in Supabase Dashboard

---

## Next Steps

After applying the migration:
1. ✅ Test student dashboard with Unified Analytics widget
2. ✅ Test teacher dashboard with enhanced batch analytics
3. ✅ Verify student cards show engagement scores
4. ✅ Check practice questions integration works

---

**Status**: Ready to apply via Supabase Dashboard SQL Editor

