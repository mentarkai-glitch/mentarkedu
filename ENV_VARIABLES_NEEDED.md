# 🔑 Environment Variables Needed

## Current Status

**✅ Already Configured:**
- Supabase
- Pinecone
- OpenAI
- Claude
- Gemini
- Perplexity
- Firebase
- HuggingFace
- PostHog
- Sentry
- Resend
- Semantic Scholar

**⚠️ Added (restart may be needed):**
- Update the dev server if analytics/emails appear stale
- Configure Razorpay keys for the new payments flow:
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`
  - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- Configure EmailJS for the contact form:
  - `NEXT_PUBLIC_EMAILJS_SERVICE_ID`
  - `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`
  - `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`

**❌ Not yet obtained:**
- (None – optional keys can be added as future features require.)

---

All core env variables are in place. Use `npm run setup:verify` after any updates to confirm the configuration.
