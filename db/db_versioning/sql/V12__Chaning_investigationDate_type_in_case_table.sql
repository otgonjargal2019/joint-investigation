-- Change investigation_date column type from DATE to TIMESTAMPTZ
ALTER TABLE public.cases
    ALTER COLUMN investigation_date TYPE timestamptz
    USING investigation_date::timestamptz;
