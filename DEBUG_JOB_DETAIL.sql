-- Debug the job detail query to see what's failing
-- This mimics what the backend does

-- Step 1: Check if the job exists
SELECT id, title, employer_id, status
FROM jobs
WHERE id = '6bd5244b-a82c-48ae-89da-b4140889d2f2';

-- Step 2: Check if the employer profile exists
SELECT
    j.id as job_id,
    j.title,
    j.employer_id,
    e.user_id as employer_user_id,
    e.business_name
FROM jobs j
LEFT JOIN employer_profiles e ON e.user_id = j.employer_id
WHERE j.id = '6bd5244b-a82c-48ae-89da-b4140889d2f2';

-- Step 3: Full query that backend uses
SELECT
    j.*,
    e.business_name,
    e.average_rating
FROM jobs j
LEFT JOIN employer_profiles e ON e.user_id = j.employer_id
WHERE j.id = '6bd5244b-a82c-48ae-89da-b4140889d2f2';

-- Step 4: Check employer_id type mismatch
SELECT
    j.employer_id,
    pg_typeof(j.employer_id) as employer_id_type,
    u.id as user_id,
    pg_typeof(u.id) as user_id_type
FROM jobs j
LEFT JOIN users u ON u.id = j.employer_id
WHERE j.id = '6bd5244b-a82c-48ae-89da-b4140889d2f2';

-- If you see NULL for user_id, there's a type mismatch between employer_id and users.id
