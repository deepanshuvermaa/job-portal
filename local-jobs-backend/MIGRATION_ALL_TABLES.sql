-- Migration: Convert ALL UUID foreign keys to TEXT for Firebase UIDs
-- This is a comprehensive migration for the entire database

-- Step 1: Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE earnings DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies (they reference user IDs)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "Users can view own profile" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Workers can view own profile" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Employers can view own profile" ON ' || r.tablename;
        EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON ' || r.tablename;
    END LOOP;
END $$;

-- Step 3: Drop ALL foreign key constraints that reference users(id)
ALTER TABLE worker_profiles DROP CONSTRAINT IF EXISTS worker_profiles_user_id_fkey;
ALTER TABLE worker_profiles DROP CONSTRAINT IF EXISTS worker_profiles_verified_by_fkey;
ALTER TABLE employer_profiles DROP CONSTRAINT IF EXISTS employer_profiles_user_id_fkey;
ALTER TABLE employer_profiles DROP CONSTRAINT IF EXISTS employer_profiles_verified_by_fkey;
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_employer_id_fkey;
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_worker_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_reviewer_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_reviewee_id_fkey;
ALTER TABLE earnings DROP CONSTRAINT IF EXISTS earnings_worker_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_reporter_id_fkey;
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_reported_user_id_fkey;
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_resolved_by_fkey;
ALTER TABLE admin_actions DROP CONSTRAINT IF EXISTS admin_actions_admin_id_fkey;
ALTER TABLE admin_actions DROP CONSTRAINT IF EXISTS admin_actions_target_user_id_fkey;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Step 4: Change ALL user ID columns from UUID to TEXT
ALTER TABLE users ALTER COLUMN id TYPE TEXT;
ALTER TABLE worker_profiles ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE worker_profiles ALTER COLUMN verified_by TYPE TEXT;
ALTER TABLE employer_profiles ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE employer_profiles ALTER COLUMN verified_by TYPE TEXT;
ALTER TABLE jobs ALTER COLUMN employer_id TYPE TEXT;
ALTER TABLE applications ALTER COLUMN worker_id TYPE TEXT;
ALTER TABLE reviews ALTER COLUMN reviewer_id TYPE TEXT;
ALTER TABLE reviews ALTER COLUMN reviewee_id TYPE TEXT;
ALTER TABLE earnings ALTER COLUMN worker_id TYPE TEXT;
ALTER TABLE notifications ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE reports ALTER COLUMN reporter_id TYPE TEXT;
ALTER TABLE reports ALTER COLUMN reported_user_id TYPE TEXT;
ALTER TABLE reports ALTER COLUMN resolved_by TYPE TEXT;
ALTER TABLE admin_actions ALTER COLUMN admin_id TYPE TEXT;
ALTER TABLE admin_actions ALTER COLUMN target_user_id TYPE TEXT;

-- Step 5: Recreate foreign keys
ALTER TABLE worker_profiles
  ADD CONSTRAINT worker_profiles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE worker_profiles
  ADD CONSTRAINT worker_profiles_verified_by_fkey
  FOREIGN KEY (verified_by) REFERENCES users(id);

ALTER TABLE employer_profiles
  ADD CONSTRAINT employer_profiles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE employer_profiles
  ADD CONSTRAINT employer_profiles_verified_by_fkey
  FOREIGN KEY (verified_by) REFERENCES users(id);

ALTER TABLE jobs
  ADD CONSTRAINT jobs_employer_id_fkey
  FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE applications
  ADD CONSTRAINT applications_worker_id_fkey
  FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE reviews
  ADD CONSTRAINT reviews_reviewer_id_fkey
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE reviews
  ADD CONSTRAINT reviews_reviewee_id_fkey
  FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE earnings
  ADD CONSTRAINT earnings_worker_id_fkey
  FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE reports
  ADD CONSTRAINT reports_reporter_id_fkey
  FOREIGN KEY (reporter_id) REFERENCES users(id);

ALTER TABLE reports
  ADD CONSTRAINT reports_reported_user_id_fkey
  FOREIGN KEY (reported_user_id) REFERENCES users(id);

ALTER TABLE reports
  ADD CONSTRAINT reports_resolved_by_fkey
  FOREIGN KEY (resolved_by) REFERENCES users(id);

ALTER TABLE admin_actions
  ADD CONSTRAINT admin_actions_admin_id_fkey
  FOREIGN KEY (admin_id) REFERENCES users(id);

ALTER TABLE admin_actions
  ADD CONSTRAINT admin_actions_target_user_id_fkey
  FOREIGN KEY (target_user_id) REFERENCES users(id);

-- Done! All tables converted to use TEXT IDs for Firebase compatibility.
