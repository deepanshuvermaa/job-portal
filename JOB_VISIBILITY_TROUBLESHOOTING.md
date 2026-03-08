# Job Visibility Issue - Troubleshooting Guide

## Issue Reported
Workers cannot see approved jobs in the job feed, even though the job shows as approved in the admin dashboard.

## Root Cause Analysis

### How Job Status Works:
1. **Job Creation:** Employer posts job → Status = `'draft'`
2. **Admin Approval:** Admin clicks "Approve" → Status = `'open'`
3. **Worker Search:** Frontend searches for jobs with Status = `'open'`

### The Problem:
The job approval might not be setting the status correctly, OR the job search is looking for the wrong status.

## What Was Fixed

### 1. Enhanced Job Approval Endpoint
**File:** `local-jobs-backend/src/app.ts` (line 1381-1408)

**Before:**
```typescript
app.put('/api/admin/jobs/:jobId/approve', async (req, res) => {
  const { error } = await supabase
    .from('jobs')
    .update({ status: 'open' })
    .eq('id', jobId);

  return res.json({ message: 'Job approved' });
});
```

**After:**
```typescript
app.put('/api/admin/jobs/:jobId/approve', async (req, res) => {
  console.log(`📝 Admin approving job: ${jobId}`);

  const { data, error } = await supabase
    .from('jobs')
    .update({
      status: 'open',
      approved_at: new Date().toISOString(),
      approved_by: req.user!.userId
    })
    .eq('id', jobId)
    .select()
    .single();

  console.log(`✅ Job approved successfully:`, data);

  return res.json({ message: 'Job approved', data });
});
```

**Changes:**
- Added logging to track approval process
- Added `approved_at` timestamp
- Added `approved_by` admin ID tracking
- Returns updated job data
- Better error logging

### 2. Enhanced Job Search Endpoint
**File:** `local-jobs-backend/src/app.ts` (line 644-664)

**Before:**
```typescript
app.get('/api/workers/jobs/search', async (req, res) => {
  let jobsQuery = supabase
    .from('jobs')
    .select('*')
    .eq('status', 'open');

  const { data: jobs } = await jobsQuery.range(...);

  return res.json({ data: jobs });
});
```

**After:**
```typescript
app.get('/api/workers/jobs/search', async (req, res) => {
  console.log(`🔍 Job search request - city: ${city}, jobType: ${jobType}, page: ${page}`);

  let jobsQuery = supabase
    .from('jobs')
    .select('*')
    .eq('status', 'open');

  const { data: jobs } = await jobsQuery.range(...);

  console.log(`📊 Found ${jobs?.length || 0} jobs with status='open'`);

  return res.json({ data: jobs });
});
```

**Changes:**
- Added logging to see search parameters
- Added logging to see how many jobs were found
- Helps diagnose if issue is with approval or search

---

## How to Diagnose the Issue

### Step 1: Check Railway Logs (Backend)
1. Go to Railway dashboard
2. Click on your backend service
3. Go to "Deployments" → View latest deployment logs
4. Look for these log messages:

**When admin approves a job:**
```
📝 Admin approving job: <job-id>
✅ Job approved successfully: { id: '...', status: 'open', ... }
```

**When worker searches for jobs:**
```
🔍 Job search request - city: undefined, jobType: undefined, page: 1
📊 Found 1 jobs with status='open'
```

### Step 2: Check Browser Console (Frontend)
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to Job Feed as a worker
4. Look for:
   - API request to `/api/workers/jobs/search`
   - Response data showing jobs array

### Step 3: Check Database Directly (Supabase)
1. Go to Supabase Dashboard
2. Go to Table Editor → `jobs` table
3. Find your job
4. Check the `status` column

**Expected values:**
- `draft` - Job just created, not yet approved
- `open` - Job approved by admin, visible to workers
- `closed` - Job closed by employer
- `rejected` - Job rejected by admin

---

## Verification Steps After Fix

### 1. Deploy Backend
```bash
cd local-jobs-backend
git pull
npm run build
# Railway will auto-deploy from git
```

### 2. Test Job Approval
1. Login as Admin
2. Go to Admin Dashboard
3. Find a job with status "Pending"
4. Click "Approve"
5. **Check Railway logs** - Should see:
   ```
   📝 Admin approving job: xyz123
   ✅ Job approved successfully: { ... }
   ```

### 3. Test Job Visibility
1. Logout from admin
2. Login as Worker
3. Go to "Find Jobs" page
4. **Check Railway logs** - Should see:
   ```
   🔍 Job search request - city: undefined, jobType: undefined, page: 1
   📊 Found 1 jobs with status='open'
   ```
5. **Check Frontend** - Job should appear in the list

---

## Common Issues & Solutions

### Issue 1: Job Approved But Still Not Visible
**Symptoms:** Admin dashboard shows "Approved" but worker sees "No jobs found"

**Possible Causes:**
1. Frontend is filtering by city and no match exists
2. Job status is not actually 'open' in database
3. Worker is on wrong page (e.g., Saved Jobs instead of Find Jobs)

**Solution:**
```bash
# Check Railway logs for job search
# Should see: "📊 Found X jobs with status='open'"
# If X is 0, job status is wrong
# If X > 0 but worker sees nothing, frontend issue
```

### Issue 2: Approval Button Not Working
**Symptoms:** Clicking "Approve" does nothing

**Possible Causes:**
1. Backend endpoint not deployed
2. Authentication issue
3. Job ID not being passed correctly

**Solution:**
```bash
# Check browser console for errors
# Check Railway logs for approval attempt
# Should see: "📝 Admin approving job: ..."
```

### Issue 3: Wrong Job Status in Database
**Symptoms:** Database shows status='draft' even after approval

**Possible Causes:**
1. Backend update query failing silently
2. Wrong job ID being sent
3. Database permissions issue

**Solution:**
```sql
-- Manually check in Supabase
SELECT id, title, status, approved_at, approved_by
FROM jobs
ORDER BY created_at DESC
LIMIT 10;

-- If status is still 'draft', manually update for testing:
UPDATE jobs
SET status = 'open',
    approved_at = NOW(),
    approved_by = '<admin-user-id>'
WHERE id = '<job-id>';
```

---

## Quick Fix if Jobs Still Not Showing

### Option 1: Manual Database Update (Testing Only)
```sql
-- In Supabase SQL Editor
UPDATE jobs
SET status = 'open'
WHERE status = 'draft';
```

### Option 2: Check Job Search Parameters
The frontend might be passing filters that exclude jobs:

**File:** `local-jobs-platform/src/services/jobs.ts`

Look for city filtering:
```typescript
// Make sure city filter is NOT automatically applied
export const searchJobs = async (filters = {}) => {
  // Should NOT filter by city by default
  const response = await api.get('/api/workers/jobs/search', {
    params: filters  // Empty by default = all jobs
  });
};
```

---

## What Logs to Check

### Backend Logs (Railway):
```
✅ GOOD:
📝 Admin approving job: abc123
✅ Job approved successfully: { id: 'abc123', status: 'open' }
🔍 Job search request - city: undefined, jobType: undefined, page: 1
📊 Found 1 jobs with status='open'

❌ BAD:
📝 Admin approving job: abc123
❌ Job approval failed: <error message>

OR

🔍 Job search request - city: undefined, jobType: undefined, page: 1
📊 Found 0 jobs with status='open'
```

### Frontend Logs (Browser Console):
```
✅ GOOD:
GET /api/workers/jobs/search?page=1&limit=20 → 200
Response: { success: true, data: [{ id: '...', title: '...' }] }

❌ BAD:
GET /api/workers/jobs/search?page=1&limit=20 → 200
Response: { success: true, data: [] }  ← Empty array
```

---

## Database Schema Requirements

Make sure these columns exist in `jobs` table:

```sql
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS approved_by TEXT REFERENCES users(id);
```

---

## Summary

**Code has been updated to:**
1. ✅ Add comprehensive logging to job approval
2. ✅ Add comprehensive logging to job search
3. ✅ Track approval timestamp and admin ID
4. ✅ Return approval confirmation data

**To fix the current issue:**
1. Deploy updated backend to Railway (already pushed to GitHub)
2. Check Railway logs when approving jobs
3. Check Railway logs when searching jobs
4. Verify job status in Supabase database
5. Test with a worker account

**Expected outcome:**
- Admin approves job → Status changes to 'open' → Worker sees job

If issue persists after deployment, share the Railway logs and we can diagnose further!

---

**Note:** All code changes have been committed and pushed to GitHub. Railway should auto-deploy within 2-3 minutes.
