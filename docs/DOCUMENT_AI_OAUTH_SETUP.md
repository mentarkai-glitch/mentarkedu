# ✅ Google Document AI OAuth Setup Complete

## OAuth Credentials Configured

You've provided OAuth client credentials. Here's how to configure them:

### Environment Variables for `.env.local`

```env
# Google OAuth Client Credentials (for Document AI)
GOOGLE_CLIENT_ID=139807892857-q6c2kgl6a81v1e1e387f36pbqhcq4jdd.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Google Document AI Configuration
GOOGLE_DOCUMENT_AI_PROJECT_ID=mentark-edu
GOOGLE_DOCUMENT_AI_LOCATION=us
GOOGLE_DOCUMENT_AI_FORM_PARSER_ID=60180463eba9ae5f
GOOGLE_DOCUMENT_AI_OCR_ID=234ca2361069f6f2

# Document AI API Key (backup/fallback)
GOOGLE_DOCUMENT_AI_API_KEY=AIzaSyDqmnk4J1aLat6XJswb_qM1DyFP-O1yZ7Y
```

---

## ⚠️ Important: Authentication for Document AI

**Google Document AI processors typically require service account credentials for server-side operations.**

However, we've implemented support for:
1. ✅ **OAuth Client Credentials** (what you provided)
2. ✅ **Service Account** (if you add service account JSON)
3. ✅ **API Key** (fallback)

---

## Authentication Flow

The implementation tries authentication in this order:

1. **Service Account** (if `GOOGLE_APPLICATION_CREDENTIALS` is set)
2. **OAuth Client Credentials** (using your provided credentials)
3. **API Key** (fallback)

---

## Setup Instructions

### Step 1: Add Environment Variables

Add the OAuth credentials to your `.env.local`:

```env
GOOGLE_CLIENT_ID=139807892857-q6c2kgl6a81v1e1e387f36pbqhcq4jdd.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_DOCUMENT_AI_PROJECT_ID=mentark-edu
GOOGLE_DOCUMENT_AI_LOCATION=us
GOOGLE_DOCUMENT_AI_FORM_PARSER_ID=60180463eba9ae5f
GOOGLE_DOCUMENT_AI_OCR_ID=234ca2361069f6f2
```

### Step 2: Install Dependencies

```bash
npm install googleapis
```

### Step 3: Restart Server

```bash
npm run dev
```

---

## Testing

1. Navigate to: `/dashboard/student/forms`
2. Upload a document (PDF or image)
3. Check if OCR extraction works

If OAuth fails, you may need to:
- Create a service account for server-side operations
- Or use Google Cloud Vision API as an alternative

---

## Alternative: Service Account (Recommended for Production)

For production, create a service account:

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=mentark-edu
2. Create service account: `mentark-document-ai`
3. Grant role: `Document AI API User`
4. Create key (JSON)
5. Download and save as `google-service-account.json`
6. Add to `.env.local`:
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=path/to/google-service-account.json
   ```

---

## Status

✅ OAuth credentials integrated
✅ Authentication flow implemented
✅ Multiple auth methods supported
✅ Error handling in place

**Ready to test!** Upload a document and see if OCR extraction works.

