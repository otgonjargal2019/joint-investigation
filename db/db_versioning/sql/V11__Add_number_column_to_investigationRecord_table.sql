-- Add the number column as SERIAL (autoincrement)
ALTER TABLE investigation_records
ADD COLUMN number SERIAL;

-- Create a unique index on the number column for better performance
CREATE UNIQUE INDEX idx_investigation_records_number ON investigation_records (number);
