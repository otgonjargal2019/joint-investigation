ALTER TABLE public.users
DROP CONSTRAINT users_status_check;

UPDATE public.users
SET status = 'PENDING'
WHERE status NOT IN ('PENDING', 'APPROVED', 'REJECTED', 'WAITING_TO_CHANGE');


ALTER TABLE public.users
ADD CONSTRAINT users_status_check
CHECK (((status)::text = ANY (
    ARRAY[('PENDING'::character varying)::text,
    ('APPROVED'::character varying)::text,
    ('REJECTED'::character varying)::text,
    ('WAITING_TO_CHANGE'::character varying)::text
    ]
)));

CREATE TABLE public.user_status_histories (
	history_id uuid NOT NULL,
	created_at timestamp(6) NOT NULL,
	from_status varchar(255) NOT NULL,
	reason varchar(250) NULL,
	to_status varchar(255) NOT NULL,
	created_by uuid NOT NULL,
	user_id uuid NOT NULL,
	CONSTRAINT user_status_histories_from_status_check CHECK (((from_status)::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying, 'WAITING_TO_CHANGE'::character varying])::text[]))),
	CONSTRAINT user_status_histories_pkey PRIMARY KEY (history_id),
	CONSTRAINT user_status_histories_to_status_check CHECK (((to_status)::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying, 'WAITING_TO_CHANGE'::character varying])::text[])))
);


-- public.user_status_histories foreign keys

ALTER TABLE public.user_status_histories ADD CONSTRAINT fkft22n4sg0yfutoq7q1vid0xbo FOREIGN KEY (created_by) REFERENCES public.users(user_id);
ALTER TABLE public.user_status_histories ADD CONSTRAINT fkrx6tew8i79jpg610qagyg7jw2 FOREIGN KEY (user_id) REFERENCES public.users(user_id);