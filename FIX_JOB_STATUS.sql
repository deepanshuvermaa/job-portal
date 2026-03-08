-- Emergency fix for job visibility issue
-- Run this in Supabase SQL Editor to diagnose and fix

-- 1. Check current status of all jobs
SELECT
  id,
  title,
  status,
  created_at,
  employer_id
FROM jobs
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check what status values exist
SELECT DISTINCT status, COUNT(*)
FROM jobs
GROUP BY status;

-- 3. MANUAL FIX: Update all jobs to 'open' status
-- (Use this if admin approval button isn't working)
UPDATE jobs
SET status = 'open'
WHERE status IN ('draft', 'pending', 'approved');

-- 4. Verify the fix
SELECT
  id,
  title,
  status,
  created_at
FROM jobs
WHERE status = 'open';

-- 5. If jobs table doesn't have status column, add it:
-- ALTER TABLE jobs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- 6. If status column has CHECK constraint blocking 'open', drop and recreate:
-- ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
-- ALTER TABLE jobs ADD CONSTRAINT jobs_status_check
--   CHECK (status IN ('draft', 'open', 'closed', 'cancelled', 'pending'));
