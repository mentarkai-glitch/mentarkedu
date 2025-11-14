# 🔐 Google Document AI - Service Account Setup (REQUIRED)

## ⚠️ Important: Document AI Requires Service Account

**Google Document AI processors require service account credentials for server-side operations.**

The OAuth client credentials you provided are for **user-facing OAuth flows** (like Google Calendar), not for server-to-server operations like Document AI.

---

## ✅ Solution: Create Service Account

### Step 1: Create Service Account

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=mentark-edu
2. Click **"Create Service Account"**
3. Fill in:
   - **Name**: `mentark-document-ai`
   - **Description**: `Service account for Document AI OCR operations`
4. Click **"Create and Continue"**

### Step 2: Grant Permissions

1. Grant role: **`Document AI API User`**
2. Click **"Continue"** → **"Done"**

### Step 3: Create and Download Key

1. Click on the created service account (`mentark-document-ai`)
2. Go to **"Keys"** tab
3. Click **"Add Key"** → **"Create new key"**
4. Select **"JSON"**
5. Click **"Create"**
6. **Download the JSON file** (save it securely)

### Step 4: Add to Environment Variables

Add to your `.env.local`:

```env
# Service Account Credentials (REQUIRED for Document AI)
GOOGLE_APPLICATION_CREDENTIALS=./google-service-account.json

# Or use absolute path:
# GOOGLE_APPLICATION_CREDENTIALS=C:\Users\sachR\OneDrive\Desktop\mentark-quantum\google-service-account.json

# Document AI Configuration
GOOGLE_DOCUMENT_AI_PROJECT_ID=mentark-edu
GOOGLE_DOCUMENT_AI_LOCATION=us
GOOGLE_DOCUMENT_AI_FORM_PARSER_ID=60180463eba9ae5f
GOOGLE_DOCUMENT_AI_OCR_ID=234ca2361069f6f2
```

### Step 5: Place JSON File

Place the downloaded `google-service-account.json` file in your project root:

```
mentark-quantum/
├── google-service-account.json  ← Place service account JSON here
├── .env.local
├── package.json
└── ...
```

**⚠️ Important**: 
- Add `google-service-account.json` to `.gitignore` (don't commit it!)
- Keep it secure - it has full access to your Google Cloud project

### Step 6: Update .gitignore

Make sure `.gitignore` includes:

```gitignore
# Google Service Account (Sensitive)
google-service-account.json
*.json
!package.json
!tsconfig.json
```

---

## 🎯 Quick Setup Summary

1. ✅ Create service account in Google Cloud Console
2. ✅ Grant `Document AI API User` role
3. ✅ Download JSON key file
4. ✅ Place in project root
5. ✅ Add `GOOGLE_APPLICATION_CREDENTIALS` to `.env.local`
6. ✅ Restart dev server

---

## 📝 Alternative: Use Google Cloud Vision API

If service account setup is complex, you can use **Google Cloud Vision API** which works with just an API key:

```env
GOOGLE_CLOUD_VISION_API_KEY=your-vision-api-key
```

**Trade-offs:**
- ✅ Simpler (just API key)
- ❌ Less accurate for structured forms
- ❌ No automatic form field extraction

---

## ✅ After Service Account Setup

Once you've set up the service account:

1. Add `GOOGLE_APPLICATION_CREDENTIALS` to `.env.local`
2. Restart dev server: `npm run dev`
3. Test document upload in Form Filler
4. It should work! ✅

---

## 🔒 Security Note

**Never commit service account JSON files to Git!**

- They have full access to your Google Cloud project
- Add to `.gitignore` immediately
- Use environment variables in production (Vercel, etc.)

---

## Status

✅ Service account setup instructions provided
✅ Environment variable configuration documented
✅ Security best practices included

**Next**: Create service account and add credentials to `.env.local`

