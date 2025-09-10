-- Add the number column as SERIAL (autoincrement)
ALTER TABLE public.cases
ADD COLUMN number SERIAL;

-- Create a unique index on the number column for better performance
CREATE UNIQUE INDEX idx_cases_number ON public.cases (number);
