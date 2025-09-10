-- Drop the existing check constraint
ALTER TABLE public.investigation_records
DROP CONSTRAINT investigation_records_review_status_check;

-- Add the updated check constraint with WRITING status included
ALTER TABLE public.investigation_records
ADD CONSTRAINT investigation_records_review_status_check
CHECK (((review_status)::text = ANY (ARRAY[('WRITING'::character varying)::text, ('PENDING'::character varying)::text, ('APPROVED'::character varying)::text, ('REJECTED'::character varying)::text])));
