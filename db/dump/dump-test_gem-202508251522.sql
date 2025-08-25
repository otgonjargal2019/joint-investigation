--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Debian 17.5-1.pgdg120+1)
-- Dumped by pg_dump version 17.0

-- Started on 2025-08-25 15:22:34

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 18037)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 3517 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 18109)
-- Name: case_assignees; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.case_assignees (
    case_id uuid NOT NULL,
    user_id uuid NOT NULL,
    assigned_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.case_assignees OWNER TO admin;

--
-- TOC entry 3518 (class 0 OID 0)
-- Dependencies: 220
-- Name: TABLE case_assignees; Type: COMMENT; Schema: public; Owner: admin
--

COMMENT ON TABLE public.case_assignees IS '사건과 담당 수사관/관리자를 연결하는 조인 테이블';


--
-- TOC entry 219 (class 1259 OID 18091)
-- Name: cases; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.cases (
    case_id uuid DEFAULT gen_random_uuid() NOT NULL,
    case_name character varying(255) NOT NULL,
    case_outline text,
    content_type character varying(50),
    infringement_type character varying(50),
    related_countries character varying(10),
    priority integer,
    status character varying(20) DEFAULT 'OPEN'::character varying NOT NULL,
    investigation_date date,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    etc character varying,
    CONSTRAINT cases_priority_check CHECK (((priority >= 1) AND (priority <= 5))),
    CONSTRAINT cases_status_check CHECK (((status)::text = ANY ((ARRAY['OPEN'::character varying, 'ON_HOLD'::character varying, 'CLOSED'::character varying])::text[])))
);


ALTER TABLE public.cases OWNER TO admin;

--
-- TOC entry 3519 (class 0 OID 0)
-- Dependencies: 219
-- Name: TABLE cases; Type: COMMENT; Schema: public; Owner: admin
--

COMMENT ON TABLE public.cases IS '저작권 침해 사건의 기본 정보를 저장하는 테이블';


--
-- TOC entry 3520 (class 0 OID 0)
-- Dependencies: 219
-- Name: COLUMN cases.related_countries; Type: COMMENT; Schema: public; Owner: admin
--

COMMENT ON COLUMN public.cases.related_countries IS '관련 국가 코드 목록 (e.g., {"KR", "TH"})';


--
-- TOC entry 3521 (class 0 OID 0)
-- Dependencies: 219
-- Name: COLUMN cases.status; Type: COMMENT; Schema: public; Owner: admin
--

COMMENT ON COLUMN public.cases.status IS '사건 상태 (OPEN, ON_HOLD, CLOSED)';


--
-- TOC entry 223 (class 1259 OID 18174)
-- Name: file_view_permissions; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.file_view_permissions (
    file_id uuid NOT NULL,
    user_id uuid NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.file_view_permissions OWNER TO admin;

--
-- TOC entry 3522 (class 0 OID 0)
-- Dependencies: 223
-- Name: TABLE file_view_permissions; Type: COMMENT; Schema: public; Owner: admin
--

COMMENT ON TABLE public.file_view_permissions IS 'AB-PRE를 지원하기 위한 파일별 사용자 열람 권한';


--
-- TOC entry 222 (class 1259 OID 18154)
-- Name: files; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.files (
    file_id uuid DEFAULT gen_random_uuid() NOT NULL,
    record_id uuid NOT NULL,
    file_name character varying(255) NOT NULL,
    file_type character varying(20) NOT NULL,
    file_size bigint,
    mime_type character varying(100),
    file_hash character varying(255),
    storage_path character varying(512) NOT NULL,
    uploaded_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    digital_evidence boolean,
    investigation_report boolean,
    etc character varying,
    CONSTRAINT files_file_type_check CHECK (((file_type)::text = ANY ((ARRAY['EVIDENCE'::character varying, 'REPORT'::character varying])::text[])))
);


ALTER TABLE public.files OWNER TO admin;

--
-- TOC entry 3523 (class 0 OID 0)
-- Dependencies: 222
-- Name: TABLE files; Type: COMMENT; Schema: public; Owner: admin
--

COMMENT ON TABLE public.files IS '업로드된 파일(증거물, 보고서)의 메타데이터';


--
-- TOC entry 3524 (class 0 OID 0)
-- Dependencies: 222
-- Name: COLUMN files.file_type; Type: COMMENT; Schema: public; Owner: admin
--

COMMENT ON COLUMN public.files.file_type IS '파일 유형 (EVIDENCE: 디지털 증거물, REPORT: 수사 보고서)';


--
-- TOC entry 3525 (class 0 OID 0)
-- Dependencies: 222
-- Name: COLUMN files.storage_path; Type: COMMENT; Schema: public; Owner: admin
--

COMMENT ON COLUMN public.files.storage_path IS '외부 스토리지(MinIO 등) 내 파일의 실제 경로';


--
-- TOC entry 221 (class 1259 OID 18125)
-- Name: investigation_records; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.investigation_records (
    record_id uuid DEFAULT gen_random_uuid() NOT NULL,
    case_id uuid NOT NULL,
    record_name character varying(255) NOT NULL,
    content text,
    security_level integer NOT NULL,
    progress_status character varying(30),
    review_status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    rejection_reason text,
    created_by uuid NOT NULL,
    reviewer_id uuid,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT investigation_records_progress_status_check CHECK (((progress_status)::text = ANY ((ARRAY['PRE_INVESTIGATION'::character varying, 'INVESTIGATION'::character varying, 'REVIEW'::character varying, 'PROSECUTION'::character varying, 'CLOSED'::character varying])::text[]))),
    CONSTRAINT investigation_records_review_status_check CHECK (((review_status)::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying])::text[]))),
    CONSTRAINT investigation_records_security_level_check CHECK (((security_level >= 1) AND (security_level <= 6)))
);


ALTER TABLE public.investigation_records OWNER TO admin;

--
-- TOC entry 3526 (class 0 OID 0)
-- Dependencies: 221
-- Name: TABLE investigation_records; Type: COMMENT; Schema: public; Owner: admin
--

COMMENT ON TABLE public.investigation_records IS '사건에 대한 상세 수사 활동 기록';


--
-- TOC entry 3527 (class 0 OID 0)
-- Dependencies: 221
-- Name: COLUMN investigation_records.security_level; Type: COMMENT; Schema: public; Owner: admin
--

COMMENT ON COLUMN public.investigation_records.security_level IS 'LBAC를 위한 보안 등급 (1이 가장 높음)';


--
-- TOC entry 3528 (class 0 OID 0)
-- Dependencies: 221
-- Name: COLUMN investigation_records.progress_status; Type: COMMENT; Schema: public; Owner: admin
--

COMMENT ON COLUMN public.investigation_records.progress_status IS '상세 진행 현황 (PRE_INVESTIGATION, INVESTIGATION, REVIEW, PROSECUTION, CLOSED)';


--
-- TOC entry 3529 (class 0 OID 0)
-- Dependencies: 221
-- Name: COLUMN investigation_records.review_status; Type: COMMENT; Schema: public; Owner: admin
--

COMMENT ON COLUMN public.investigation_records.review_status IS '수사 관리자 검토 상태 (PENDING, APPROVED, REJECTED)';


--
-- TOC entry 225 (class 1259 OID 18206)
-- Name: messages; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.messages (
    message_id uuid DEFAULT gen_random_uuid() NOT NULL,
    sender_id uuid NOT NULL,
    recipient_id uuid NOT NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.messages OWNER TO admin;

--
-- TOC entry 3530 (class 0 OID 0)
-- Dependencies: 225
-- Name: TABLE messages; Type: COMMENT; Schema: public; Owner: admin
--

COMMENT ON TABLE public.messages IS '사용자 간 1:1 메시지 내용';


--
-- TOC entry 226 (class 1259 OID 18226)
-- Name: notifications; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.notifications (
    notification_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    content text,
    related_url character varying(255),
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO admin;

--
-- TOC entry 3531 (class 0 OID 0)
-- Dependencies: 226
-- Name: TABLE notifications; Type: COMMENT; Schema: public; Owner: admin
--

COMMENT ON TABLE public.notifications IS '사용자에게 보내는 시스템 생성 알림';


--
-- TOC entry 224 (class 1259 OID 18190)
-- Name: posts; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.posts (
    post_id uuid DEFAULT gen_random_uuid() NOT NULL,
    board_type character varying(20) NOT NULL,
    title character varying(255) NOT NULL,
    content text,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT posts_board_type_check CHECK (((board_type)::text = ANY ((ARRAY['NOTICE'::character varying, 'RESEARCH'::character varying])::text[])))
);


ALTER TABLE public.posts OWNER TO admin;

--
-- TOC entry 3532 (class 0 OID 0)
-- Dependencies: 224
-- Name: TABLE posts; Type: COMMENT; Schema: public; Owner: admin
--

COMMENT ON TABLE public.posts IS '공지사항 및 조사정보 게시물을 저장하는 통합 테이블';


--
-- TOC entry 3533 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN posts.board_type; Type: COMMENT; Schema: public; Owner: admin
--

COMMENT ON COLUMN public.posts.board_type IS '게시판 유형 (NOTICE: 공지사항, RESEARCH: 조사정보)';


--
-- TOC entry 218 (class 1259 OID 18074)
-- Name: users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.users (
    user_id uuid DEFAULT gen_random_uuid() NOT NULL,
    login_id character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    name_kr character varying(50) NOT NULL,
    name_en character varying(100),
    email character varying(100) NOT NULL,
    phone character varying(20),
    country character varying(10) NOT NULL,
    department character varying(100),
    role character varying(20) NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    profile_image_url character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['PLATFORM_ADMIN'::character varying, 'INV_ADMIN'::character varying, 'INVESTIGATOR'::character varying, 'RESEARCHER'::character varying, 'COPYRIGHT_HOLDER'::character varying])::text[]))),
    CONSTRAINT users_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'ACTIVE'::character varying, 'INACTIVE'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO admin;

--
-- TOC entry 3534 (class 0 OID 0)
-- Dependencies: 218
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: admin
--

COMMENT ON TABLE public.users IS '플랫폼의 모든 사용자 정보를 저장하는 테이블';


--
-- TOC entry 3535 (class 0 OID 0)
-- Dependencies: 218
-- Name: COLUMN users.role; Type: COMMENT; Schema: public; Owner: admin
--

COMMENT ON COLUMN public.users.role IS '사용자 역할 (PLATFORM_ADMIN, INV_ADMIN, INVESTIGATOR, RESEARCHER, COPYRIGHT_HOLDER)';


--
-- TOC entry 3536 (class 0 OID 0)
-- Dependencies: 218
-- Name: COLUMN users.status; Type: COMMENT; Schema: public; Owner: admin
--

COMMENT ON COLUMN public.users.status IS '계정 상태 (PENDING, ACTIVE, INACTIVE)';


--
-- TOC entry 3505 (class 0 OID 18109)
-- Dependencies: 220
-- Data for Name: case_assignees; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.case_assignees (case_id, user_id, assigned_at) FROM stdin;
\.


--
-- TOC entry 3504 (class 0 OID 18091)
-- Dependencies: 219
-- Data for Name: cases; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.cases (case_id, case_name, case_outline, content_type, infringement_type, related_countries, priority, status, investigation_date, created_by, created_at, updated_at, etc) FROM stdin;
\.


--
-- TOC entry 3508 (class 0 OID 18174)
-- Dependencies: 223
-- Data for Name: file_view_permissions; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.file_view_permissions (file_id, user_id, granted_at) FROM stdin;
\.


--
-- TOC entry 3507 (class 0 OID 18154)
-- Dependencies: 222
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.files (file_id, record_id, file_name, file_type, file_size, mime_type, file_hash, storage_path, uploaded_by, created_at, digital_evidence, investigation_report, etc) FROM stdin;
\.


--
-- TOC entry 3506 (class 0 OID 18125)
-- Dependencies: 221
-- Data for Name: investigation_records; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.investigation_records (record_id, case_id, record_name, content, security_level, progress_status, review_status, rejection_reason, created_by, reviewer_id, reviewed_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3510 (class 0 OID 18206)
-- Dependencies: 225
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.messages (message_id, sender_id, recipient_id, content, is_read, created_at) FROM stdin;
\.


--
-- TOC entry 3511 (class 0 OID 18226)
-- Dependencies: 226
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.notifications (notification_id, user_id, title, content, related_url, is_read, created_at) FROM stdin;
\.


--
-- TOC entry 3509 (class 0 OID 18190)
-- Dependencies: 224
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.posts (post_id, board_type, title, content, created_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3503 (class 0 OID 18074)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.users (user_id, login_id, password_hash, name_kr, name_en, email, phone, country, department, role, status, profile_image_url, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3322 (class 2606 OID 18114)
-- Name: case_assignees case_assignees_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.case_assignees
    ADD CONSTRAINT case_assignees_pkey PRIMARY KEY (case_id, user_id);


--
-- TOC entry 3319 (class 2606 OID 18103)
-- Name: cases cases_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_pkey PRIMARY KEY (case_id);


--
-- TOC entry 3333 (class 2606 OID 18179)
-- Name: file_view_permissions file_view_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.file_view_permissions
    ADD CONSTRAINT file_view_permissions_pkey PRIMARY KEY (file_id, user_id);


--
-- TOC entry 3329 (class 2606 OID 18163)
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (file_id);


--
-- TOC entry 3327 (class 2606 OID 18138)
-- Name: investigation_records investigation_records_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.investigation_records
    ADD CONSTRAINT investigation_records_pkey PRIMARY KEY (record_id);


--
-- TOC entry 3340 (class 2606 OID 18215)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (message_id);


--
-- TOC entry 3343 (class 2606 OID 18235)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- TOC entry 3337 (class 2606 OID 18200)
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (post_id);


--
-- TOC entry 3313 (class 2606 OID 18090)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3315 (class 2606 OID 18088)
-- Name: users users_login_id_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_login_id_key UNIQUE (login_id);


--
-- TOC entry 3317 (class 2606 OID 18086)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 3323 (class 1259 OID 18242)
-- Name: idx_case_assignees_user_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_case_assignees_user_id ON public.case_assignees USING btree (user_id);


--
-- TOC entry 3320 (class 1259 OID 18241)
-- Name: idx_cases_created_by; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_cases_created_by ON public.cases USING btree (created_by);


--
-- TOC entry 3334 (class 1259 OID 18247)
-- Name: idx_file_view_permissions_user_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_file_view_permissions_user_id ON public.file_view_permissions USING btree (user_id);


--
-- TOC entry 3330 (class 1259 OID 18245)
-- Name: idx_files_record_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_files_record_id ON public.files USING btree (record_id);


--
-- TOC entry 3331 (class 1259 OID 18246)
-- Name: idx_files_uploaded_by; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_files_uploaded_by ON public.files USING btree (uploaded_by);


--
-- TOC entry 3324 (class 1259 OID 18243)
-- Name: idx_investigation_records_case_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_investigation_records_case_id ON public.investigation_records USING btree (case_id);


--
-- TOC entry 3325 (class 1259 OID 18244)
-- Name: idx_investigation_records_created_by; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_investigation_records_created_by ON public.investigation_records USING btree (created_by);


--
-- TOC entry 3338 (class 1259 OID 18249)
-- Name: idx_messages_sender_recipient; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_messages_sender_recipient ON public.messages USING btree (sender_id, recipient_id, created_at DESC);


--
-- TOC entry 3341 (class 1259 OID 18250)
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- TOC entry 3335 (class 1259 OID 18248)
-- Name: idx_posts_created_by; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_posts_created_by ON public.posts USING btree (created_by);


--
-- TOC entry 3345 (class 2606 OID 18115)
-- Name: case_assignees case_assignees_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.case_assignees
    ADD CONSTRAINT case_assignees_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(case_id) ON DELETE CASCADE;


--
-- TOC entry 3346 (class 2606 OID 18120)
-- Name: case_assignees case_assignees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.case_assignees
    ADD CONSTRAINT case_assignees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3344 (class 2606 OID 18104)
-- Name: cases cases_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id);


--
-- TOC entry 3352 (class 2606 OID 18180)
-- Name: file_view_permissions file_view_permissions_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.file_view_permissions
    ADD CONSTRAINT file_view_permissions_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.files(file_id) ON DELETE CASCADE;


--
-- TOC entry 3353 (class 2606 OID 18185)
-- Name: file_view_permissions file_view_permissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.file_view_permissions
    ADD CONSTRAINT file_view_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3350 (class 2606 OID 18164)
-- Name: files files_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_record_id_fkey FOREIGN KEY (record_id) REFERENCES public.investigation_records(record_id) ON DELETE CASCADE;


--
-- TOC entry 3351 (class 2606 OID 18169)
-- Name: files files_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(user_id);


--
-- TOC entry 3347 (class 2606 OID 18139)
-- Name: investigation_records investigation_records_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.investigation_records
    ADD CONSTRAINT investigation_records_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(case_id) ON DELETE CASCADE;


--
-- TOC entry 3348 (class 2606 OID 18144)
-- Name: investigation_records investigation_records_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.investigation_records
    ADD CONSTRAINT investigation_records_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id);


--
-- TOC entry 3349 (class 2606 OID 18149)
-- Name: investigation_records investigation_records_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.investigation_records
    ADD CONSTRAINT investigation_records_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(user_id);


--
-- TOC entry 3355 (class 2606 OID 18221)
-- Name: messages messages_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(user_id);


--
-- TOC entry 3356 (class 2606 OID 18216)
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(user_id);


--
-- TOC entry 3357 (class 2606 OID 18236)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3354 (class 2606 OID 18201)
-- Name: posts posts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id);


-- Completed on 2025-08-25 15:22:54

--
-- PostgreSQL database dump complete
--

