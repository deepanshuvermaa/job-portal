-- Migration: Fix users table ID to support Firebase UIDs
-- Firebase UIDs are strings, not UUIDs

-- Step 1: Disable RLS temporarily and drop all policies
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

ALTER TABLE worker_profiles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Workers can view own profile" ON worker_profiles;
DROP POLICY IF EXISTS "Workers can update own profile" ON worker_profiles;

ALTER TABLE employer_profiles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Employers can view own profile" ON employer_profiles;
DROP POLICY IF EXISTS "Employers can update own profile" ON employer_profiles;

-- Step 2: Drop the foreign key constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Step 3: Drop existing indexes that might depend on UUID type
DROP INDEX IF EXISTS users_pkey;

-- Step 4: Change ID type from UUID to TEXT
ALTER TABLE users ALTER COLUMN id TYPE TEXT;

-- Step 5: Update worker_profiles and employer_profiles to match
ALTER TABLE worker_profiles ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE employer_profiles ALTER COLUMN user_id TYPE TEXT;

-- Step 6: Recreate primary key
ALTER TABLE users ADD PRIMARY KEY (id);

-- Step 7: Recreate foreign keys for profiles
ALTER TABLE worker_profiles
  ADD CONSTRAINT worker_profiles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE employer_profiles
  ADD CONSTRAINT employer_profiles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Step 8: Re-enable RLS and recreate policies (simplified - adjust as needed)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::TEXT = id);

ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Workers can view own profile" ON worker_profiles
  FOR SELECT USING (auth.uid()::TEXT = user_id);

ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employers can view own profile" ON employer_profiles
  FOR SELECT USING (auth.uid()::TEXT = user_id);

-- Note: You may need to recreate additional policies based on your needs
