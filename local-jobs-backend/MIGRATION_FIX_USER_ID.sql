-- Migration: Fix users table ID to support Firebase UIDs
-- Firebase UIDs are strings, not UUIDs

-- Step 1: Drop the foreign key constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Step 2: Change ID type from UUID to TEXT
ALTER TABLE users ALTER COLUMN id TYPE TEXT;

-- Step 3: Update worker_profiles and employer_profiles to match
ALTER TABLE worker_profiles ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE employer_profiles ALTER COLUMN user_id TYPE TEXT;

-- Note: You need to run this SQL in your Supabase SQL Editor
-- Go to: Supabase Dashboard > SQL Editor > New Query > Paste this > Run
