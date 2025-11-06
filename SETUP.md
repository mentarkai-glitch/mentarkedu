# 🚀 Quick Setup Guide - Mentark Quantum

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Supabase account created
- [ ] API keys obtained (see below)

---

## Step 1: Environment Setup

1. **Copy the API keys** you provided to a `.env.local` file in the root directory

2. **Get additional keys** (if not already obtained):

### Supabase Setup
- Go to [supabase.com](https://supabase.com)
- Create a new project
- Copy URL and anon key from Settings → API

### Pinecone Setup
- Go to [pinecone.io](https://pinecone.io)
- Create free account
- Create index named `mentark-memory`
- Dimension: 1536 (OpenAI ada-002 embeddings)
- Metric: Cosine

### Optional Services (for full functionality)
- **Resend**: [resend.com](https://resend.com) for emails
- **PostHog**: [posthog.com](https://posthog.com) for analytics
- **Sentry**: [sentry.io](https://sentry.io) for error tracking

---

## Step 2: Database Setup

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Click "SQL Editor"
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and run in SQL Editor

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

---

## Step 3: Install Dependencies

```bash
npm install
```

---

## Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Step 5: Test the Application

### Landing Page
✅ Visit homepage - should see Mentark Quantum branding

### Authentication (Placeholder)
✅ Click "Get Started" → Register page
✅ Fill form → Will show alert (full auth to be implemented)

### Database Connection
Check Supabase dashboard → Tables should be created

---

## Common Issues & Solutions

### Issue: `Cannot find module '@/lib/...'`
**Solution**: Restart dev server (`Ctrl+C` then `npm run dev`)

### Issue: Database migration fails
**Solution**: 
1. Check Supabase connection in `.env.local`
2. Ensure project is not paused
3. Run migration manually in SQL Editor

### Issue: AI API errors
**Solution**: 
1. Verify API keys in `.env.local`
2. Check API key validity on provider dashboards
3. Check rate limits

### Issue: TypeScript errors
**Solution**: 
```bash
npm run type-check
```

---

## Next Steps

### Immediate (to make app functional):
1. **Implement Supabase Auth**: 
   - Update `app/auth/login/page.tsx`
   - Update `app/auth/register/page.tsx`
   
2. **Create Dashboard Pages**:
   - `app/dashboard/student/page.tsx`
   - `app/dashboard/teacher/page.tsx`
   - `app/dashboard/admin/page.tsx`

3. **Test AI Endpoints**:
   ```bash
   curl -X POST http://localhost:3000/api/ai/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello!", "persona": "friendly"}'
   ```

### Week 2-4 (Core Features):
- Daily check-in flow
- ARK creation wizard
- Student dashboard with real data
- AI chat interface

### Week 5+ (Advanced):
- ML model training (dropout prediction)
- Analytics dashboards
- Voice/vision features
- Real-time collaboration

---

## Project Structure Quick Reference

```
app/
├── auth/              ← Authentication pages
├── dashboard/         ← Role-based dashboards
├── api/              ← API endpoints
└── page.tsx          ← Landing page

lib/
├── ai/               ← AI orchestration & models
├── supabase/         ← Database clients
├── services/         ← External services
├── gamification/     ← XP, badges, streaks
└── utils/            ← Helper functions

components/
└── ui/               ← Shadcn/UI components

supabase/
└── migrations/       ← Database schema
```

---

## Environment Variables Reference

Essential for MVP:
```env
# Core (Required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
CLAUDE_API_KEY=
GEMINI_API_KEY=

# Memory (Required for chat context)
PINECONE_API_KEY=

# Optional but Recommended
PERPLEXITY_API_KEY=
YOUTUBE_API_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
```

---

## Testing Checklist

Before deploying:
- [ ] Landing page loads
- [ ] Auth pages render
- [ ] API routes respond
- [ ] Database connection works
- [ ] AI models respond (test with curl)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add all environment variables in Vercel dashboard.

---

## Support

- **Documentation**: See README.md
- **Issues**: Check error logs in browser console
- **API Status**: Check individual provider status pages

---

**Ready to build? Run `npm run dev` and start coding! 🚀**

