# ⚡ Quick Supabase Setup (5 Minutes)

## Current Issue

Your app is showing "TypeError: fetch failed" because **Supabase database is not configured**.

## Option 1: Quick Test with Mock Mode (No Database)

To test the UI without setting up database:

1. **Edit Frontend .env**:
   ```bash
   # Change this line in local-jobs-platform/.env
   VITE_MOCK_MODE=true
   ```

2. **Refresh browser** - Press `Ctrl+Shift+R`

This will use mock data for testing the UI flows.

---

## Option 2: Setup Real Database (Recommended - 5 minutes)

### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub/Google (free)

### Step 2: Create New Project
1. Click "New Project"
2. Fill in:
   - **Name**: `local-jobs-portal`
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
3. Click "Create new project"
4. **Wait 2-3 minutes** for setup

### Step 3: Setup Database Tables
1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Open this file: `local-jobs-backend/SUPABASE_SCHEMA.sql`
4. Copy ALL contents
5. Paste into SQL Editor
6. Click **RUN** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

### Step 4: Get API Credentials
1. Go to **Settings** → **API** (left sidebar)
2. You'll see:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Project API keys**:
     - `anon` `public` (first key)
     - `service_role` (second key - click "Reveal" to see)

### Step 5: Update Backend .env
1. Open `local-jobs-backend/.env`
2. Update these lines:
   ```bash
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. **Save the file**

### Step 6: Restart Backend
1. In terminal where backend is running, press `Ctrl+C`
2. Run again:
   ```bash
   cd local-jobs-backend
   npm run dev
   ```

### Step 7: Test
1. Refresh browser: http://localhost:5173/local-job-portal/
2. Select language
3. Enter phone: `9876543210`
4. Click "Send OTP"
5. **OTP will show in GREEN BOX!** ✅

---

## Verify Setup

### Check Backend Logs
In terminal where backend is running, you should see:
```
🚀 Job Platform API Server Running
```

### Check Database Connection
Visit: http://localhost:5000/health

Should return:
```json
{"success":true,"data":{"status":"OK","timestamp":"..."}}
```

### Test OTP Generation
1. Go to: http://localhost:5173/local-job-portal/
2. Click English
3. Enter phone: `9876543210`
4. Click "Send OTP"
5. Check backend terminal - you'll see:
   ```
   [DEV MODE] OTP: 123456 for phone: 9876543210
   ```
6. OTP also shown on screen in green box

---

## Troubleshooting

### "fetch failed" error
- Supabase credentials not set
- Follow Option 2 above

### Hindi button not visible
- Scroll down on the page
- Or zoom out browser (Ctrl + Mouse wheel)
- Hindi button is above English button

### "Send OTP" button not visible
- Check browser console (F12)
- Make sure backend is running
- Check if port 5000 is accessible

### Backend won't start
- Check if `.env` file exists
- Check if all npm packages installed: `npm install`
- Check port 5000 not in use

---

## Quick Copy-Paste Template

After creating Supabase project, copy this template and fill in your values:

```bash
# Replace in local-jobs-backend/.env

SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
SUPABASE_ANON_KEY=YOUR-ANON-KEY-HERE
SUPABASE_SERVICE_KEY=YOUR-SERVICE-KEY-HERE
```

---

## ✅ Success Check

You'll know setup is complete when:
- ✅ Backend starts without errors
- ✅ http://localhost:5000/health returns success
- ✅ Can enter phone number
- ✅ "Send OTP" button works
- ✅ OTP appears in GREEN BOX on screen
- ✅ Can verify OTP and proceed

---

**Need help?** Check [TESTING_GUIDE.md](./TESTING_GUIDE.md) for full testing instructions.
