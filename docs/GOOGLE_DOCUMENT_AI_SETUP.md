# ✅ Google Document AI Setup Guide

## Overview

Google Document AI OCR integration for Form Filler requires proper authentication. This guide covers the setup.

---

## ⚠️ Important: Authentication Requirements

**Google Document AI processors require OAuth/service account authentication, not just API keys.**

The API key you have may work for some basic operations, but for Form Parser processors, you typically need:
- Service Account credentials (recommended), OR
- OAuth token

---

## Setup Options

### Option 1: Service Account (Recommended) ✅

**Best for production and processors.**

#### Step 1: Create Service Account
1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Select project: `mentark-edu`
3. Click "Create Service Account"
4. Name: `mentark-document-ai`
5. Click "Create and Continue"
6. Grant role: `Document AI API User`
7. Click "Continue" → "Done"

#### Step 2: Create and Download Key
1. Click on the created service account
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Select "JSON"
5. Download the JSON file
6. Save securely (e.g., `google-service-account.json`)

#### Step 3: Add to Environment Variables
```env
# Service Account Path (recommended)
GOOGLE_APPLICATION_CREDENTIALS=path/to/google-service-account.json

# OR set credentials in environment
GOOGLE_DOCUMENT_AI_PROJECT_ID=mentark-edu
GOOGLE_DOCUMENT_AI_LOCATION=us
GOOGLE_DOCUMENT_AI_FORM_PARSER_ID=60180463eba9ae5f
GOOGLE_DOCUMENT_AI_OCR_ID=234ca2361069f6f2
```

---

### Option 2: API Key (Limited) ⚠️

**Works for basic OCR, may not work for processors.**

You already have the API key. Add to `.env.local`:

```env
GOOGLE_DOCUMENT_AI_API_KEY=AIzaSyDqmnk4J1aLat6XJswb_qM1DyFP-O1yZ7Y
GOOGLE_DOCUMENT_AI_PROJECT_ID=mentark-edu
GOOGLE_DOCUMENT_AI_LOCATION=us
GOOGLE_DOCUMENT_AI_FORM_PARSER_ID=60180463eba9ae5f
GOOGLE_DOCUMENT_AI_OCR_ID=234ca2361069f6f2
```

**Note:** If you get OAuth errors, you'll need to set up service account (Option 1).

---

## Current Configuration

✅ **What you have:**
- API Key: `AIzaSyDqmnk4J1aLat6XJswb_qM1DyFP-O1yZ7Y`
- Project ID: `mentark-edu`
- Location: `us`
- Form Parser Processor: `60180463eba9ae5f`
- Document OCR Processor: `234ca2361069f6f2`

---

## Testing

### 1. Test with API Key First

The implementation will try API key first. If it works, great!

### 2. If OAuth Error Occurs

You'll see an error message: "Document AI requires service account credentials."

**Solution:** Set up service account (Option 1 above).

---

## Alternative: Google Cloud Vision API

If Document AI OAuth setup is complex, we can use **Google Cloud Vision API** which works with just an API key:

```env
GOOGLE_CLOUD_VISION_API_KEY=your-vision-api-key
```

**Trade-offs:**
- ✅ Simpler (just API key)
- ❌ Less accurate for structured forms
- ❌ No automatic form field extraction

---

## Recommended Next Steps

1. **Try API key first** - It might work for basic OCR
2. **If OAuth errors** - Set up service account
3. **Test document upload** - Verify extraction works
4. **Use Form Parser** - For structured form extraction

---

## Implementation Status

✅ Document AI service created (`lib/services/document-ai.ts`)
✅ Upload API endpoint created (`app/api/vision/upload-document/route.ts`)
✅ Document upload UI added to Form Filler
✅ Error handling for OAuth requirements

**Ready to test!** Upload a document and see if it works with your API key.

