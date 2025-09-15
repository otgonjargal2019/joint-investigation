-- Drop the existing check constraint
ALTER TABLE cases
DROP CONSTRAINT IF EXISTS cases_infringement_type_check;

-- Add the updated check constraint
ALTER TABLE cases
ADD CONSTRAINT cases_infringement_type_check
CHECK (((infringement_type)::text = ANY (
    ARRAY[
        ('PLATFORMS_SITES'::character varying)::text,
        ('LINK_SITES'::character varying)::text,
        ('WEBHARD_P2P'::character varying)::text,
        ('TORRENTS'::character varying)::text,
        ('SNS'::character varying)::text,
        ('COMMUNITIES'::character varying)::text,
        ('OTHER'::character varying)::text
    ]
)));
