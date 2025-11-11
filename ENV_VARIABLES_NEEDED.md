# 🔑 Environment Variables Needed

## Current Status

**✅ Already Configured (per latest verification):**
- Core platform
  - Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
  - Pinecone (`PINECONE_API_KEY`, `PINECONE_INDEX`)
  - Firebase Admin + Client (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `NEXT_PUBLIC_FIREBASE_*`)
  - PostHog (`NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`)
  - Sentry (`SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`)
  - Resend (`RESEND_API_KEY`)
  - Semantic Scholar (`SEMANTIC_SCHOLAR_API_KEY`)

- ARK AI Orchestration (at least one provider required)
  - OpenAI (`OPENAI_API_KEY`)
  - Claude / Anthropic (`CLAUDE_API_KEY` or `ANTHROPIC_API_KEY`)
  - Gemini (`GEMINI_API_KEY`)
  - Perplexity (`PERPLEXITY_API_KEY`)
  - Cohere (`COHERE_API_KEY`)
  - Mistral (`MISTRAL_API_KEY`)

- Resource Gathering APIs used during ARK creation
  - YouTube Data API (`YOUTUBE_DATA_API_KEY`)
  - GitHub (`GITHUB_TOKEN`)
  - Reddit (`REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USER_AGENT`)
  - Optional: Tavily / additional research providers (add to `.env.local` as needed)

**⚠️ Added / Recently Required (restart may be needed):**
- Razorpay payments flow
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`
  - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- EmailJS contact form
  - `NEXT_PUBLIC_EMAILJS_SERVICE_ID`
  - `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`
  - `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`
- Optional ML / Vision add-ons
  - `GOOGLE_CLOUD_VISION_API_KEY`
  - `GOOGLE_CLOUD_TTS_API_KEY`
  - `GOOGLE_CLOUD_STT_API_KEY`
  - `HUME_AI_API_KEY`
  - `DEEPL_API_KEY`
  - `WOLFRAM_ALPHA_APP_ID`

**❌ Not yet obtained:**
- (None – optional keys can be added as future features require.)

---

All core env variables are in place. Use `npm run setup:verify` after any updates to confirm the configuration.
