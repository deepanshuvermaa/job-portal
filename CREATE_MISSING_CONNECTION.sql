-- Create connection for the application that was just submitted
-- Run this in Supabase SQL Editor

-- First, check the application details
SELECT
    a.id as application_id,
    a.worker_id,
    j.employer_id,
    a.cover_letter,
    a.created_at
FROM applications a
JOIN jobs j ON j.id = a.job_id
ORDER BY a.created_at DESC
LIMIT 5;

-- Create the connection manually for the most recent application
INSERT INTO connections (
    application_id,
    worker_id,
    employer_id,
    status
)
SELECT
    a.id,
    a.worker_id,
    j.employer_id,
    'pending'
FROM applications a
JOIN jobs j ON j.id = a.job_id
WHERE NOT EXISTS (
    SELECT 1 FROM connections c
    WHERE c.worker_id = a.worker_id
    AND c.employer_id = j.employer_id
)
ORDER BY a.created_at DESC
LIMIT 1;

-- Verify the connection was created
SELECT
    c.id,
    c.status,
    c.created_at,
    w.full_name as worker_name,
    e.business_name as employer_name,
    j.title as job_title
FROM connections c
LEFT JOIN worker_profiles w ON w.user_id = c.worker_id
LEFT JOIN employer_profiles e ON e.user_id = c.employer_id
LEFT JOIN applications a ON a.id = c.application_id
LEFT JOIN jobs j ON j.id = a.job_id
ORDER BY c.created_at DESC
LIMIT 5;
