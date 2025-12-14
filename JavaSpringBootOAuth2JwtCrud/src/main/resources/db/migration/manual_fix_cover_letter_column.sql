-- Manual Database Fix for Cover Letter Column Length Issue
-- Run this SQL command in your PostgreSQL database to fix the error immediately
-- 
-- Error: "ERROR: value too long for type character varying(2000)"
-- Solution: Change cover_letter column from VARCHAR(2000) to TEXT

ALTER TABLE job_applications 
ALTER COLUMN cover_letter TYPE TEXT;

-- Verify the change
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'job_applications' 
  AND column_name = 'cover_letter';

-- Expected result after running:
-- column_name   | data_type | character_maximum_length
-- --------------+-----------+-------------------------
-- cover_letter  | text      | null


