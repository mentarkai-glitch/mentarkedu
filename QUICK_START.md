# 🚀 Mentark Quantum - Quick Start Guide

Get your Mentark Quantum installation running in 10 minutes!

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- API keys for AI models (OpenAI, Claude, Gemini, Perplexity)
- Pinecone account (free tier works)

---

## Step 1: Install Dependencies (1 min)

```bash
npm install
```

---

## Step 2: Create .env.local (2 min)

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# AI Models
OPENAI_API_KEY=sk-your-openai-key
CLAUDE_API_KEY=sk-ant-your-claude-key
GEMINI_API_KEY=your-gemini-key
PERPLEXITY_API_KEY=pplx-your-perplexity-key

# Vector Database
PINECONE_API_KEY=your-pinecone-api-key
```

📚 **Need help getting these keys?** See [PRODUCTION_SETUP_GUIDE.md](./PRODUCTION_SETUP_GUIDE.md)

---

## Step 3: Set Up Supabase (3 min)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy URL and anon key → paste into `.env.local`
4. Go to **SQL Editor**
5. Copy/paste entire contents of `supabase/migrations/001_initial_schema.sql`
6. Click **Run**
7. Repeat for all migration files (002, 003, 004, 005, etc.)

---

## Step 4: Set Up Pinecone (2 min)

1. Go to [pinecone.io](https://pinecone.io)
2. Create a new index:
   - **Name**: `mentark-memory`
   - **Dimension**: `1536`
   - **Metric**: `cosine`
3. Copy API key → paste into `.env.local`

---

## Step 5: Verify Setup (1 min)

```bash
npm run setup:verify
```

This checks everything is configured correctly!

---

## Step 6: Start Development Server (30 sec)

```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002) 🎉

---

## Optional: Generate Demo Data

```bash
npm run demo:generate
```

Creates sample students, teachers, and admins for testing.

---

## 🎯 What's Next?

- **Set up Google OAuth**: See [PRODUCTION_SETUP_GUIDE.md](./PRODUCTION_SETUP_GUIDE.md#step-2-oauth-configuration)
- **Customize branding**: Update logo and colors
- **Configure notifications**: Set up Firebase and Resend
- **Deploy to production**: Follow deployment guide

---

## ❓ Having Issues?

### Common Problems

**"Cannot connect to Supabase"**
- Check `.env.local` has correct URL and key
- Verify Supabase project is active
- Run `npm run setup:verify`

**"Pinecone index not found"**
- Ensure index name is exactly `mentark-memory`
- Check dimension is `1536`
- Verify API key is correct

**"Authentication not working"**
- Ensure migrations ran successfully
- Check browser console for errors
- Verify RLS policies are enabled

### Need More Help?

- 📚 Full guide: [PRODUCTION_SETUP_GUIDE.md](./PRODUCTION_SETUP_GUIDE.md)
- 🐛 Troubleshooting: See setup guide's troubleshooting section
- 📖 Documentation: [README.md](./README.md)

---

## ✅ Success Checklist

After completing these steps, you should have:

- ✅ Supabase project configured
- ✅ Database tables created
- ✅ Pinecone index ready
- ✅ AI models connected
- ✅ Dev server running
- ✅ Demo data (optional)

**You're ready to start building with Mentark Quantum!** 🚀

