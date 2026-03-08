-- Check the jobs table schema to see ID column type
SELECT
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'jobs'
    AND column_name = 'id';

-- Check what type the job IDs actually are
SELECT
    id,
    pg_typeof(id) as id_type,
    title
FROM jobs
LIMIT 5;

-- If jobs.id is UUID type, we need to ensure employer_id is also UUID
SELECT
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'jobs'
    AND column_name IN ('id', 'employer_id');
