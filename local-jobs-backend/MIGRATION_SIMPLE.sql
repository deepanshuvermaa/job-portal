-- Migration: Fix users table ID to support Firebase UIDs (Simple Version)
-- This version disables RLS to allow Firebase Auth integration

-- Step 1: Disable RLS and drop all policies
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;

ALTER TABLE worker_profiles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Workers can view own profile" ON worker_profiles;
DROP POLICY IF EXISTS "Workers can update own profile" ON worker_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON worker_profiles;

ALTER TABLE employer_profiles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Employers can view own profile" ON employer_profiles;
DROP POLICY IF EXISTS "Employers can update own profile" ON employer_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON employer_profiles;

-- Step 2: Drop the foreign key constraint from users table
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Step 3: Change ID columns from UUID to TEXT
ALTER TABLE users ALTER COLUMN id TYPE TEXT;
ALTER TABLE worker_profiles ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE employer_profiles ALTER COLUMN user_id TYPE TEXT;

-- Step 4: Recreate foreign keys
ALTER TABLE worker_profiles DROP CONSTRAINT IF EXISTS worker_profiles_user_id_fkey;
ALTER TABLE worker_profiles
  ADD CONSTRAINT worker_profiles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE employer_profiles DROP CONSTRAINT IF EXISTS employer_profiles_user_id_fkey;
ALTER TABLE employer_profiles
  ADD CONSTRAINT employer_profiles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Note: RLS is disabled. Your backend JWT authentication will handle security.
-- If you need RLS later, you'll need to create custom policies that don't rely on auth.uid()
