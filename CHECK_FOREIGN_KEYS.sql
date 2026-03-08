-- Check if the foreign key constraint exists
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'employer_profiles'
    AND tc.constraint_type = 'FOREIGN KEY';

-- Check if user_id column exists in employer_profiles
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'employer_profiles'
    AND column_name = 'user_id';

-- Alternative: Just do a simple join without the constraint name
SELECT
    j.id,
    j.title,
    j.employer_id,
    e.business_name,
    e.average_rating
FROM jobs j
LEFT JOIN employer_profiles e ON e.user_id = j.employer_id
WHERE j.id = '6bd5244b-a82c-48ae-89da-b4140889d2f2';
