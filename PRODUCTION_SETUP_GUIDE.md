# 🚀 Production Setup Guide: Supabase, OAuth & Pinecone

This guide will help you configure Mentark Quantum for production with proper authentication, OAuth, and vector database setup.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Step 1: Supabase Project Setup](#step-1-supabase-project-setup)
- [Step 2: OAuth Configuration](#step-2-oauth-configuration)
- [Step 3: Row Level Security (RLS)](#step-3-row-level-security-rls)
- [Step 4: Pinecone Configuration](#step-4-pinecone-configuration)
- [Step 5: Environment Variables](#step-5-environment-variables)
- [Step 6: Database Migrations](#step-6-database-migrations)
- [Step 7: Verification & Testing](#step-7-verification--testing)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

If you're setting up for the first time, follow this checklist:

```bash
✅ Create Supabase project
✅ Configure Google OAuth
✅ Set up RLS policies
✅ Create Pinecone index
✅ Run database migrations
✅ Configure environment variables
✅ Test authentication flow
```

---

## Step 1: Supabase Project Setup

### A. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: `mentark-quantum`
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing**: Start with Free tier

4. Wait for project initialization (~2 minutes)

### B. Get API Keys

1. Navigate to **Settings → API**
2. Copy these values to your `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

⚠️ **Security Note**: The `anon` key is safe for public use with RLS enabled.

---

## Step 2: OAuth Configuration

### A. Google OAuth Setup

#### 1. Create Google Cloud Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project: `Mentark Quantum`
3. Enable **Google+ API**:
   - Navigate to **APIs & Services → Enable APIs**
   - Search for "Google+ API" and enable it

4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services → Credentials**
   - Click **Create Credentials → OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Name: `Mentark Quantum Web Client`
   
5. Add authorized redirect URIs:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
   
   For local development:
   ```
   http://localhost:3002/auth/callback
   ```

6. Copy **Client ID** and **Client Secret**

#### 2. Configure in Supabase

1. In Supabase dashboard, go to **Authentication → Providers**
2. Find **Google** provider and toggle it **ON**
3. Enter credentials:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
4. Click **Save**

#### 3. Test Google OAuth

1. Run `npm run dev`
2. Navigate to `/auth/login`
3. Click **"Sign in with Google"**
4. Complete OAuth flow
5. Verify you're redirected back to `/dashboard`

### B. Email Authentication (Already Configured)

Supabase provides email/password auth by default. The following auth methods are already implemented:

- ✅ Email/password registration
- ✅ Email/password login
- ✅ Email verification
- ✅ Password reset
- ✅ Magic links (optional)

To customize email templates:
1. Go to **Authentication → Email Templates**
2. Customize confirmation, reset, and magic link emails
3. Add Mentark branding

---

## Step 3: Row Level Security (RLS)

Row Level Security ensures data isolation between institutes and users.

### A. Verify RLS Status

All tables in your migrations should have RLS enabled. Check in Supabase:

1. Go to **Table Editor**
2. For each table, click **Settings** (gear icon)
3. Verify **"Enable Row Level Security"** is ON

### B. Key RLS Policies Already Implemented

The migrations include these policies:

#### Users Table
```sql
-- Users can only read their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update own data
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

#### Students Table
```sql
-- Students can view their own data
CREATE POLICY "Students can view own data" ON students
  FOR SELECT USING (auth.uid() = user_id);

-- Teachers can view students in their batches
CREATE POLICY "Teachers can view assigned students" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM teacher_student_assignments tsa
      WHERE tsa.student_id = students.user_id
      AND tsa.teacher_id = auth.uid()
    )
  );
```

#### Institutes Table
```sql
-- Only admins can modify their institute
CREATE POLICY "Admins can manage their institute" ON institutes
  FOR ALL USING (auth.uid() = admin_id);
```

### C. Test RLS Policies

1. Create test users (student, teacher, admin)
2. Log in as each user
3. Verify data isolation:
   - Students can't see other students' data
   - Teachers can only see their assigned students
   - Admins can only modify their own institute

---

## Step 4: Pinecone Configuration

Pinecone stores conversation memory and contextual data for AI responses.

### A. Create Pinecone Account

1. Go to [pinecone.io](https://pinecone.io)
2. Sign up for free account
3. Verify email

### B. Create Index

1. In Pinecone dashboard, click **"Create Index"**
2. Configure index:
   - **Name**: `mentark-memory`
   - **Dimension**: `1536` (OpenAI ada-002 embeddings)
   - **Metric**: `cosine`
   - **Pod Type**: `s1.x1` (free tier) or `p1.x1` (performance)
   - **Region**: Same as Supabase for low latency

3. Click **"Create Index"**

### C. Get API Key

1. Go to **API Keys** section
2. Copy your API key to `.env.local`:
   ```
   PINECONE_API_KEY=your-pinecone-api-key
   ```

### D. Verify Index

The app automatically uses the index. Verify connection:

1. In `lib/ai/memory.ts`, the index is referenced as:
   ```typescript
   const INDEX_NAME = "mentark-memory";
   ```

2. Test by chatting with the AI mentor:
   - Memory should be stored after conversation
   - Previous context should be retrieved

---

## Step 5: Environment Variables

Create a `.env.local` file in the root directory with all required variables.

### A. Create `.env.local`

```bash
# Copy from .env.example if exists, or create new file
touch .env.local
```

### B. Required Variables

```env
# ============================================
# SUPABASE CONFIGURATION
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: For server-side operations
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key


# ============================================
# AI MODELS
# ============================================
OPENAI_API_KEY=sk-your-openai-key
CLAUDE_API_KEY=sk-ant-your-claude-key
GEMINI_API_KEY=your-gemini-key
PERPLEXITY_API_KEY=pplx-your-perplexity-key

# Optional AI providers
# MISTRAL_API_KEY=your-mistral-key
# COHERE_API_KEY=your-cohere-key
# GROK_API_KEY=your-grok-key


# ============================================
# VECTOR DATABASE
# ============================================
PINECONE_API_KEY=your-pinecone-api-key


# ============================================
# EXTERNAL APIs
# ============================================
# YouTube for video resources
YOUTUBE_API_KEY=your-youtube-key

# GitHub for code resources
GITHUB_TOKEN=your-github-token

# Google Vision for multi-modal input
GOOGLE_CLOUD_VISION_API_KEY=your-google-vision-key


# ============================================
# COMMUNICATION SERVICES
# ============================================
# Resend for emails
RESEND_API_KEY=re-your-resend-key

# Firebase for push notifications
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id

# Twilio for WhatsApp (optional)
# TWILIO_ACCOUNT_SID=your-twilio-sid
# TWILIO_AUTH_TOKEN=your-twilio-token
# TWILIO_WHATSAPP_NUMBER=your-whatsapp-number


# ============================================
# ANALYTICS & MONITORING
# ============================================
# PostHog for product analytics
NEXT_PUBLIC_POSTHOG_KEY=phc-your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry for error tracking
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token


# ============================================
# ML & TRAINING
# ============================================
# Hugging Face for ML models
HF_API_KEY=hf_your-huggingface-key


# ============================================
# REDIS (Optional)
# ============================================
# Upstash Redis for caching
# UPSTASH_REDIS_REST_URL=your-upstash-url
# UPSTASH_REDIS_REST_TOKEN=your-upstash-token


# ============================================
# DEVELOPMENT
# ============================================
NODE_ENV=development
```

### C. Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Use different keys for dev/staging/production**
3. **Rotate keys regularly**
4. **Limit API key permissions** when possible

---

## Step 6: Database Migrations

Run all database migrations to set up the schema.

### A. Option 1: Supabase Dashboard (Recommended)

1. Go to **SQL Editor** in Supabase dashboard
2. Run migrations in order:

```bash
001_initial_schema.sql          # Core tables
002_gamification_career_dna.sql # Gamification features
003_teacher_admin_system.sql    # Teacher/Admin tables
004_ml_risk_sentiment.sql       # ML features
005_multimodal_support.sql      # Vision API support
006_sms_integration.sql         # SMS features
007_ai_orchestration_system.sql # AI routing
008_add_ai_identity_profile.sql # Student AI profiles
008_notification_logs.sql       # Notification logging
```

3. Click **Run** after each migration

### B. Option 2: Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push

# Or reset database
supabase db reset
```

### C. Verify Migrations

1. Go to **Table Editor** in Supabase
2. Confirm all tables exist:
   - `institutes`, `users`, `students`, `teachers`, `admins`
   - `arks`, `ark_milestones`, `ark_resources`
   - `chat_sessions`, `messages`
   - `daily_checkins`, `emotion_timeline`
   - `student_stats`, `achievements`
   - `ark_templates`, `interventions`
   - `risk_predictions`, `behavioral_patterns`
   - `student_journals`, `message_attachments`

---

## Step 7: Verification & Testing

### A. Authentication Flow Test

```bash
# Test email/password registration
✅ Navigate to /auth/register
✅ Create test account (student role)
✅ Verify email confirmation received
✅ Log in with credentials

# Test OAuth
✅ Navigate to /auth/login
✅ Click "Sign in with Google"
✅ Complete OAuth flow
✅ Verify redirect to /dashboard
✅ Verify user profile created in Supabase
```

### B. RLS Security Test

```bash
# Test student isolation
✅ Create Student A
✅ Create Student B
✅ Log in as Student A
✅ Verify can't see Student B's ARKs or chat history

# Test teacher access
✅ Create Teacher
✅ Assign Teacher to Student A's batch
✅ Log in as Teacher
✅ Verify can see Student A but not Student B
```

### C. Pinecone Integration Test

```bash
# Test memory storage
✅ Log in as student
✅ Navigate to /chat
✅ Send several messages to AI mentor
✅ Verify memories stored in Pinecone

# Test memory retrieval
✅ Start new chat session
✅ Reference previous conversation
✅ Verify AI remembers context
```

### D. API Endpoint Test

Test critical API endpoints:

```bash
# Test ARK generation
curl -X POST http://localhost:3002/api/ai/generate-ark \
  -H "Content-Type: application/json" \
  -d '{"categoryId":"academic-excellence",...}'

# Test risk prediction
curl http://localhost:3002/api/ml/predict-risk?studentId=test-student-id

# Test vision API
curl -X POST http://localhost:3002/api/vision/analyze-image \
  -H "Content-Type: application/json" \
  -d '{"imageBase64":"data:image/jpeg;base64,..."}'
```

---

## Troubleshooting

### Issue: OAuth redirect loop

**Cause**: Callback URL not configured correctly

**Solution**:
1. Verify Google OAuth callback URI in Google Cloud Console
2. Should be: `https://your-project.supabase.co/auth/v1/callback`
3. Add to authorized redirect URIs

---

### Issue: RLS blocking data access

**Cause**: RLS policies too restrictive

**Solution**:
1. Check Supabase logs: **Logs → Postgres Logs**
2. Verify user has proper role in `users` table
3. Check RLS policies in migration files
4. Temporarily disable RLS for testing (NOT recommended for production)

---

### Issue: Pinecone connection timeout

**Cause**: Invalid API key or wrong index name

**Solution**:
1. Verify `PINECONE_API_KEY` in `.env.local`
2. Confirm index name is `mentark-memory`
3. Check Pinecone dashboard for index status
4. Verify region matches

---

### Issue: AI model errors

**Cause**: Invalid API keys or rate limits

**Solution**:
1. Verify all AI API keys in `.env.local`
2. Check API quotas in provider dashboards
3. Review error logs in console
4. Implement retry logic in `lib/ai/orchestrator.ts`

---

### Issue: Database migration errors

**Cause**: Schema conflicts or syntax errors

**Solution**:
1. Check migration file syntax
2. Verify dependencies between migrations
3. Drop and recreate tables if needed
4. Use `supabase db reset` for clean slate

---

### Issue: Environment variables not loading

**Cause**: `.env.local` not in root or not formatted correctly

**Solution**:
1. Verify file is in project root
2. Check for typos in variable names
3. Restart dev server after changes
4. Use `console.log(process.env.VARIABLE_NAME)` to debug

---

## Production Checklist

Before deploying to production:

```bash
✅ All environment variables set
✅ Google OAuth configured and tested
✅ RLS policies verified
✅ Pinecone index created and tested
✅ All migrations run successfully
✅ Authentication flow works (email & OAuth)
✅ Data isolation verified
✅ API endpoints responding
✅ AI models working with fallback
✅ Error tracking configured (Sentry)
✅ Analytics configured (PostHog)
✅ Email templates customized
✅ Domain configured in Supabase auth settings
```

---

## Next Steps

After completing this setup:

1. **Generate Demo Data**: Run `npm run demo:generate` for testing
2. **Customize Branding**: Update logo, colors, and email templates
3. **Monitor Usage**: Set up alerts in Supabase and Pinecone
4. **Backup Strategy**: Enable Supabase backups
5. **Scale Planning**: Monitor resource usage and upgrade as needed

---

## Support

For issues not covered in this guide:

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Pinecone Docs**: [docs.pinecone.io](https://docs.pinecone.io)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

---

**Last Updated**: January 2025  
**Version**: 1.0.0

