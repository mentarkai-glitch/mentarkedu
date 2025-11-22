### EmailJS Setup Guide

1. Log in to your EmailJS dashboard.
2. Click your profile avatar (top-right) → **Account** → **API Keys**.
3. Copy the value labeled **Public Key** (starts with `v_` or similar). This is what we expose client-side.
4. Add/update the following env vars in `.env.local` (same directory as `package.json`):

```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_ig2nocf
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_6k34q2h
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=8jzsyBLBwlUCpotE0
```

5. Restart `npm run dev` so Next.js picks up the new env vars.
6. Test the homepage form to confirm “Sending…” transitions to success.

