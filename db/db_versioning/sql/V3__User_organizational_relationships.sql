-- Migration to establish user relationships with organizational structure
-- This migration adds foreign key relationships between users and country/headquarter/department tables

-- Step 1: Add new foreign key columns to users table
ALTER TABLE users ADD COLUMN country_id BIGINT;
ALTER TABLE users ADD COLUMN headquarter_id BIGINT;
ALTER TABLE users ADD COLUMN department_id BIGINT;

-- Step 2: Create indexes for the new foreign key columns
CREATE INDEX idx_users_country_id ON users(country_id);
CREATE INDEX idx_users_headquarter_id ON users(headquarter_id);
CREATE INDEX idx_users_department_id ON users(department_id);

-- Step 3: Migrate existing country data
-- Map existing country codes to country_id
UPDATE users SET country_id = (
    SELECT id FROM country WHERE code = users.country
);

-- Step 4: Set default headquarter and department for users with unmapped data
-- For users without specific headquarter/department, assign them to the first available ones
UPDATE users SET 
    headquarter_id = (
        SELECT h.id 
        FROM headquarter h 
        WHERE h.country_id = users.country_id 
        LIMIT 1
    )
WHERE headquarter_id IS NULL AND country_id IS NOT NULL;

UPDATE users SET 
    department_id = (
        SELECT d.id 
        FROM department d 
        WHERE d.country_id = users.country_id 
        AND d.headquarter_id = users.headquarter_id
        LIMIT 1
    )
WHERE department_id IS NULL AND country_id IS NOT NULL AND headquarter_id IS NOT NULL;

-- Step 5: Handle users with departments that match existing department names
-- Try to match existing department text with department names
UPDATE users SET 
    department_id = (
        SELECT d.id 
        FROM department d 
        WHERE LOWER(d.name) = LOWER(users.department)
        AND d.country_id = users.country_id
        LIMIT 1
    )
WHERE department_id IS NULL 
    AND users.department IS NOT NULL 
    AND users.country_id IS NOT NULL
    AND EXISTS (
        SELECT 1 FROM department d 
        WHERE LOWER(d.name) = LOWER(users.department)
        AND d.country_id = users.country_id
    );

-- Step 6: Update headquarter_id based on the selected department
UPDATE users SET 
    headquarter_id = (
        SELECT d.headquarter_id 
        FROM department d 
        WHERE d.id = users.department_id
    )
WHERE department_id IS NOT NULL AND headquarter_id IS NULL;

-- Step 7: Set NOT NULL constraints on the new foreign key columns
-- First, ensure all users have valid country_id (required)
UPDATE users SET country_id = 1 WHERE country_id IS NULL; -- Default to first country (South Korea)

ALTER TABLE users ALTER COLUMN country_id SET NOT NULL;

-- Step 8: Add foreign key constraints
ALTER TABLE users ADD CONSTRAINT fk_users_country 
    FOREIGN KEY (country_id) REFERENCES country(id) ON DELETE RESTRICT;

ALTER TABLE users ADD CONSTRAINT fk_users_headquarter 
    FOREIGN KEY (headquarter_id) REFERENCES headquarter(id) ON DELETE SET NULL;

ALTER TABLE users ADD CONSTRAINT fk_users_department 
    FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE SET NULL;

-- Step 9: Create backup columns for old data (optional - for rollback purposes)
ALTER TABLE users ADD COLUMN country_code_backup VARCHAR(10);
ALTER TABLE users ADD COLUMN department_name_backup VARCHAR(100);

-- Copy old values to backup columns
UPDATE users SET country_code_backup = country;
UPDATE users SET department_name_backup = department;

-- Step 10: Drop old text-based columns (uncomment when ready to finalize)
-- ALTER TABLE users DROP COLUMN country;
-- ALTER TABLE users DROP COLUMN department;

-- Add comments for documentation
COMMENT ON COLUMN users.country_id IS 'Foreign key reference to country table';
COMMENT ON COLUMN users.headquarter_id IS 'Foreign key reference to headquarter table (optional)';
COMMENT ON COLUMN users.department_id IS 'Foreign key reference to department table (optional)';
COMMENT ON COLUMN users.country_code_backup IS 'Backup of original country code for rollback purposes';
COMMENT ON COLUMN users.department_name_backup IS 'Backup of original department name for rollback purposes';
