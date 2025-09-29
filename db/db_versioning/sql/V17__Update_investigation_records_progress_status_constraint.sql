-- Drop the existing constraint
ALTER TABLE public.investigation_records
DROP CONSTRAINT IF EXISTS investigation_records_progress_status_check;

-- Add the new constraint with updated values
ALTER TABLE public.investigation_records
ADD CONSTRAINT investigation_records_progress_status_check
CHECK (((progress_status)::text = ANY ((ARRAY[
    'PRE_INVESTIGATION'::character varying,
    'INVESTIGATION'::character varying,
    'TRANSFER'::character varying,
    'ANALYZING'::character varying,
    'REPORT_INVESTIGATION'::character varying,
    'DISPOSE'::character varying,
    'ON_HOLD'::character varying,
    'CLOSED'::character varying
])::text[])));
