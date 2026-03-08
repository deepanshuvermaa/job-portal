-- =====================================================
-- URGENT FIX: Jobs Table Status Issue
-- Run this in Supabase SQL Editor NOW
-- =====================================================

-- Step 1: Check current jobs and their statuses
SELECT id, title, status, employer_id, created_at
FROM jobs
ORDER BY created_at DESC
LIMIT 10;

-- Step 2: Check what the current CHECK constraint allows
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'jobs'::regclass
AND conname LIKE '%status%';

-- Step 3: DROP the existing status CHECK constraint if it exists
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check;

-- Step 4: Add the correct CHECK constraint that includes all needed values
ALTER TABLE jobs ADD CONSTRAINT jobs_status_check
CHECK (status IN ('draft', 'pending', 'open', 'active', 'closed', 'filled', 'cancelled'));

-- Step 5: Add approved_at and approved_by columns if they don't exist
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS approved_by TEXT REFERENCES users(id);

-- Step 6: Update all existing jobs to 'open' status
-- (This makes them visible to workers immediately)
UPDATE jobs
SET status = 'open'
WHERE status IN ('draft', 'pending', 'approved', NULL);

-- Step 7: Verify the fix worked
SELECT
  id,
  title,
  status,
  employer_id,
  created_at,
  approved_at
FROM jobs
WHERE status = 'open'
ORDER BY created_at DESC;

-- Expected result: You should see all jobs with status='open'
-- If you see jobs, workers will now be able to see them!

-- =====================================================
-- Alternative: If jobs table uses TEXT instead of UUID
-- =====================================================

-- If you get error about TEXT vs UUID mismatch, run this instead:
-- ALTER TABLE jobs ADD COLUMN IF NOT EXISTS approved_by_admin TEXT;

-- =====================================================
-- Verification Query - Run this last
-- =====================================================

-- This should return the count of open jobs
SELECT COUNT(*) as open_jobs_count FROM jobs WHERE status = 'open';

-- This should match what workers will see
SELECT
  j.id,
  j.title,
  j.city,
  j.status,
  e.business_name as employer
FROM jobs j
LEFT JOIN employer_profiles e ON e.user_id = j.employer_id
WHERE j.status = 'open'
ORDER BY j.created_at DESC;
