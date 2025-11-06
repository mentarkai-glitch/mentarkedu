# Port Configuration & Environment Setup

## ✅ **Port Assignment - Fixed!**

Mentark Quantum is now configured to always use **port 3002** to avoid conflicts with your other Mentark project.

### **Updated Scripts**

**File**: `package.json`

```json
"scripts": {
  "dev": "next dev --turbopack -p 3002",     // Development port
  "start": "next start -p 3002"              // Production port
}
```

---

## 🔗 **Project Port Map**

| Project | Port | URL |
|---------|------|-----|
| **Mentark (Original)** | 3000 | http://localhost:3000 |
| **Mentark Quantum (B2B)** | 3002 | http://localhost:3002 |

---

## ⚠️ **API Redirect URIs to Update**

Since we changed the port to 3002, you need to update these redirect URIs in your API configurations:

### **1. Google Calendar API**

**Current (in .env)**:
```
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

**Should be updated to**:
```
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3002/api/auth/google/callback
```

**Where to update**:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. APIs & Services → Credentials
4. Edit OAuth 2.0 Client ID
5. Add to "Authorized redirect URIs": `http://localhost:3002/api/auth/google/callback`
6. Update your `.env.local` file with the new URI

---

### **2. Firebase (If using Auth)**

**Where to update**:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `mentark-a7bfa`
3. Authentication → Settings → Authorized domains
4. Add: `localhost:3002`

**Note**: Your current Firebase config works for push notifications (no redirect needed), but if you add Firebase Auth later, add this domain.

---

### **3. Supabase (If using OAuth)**

**Where to update**:
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select project: `nfclssexacbbjmqhplal`
3. Authentication → URL Configuration
4. Add to "Redirect URLs": `http://localhost:3002/**`

**Your current setup**: Should already work since you're using Supabase Auth (not OAuth providers), but good to verify.

---

## 🚀 **Production Deployment**

When deploying to production (Vercel), the port won't matter:
- Vercel automatically handles ports
- Production URL will be: `https://mentark-quantum.vercel.app`
- Update all redirect URIs to production domain

**Update these for production**:
```
GOOGLE_CALENDAR_REDIRECT_URI=https://mentark-quantum.vercel.app/api/auth/google/callback
```

Add production domain to:
- Firebase Authorized Domains
- Supabase Redirect URLs
- Google Cloud Console

---

## 🔧 **How to Run Both Projects**

### **Option 1: Sequential (Recommended)**
Work on one project at a time:

```bash
# Terminal 1 - Mentark (Original)
cd path/to/mentark
npm run dev
# Runs on localhost:3000

# Terminal 2 - Mentark Quantum (B2B) - Close Terminal 1 first
cd path/to/mentark-quantum
npm run dev
# Runs on localhost:3002
```

### **Option 2: Parallel (If you need both running)**
Run both simultaneously:

```bash
# Terminal 1 - Mentark (Original)
cd path/to/mentark
npm run dev
# localhost:3000

# Terminal 2 - Mentark Quantum (B2B)
cd path/to/mentark-quantum
npm run dev
# localhost:3002
```

**Note**: This works but uses 2x resources (RAM, CPU)

---

## 📝 **Environment Variables - Port References**

Check if you have hardcoded `localhost:3000` anywhere:

**Files to check** (if you use these features):
- OAuth callback URLs
- Webhook endpoints
- CORS origins
- API base URLs

**Good practice**: Use environment variable for base URL:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

Then in code:
```typescript
const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
```

---

## 🗄️ **Database Separation**

### **Are Both Projects Using Same Supabase?**

**Current Mentark Quantum**:
- URL: `https://nfclssexacbbjmqhplal.supabase.co`

**Check your other Mentark project's `.env`**:
- If it has the **same Supabase URL** → ⚠️ **Sharing database**
- If it has a **different URL** → ✅ **Separate databases**

### **If Sharing Database (Not Recommended)**

**Problems**:
- Schema conflicts (both running migrations)
- Data mixing (students from both projects)
- Auth conflicts

**Solutions**:
1. **Best**: Create separate Supabase project for Mentark Quantum
2. **Alternative**: Use schema namespacing (complex)
3. **Temporary**: Run only one project at a time

---

## ✅ **What's Already Fixed**

✅ Port 3002 assigned to Mentark Quantum
✅ No more auto-incrementing confusion
✅ Clear separation from original Mentark
✅ Production-ready port configuration

---

## 📋 **Action Items for You**

### **Required** (To fully use port 3002):
1. **Update Google Calendar redirect URI**:
   - Go to Google Cloud Console
   - Change from `localhost:3000` to `localhost:3002`
   - Update `.env.local` to match

### **Optional** (For better setup):
2. **Add localhost:3002 to Firebase authorized domains**
3. **Verify Supabase redirect URLs include `localhost:3002/**`
4. **Check if other Mentark uses same Supabase** (if yes, consider separate project)

### **Recommended** (For clean development):
5. Close other Mentark when working on Quantum
6. Or use separate Supabase projects for each

---

## 🎯 **Summary**

**Problem**: Two projects competing for port 3000
**Solution**: Mentark Quantum now permanently on port 3002
**Status**: ✅ Fixed
**Impact**: Clean separation, no more conflicts
**Action Needed**: Update OAuth redirect URIs to port 3002

---

**You're all set!** Run `npm run dev` and it will always use port 3002. 🚀


